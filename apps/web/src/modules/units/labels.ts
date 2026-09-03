import type { UnitType } from "./types"

export const unitTypeLabels: Record<UnitType, string> = {
  DEPARTAMENTO: "Departamento",
  OFICINA: "Oficina",
  BODEGA: "Bodega",
  ESTACIONAMIENTO: "Estacionamiento",
  LOCAL_COMERCIAL: "Local Comercial",
}

export function formatCurrency(value: string | null): string {
  if (!value) return "—"
  const n = Number(value)
  return n.toLocaleString("es-PA", { style: "currency", currency: "USD" })
}
