import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UnitType(str, enum.Enum):
    DEPARTAMENTO = "DEPARTAMENTO"
    OFICINA = "OFICINA"
    BODEGA = "BODEGA"
    ESTACIONAMIENTO = "ESTACIONAMIENTO"
    LOCAL_COMERCIAL = "LOCAL_COMERCIAL"


class Unit(Base):
    __tablename__ = "units"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    organization_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False, index=True)

    unit_number: Mapped[str] = mapped_column(String, nullable=False)
    floor: Mapped[str | None] = mapped_column(String, nullable=True)
    unit_type: Mapped[UnitType] = mapped_column(Enum(UnitType), default=UnitType.DEPARTAMENTO, nullable=False)
    monthly_fee: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    property_ref = relationship("Property")

    @property
    def property_name(self) -> str:
        return self.property_ref.name
