import { apiClient } from "@/shared/api/client"

export interface DashboardActivityItem {
  type: "PAGO" | "CARGO"
  label: string
  detail: string
  amount: string
  date: string
}

export interface DashboardFinance {
  month: number
  year: number
  total_recaudado_mes: string
  total_pendiente: string
  total_morosidad: string
  unidades_en_mora: number
  total_cargos_mes: string
}

export interface DashboardSummary {
  properties_count: number
  units_count: number
  occupied_units: number
  occupancy_rate: number
  owners_count: number
  vendors_count: number
  finance: DashboardFinance
  recent_activity: DashboardActivityItem[]
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await apiClient.get<DashboardSummary>("/dashboard/summary")
  return data
}
