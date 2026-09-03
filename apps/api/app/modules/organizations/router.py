from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_membership, get_current_user
from app.db.session import get_db
from app.modules.auth.models import User
from app.modules.organizations import repository as org_repo
from app.modules.organizations.schemas import MembershipRead, OrganizationRead

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.get("/", response_model=list[MembershipRead])
def list_my_organizations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return org_repo.list_memberships_for_user(db, current_user.id)


@router.get("/current", response_model=OrganizationRead)
def get_current_organization(membership=Depends(get_current_membership)):
    return membership.organization
