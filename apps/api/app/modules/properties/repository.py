from sqlalchemy.orm import Session

from app.modules.properties.models import Property
from app.modules.properties.schemas import PropertyCreateRequest, PropertyUpdateRequest


def list_properties(db: Session, *, organization_id: int) -> list[Property]:
    return (
        db.query(Property)
        .filter(Property.organization_id == organization_id)
        .order_by(Property.created_at.desc())
        .all()
    )


def get_property(db: Session, *, organization_id: int, property_id: int) -> Property | None:
    return (
        db.query(Property)
        .filter(Property.organization_id == organization_id, Property.id == property_id)
        .first()
    )


def create_property(db: Session, *, organization_id: int, payload: PropertyCreateRequest) -> Property:
    prop = Property(organization_id=organization_id, **payload.model_dump())
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop


def update_property(db: Session, *, prop: Property, payload: PropertyUpdateRequest) -> Property:
    for field, value in payload.model_dump().items():
        setattr(prop, field, value)
    db.commit()
    db.refresh(prop)
    return prop


def delete_property(db: Session, *, prop: Property) -> None:
    db.delete(prop)
    db.commit()
