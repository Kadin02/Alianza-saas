from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.modules.vendors.models import VendorCategory


class VendorCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    category: VendorCategory = VendorCategory.OTRO
    contact_name: str | None = Field(default=None, max_length=120)
    phone: str | None = Field(default=None, max_length=40)
    email: str | None = Field(default=None, max_length=160)
    address: str | None = Field(default=None, max_length=200)
    notes: str | None = Field(default=None, max_length=500)
    is_active: bool = True


class VendorUpdateRequest(VendorCreateRequest):
    pass


class VendorRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: VendorCategory
    contact_name: str | None
    phone: str | None
    email: str | None
    address: str | None
    notes: str | None
    is_active: bool
    created_at: datetime
