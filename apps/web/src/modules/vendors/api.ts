import { apiClient } from "@/shared/api/client"

import type { VendorPayload, VendorRead } from "./types"

export async function listVendors(): Promise<VendorRead[]> {
  const { data } = await apiClient.get<VendorRead[]>("/vendors/")
  return data
}

export async function createVendor(payload: VendorPayload): Promise<VendorRead> {
  const { data } = await apiClient.post<VendorRead>("/vendors/", payload)
  return data
}

export async function updateVendor(id: number, payload: VendorPayload): Promise<VendorRead> {
  const { data } = await apiClient.put<VendorRead>(`/vendors/${id}`, payload)
  return data
}

export async function deleteVendor(id: number): Promise<void> {
  await apiClient.delete(`/vendors/${id}`)
}
