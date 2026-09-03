import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Grid2x2, Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/shared/ui/button"

import { deleteUnit, listUnits } from "./api"
import { formatCurrency, unitTypeLabels } from "./labels"
import type { UnitRead } from "./types"
import { UnitFormDialog } from "./UnitFormDialog"

export default function UnitsPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<UnitRead | null>(null)

  const { data: units, isLoading } = useQuery({ queryKey: ["units"], queryFn: listUnits })

  const deleteMutation = useMutation({
    mutationFn: deleteUnit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["units"] }),
  })

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(unit: UnitRead) {
    setEditing(unit)
    setDialogOpen(true)
  }

  function handleDelete(unit: UnitRead) {
    if (window.confirm(`¿Eliminar la unidad "${unit.unit_number}"? Esta acción no se puede deshacer.`)) {
      deleteMutation.mutate(unit.id)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="heading-gradient text-headline-lg font-bold">Unidades</h1>
            <span className="rounded-full bg-surface-container-high px-2.5 py-0.5 text-label-sm font-semibold text-on-surface-variant">
              {units?.length ?? 0} {units?.length === 1 ? "unidad" : "unidades"}
            </span>
          </div>
          <p className="mt-0.5 text-body-sm text-on-surface-variant">Catálogo físico de departamentos, locales y estacionamientos</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nueva Unidad
        </Button>
      </div>

      {isLoading && <p className="text-body-md text-on-surface-variant">Cargando…</p>}

      {!isLoading && units?.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest py-16 text-center">
          <Grid2x2 className="h-10 w-10 text-outline" />
          <p className="text-title-sm text-on-surface">Todavía no tienes unidades</p>
          <p className="max-w-sm text-body-sm text-on-surface-variant">
            Crea tu primer departamento, local o estacionamiento dentro de una propiedad.
          </p>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nueva Unidad
          </Button>
        </div>
      )}

      {!!units?.length && (
        <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="h-9 bg-surface-container-low text-label-sm uppercase tracking-wider text-on-surface-variant">
                <th className="px-4">Unidad</th>
                <th className="px-3">Propiedad</th>
                <th className="px-3">Piso</th>
                <th className="px-3">Tipo</th>
                <th className="px-3 text-right">Cuota mensual</th>
                <th className="px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {units.map((unit) => (
                <tr key={unit.id} className="h-12 transition-colors hover:bg-surface-container-low/50">
                  <td className="px-4 font-semibold text-on-surface">{unit.unit_number}</td>
                  <td className="px-3 text-body-sm text-on-surface-variant">{unit.property_name}</td>
                  <td className="px-3 text-body-sm text-on-surface-variant">{unit.floor || "—"}</td>
                  <td className="px-3">
                    <span className="rounded-full bg-secondary-fixed px-2 py-0.5 text-label-sm font-semibold text-on-secondary-fixed">
                      {unitTypeLabels[unit.unit_type]}
                    </span>
                  </td>
                  <td className="px-3 text-right font-numeric-data text-primary-container">
                    {formatCurrency(unit.monthly_fee)}
                  </td>
                  <td className="px-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(unit)}
                        className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(unit)}
                        className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-danger-bg hover:text-danger"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UnitFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />
    </div>
  )
}
