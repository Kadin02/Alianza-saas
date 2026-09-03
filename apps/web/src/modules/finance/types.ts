export type ChargeStatus = "PENDIENTE" | "PARCIAL" | "PAGADO"

export interface ChargeRead {
  id: number
  unit_id: number
  unit_number: string
  property_name: string
  description: string
  amount: string
  applied_amount: string
  balance: string
  status: ChargeStatus
  date_created: string
  due_date: string
  created_at: string
}

export interface ChargeCreatePayload {
  unit_id: number
  description: string
  amount: number
  date_created: string
  due_date: string
}

export interface PaymentRead {
  id: number
  unit_id: number
  unit_number: string
  property_name: string
  owner_id: number | null
  owner_name: string | null
  amount: string
  applied_to_charges: string
  credit_generated: string
  payment_date: string
  method: string | null
  reference: string | null
  created_at: string
}

export interface PaymentCreatePayload {
  unit_id: number
  owner_id?: number
  amount: number
  payment_date: string
  method?: string
  reference?: string
}

export interface LedgerRow {
  fecha: string
  tipo: "CARGO" | "PAGO"
  concepto: string
  cargo: string
  pago: string
  saldo: string
}

export interface UnitStatement {
  unit_id: number
  unit_number: string
  property_name: string
  owner_id: number | null
  owner_name: string | null
  total_due: string
  total_cargos: string
  total_pagos: string
  ledger: LedgerRow[]
}
