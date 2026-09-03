import enum
from datetime import date, datetime, timezone
from decimal import Decimal

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ChargeStatus(str, enum.Enum):
    PENDIENTE = "PENDIENTE"
    PARCIAL = "PARCIAL"
    PAGADO = "PAGADO"


class Charge(Base):
    __tablename__ = "charges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    organization_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    unit_id: Mapped[int] = mapped_column(ForeignKey("units.id"), nullable=False, index=True)

    description: Mapped[str] = mapped_column(String, nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[ChargeStatus] = mapped_column(Enum(ChargeStatus), default=ChargeStatus.PENDIENTE, nullable=False)

    date_created: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    unit = relationship("Unit")
    applications: Mapped[list["PaymentApplication"]] = relationship(
        "PaymentApplication", back_populates="charge", cascade="all, delete-orphan"
    )

    @property
    def applied_amount(self) -> Decimal:
        return sum((a.applied_amount for a in self.applications), Decimal("0.00"))

    @property
    def balance(self) -> Decimal:
        return self.amount - self.applied_amount


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    organization_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    unit_id: Mapped[int] = mapped_column(ForeignKey("units.id"), nullable=False, index=True)
    owner_id: Mapped[int | None] = mapped_column(ForeignKey("owners.id"), nullable=True)

    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    payment_date: Mapped[date] = mapped_column(Date, nullable=False)
    method: Mapped[str | None] = mapped_column(String, nullable=True)
    reference: Mapped[str | None] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    unit = relationship("Unit")
    owner = relationship("Owner")
    applications: Mapped[list["PaymentApplication"]] = relationship(
        "PaymentApplication", back_populates="payment", cascade="all, delete-orphan"
    )


class PaymentApplication(Base):
    __tablename__ = "payment_applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    organization_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    payment_id: Mapped[int] = mapped_column(ForeignKey("payments.id"), nullable=False, index=True)
    charge_id: Mapped[int] = mapped_column(ForeignKey("charges.id"), nullable=False, index=True)

    applied_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    payment: Mapped["Payment"] = relationship("Payment", back_populates="applications")
    charge: Mapped["Charge"] = relationship("Charge", back_populates="applications")
