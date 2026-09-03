from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.owners import repository as owners_repo
from app.modules.owners.models import Owner
from app.modules.owners.schemas import OwnerCreateRequest, OwnerRead, OwnerUpdateRequest
from app.modules.units import repository as units_repo


def _to_owner_read(db: Session, owner: Owner) -> OwnerRead:
    link = owners_repo.get_active_unit_link(db, owner_id=owner.id)
    unit_id = link.unit_id if link else None
    unit_number = link.unit.unit_number if link else None
    property_name = link.unit.property_name if link else None
    return OwnerRead(
        **{k: getattr(owner, k) for k in ("id", "full_name", "email", "phone", "identification", "created_at")},
        unit_id=unit_id,
        unit_number=unit_number,
        property_name=property_name,
    )


def list_owners(db: Session, *, organization_id: int) -> list[OwnerRead]:
    owners = owners_repo.list_owners(db, organization_id=organization_id)
    return [_to_owner_read(db, o) for o in owners]


def get_owner_or_404(db: Session, *, organization_id: int, owner_id: int) -> Owner:
    owner = owners_repo.get_owner(db, organization_id=organization_id, owner_id=owner_id)
    if not owner:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Propietario no encontrado")
    return owner


def create_owner(db: Session, *, organization_id: int, payload: OwnerCreateRequest) -> OwnerRead:
    if payload.unit_id is not None:
        unit = units_repo.get_unit(db, organization_id=organization_id, unit_id=payload.unit_id)
        if not unit:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "La unidad no pertenece a esta organización")

    owner = owners_repo.create_owner(
        db,
        organization_id=organization_id,
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        identification=payload.identification,
    )
    if payload.unit_id is not None:
        owners_repo.link_owner_to_unit(
            db, organization_id=organization_id, owner_id=owner.id, unit_id=payload.unit_id
        )
    db.commit()
    db.refresh(owner)
    return _to_owner_read(db, owner)


def update_owner(
    db: Session, *, organization_id: int, owner_id: int, payload: OwnerUpdateRequest
) -> OwnerRead:
    owner = get_owner_or_404(db, organization_id=organization_id, owner_id=owner_id)
    owner = owners_repo.update_owner(
        db,
        owner=owner,
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        identification=payload.identification,
    )
    return _to_owner_read(db, owner)


def delete_owner(db: Session, *, organization_id: int, owner_id: int) -> None:
    owner = get_owner_or_404(db, organization_id=organization_id, owner_id=owner_id)
    owners_repo.delete_owner(db, owner=owner)


def assign_unit(db: Session, *, organization_id: int, owner_id: int, unit_id: int) -> OwnerRead:
    owner = get_owner_or_404(db, organization_id=organization_id, owner_id=owner_id)

    unit = units_repo.get_unit(db, organization_id=organization_id, unit_id=unit_id)
    if not unit:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "La unidad no pertenece a esta organización")

    current_owner_link = owners_repo.get_active_unit_link(db, owner_id=owner.id)
    if current_owner_link and current_owner_link.unit_id != unit_id:
        owners_repo.deactivate_link(db, link=current_owner_link)

    current_unit_link = owners_repo.get_active_unit_link_for_unit(db, unit_id=unit_id)
    if current_unit_link and current_unit_link.owner_id != owner.id:
        owners_repo.deactivate_link(db, link=current_unit_link)

    if not (current_owner_link and current_owner_link.unit_id == unit_id):
        owners_repo.link_owner_to_unit(db, organization_id=organization_id, owner_id=owner.id, unit_id=unit_id)

    db.commit()
    db.refresh(owner)
    return _to_owner_read(db, owner)


def unassign_unit(db: Session, *, organization_id: int, owner_id: int) -> OwnerRead:
    owner = get_owner_or_404(db, organization_id=organization_id, owner_id=owner_id)

    link = owners_repo.get_active_unit_link(db, owner_id=owner.id)
    if link:
        owners_repo.deactivate_link(db, link=link)

    db.commit()
    db.refresh(owner)
    return _to_owner_read(db, owner)
