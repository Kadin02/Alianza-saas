from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_membership
from app.db.session import get_db
from app.modules.organizations.models import Membership
from app.modules.owners import service as owners_service
from app.modules.owners.schemas import AssignUnitRequest, OwnerCreateRequest, OwnerRead, OwnerUpdateRequest

router = APIRouter(prefix="/owners", tags=["owners"])


@router.get("/", response_model=list[OwnerRead])
def list_owners(membership: Membership = Depends(get_current_membership), db: Session = Depends(get_db)):
    return owners_service.list_owners(db, organization_id=membership.organization_id)


@router.post("/", response_model=OwnerRead, status_code=201)
def create_owner(
    payload: OwnerCreateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    return owners_service.create_owner(db, organization_id=membership.organization_id, payload=payload)


@router.put("/{owner_id}", response_model=OwnerRead)
def update_owner(
    owner_id: int,
    payload: OwnerUpdateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    return owners_service.update_owner(
        db, organization_id=membership.organization_id, owner_id=owner_id, payload=payload
    )


@router.delete("/{owner_id}", status_code=204)
def delete_owner(
    owner_id: int,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    owners_service.delete_owner(db, organization_id=membership.organization_id, owner_id=owner_id)


@router.post("/{owner_id}/assign-unit", response_model=OwnerRead)
def assign_unit(
    owner_id: int,
    payload: AssignUnitRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    return owners_service.assign_unit(
        db, organization_id=membership.organization_id, owner_id=owner_id, unit_id=payload.unit_id
    )


@router.delete("/{owner_id}/unit", response_model=OwnerRead)
def unassign_unit(
    owner_id: int,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    return owners_service.unassign_unit(db, organization_id=membership.organization_id, owner_id=owner_id)
