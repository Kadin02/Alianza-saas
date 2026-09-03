from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.properties import repository as properties_repo
from app.modules.properties.models import Property
from app.modules.properties.schemas import PropertyCreateRequest, PropertyUpdateRequest


def get_property_or_404(db: Session, *, organization_id: int, property_id: int) -> Property:
    prop = properties_repo.get_property(db, organization_id=organization_id, property_id=property_id)
    if not prop:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Propiedad no encontrada")
    return prop


def create_property(db: Session, *, organization_id: int, payload: PropertyCreateRequest) -> Property:
    return properties_repo.create_property(db, organization_id=organization_id, payload=payload)


def update_property(
    db: Session, *, organization_id: int, property_id: int, payload: PropertyUpdateRequest
) -> Property:
    prop = get_property_or_404(db, organization_id=organization_id, property_id=property_id)
    return properties_repo.update_property(db, prop=prop, payload=payload)


def delete_property(db: Session, *, organization_id: int, property_id: int) -> None:
    prop = get_property_or_404(db, organization_id=organization_id, property_id=property_id)
    properties_repo.delete_property(db, prop=prop)
