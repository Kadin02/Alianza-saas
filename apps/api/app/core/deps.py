from fastapi import Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.modules.auth import repository as auth_repo
from app.modules.auth.models import User
from app.modules.organizations import repository as org_repo
from app.modules.organizations.models import Membership, MembershipRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_current_user(
    token: str | None = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    credentials_error = HTTPException(
        status.HTTP_401_UNAUTHORIZED, "No se pudo validar la sesión"
    )
    if not token:
        raise credentials_error
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise credentials_error
    user = auth_repo.get_user_by_id(db, int(payload["sub"]))
    if not user or not user.is_active:
        raise credentials_error
    return user


def get_current_membership(
    x_organization_id: int = Header(..., alias="X-Organization-Id"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Membership:
    """Resuelve la organización activa desde el header X-Organization-Id y valida que
    el usuario autenticado pertenezca a ella. Todo endpoint scoped a un tenant depende
    de esto en vez de confiar en un organization_id que venga del body/query."""
    membership = org_repo.get_membership(
        db, user_id=current_user.id, organization_id=x_organization_id
    )
    if not membership:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN, "No perteneces a esta organización"
        )
    return membership


def require_roles(*roles: MembershipRole):
    def _check(membership: Membership = Depends(get_current_membership)) -> Membership:
        if membership.role not in roles:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN, "No tienes permiso para esta acción"
            )
        return membership

    return _check
