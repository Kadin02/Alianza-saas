from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.modules.organizations.models import (
    MembershipRole,
    OrganizationType,
    PlanTier,
    SubscriptionStatus,
)


class OrganizationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    logo_url: str | None
    brand_color: str | None
    org_type: OrganizationType | None
    tax_id: str | None
    contact_email: str | None
    contact_phone: str | None
    address: str | None
    plan: PlanTier
    subscription_status: SubscriptionStatus
    created_at: datetime


class MembershipRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: MembershipRole
    organization: OrganizationRead


class OrganizationCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    slug: str | None = Field(default=None, min_length=3, max_length=60)
    org_type: OrganizationType | None = None
    tax_id: str | None = Field(default=None, max_length=40)
    contact_email: str | None = Field(default=None, max_length=160)
    contact_phone: str | None = Field(default=None, max_length=40)
    address: str | None = Field(default=None, max_length=200)
    brand_color: str | None = Field(default=None, max_length=20)


class SlugAvailabilityResponse(BaseModel):
    slug: str
    available: bool
