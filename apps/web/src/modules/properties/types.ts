export type PropertyType = "PH" | "CASA" | "LOCAL"

export interface PropertyRead {
  id: number
  name: string
  type: PropertyType
  address: string
  max_units: number
  phone: string | null
  email: string | null
  website: string | null
  photo_url: string | null
  created_at: string
}

export interface PropertyPayload {
  name: string
  type: PropertyType
  address: string
  max_units: number
  phone?: string
  email?: string
  website?: string
  photo_url?: string
}
