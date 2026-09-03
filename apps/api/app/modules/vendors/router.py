from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_membership
from app.db.session import get_db
from app.modules.organizations.models import Membership
from app.modules.vendors import repository as vendors_repo
from app.modules.vendors import service as vendors_service
from app.modules.vendors.schemas import VendorCreateRequest, VendorRead, VendorUpdateRequest

router = APIRouter(prefix="/vendors", tags=["vendors"])


@router.get("/", response_model=list[VendorRead])
def list_vendors(membership: Membership = Depends(get_current_membership), db: Session = Depends(get_db)):
    return vendors_repo.list_vendors(db, organization_id=membership.organization_id)


@router.post("/", response_model=VendorRead, status_code=201)
def create_vendor(
    payload: VendorCreateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    return vendors_service.create_vendor(db, organization_id=membership.organization_id, payload=payload)


@router.put("/{vendor_id}", response_model=VendorRead)
def update_vendor(
    vendor_id: int,
    payload: VendorUpdateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    return vendors_service.update_vendor(
        db, organization_id=membership.organization_id, vendor_id=vendor_id, payload=payload
    )


@router.delete("/{vendor_id}", status_code=204)
def delete_vendor(
    vendor_id: int,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    vendors_service.delete_vendor(db, organization_id=membership.organization_id, vendor_id=vendor_id)
