import enum
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class VendorCategory(str, enum.Enum):
    MANTENIMIENTO = "MANTENIMIENTO"
    SEGURIDAD = "SEGURIDAD"
    LIMPIEZA = "LIMPIEZA"
    JARDINERIA = "JARDINERIA"
    PLOMERIA = "PLOMERIA"
    ELECTRICIDAD = "ELECTRICIDAD"
    OTRO = "OTRO"


class Vendor(Base):
    __tablename__ = "vendors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    organization_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)

    name: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[VendorCategory] = mapped_column(Enum(VendorCategory), default=VendorCategory.OTRO, nullable=False)
    contact_name: Mapped[str | None] = mapped_column(String, nullable=True)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    email: Mapped[str | None] = mapped_column(String, nullable=True)
    address: Mapped[str | None] = mapped_column(String, nullable=True)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    organization = relationship("Organization")
