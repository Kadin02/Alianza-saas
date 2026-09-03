export type VendorCategory =
  | "MANTENIMIENTO"
  | "SEGURIDAD"
  | "LIMPIEZA"
  | "JARDINERIA"
  | "PLOMERIA"
  | "ELECTRICIDAD"
  | "OTRO"

export interface VendorRead {
  id: number
  name: string
  category: VendorCategory
  contact_name: string | null
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  is_active: boolean
  created_at: string
}

export interface VendorPayload {
  name: string
  category: VendorCategory
  contact_name?: string
  phone?: string
  email?: string
  address?: string
  notes?: string
  is_active: boolean
}
