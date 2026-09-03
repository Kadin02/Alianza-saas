import { apiClient } from "@/shared/api/client"

import type { UnitPayload, UnitRead } from "./types"

export async function listUnits(): Promise<UnitRead[]> {
  const { data } = await apiClient.get<UnitRead[]>("/units/")
  return data
}

export async function createUnit(payload: UnitPayload): Promise<UnitRead> {
  const { data } = await apiClient.post<UnitRead>("/units/", payload)
  return data
}

export async function updateUnit(id: number, payload: UnitPayload): Promise<UnitRead> {
  const { data } = await apiClient.put<UnitRead>(`/units/${id}`, payload)
  return data
}

export async function deleteUnit(id: number): Promise<void> {
  await apiClient.delete(`/units/${id}`)
}
