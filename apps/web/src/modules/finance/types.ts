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
  is_recargo: boolean
  created_at: string
}

export interface LateFeeCreatePayload {
  amount: number
}

export interface ChargeCreatePayload {
  unit_id: number
  description: string
  amount: number
  date_created: string
  due_date: string
}

export interface GenerateMonthlyChargesPayload {
  property_id?: number
  month: number
  year: number
}

export interface GenerateMonthlyChargesResult {
  created: number
  skipped: number
  month: number
  year: number
  charges: ChargeRead[]
}

export interface PaymentRead {
  id: number
  receipt_number: string | null
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
  tipo: "CARGO" | "PAGO" | "CREDITO"
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
  available_credit: string
  ledger: LedgerRow[]
}

export interface ReceiptApplicationLine {
  charge_id: number
  description: string
  is_recargo: boolean
  applied_amount: string
}

export interface PaymentReceipt {
  payment_id: number
  receipt_number: string | null
  payment_date: string
  amount: string
  method: string | null
  reference: string | null
  subtotal: string
  recargo: string
  credit_generated: string
  owner_name: string | null
  unit_number: string
  property_name: string
  property_address: string
  property_phone: string | null
  property_email: string | null
  applications: ReceiptApplicationLine[]
}
