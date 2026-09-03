from datetime import date

from sqlalchemy.orm import Session

from app.modules.dashboard.schemas import ActivityItem, DashboardSummary
from app.modules.finance import service as finance_service
from app.modules.owners import repository as owners_repo
from app.modules.owners.models import UnitOwner
from app.modules.properties import repository as properties_repo
from app.modules.units import repository as units_repo
from app.modules.vendors import repository as vendors_repo


def get_dashboard_summary(db: Session, *, organization_id: int) -> DashboardSummary:
    today = date.today()

    properties = properties_repo.list_properties(db, organization_id=organization_id)
    units = units_repo.list_units(db, organization_id=organization_id)
    owners = owners_repo.list_owners(db, organization_id=organization_id)
    vendors = vendors_repo.list_vendors(db, organization_id=organization_id)

    occupied_units = (
        db.query(UnitOwner)
        .filter(UnitOwner.organization_id == organization_id, UnitOwner.is_active.is_(True))
        .count()
    )
    occupancy_rate = round((occupied_units / len(units)) * 100, 1) if units else 0.0

    finance = finance_service.get_reports_overview(
        db, organization_id=organization_id, month=today.month, year=today.year
    )

    charges = finance_service.list_charges(db, organization_id=organization_id)
    payments = finance_service.list_payments(db, organization_id=organization_id)

    activity: list[ActivityItem] = []
    for payment in payments:
        activity.append(
            ActivityItem(
                type="PAGO",
                label=f"Pago recibido — {payment.unit_number}",
                detail=payment.property_name,
                amount=payment.amount,
                date=payment.payment_date,
            )
        )
    for charge in charges:
        activity.append(
            ActivityItem(
                type="CARGO",
                label=f"{charge.description} — {charge.unit_number}",
                detail=charge.property_name,
                amount=charge.amount,
                date=charge.date_created,
            )
        )
    activity.sort(key=lambda item: item.date, reverse=True)

    return DashboardSummary(
        properties_count=len(properties),
        units_count=len(units),
        occupied_units=occupied_units,
        occupancy_rate=occupancy_rate,
        owners_count=len(owners),
        vendors_count=len(vendors),
        finance=finance,
        recent_activity=activity[:8],
    )
