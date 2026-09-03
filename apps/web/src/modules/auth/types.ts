export type MembershipRole =
  | "SUPERADMIN"
  | "ORG_OWNER"
  | "ADMIN"
  | "STAFF_GARITA"
  | "OWNER_PORTAL"

export interface OrganizationRead {
  id: number
  name: string
  slug: string
  logo_url: string | null
  brand_color: string | null
  plan: "TRIAL" | "STARTER" | "PRO"
  subscription_status: "TRIALING" | "ACTIVE" | "SUSPENDED"
  created_at: string
}

export interface MembershipRead {
  id: number
  role: MembershipRole
  organization: OrganizationRead
}

export interface UserRead {
  id: number
  email: string
  full_name: string
  is_superadmin: boolean
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: UserRead
  memberships: MembershipRead[]
}

export interface LoginPayload {
  email: string
  password: string
}
