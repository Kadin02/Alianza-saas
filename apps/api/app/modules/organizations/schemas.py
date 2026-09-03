from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.modules.organizations.models import MembershipRole, PlanTier, SubscriptionStatus


class OrganizationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    logo_url: str | None
    brand_color: str | None
    plan: PlanTier
    subscription_status: SubscriptionStatus
    created_at: datetime


class MembershipRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: MembershipRole
    organization: OrganizationRead
