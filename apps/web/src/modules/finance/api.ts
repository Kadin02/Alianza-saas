import { apiClient } from "@/shared/api/client"

import type {
  ChargeCreatePayload,
  ChargeRead,
  GenerateMonthlyChargesPayload,
  GenerateMonthlyChargesResult,
  LateFeeCreatePayload,
  PaymentCreatePayload,
  PaymentReceipt,
  PaymentRead,
  UnitStatement,
} from "./types"

export async function listCharges(unitId?: number): Promise<ChargeRead[]> {
  const { data } = await apiClient.get<ChargeRead[]>("/finance/charges", {
    params: unitId ? { unit_id: unitId } : undefined,
  })
  return data
}

export async function createCharge(payload: ChargeCreatePayload): Promise<ChargeRead> {
  const { data } = await apiClient.post<ChargeRead>("/finance/charges", payload)
  return data
}

export async function generateMonthlyCharges(payload: GenerateMonthlyChargesPayload): Promise<GenerateMonthlyChargesResult> {
  const { data } = await apiClient.post<GenerateMonthlyChargesResult>("/finance/charges/generate-monthly", payload)
  return data
}

export async function createLateFee(chargeId: number, payload: LateFeeCreatePayload): Promise<ChargeRead> {
  const { data } = await apiClient.post<ChargeRead>(`/finance/charges/${chargeId}/late-fee`, payload)
  return data
}

export async function listPayments(unitId?: number): Promise<PaymentRead[]> {
  const { data } = await apiClient.get<PaymentRead[]>("/finance/payments", {
    params: unitId ? { unit_id: unitId } : undefined,
  })
  return data
}

export async function createPayment(payload: PaymentCreatePayload): Promise<PaymentRead> {
  const { data } = await apiClient.post<PaymentRead>("/finance/payments", payload)
  return data
}

export async function getUnitStatement(unitId: number): Promise<UnitStatement> {
  const { data } = await apiClient.get<UnitStatement>(`/finance/units/${unitId}/statement`)
  return data
}

export async function getPaymentReceipt(paymentId: number): Promise<PaymentReceipt> {
  const { data } = await apiClient.get<PaymentReceipt>(`/finance/payments/${paymentId}/receipt`)
  return data
}
