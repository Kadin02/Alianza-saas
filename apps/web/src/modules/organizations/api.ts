import { apiClient } from "@/shared/api/client"
import type { MembershipRead, OrganizationType } from "@/modules/auth/types"

export async function listMyOrganizations(): Promise<MembershipRead[]> {
  const { data } = await apiClient.get<MembershipRead[]>("/organizations/")
  return data
}

export interface CreateOrganizationPayload {
  name: string
  slug?: string
  org_type?: OrganizationType
  tax_id?: string
  contact_email?: string
  contact_phone?: string
  address?: string
  brand_color?: string
}

export async function createOrganization(payload: CreateOrganizationPayload): Promise<MembershipRead> {
  const { data } = await apiClient.post<MembershipRead>("/organizations/", payload)
  return data
}

export async function checkSlugAvailability(slug: string): Promise<{ slug: string; available: boolean }> {
  const { data } = await apiClient.get("/organizations/check-slug", { params: { slug } })
  return data
}
