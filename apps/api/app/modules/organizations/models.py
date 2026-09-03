import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class PlanTier(str, enum.Enum):
    TRIAL = "TRIAL"
    STARTER = "STARTER"
    PRO = "PRO"


class SubscriptionStatus(str, enum.Enum):
    TRIALING = "TRIALING"
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"


class MembershipRole(str, enum.Enum):
    SUPERADMIN = "SUPERADMIN"
    ORG_OWNER = "ORG_OWNER"
    ADMIN = "ADMIN"
    STAFF_GARITA = "STAFF_GARITA"
    OWNER_PORTAL = "OWNER_PORTAL"


class OrganizationType(str, enum.Enum):
    RESIDENCIAL = "RESIDENCIAL"
    CORPORATIVO = "CORPORATIVO"
    PARCELAS = "PARCELAS"
    ADMINISTRADORA = "ADMINISTRADORA"


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    logo_url: Mapped[str | None] = mapped_column(String, nullable=True)
    brand_color: Mapped[str | None] = mapped_column(String, nullable=True)

    org_type: Mapped[OrganizationType | None] = mapped_column(Enum(OrganizationType), nullable=True)
    tax_id: Mapped[str | None] = mapped_column(String, nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String, nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String, nullable=True)
    address: Mapped[str | None] = mapped_column(String, nullable=True)

    plan: Mapped[PlanTier] = mapped_column(Enum(PlanTier), default=PlanTier.TRIAL, nullable=False)
    subscription_status: Mapped[SubscriptionStatus] = mapped_column(
        Enum(SubscriptionStatus), default=SubscriptionStatus.TRIALING, nullable=False
    )
    max_properties: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    max_units: Mapped[int] = mapped_column(Integer, default=100, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    memberships: Mapped[list["Membership"]] = relationship(
        "Membership", back_populates="organization", cascade="all, delete-orphan"
    )


class Membership(Base):
    """Une un User a una Organization con un rol. Un usuario puede pertenecer a varias
    organizaciones (ej. un contador que administra varias comunidades)."""

    __tablename__ = "memberships"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    organization_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    role: Mapped[MembershipRole] = mapped_column(Enum(MembershipRole), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    user: Mapped["User"] = relationship("User", back_populates="memberships")
    organization: Mapped["Organization"] = relationship("Organization", back_populates="memberships")
