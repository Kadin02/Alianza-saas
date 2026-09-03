from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.modules.finance.models import ChargeStatus


class ChargeCreateRequest(BaseModel):
    unit_id: int
    description: str = Field(min_length=1, max_length=200)
    amount: Decimal = Field(gt=0)
    date_created: date
    due_date: date


class ChargeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    unit_id: int
    unit_number: str
    property_name: str
    description: str
    amount: Decimal
    applied_amount: Decimal
    balance: Decimal
    status: ChargeStatus
    date_created: date
    due_date: date
    is_recargo: bool
    created_at: datetime


class LateFeeCreateRequest(BaseModel):
    amount: Decimal = Field(gt=0)


class PaymentCreateRequest(BaseModel):
    unit_id: int
    owner_id: int | None = None
    amount: Decimal = Field(gt=0)
    payment_date: date
    method: str | None = Field(default=None, max_length=60)
    reference: str | None = Field(default=None, max_length=100)


class PaymentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    unit_id: int
    unit_number: str
    property_name: str
    owner_id: int | None
    owner_name: str | None
    amount: Decimal
    applied_to_charges: Decimal
    credit_generated: Decimal
    payment_date: date
    method: str | None
    reference: str | None
    created_at: datetime


class LedgerRow(BaseModel):
    fecha: date
    tipo: str
    concepto: str
    cargo: Decimal
    pago: Decimal
    saldo: Decimal


class UnitStatement(BaseModel):
    unit_id: int
    unit_number: str
    property_name: str
    owner_id: int | None
    owner_name: str | None
    total_due: Decimal
    total_cargos: Decimal
    total_pagos: Decimal
    available_credit: Decimal
    ledger: list[LedgerRow]


class OwnerCreditRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    amount: Decimal
    remaining_amount: Decimal
    source_payment_id: int | None
    created_at: datetime
