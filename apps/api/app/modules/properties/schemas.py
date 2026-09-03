from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.modules.properties.models import PropertyType


class PropertyCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    type: PropertyType
    address: str = Field(min_length=2, max_length=200)
    max_units: int = Field(default=50, ge=1, le=10000)
    phone: str | None = Field(default=None, max_length=40)
    email: str | None = Field(default=None, max_length=160)
    website: str | None = Field(default=None, max_length=200)
    photo_url: str | None = Field(default=None, max_length=500)


class PropertyUpdateRequest(PropertyCreateRequest):
    pass


class PropertyRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    type: PropertyType
    address: str
    max_units: int
    phone: str | None
    email: str | None
    website: str | None
    photo_url: str | None
    created_at: datetime
