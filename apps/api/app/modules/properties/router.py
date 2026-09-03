from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_membership
from app.db.session import get_db
from app.modules.organizations.models import Membership
from app.modules.properties import repository as properties_repo
from app.modules.properties import service as properties_service
from app.modules.properties.schemas import PropertyCreateRequest, PropertyRead, PropertyUpdateRequest

router = APIRouter(prefix="/properties", tags=["properties"])


@router.get("/", response_model=list[PropertyRead])
def list_properties(
    membership: Membership = Depends(get_current_membership), db: Session = Depends(get_db)
):
    return properties_repo.list_properties(db, organization_id=membership.organization_id)


@router.post("/", response_model=PropertyRead, status_code=201)
def create_property(
    payload: PropertyCreateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    return properties_service.create_property(
        db, organization_id=membership.organization_id, payload=payload
    )


@router.put("/{property_id}", response_model=PropertyRead)
def update_property(
    property_id: int,
    payload: PropertyUpdateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    return properties_service.update_property(
        db, organization_id=membership.organization_id, property_id=property_id, payload=payload
    )


@router.delete("/{property_id}", status_code=204)
def delete_property(
    property_id: int,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    properties_service.delete_property(
        db, organization_id=membership.organization_id, property_id=property_id
    )
