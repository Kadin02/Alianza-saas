from datetime import date

from sqlalchemy.orm import Session

from app.modules.owners.models import Owner, UnitOwner


def list_owners(db: Session, *, organization_id: int) -> list[Owner]:
    return (
        db.query(Owner)
        .filter(Owner.organization_id == organization_id)
        .order_by(Owner.created_at.desc())
        .all()
    )


def get_owner(db: Session, *, organization_id: int, owner_id: int) -> Owner | None:
    return (
        db.query(Owner)
        .filter(Owner.organization_id == organization_id, Owner.id == owner_id)
        .first()
    )


def create_owner(
    db: Session, *, organization_id: int, full_name: str, email: str | None,
    phone: str | None, identification: str | None,
) -> Owner:
    owner = Owner(
        organization_id=organization_id,
        full_name=full_name,
        email=email,
        phone=phone,
        identification=identification,
    )
    db.add(owner)
    db.flush()
    return owner


def link_owner_to_unit(db: Session, *, organization_id: int, owner_id: int, unit_id: int) -> UnitOwner:
    link = UnitOwner(
        organization_id=organization_id,
        owner_id=owner_id,
        unit_id=unit_id,
        start_date=date.today(),
        is_active=True,
    )
    db.add(link)
    db.flush()
    return link


def get_active_unit_link(db: Session, *, owner_id: int) -> UnitOwner | None:
    return (
        db.query(UnitOwner)
        .filter(UnitOwner.owner_id == owner_id, UnitOwner.is_active.is_(True))
        .first()
    )


def get_active_unit_link_for_unit(db: Session, *, unit_id: int) -> UnitOwner | None:
    return (
        db.query(UnitOwner)
        .filter(UnitOwner.unit_id == unit_id, UnitOwner.is_active.is_(True))
        .first()
    )


def deactivate_link(db: Session, *, link: UnitOwner) -> None:
    link.is_active = False
    link.end_date = date.today()
    db.flush()


def update_owner(
    db: Session, *, owner: Owner, full_name: str, email: str | None,
    phone: str | None, identification: str | None,
) -> Owner:
    owner.full_name = full_name
    owner.email = email
    owner.phone = phone
    owner.identification = identification
    db.commit()
    db.refresh(owner)
    return owner


def delete_owner(db: Session, *, owner: Owner) -> None:
    db.delete(owner)
    db.commit()
