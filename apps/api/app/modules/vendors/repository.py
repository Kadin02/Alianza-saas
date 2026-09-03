from sqlalchemy.orm import Session

from app.modules.vendors.models import Vendor
from app.modules.vendors.schemas import VendorCreateRequest, VendorUpdateRequest


def list_vendors(db: Session, *, organization_id: int) -> list[Vendor]:
    return (
        db.query(Vendor)
        .filter(Vendor.organization_id == organization_id)
        .order_by(Vendor.created_at.desc())
        .all()
    )


def get_vendor(db: Session, *, organization_id: int, vendor_id: int) -> Vendor | None:
    return (
        db.query(Vendor)
        .filter(Vendor.organization_id == organization_id, Vendor.id == vendor_id)
        .first()
    )


def create_vendor(db: Session, *, organization_id: int, payload: VendorCreateRequest) -> Vendor:
    vendor = Vendor(organization_id=organization_id, **payload.model_dump())
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor


def update_vendor(db: Session, *, vendor: Vendor, payload: VendorUpdateRequest) -> Vendor:
    for field, value in payload.model_dump().items():
        setattr(vendor, field, value)
    db.commit()
    db.refresh(vendor)
    return vendor


def delete_vendor(db: Session, *, vendor: Vendor) -> None:
    db.delete(vendor)
    db.commit()
