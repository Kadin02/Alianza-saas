import { apiClient } from "@/shared/api/client"

export interface ReportsOverview {
  month: number
  year: number
  total_recaudado_mes: string
  total_pendiente: string
  total_morosidad: string
  unidades_en_mora: number
  total_cargos_mes: string
}

export interface PropertyReportRow {
  property_id: number
  property_name: string
  total_charged: string
  total_paid: string
  total_pending: string
  units_overdue: number
}

export async function getReportsOverview(month: number, year: number): Promise<ReportsOverview> {
  const { data } = await apiClient.get<ReportsOverview>("/finance/reports/overview", { params: { month, year } })
  return data
}

export async function getReportsByProperty(): Promise<PropertyReportRow[]> {
  const { data } = await apiClient.get<PropertyReportRow[]>("/finance/reports/by-property")
  return data
}
