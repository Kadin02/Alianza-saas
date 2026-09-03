import axios from "axios"

import { getToken } from "@/shared/lib/auth-storage"
import { getActiveOrgId } from "@/shared/lib/org-storage"

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8011/api",
})

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  const orgId = getActiveOrgId()
  if (orgId) {
    config.headers["X-Organization-Id"] = orgId
  }
  return config
})
