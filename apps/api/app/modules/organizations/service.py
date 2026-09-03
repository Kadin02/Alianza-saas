from sqlalchemy.orm import Session

from app.modules.auth.models import User
from app.modules.organizations import repository as org_repo
from app.modules.organizations.models import Membership, MembershipRole
from app.modules.organizations.schemas import OrganizationCreateRequest


def create_additional_organization(
    db: Session, *, current_user: User, payload: OrganizationCreateRequest
) -> Membership:
    """Crea una organización nueva para un usuario ya autenticado (ej. desde el botón
    'Crear nueva organización' del selector), asignándolo como ORG_OWNER."""
    org = org_repo.create_organization(
        db,
        name=payload.name,
        slug=payload.slug,
        org_type=payload.org_type,
        tax_id=payload.tax_id,
        contact_email=payload.contact_email,
        contact_phone=payload.contact_phone,
        address=payload.address,
        brand_color=payload.brand_color,
    )
    membership = org_repo.add_membership(
        db, user_id=current_user.id, organization_id=org.id, role=MembershipRole.ORG_OWNER
    )
    db.commit()
    db.refresh(membership)
    return membership
