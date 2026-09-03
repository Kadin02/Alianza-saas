from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.modules.organizations.schemas import MembershipRead


class RegisterOrganizationRequest(BaseModel):
    """Alta de una organización nueva junto con su primer usuario (ORG_OWNER)."""

    organization_name: str = Field(min_length=2, max_length=120)
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    is_superadmin: bool


class MeResponse(BaseModel):
    user: UserRead
    memberships: list[MembershipRead]


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
    memberships: list[MembershipRead]
