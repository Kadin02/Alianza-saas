import type { ChargeStatus } from "./types"

export const chargeStatusLabels: Record<ChargeStatus, string> = {
  PENDIENTE: "Pendiente",
  PARCIAL: "Parcial",
  PAGADO: "Pagado",
}

export const chargeStatusStyles: Record<ChargeStatus, string> = {
  PENDIENTE: "bg-danger-bg text-danger-text",
  PARCIAL: "bg-secondary-fixed text-on-secondary-fixed",
  PAGADO: "bg-surface-container text-on-surface-variant",
}

export function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "—"
  const n = Number(value)
  return n.toLocaleString("es-PA", { style: "currency", currency: "USD" })
}

export function formatDate(value: string): string {
  const [year, month, day] = value.split("-")
  return `${day}/${month}/${year}`
}
