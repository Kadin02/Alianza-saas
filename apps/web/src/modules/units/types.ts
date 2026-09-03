export type UnitType = "DEPARTAMENTO" | "OFICINA" | "BODEGA" | "ESTACIONAMIENTO" | "LOCAL_COMERCIAL"

export interface UnitRead {
  id: number
  property_id: number
  property_name: string
  unit_number: string
  floor: string | null
  unit_type: UnitType
  monthly_fee: string | null
  created_at: string
}

export interface UnitPayload {
  property_id: number
  unit_number: string
  floor?: string
  unit_type: UnitType
  monthly_fee?: number
}
