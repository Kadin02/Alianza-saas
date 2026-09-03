from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.properties import repository as properties_repo
from app.modules.units import repository as units_repo
from app.modules.units.models import Unit
from app.modules.units.schemas import UnitCreateRequest, UnitUpdateRequest


def _assert_property_in_org(db: Session, *, organization_id: int, property_id: int) -> None:
    prop = properties_repo.get_property(db, organization_id=organization_id, property_id=property_id)
    if not prop:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "La propiedad no pertenece a esta organización")


def get_unit_or_404(db: Session, *, organization_id: int, unit_id: int) -> Unit:
    unit = units_repo.get_unit(db, organization_id=organization_id, unit_id=unit_id)
    if not unit:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Unidad no encontrada")
    return unit


def create_unit(db: Session, *, organization_id: int, payload: UnitCreateRequest) -> Unit:
    _assert_property_in_org(db, organization_id=organization_id, property_id=payload.property_id)
    return units_repo.create_unit(db, organization_id=organization_id, payload=payload)


def update_unit(db: Session, *, organization_id: int, unit_id: int, payload: UnitUpdateRequest) -> Unit:
    _assert_property_in_org(db, organization_id=organization_id, property_id=payload.property_id)
    unit = get_unit_or_404(db, organization_id=organization_id, unit_id=unit_id)
    return units_repo.update_unit(db, unit=unit, payload=payload)


def delete_unit(db: Session, *, organization_id: int, unit_id: int) -> None:
    unit = get_unit_or_404(db, organization_id=organization_id, unit_id=unit_id)
    units_repo.delete_unit(db, unit=unit)
