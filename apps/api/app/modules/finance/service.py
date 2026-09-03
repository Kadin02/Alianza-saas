from datetime import date as date_
from decimal import Decimal, ROUND_HALF_UP

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.finance import repository as finance_repo
from app.modules.finance.models import Charge, ChargeStatus, Payment
from app.modules.finance.schemas import (
    ChargeCreateRequest,
    ChargeRead,
    GenerateMonthlyChargesRequest,
    GenerateMonthlyChargesResult,
    LateFeeCreateRequest,
    LedgerRow,
    PaymentCreateRequest,
    PaymentReceipt,
    PaymentRead,
    PropertyReportRow,
    ReceiptApplicationLine,
    ReportsOverview,
    UnitStatement,
)
from app.modules.owners import repository as owners_repo
from app.modules.owners.models import UnitOwner
from app.modules.properties import repository as properties_repo
from app.modules.units import repository as units_repo


def _to_dec(value) -> Decimal:
    return Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _refresh_charge_status(charge: Charge) -> None:
    balance = charge.balance
    if charge.applied_amount == Decimal("0.00"):
        charge.status = ChargeStatus.PENDIENTE
    elif balance > Decimal("0.00"):
        charge.status = ChargeStatus.PARCIAL
    else:
        charge.status = ChargeStatus.PAGADO


def _to_charge_read(charge: Charge) -> ChargeRead:
    return ChargeRead(
        id=charge.id,
        unit_id=charge.unit_id,
        unit_number=charge.unit.unit_number,
        property_name=charge.unit.property_name,
        description=charge.description,
        amount=charge.amount,
        applied_amount=charge.applied_amount,
        balance=charge.balance,
        status=charge.status,
        date_created=charge.date_created,
        due_date=charge.due_date,
        is_recargo=charge.is_recargo,
        created_at=charge.created_at,
    )


def _get_active_owner_name(db: Session, *, unit_id: int) -> tuple[int | None, str | None]:
    link: UnitOwner | None = owners_repo.get_active_unit_link_for_unit(db, unit_id=unit_id)
    if link:
        return link.owner_id, link.owner.full_name
    return None, None


def _apply_available_credits(db: Session, *, organization_id: int, owner_id: int, charge: Charge) -> None:
    """Aplica los saldos a favor disponibles del propietario (más antiguo primero) a un cargo."""
    credits = finance_repo.list_available_credits(db, organization_id=organization_id, owner_id=owner_id)
    remaining_charge = charge.balance
    for credit in credits:
        if remaining_charge <= Decimal("0.00"):
            break
        apply_amount = min(credit.remaining_amount, remaining_charge)
        if apply_amount <= Decimal("0.00"):
            continue
        finance_repo.create_credit_application(
            db,
            organization_id=organization_id,
            credit_id=credit.id,
            charge_id=charge.id,
            applied_amount=apply_amount,
        )
        credit.remaining_amount -= apply_amount
        remaining_charge -= apply_amount
        db.flush()
    if credits:
        db.refresh(charge)
        _refresh_charge_status(charge)


def list_charges(db: Session, *, organization_id: int, unit_id: int | None = None) -> list[ChargeRead]:
    charges = finance_repo.list_charges(db, organization_id=organization_id, unit_id=unit_id)
    return [_to_charge_read(c) for c in charges]


def _create_charge_core(
    db: Session, *, organization_id: int, unit_id: int, description: str, amount, date_created: date_, due_date: date_,
) -> Charge:
    charge = finance_repo.create_charge(
        db,
        organization_id=organization_id,
        unit_id=unit_id,
        description=description,
        amount=_to_dec(amount),
        date_created=date_created,
        due_date=due_date,
    )
    owner_id, _ = _get_active_owner_name(db, unit_id=unit_id)
    if owner_id is not None:
        _apply_available_credits(db, organization_id=organization_id, owner_id=owner_id, charge=charge)
    return charge


def create_charge(db: Session, *, organization_id: int, payload: ChargeCreateRequest) -> ChargeRead:
    unit = units_repo.get_unit(db, organization_id=organization_id, unit_id=payload.unit_id)
    if not unit:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "La unidad no pertenece a esta organización")

    charge = _create_charge_core(
        db,
        organization_id=organization_id,
        unit_id=payload.unit_id,
        description=payload.description,
        amount=payload.amount,
        date_created=payload.date_created,
        due_date=payload.due_date,
    )

    db.commit()
    db.refresh(charge)
    return _to_charge_read(charge)


def generate_monthly_charges(
    db: Session, *, organization_id: int, payload: GenerateMonthlyChargesRequest,
) -> GenerateMonthlyChargesResult:
    units = units_repo.list_units(db, organization_id=organization_id)
    if payload.property_id is not None:
        units = [u for u in units if u.property_id == payload.property_id]
    units = [u for u in units if u.monthly_fee is not None and u.monthly_fee > 0]

    if not units:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "No hay unidades con cuota mensual configurada para generar cargos",
        )

    description = f"Cuota mensual {payload.month:02d}/{payload.year}"
    due_date = date_(payload.year, payload.month, 5)
    today = date_.today()

    created: list[Charge] = []
    skipped = 0
    for unit in units:
        existing = finance_repo.get_charge_by_unit_and_description(
            db, organization_id=organization_id, unit_id=unit.id, description=description
        )
        if existing:
            skipped += 1
            continue
        charge = _create_charge_core(
            db,
            organization_id=organization_id,
            unit_id=unit.id,
            description=description,
            amount=unit.monthly_fee,
            date_created=today,
            due_date=due_date,
        )
        created.append(charge)

    db.commit()
    for charge in created:
        db.refresh(charge)

    return GenerateMonthlyChargesResult(
        created=len(created),
        skipped=skipped,
        month=payload.month,
        year=payload.year,
        charges=[_to_charge_read(c) for c in created],
    )


def create_late_fee(db: Session, *, organization_id: int, charge_id: int, payload: LateFeeCreateRequest) -> ChargeRead:
    original = finance_repo.get_charge(db, organization_id=organization_id, charge_id=charge_id)
    if not original:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Cargo no encontrado")

    if original.due_date >= date_.today():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No se puede aplicar mora: el cargo aún no está vencido")

    if original.balance <= Decimal("0.00"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No se puede aplicar mora: el cargo ya está pagado")

    late_fee = Charge(
        organization_id=organization_id,
        unit_id=original.unit_id,
        description=f"Mora — {original.description}",
        amount=_to_dec(payload.amount),
        date_created=date_.today(),
        due_date=date_.today(),
        related_charge_id=original.id,
    )
    db.add(late_fee)
    db.commit()
    db.refresh(late_fee)
    return _to_charge_read(late_fee)


def _generate_receipt_number(db: Session, *, organization_id: int) -> str:
    last = finance_repo.get_last_payment_with_receipt_number(db, organization_id=organization_id)
    n = 0
    if last and last.receipt_number:
        try:
            n = int(last.receipt_number.split("-")[1])
        except (IndexError, ValueError):
            n = 0
    return f"REC-{n + 1:06d}"


def _to_payment_read(payment: Payment, *, owner_name: str | None) -> PaymentRead:
    applied = sum((a.applied_amount for a in payment.applications), Decimal("0.00"))
    return PaymentRead(
        id=payment.id,
        receipt_number=payment.receipt_number,
        unit_id=payment.unit_id,
        unit_number=payment.unit.unit_number,
        property_name=payment.unit.property_name,
        owner_id=payment.owner_id,
        owner_name=owner_name,
        amount=payment.amount,
        applied_to_charges=applied,
        credit_generated=payment.amount - applied,
        payment_date=payment.payment_date,
        method=payment.method,
        reference=payment.reference,
        created_at=payment.created_at,
    )


def list_payments(db: Session, *, organization_id: int, unit_id: int | None = None) -> list[PaymentRead]:
    payments = finance_repo.list_payments(db, organization_id=organization_id, unit_id=unit_id)
    result = []
    for payment in payments:
        owner_name = payment.owner.full_name if payment.owner else None
        result.append(_to_payment_read(payment, owner_name=owner_name))
    return result


def create_payment_fifo(db: Session, *, organization_id: int, payload: PaymentCreateRequest) -> PaymentRead:
    unit = units_repo.get_unit(db, organization_id=organization_id, unit_id=payload.unit_id)
    if not unit:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "La unidad no pertenece a esta organización")

    owner_id = payload.owner_id
    if owner_id is not None:
        owner = owners_repo.get_owner(db, organization_id=organization_id, owner_id=owner_id)
        if not owner:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "El propietario no pertenece a esta organización")
    else:
        owner_id, _ = _get_active_owner_name(db, unit_id=payload.unit_id)

    amount = _to_dec(payload.amount)
    receipt_number = _generate_receipt_number(db, organization_id=organization_id)

    payment = finance_repo.create_payment(
        db,
        organization_id=organization_id,
        unit_id=payload.unit_id,
        owner_id=owner_id,
        amount=amount,
        payment_date=payload.payment_date,
        method=payload.method,
        reference=payload.reference,
        receipt_number=receipt_number,
    )

    charges = finance_repo.list_charges(db, organization_id=organization_id, unit_id=payload.unit_id)
    charges = sorted(
        (c for c in charges if c.status != ChargeStatus.PAGADO),
        key=lambda c: c.due_date,
    )

    remaining = amount
    for charge in charges:
        if remaining <= Decimal("0.00"):
            break
        balance = charge.balance
        if balance <= Decimal("0.00"):
            continue
        apply_amount = min(remaining, balance)
        finance_repo.create_application(
            db,
            organization_id=organization_id,
            payment_id=payment.id,
            charge_id=charge.id,
            applied_amount=apply_amount,
        )
        remaining -= apply_amount
        db.flush()
        db.refresh(charge)
        _refresh_charge_status(charge)

    if remaining > Decimal("0.00") and owner_id is not None:
        finance_repo.create_owner_credit(
            db,
            organization_id=organization_id,
            owner_id=owner_id,
            source_payment_id=payment.id,
            amount=remaining,
        )

    db.commit()
    db.refresh(payment)

    owner_name = payment.owner.full_name if payment.owner else None
    return _to_payment_read(payment, owner_name=owner_name)


def get_payment_receipt(db: Session, *, organization_id: int, payment_id: int) -> PaymentReceipt:
    payment = finance_repo.get_payment(db, organization_id=organization_id, payment_id=payment_id)
    if not payment:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pago no encontrado")

    property_ref = payment.unit.property_ref

    subtotal = Decimal("0.00")
    recargo = Decimal("0.00")
    applications: list[ReceiptApplicationLine] = []
    for app in payment.applications:
        charge = app.charge
        applied = app.applied_amount
        if charge.is_recargo:
            recargo += applied
        else:
            subtotal += applied
        applications.append(ReceiptApplicationLine(
            charge_id=charge.id,
            description=charge.description,
            is_recargo=charge.is_recargo,
            applied_amount=applied,
        ))

    applied_total = sum((a.applied_amount for a in payment.applications), Decimal("0.00"))

    return PaymentReceipt(
        payment_id=payment.id,
        receipt_number=payment.receipt_number,
        payment_date=payment.payment_date,
        amount=payment.amount,
        method=payment.method,
        reference=payment.reference,
        subtotal=subtotal,
        recargo=recargo,
        credit_generated=payment.amount - applied_total,
        owner_name=payment.owner.full_name if payment.owner else None,
        unit_number=payment.unit.unit_number,
        property_name=property_ref.name,
        property_address=property_ref.address,
        property_phone=property_ref.phone,
        property_email=property_ref.email,
        applications=applications,
    )


def get_unit_statement(db: Session, *, organization_id: int, unit_id: int) -> UnitStatement:
    unit = units_repo.get_unit(db, organization_id=organization_id, unit_id=unit_id)
    if not unit:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Unidad no encontrada")

    owner_id, owner_name = _get_active_owner_name(db, unit_id=unit_id)

    charges = finance_repo.list_charges(db, organization_id=organization_id, unit_id=unit_id)
    payments = finance_repo.list_payments(db, organization_id=organization_id, unit_id=unit_id)

    rows: list[dict] = []
    for charge in charges:
        rows.append({
            "fecha": charge.date_created,
            "tipo": "CARGO",
            "concepto": charge.description,
            "cargo": charge.amount,
            "pago": Decimal("0.00"),
            "_order": 0,
        })
    for payment in payments:
        applied = sum((a.applied_amount for a in payment.applications), Decimal("0.00"))
        if applied <= Decimal("0.00"):
            continue
        rows.append({
            "fecha": payment.payment_date,
            "tipo": "PAGO",
            "concepto": payment.reference or f"Pago #{payment.id}",
            "cargo": Decimal("0.00"),
            "pago": applied,
            "_order": 1,
        })

    for charge in charges:
        for credit_app in charge.credit_applications:
            rows.append({
                "fecha": credit_app.created_at.date(),
                "tipo": "CREDITO",
                "concepto": f"Saldo a favor aplicado — {charge.description}",
                "cargo": Decimal("0.00"),
                "pago": credit_app.applied_amount,
                "_order": 1,
            })

    rows.sort(key=lambda r: (r["fecha"], r["_order"]))

    saldo = Decimal("0.00")
    ledger: list[LedgerRow] = []
    for row in rows:
        saldo += row["cargo"] - row["pago"]
        ledger.append(LedgerRow(
            fecha=row["fecha"], tipo=row["tipo"], concepto=row["concepto"],
            cargo=row["cargo"], pago=row["pago"], saldo=saldo,
        ))

    total_cargos = sum((c.amount for c in charges), Decimal("0.00"))
    total_pagos = sum(
        (a.applied_amount for p in payments for a in p.applications), Decimal("0.00")
    )
    total_due = sum((c.balance for c in charges), Decimal("0.00"))

    available_credit = Decimal("0.00")
    if owner_id is not None:
        credits = finance_repo.list_available_credits(db, organization_id=organization_id, owner_id=owner_id)
        available_credit = sum((c.remaining_amount for c in credits), Decimal("0.00"))

    return UnitStatement(
        unit_id=unit.id,
        unit_number=unit.unit_number,
        property_name=unit.property_name,
        owner_id=owner_id,
        owner_name=owner_name,
        total_due=total_due,
        total_cargos=total_cargos,
        total_pagos=total_pagos,
        available_credit=available_credit,
        ledger=ledger,
    )


def get_reports_overview(db: Session, *, organization_id: int, month: int, year: int) -> ReportsOverview:
    charges = finance_repo.list_charges(db, organization_id=organization_id)
    payments = finance_repo.list_payments(db, organization_id=organization_id)
    today = date_.today()

    total_pendiente = sum((c.balance for c in charges), Decimal("0.00"))

    overdue_charges = [c for c in charges if c.due_date < today and c.status != ChargeStatus.PAGADO]
    total_morosidad = sum((c.balance for c in overdue_charges), Decimal("0.00"))
    unidades_en_mora = len({c.unit_id for c in overdue_charges})

    total_cargos_mes = sum(
        (c.amount for c in charges if c.date_created.month == month and c.date_created.year == year),
        Decimal("0.00"),
    )

    total_recaudado_mes = Decimal("0.00")
    for payment in payments:
        if payment.payment_date.month == month and payment.payment_date.year == year:
            total_recaudado_mes += sum((a.applied_amount for a in payment.applications), Decimal("0.00"))

    return ReportsOverview(
        month=month,
        year=year,
        total_recaudado_mes=total_recaudado_mes,
        total_pendiente=total_pendiente,
        total_morosidad=total_morosidad,
        unidades_en_mora=unidades_en_mora,
        total_cargos_mes=total_cargos_mes,
    )


def get_reports_by_property(db: Session, *, organization_id: int) -> list[PropertyReportRow]:
    properties = properties_repo.list_properties(db, organization_id=organization_id)
    units = units_repo.list_units(db, organization_id=organization_id)
    unit_to_property_id = {u.id: u.property_id for u in units}

    charges = finance_repo.list_charges(db, organization_id=organization_id)
    today = date_.today()

    agg: dict[int, dict] = {
        p.id: {"charged": Decimal("0.00"), "paid": Decimal("0.00"), "pending": Decimal("0.00"), "overdue_units": set()}
        for p in properties
    }

    for charge in charges:
        property_id = unit_to_property_id.get(charge.unit_id)
        if property_id is None or property_id not in agg:
            continue
        row = agg[property_id]
        row["charged"] += charge.amount
        row["paid"] += charge.applied_amount
        row["pending"] += charge.balance
        if charge.due_date < today and charge.status != ChargeStatus.PAGADO:
            row["overdue_units"].add(charge.unit_id)

    result = [
        PropertyReportRow(
            property_id=p.id,
            property_name=p.name,
            total_charged=agg[p.id]["charged"],
            total_paid=agg[p.id]["paid"],
            total_pending=agg[p.id]["pending"],
            units_overdue=len(agg[p.id]["overdue_units"]),
        )
        for p in properties
    ]
    result.sort(key=lambda r: r.property_name)
    return result
