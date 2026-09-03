from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_membership
from app.db.session import get_db
from app.modules.finance import service as finance_service
from app.modules.finance.schemas import (
    ChargeCreateRequest,
    ChargeRead,
    PaymentCreateRequest,
    PaymentRead,
    UnitStatement,
)
from app.modules.organizations.models import Membership

router = APIRouter(prefix="/finance", tags=["finance"])


@router.get("/charges", response_model=list[ChargeRead])
def list_charges(
    unit_id: int | None = Query(default=None),
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    return finance_service.list_charges(db, organization_id=membership.organization_id, unit_id=unit_id)


@router.post("/charges", response_model=ChargeRead, status_code=201)
def create_charge(
    payload: ChargeCreateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    return finance_service.create_charge(db, organization_id=membership.organization_id, payload=payload)


@router.get("/payments", response_model=list[PaymentRead])
def list_payments(
    unit_id: int | None = Query(default=None),
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    return finance_service.list_payments(db, organization_id=membership.organization_id, unit_id=unit_id)


@router.post("/payments", response_model=PaymentRead, status_code=201)
def create_payment(
    payload: PaymentCreateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    return finance_service.create_payment_fifo(db, organization_id=membership.organization_id, payload=payload)


@router.get("/units/{unit_id}/statement", response_model=UnitStatement)
def get_unit_statement(
    unit_id: int,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    return finance_service.get_unit_statement(db, organization_id=membership.organization_id, unit_id=unit_id)
