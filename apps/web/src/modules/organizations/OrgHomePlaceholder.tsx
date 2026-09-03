import { LayoutGrid } from "lucide-react"

/** Placeholder del Dashboard — llega en un módulo posterior con KPIs reales. */
export default function OrgHomePlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest py-24 text-center">
      <LayoutGrid className="h-10 w-10 text-outline" />
      <p className="text-title-sm text-on-surface">Dashboard</p>
      <p className="max-w-sm text-body-sm text-on-surface-variant">
        Próximo módulo — resumen ejecutivo con KPIs reales una vez que haya unidades y cargos cargados.
      </p>
    </div>
  )
}
