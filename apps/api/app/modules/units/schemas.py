from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.modules.units.models import UnitType


class UnitCreateRequest(BaseModel):
    property_id: int
    unit_number: str = Field(min_length=1, max_length=40)
    floor: str | None = Field(default=None, max_length=40)
    unit_type: UnitType = UnitType.DEPARTAMENTO
    monthly_fee: Decimal | None = Field(default=None, ge=0)


class UnitUpdateRequest(UnitCreateRequest):
    pass


class UnitRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    property_id: int
    property_name: str
    unit_number: str
    floor: str | None
    unit_type: UnitType
    monthly_fee: Decimal | None
    created_at: datetime
