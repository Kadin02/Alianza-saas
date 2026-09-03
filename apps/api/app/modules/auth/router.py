from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.modules.auth import service as auth_service
from app.modules.auth.models import User
from app.modules.auth.schemas import (
    LoginRequest,
    MeResponse,
    RegisterOrganizationRequest,
    TokenResponse,
)
from app.modules.organizations import repository as org_repo

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register-organization", response_model=TokenResponse, status_code=201)
def register_organization(payload: RegisterOrganizationRequest, db: Session = Depends(get_db)):
    user = auth_service.register_organization(db, payload)
    memberships = org_repo.list_memberships_for_user(db, user.id)
    token = auth_service.issue_token(user)
    return TokenResponse(access_token=token, user=user, memberships=memberships)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.authenticate(db, payload)
    memberships = org_repo.list_memberships_for_user(db, user.id)
    token = auth_service.issue_token(user)
    return TokenResponse(access_token=token, user=user, memberships=memberships)


@router.get("/me", response_model=MeResponse)
def me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    memberships = org_repo.list_memberships_for_user(db, current_user.id)
    return MeResponse(user=current_user, memberships=memberships)
