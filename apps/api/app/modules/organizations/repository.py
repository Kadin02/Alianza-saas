import re
import uuid

from sqlalchemy.orm import Session

from app.modules.organizations.models import (
    Membership,
    MembershipRole,
    Organization,
    OrganizationType,
)


def normalize_slug(raw: str) -> str:
    return re.sub(r"[^a-z0-9-]+", "-", raw.lower()).strip("-")


def slugify(name: str) -> str:
    base = normalize_slug(name)
    return f"{base}-{uuid.uuid4().hex[:6]}"


def slug_exists(db: Session, slug: str) -> bool:
    return db.query(Organization).filter(Organization.slug == slug).first() is not None


def create_organization(
    db: Session,
    *,
    name: str,
    slug: str | None = None,
    org_type: OrganizationType | None = None,
    tax_id: str | None = None,
    contact_email: str | None = None,
    contact_phone: str | None = None,
    address: str | None = None,
    brand_color: str | None = None,
) -> Organization:
    final_slug = slugify(name)
    if slug:
        normalized = normalize_slug(slug)
        if normalized and not slug_exists(db, normalized):
            final_slug = normalized

    org = Organization(
        name=name,
        slug=final_slug,
        org_type=org_type,
        tax_id=tax_id,
        contact_email=contact_email,
        contact_phone=contact_phone,
        address=address,
        brand_color=brand_color,
    )
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
