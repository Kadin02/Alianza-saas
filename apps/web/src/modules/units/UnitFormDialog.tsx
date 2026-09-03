import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { listProperties } from "@/modules/properties/api"
import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"

import { createUnit, updateUnit } from "./api"
import { unitTypeLabels } from "./labels"
import type { UnitRead } from "./types"

const unitSchema = z.object({
  property_id: z.coerce.number().int().min(1, "Selecciona una propiedad"),
  unit_number: z.string().min(1, "Ingresa el número de unidad"),
  floor: z.string().optional(),
  unit_type: z.enum(["DEPARTAMENTO", "OFICINA", "BODEGA", "ESTACIONAMIENTO", "LOCAL_COMERCIAL"]),
  monthly_fee: z.coerce.number().min(0).optional(),
})

type UnitFormInput = z.input<typeof unitSchema>
type UnitFormValues = z.output<typeof unitSchema>

interface UnitFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: UnitRead | null
}

export function UnitFormDialog({ open, onOpenChange, editing }: UnitFormDialogProps) {
  const queryClient = useQueryClient()

  const { data: properties } = useQuery({ queryKey: ["properties"], queryFn: listProperties })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UnitFormInput, unknown, UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: { unit_type: "DEPARTAMENTO" },
  })

  useEffect(() => {
    if (open) {
      reset(
        editing
          ? {
              property_id: editing.property_id,
              unit_number: editing.unit_number,
              floor: editing.floor ?? "",
              unit_type: editing.unit_type,
              monthly_fee: editing.monthly_fee ? Number(editing.monthly_fee) : undefined,
            }
          : { property_id: properties?.[0]?.id, unit_number: "", floor: "", unit_type: "DEPARTAMENTO" }
      )
    }
  }, [open, editing, properties, reset])

  const mutation = useMutation({
    mutationFn: (values: UnitFormValues) =>
      editing ? updateUnit(editing.id, values) : createUnit(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] })
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{editing ? "Editar Unidad" : "Nueva Unidad"}</DialogTitle>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <div>
            <Label htmlFor="property_id">Propiedad / Comunidad *</Label>
            <select
              id="property_id"
              className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-body-lg text-on-surface focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              {...register("property_id")}
            >
              {!properties?.length && <option value="">No hay propiedades — crea una primero</option>}
              {properties?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.property_id && <p className="mt-1 text-body-sm text-danger">{errors.property_id.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unit_number">Número de Unidad *</Label>
              <Input id="unit_number" className="mt-1" placeholder="ej. Depto 304-B" {...register("unit_number")} />
              {errors.unit_number && <p className="mt-1 text-body-sm text-danger">{errors.unit_number.message}</p>}
            </div>
            <div>
              <Label htmlFor="floor">Piso o Nivel</Label>
              <Input id="floor" className="mt-1" placeholder="Piso 3" {...register("floor")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unit_type">Tipo de Unidad *</Label>
              <select
                id="unit_type"
                className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-body-lg text-on-surface focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                {...register("unit_type")}
              >
                {Object.entries(unitTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="monthly_fee">Cuota Mensual Base</Label>
              <div className="relative mt-1 flex items-center">
                <span className="pointer-events-none absolute left-3 text-body-lg font-semibold text-on-surface-variant">$</span>
                <Input id="monthly_fee" type="number" step="0.01" min={0} className="pl-6" placeholder="185.00" {...register("monthly_fee")} />
              </div>
            </div>
          </div>

          {mutation.isError && (
            <p className="rounded-lg bg-danger-bg px-3 py-2 text-body-sm text-danger-text">
              No se pudo guardar la unidad. Intenta de nuevo.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending || !properties?.length}>
              {mutation.isPending ? "Guardando…" : editing ? "Guardar cambios" : "Crear unidad"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
