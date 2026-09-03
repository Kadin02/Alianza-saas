import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { listUnits } from "@/modules/units/api"
import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { blurActiveElement } from "@/shared/lib/utils"

import { createCharge } from "./api"

const today = new Date().toISOString().slice(0, 10)

const chargeSchema = z.object({
  unit_id: z.coerce.number().int().min(1, "Selecciona una unidad"),
  description: z.string().min(2, "Ingresa una descripción"),
  amount: z.coerce.number().gt(0, "Debe ser mayor a 0"),
  date_created: z.string().min(1, "Requerido"),
  due_date: z.string().min(1, "Requerido"),
})

type ChargeFormInput = z.input<typeof chargeSchema>
type ChargeFormValues = z.output<typeof chargeSchema>

interface ChargeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChargeFormDialog({ open, onOpenChange }: ChargeFormDialogProps) {
  const queryClient = useQueryClient()
  const { data: units } = useQuery({ queryKey: ["units"], queryFn: listUnits })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChargeFormInput, unknown, ChargeFormValues>({
    resolver: zodResolver(chargeSchema),
    defaultValues: { description: "Cuota mensual", date_created: today, due_date: today },
  })

  useEffect(() => {
    if (open) {
      reset({
        unit_id: units?.[0]?.id,
        description: "Cuota mensual",
        amount: undefined,
        date_created: today,
        due_date: today,
      })
    }
  }, [open, units, reset])

  const mutation = useMutation({
    mutationFn: createCharge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charges"] })
      blurActiveElement()
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Nuevo Cargo</DialogTitle>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <div>
            <Label htmlFor="unit_id">Unidad *</Label>
            <select
              id="unit_id"
              className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-body-lg text-on-surface focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              {...register("unit_id")}
            >
              {!units?.length && <option value="">No hay unidades — crea una primero</option>}
              {units?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.unit_number} — {u.property_name}
                </option>
              ))}
            </select>
            {errors.unit_id && <p className="mt-1 text-body-sm text-danger">{errors.unit_id.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Descripción *</Label>
            <Input id="description" autoComplete="off" className="mt-1" placeholder="Cuota mensual Septiembre" {...register("description")} />
            {errors.description && <p className="mt-1 text-body-sm text-danger">{errors.description.message}</p>}
          </div>

          <div>
            <Label htmlFor="amount">Monto *</Label>
            <div className="relative mt-1 flex items-center">
              <span className="pointer-events-none absolute left-3 text-body-lg font-semibold text-on-surface-variant">$</span>
              <Input id="amount" type="number" step="0.01" min={0} className="pl-6" placeholder="185.00" {...register("amount")} />
            </div>
            {errors.amount && <p className="mt-1 text-body-sm text-danger">{errors.amount.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date_created">Fecha de emisión *</Label>
              <Input id="date_created" type="date" className="mt-1" {...register("date_created")} />
            </div>
            <div>
              <Label htmlFor="due_date">Fecha de vencimiento *</Label>
              <Input id="due_date" type="date" className="mt-1" {...register("due_date")} />
            </div>
          </div>

          {mutation.isError && (
            <p className="rounded-lg bg-danger-bg px-3 py-2 text-body-sm text-danger-text">
              No se pudo crear el cargo. Intenta de nuevo.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending || !units?.length}>
              {mutation.isPending ? "Guardando…" : "Crear cargo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
