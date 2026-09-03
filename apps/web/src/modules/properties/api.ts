import { apiClient } from "@/shared/api/client"

import type { PropertyPayload, PropertyRead } from "./types"

export async function listProperties(): Promise<PropertyRead[]> {
  const { data } = await apiClient.get<PropertyRead[]>("/properties/")
  return data
}

export async function createProperty(payload: PropertyPayload): Promise<PropertyRead> {
  const { data } = await apiClient.post<PropertyRead>("/properties/", payload)
  return data
}

export async function updateProperty(id: number, payload: PropertyPayload): Promise<PropertyRead> {
  const { data } = await apiClient.put<PropertyRead>(`/properties/${id}`, payload)
  return data
}

export async function deleteProperty(id: number): Promise<void> {
  await apiClient.delete(`/properties/${id}`)
}
