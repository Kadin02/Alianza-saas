from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.modules.auth import repository as auth_repo
from app.modules.auth.models import User
from app.modules.auth.schemas import LoginRequest, RegisterOrganizationRequest
from app.modules.organizations import repository as org_repo
from app.modules.organizations.models import MembershipRole


def register_organization(db: Session, payload: RegisterOrganizationRequest) -> User:
    if auth_repo.get_user_by_email(db, payload.email):
        raise HTTPException(status.HTTP_409_CONFLICT, "Ya existe una cuenta con ese correo")

    user = auth_repo.create_user(
        db,
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
    )
    org = org_repo.create_organization(db, name=payload.organization_name)
    org_repo.add_membership(
        db, user_id=user.id, organization_id=org.id, role=MembershipRole.ORG_OWNER
    )
    db.commit()
    db.refresh(user)
    return user


def authenticate(db: Session, payload: LoginRequest) -> User:
    user = auth_repo.get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Credenciales inválidas")
    if not user.is_active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Usuario inactivo")
    return user


def issue_token(user: User) -> str:
    return create_access_token(subject=str(user.id))
