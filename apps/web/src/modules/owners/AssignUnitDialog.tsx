import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { listUnits } from "@/modules/units/api"
import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog"
import { Label } from "@/shared/ui/label"
import { blurActiveElement } from "@/shared/lib/utils"

import { assignUnit, unassignUnit } from "./api"
import type { OwnerRead } from "./types"

interface AssignUnitDialogProps {
  owner: OwnerRead | null
  onOpenChange: (open: boolean) => void
}

export function AssignUnitDialog({ owner, onOpenChange }: AssignUnitDialogProps) {
  const queryClient = useQueryClient()
  const { data: units } = useQuery({ queryKey: ["units"], queryFn: listUnits })
  const [unitId, setUnitId] = useState<string>("")

  useEffect(() => {
    if (owner) {
      setUnitId(owner.unit_id ? String(owner.unit_id) : "")
    }
  }, [owner])

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) blurActiveElement()
    onOpenChange(nextOpen)
  }

  const assignMutation = useMutation({
    mutationFn: () => assignUnit(owner!.id, Number(unitId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owners"] })
      handleClose(false)
    },
  })

  const unassignMutation = useMutation({
    mutationFn: () => unassignUnit(owner!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owners"] })
      handleClose(false)
    },
  })

  const isPending = assignMutation.isPending || unassignMutation.isPending

  return (
    <Dialog open={owner !== null} onOpenChange={handleClose}>
      <DialogContent>
        <DialogTitle>Asignar Unidad</DialogTitle>
        {owner && (
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Elige la unidad de <span className="font-semibold text-on-surface">{owner.full_name}</span>. Si ya tenía una
            asignada, se reemplaza.
          </p>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="unit_id">Unidad</Label>
            <select
              id="unit_id"
              className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-body-lg text-on-surface focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
            >
              <option value="">Sin asignar</option>
              {units?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.unit_number} — {u.property_name}
                </option>
              ))}
            </select>
          </div>

          {(assignMutation.isError || unassignMutation.isError) && (
            <p className="rounded-lg bg-danger-bg px-3 py-2 text-body-sm text-danger-text">
              No se pudo actualizar la asignación. Intenta de nuevo.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => handleClose(false)}>
              Cancelar
            </Button>
            {owner?.unit_id && (
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                onClick={() => unassignMutation.mutate()}
              >
                Quitar asignación
              </Button>
            )}
            <Button
              type="button"
              disabled={isPending || !unitId}
              onClick={() => assignMutation.mutate()}
            >
              {assignMutation.isPending ? "Guardando…" : "Asignar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
