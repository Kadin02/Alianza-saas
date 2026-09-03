import re
import uuid

from sqlalchemy.orm import Session

from app.modules.organizations.models import Membership, MembershipRole, Organization


def slugify(name: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return f"{base}-{uuid.uuid4().hex[:6]}"


def create_organization(db: Session, *, name: str) -> Organization:
    org = Organization(name=name, slug=slugify(name))
    db.add(org)
    db.flush()
    return org


def add_membership(
    db: Session, *, user_id: int, organization_id: int, role: MembershipRole
) -> Membership:
    membership = Membership(user_id=user_id, organization_id=organization_id, role=role)
    db.add(membership)
    db.flush()
    return membership


def list_memberships_for_user(db: Session, user_id: int) -> list[Membership]:
    return db.query(Membership).filter(Membership.user_id == user_id).all()


def get_membership(db: Session, *, user_id: int, organization_id: int) -> Membership | None:
    return (
        db.query(Membership)
        .filter(Membership.user_id == user_id, Membership.organization_id == organization_id)
        .first()
    )
