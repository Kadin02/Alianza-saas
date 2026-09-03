from datetime import date
from decimal import Decimal

from pydantic import BaseModel

from app.modules.finance.schemas import ReportsOverview


class ActivityItem(BaseModel):
    type: str
    label: str
    detail: str
    amount: Decimal
    date: date


class DashboardSummary(BaseModel):
    properties_count: int
    units_count: int
    occupied_units: int
    occupancy_rate: float
    owners_count: int
    vendors_count: int
    finance: ReportsOverview
    recent_activity: list[ActivityItem]
