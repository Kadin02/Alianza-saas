from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_membership
from app.db.session import get_db
from app.modules.organizations.models import Membership
from app.modules.units import repository as units_repo
from app.modules.units import service as units_service
from app.modules.units.schemas import UnitCreateRequest, UnitRead, UnitUpdateRequest

router = APIRouter(prefix="/units", tags=["units"])


@router.get("/", response_model=list[UnitRead])
def list_units(membership: Membership = Depends(get_current_membership), db: Session = Depends(get_db)):
    return units_repo.list_units(db, organization_id=membership.organization_id)


@router.post("/", response_model=UnitRead, status_code=201)
def create_unit(
    payload: UnitCreateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    return units_service.create_unit(db, organization_id=membership.organization_id, payload=payload)


@router.put("/{unit_id}", response_model=UnitRead)
def update_unit(
    unit_id: int,
    payload: UnitUpdateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    return units_service.update_unit(
        db, organization_id=membership.organization_id, unit_id=unit_id, payload=payload
    )


@router.delete("/{unit_id}", status_code=204)
def delete_unit(
    unit_id: int,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    units_service.delete_unit(db, organization_id=membership.organization_id, unit_id=unit_id)
