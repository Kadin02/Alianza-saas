import { apiClient } from "@/shared/api/client"
import type { MembershipRead } from "@/modules/auth/types"

export async function listMyOrganizations(): Promise<MembershipRead[]> {
  const { data } = await apiClient.get<MembershipRead[]>("/organizations/")
  return data
}
