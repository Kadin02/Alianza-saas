from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.vendors import repository as vendors_repo
from app.modules.vendors.models import Vendor
from app.modules.vendors.schemas import VendorCreateRequest, VendorUpdateRequest


def get_vendor_or_404(db: Session, *, organization_id: int, vendor_id: int) -> Vendor:
    vendor = vendors_repo.get_vendor(db, organization_id=organization_id, vendor_id=vendor_id)
    if not vendor:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Proveedor no encontrado")
    return vendor


def create_vendor(db: Session, *, organization_id: int, payload: VendorCreateRequest) -> Vendor:
    return vendors_repo.create_vendor(db, organization_id=organization_id, payload=payload)


def update_vendor(db: Session, *, organization_id: int, vendor_id: int, payload: VendorUpdateRequest) -> Vendor:
    vendor = get_vendor_or_404(db, organization_id=organization_id, vendor_id=vendor_id)
    return vendors_repo.update_vendor(db, vendor=vendor, payload=payload)


def delete_vendor(db: Session, *, organization_id: int, vendor_id: int) -> None:
    vendor = get_vendor_or_404(db, organization_id=organization_id, vendor_id=vendor_id)
    vendors_repo.delete_vendor(db, vendor=vendor)
