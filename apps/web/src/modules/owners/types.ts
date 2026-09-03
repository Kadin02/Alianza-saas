export interface OwnerRead {
  id: number
  full_name: string
  email: string | null
  phone: string | null
  identification: string | null
  created_at: string
  unit_id: number | null
  unit_number: string | null
  property_name: string | null
}

export interface OwnerCreatePayload {
  full_name: string
  email?: string
  phone?: string
  identification?: string
  unit_id?: number
}

export interface OwnerUpdatePayload {
  full_name: string
  email?: string
  phone?: string
  identification?: string
}
