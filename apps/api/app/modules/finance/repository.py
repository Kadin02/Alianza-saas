from datetime import date

from sqlalchemy.orm import Session

from app.modules.finance.models import Charge, CreditApplication, OwnerCredit, Payment, PaymentApplication


def list_charges(db: Session, *, organization_id: int, unit_id: int | None = None) -> list[Charge]:
    query = db.query(Charge).filter(Charge.organization_id == organization_id)
    if unit_id is not None:
        query = query.filter(Charge.unit_id == unit_id)
    return query.order_by(Charge.date_created.desc()).all()


def get_charge(db: Session, *, organization_id: int, charge_id: int) -> Charge | None:
    return (
        db.query(Charge)
        .filter(Charge.organization_id == organization_id, Charge.id == charge_id)
        .first()
    )


def get_charge_by_unit_and_description(db: Session, *, organization_id: int, unit_id: int, description: str) -> Charge | None:
    return (
        db.query(Charge)
        .filter(
            Charge.organization_id == organization_id,
            Charge.unit_id == unit_id,
            Charge.description == description,
        )
        .first()
    )


def create_charge(
    db: Session, *, organization_id: int, unit_id: int, description: str,
    amount, date_created: date, due_date: date,
) -> Charge:
    charge = Charge(
        organization_id=organization_id,
        unit_id=unit_id,
        description=description,
        amount=amount,
        date_created=date_created,
        due_date=due_date,
    )
    db.add(charge)
    db.flush()
    return charge


def list_payments(db: Session, *, organization_id: int, unit_id: int | None = None) -> list[Payment]:
    query = db.query(Payment).filter(Payment.organization_id == organization_id)
    if unit_id is not None:
        query = query.filter(Payment.unit_id == unit_id)
    return query.order_by(Payment.payment_date.desc(), Payment.id.desc()).all()


def get_payment(db: Session, *, organization_id: int, payment_id: int) -> Payment | None:
    return (
        db.query(Payment)
        .filter(Payment.organization_id == organization_id, Payment.id == payment_id)
        .first()
    )


def get_last_payment_with_receipt_number(db: Session, *, organization_id: int) -> Payment | None:
    return (
        db.query(Payment)
        .filter(Payment.organization_id == organization_id, Payment.receipt_number.isnot(None))
        .order_by(Payment.id.desc())
        .first()
    )


def create_payment(
    db: Session, *, organization_id: int, unit_id: int, owner_id: int | None,
    amount, payment_date: date, method: str | None, reference: str | None, receipt_number: str | None = None,
) -> Payment:
    payment = Payment(
        organization_id=organization_id,
        unit_id=unit_id,
        owner_id=owner_id,
        amount=amount,
        payment_date=payment_date,
        method=method,
        reference=reference,
        receipt_number=receipt_number,
    )
    db.add(payment)
    db.flush()
    return payment


def create_application(db: Session, *, organization_id: int, payment_id: int, charge_id: int, applied_amount) -> PaymentApplication:
    application = PaymentApplication(
        organization_id=organization_id,
        payment_id=payment_id,
        charge_id=charge_id,
        applied_amount=applied_amount,
    )
    db.add(application)
    db.flush()
    return application


def create_owner_credit(
    db: Session, *, organization_id: int, owner_id: int, source_payment_id: int | None, amount,
) -> OwnerCredit:
    credit = OwnerCredit(
        organization_id=organization_id,
        owner_id=owner_id,
        source_payment_id=source_payment_id,
        amount=amount,
        remaining_amount=amount,
    )
    db.add(credit)
    db.flush()
    return credit


def list_available_credits(db: Session, *, organization_id: int, owner_id: int) -> list[OwnerCredit]:
    return (
        db.query(OwnerCredit)
        .filter(
            OwnerCredit.organization_id == organization_id,
            OwnerCredit.owner_id == owner_id,
            OwnerCredit.remaining_amount > 0,
        )
        .order_by(OwnerCredit.created_at.asc())
        .all()
    )


def create_credit_application(
    db: Session, *, organization_id: int, credit_id: int, charge_id: int, applied_amount,
) -> CreditApplication:
    application = CreditApplication(
        organization_id=organization_id,
        credit_id=credit_id,
        charge_id=charge_id,
        applied_amount=applied_amount,
    )
    db.add(application)
    db.flush()
    return application
