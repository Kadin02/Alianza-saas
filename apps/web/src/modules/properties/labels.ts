import type { PropertyType } from "./types"

export const propertyTypeLabels: Record<PropertyType, { title: string; badge: string }> = {
  PH: { title: "PH / Edificio", badge: "PH / Edificio" },
  CASA: { title: "Casa / Condominio", badge: "Condominio Casas" },
  LOCAL: { title: "Local Comercial", badge: "Local Comercial" },
}
