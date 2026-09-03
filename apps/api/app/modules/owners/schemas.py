from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class OwnerCreateRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=40)
    identification: str | None = Field(default=None, max_length=40)
    unit_id: int | None = None


class OwnerUpdateRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=40)
    identification: str | None = Field(default=None, max_length=40)


class AssignUnitRequest(BaseModel):
    unit_id: int


class OwnerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str | None
    phone: str | None
    identification: str | None
    created_at: datetime
    unit_id: int | None = None
    unit_number: str | None = None
    property_name: str | None = None
