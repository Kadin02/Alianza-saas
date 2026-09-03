import { apiClient } from "@/shared/api/client"

import type { LoginPayload, TokenResponse } from "./types"

export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>("/auth/login", payload)
  return data
}
