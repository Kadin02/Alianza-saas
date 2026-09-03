from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_membership
from app.db.session import get_db
from app.modules.dashboard import service as dashboard_service
from app.modules.dashboard.schemas import DashboardSummary
from app.modules.organizations.models import Membership

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    return dashboard_service.get_dashboard_summary(db, organization_id=membership.organization_id)
