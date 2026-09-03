from sqlalchemy.orm import Session

from app.modules.units.models import Unit
from app.modules.units.schemas import UnitCreateRequest, UnitUpdateRequest


def list_units(db: Session, *, organization_id: int) -> list[Unit]:
    return (
        db.query(Unit)
        .filter(Unit.organization_id == organization_id)
        .order_by(Unit.created_at.desc())
        .all()
    )


def get_unit(db: Session, *, organization_id: int, unit_id: int) -> Unit | None:
    return (
        db.query(Unit)
        .filter(Unit.organization_id == organization_id, Unit.id == unit_id)
        .first()
    )


def create_unit(db: Session, *, organization_id: int, payload: UnitCreateRequest) -> Unit:
    unit = Unit(organization_id=organization_id, **payload.model_dump())
    db.add(unit)
    db.commit()
    db.refresh(unit)
    return unit


def update_unit(db: Session, *, unit: Unit, payload: UnitUpdateRequest) -> Unit:
    for field, value in payload.model_dump().items():
        setattr(unit, field, value)
    db.commit()
    db.refresh(unit)
    return unit


def delete_unit(db: Session, *, unit: Unit) -> None:
    db.delete(unit)
    db.commit()
