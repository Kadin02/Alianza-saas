import { apiClient } from "@/shared/api/client"

import type { OwnerCreatePayload, OwnerRead, OwnerUpdatePayload } from "./types"

export async function listOwners(): Promise<OwnerRead[]> {
  const { data } = await apiClient.get<OwnerRead[]>("/owners/")
  return data
}

export async function createOwner(payload: OwnerCreatePayload): Promise<OwnerRead> {
  const { data } = await apiClient.post<OwnerRead>("/owners/", payload)
  return data
}

export async function updateOwner(id: number, payload: OwnerUpdatePayload): Promise<OwnerRead> {
  const { data } = await apiClient.put<OwnerRead>(`/owners/${id}`, payload)
  return data
}

export async function deleteOwner(id: number): Promise<void> {
  await apiClient.delete(`/owners/${id}`)
}

export async function assignUnit(ownerId: number, unitId: number): Promise<OwnerRead> {
  const { data } = await apiClient.post<OwnerRead>(`/owners/${ownerId}/assign-unit`, { unit_id: unitId })
  return data
}

export async function unassignUnit(ownerId: number): Promise<OwnerRead> {
  const { data } = await apiClient.delete<OwnerRead>(`/owners/${ownerId}/unit`)
  return data
}
