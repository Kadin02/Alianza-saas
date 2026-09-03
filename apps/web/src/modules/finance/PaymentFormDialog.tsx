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

import { createPayment } from "./api"

const today = new Date().toISOString().slice(0, 10)

const paymentSchema = z.object({
  unit_id: z.coerce.number().int().min(1, "Selecciona una unidad"),
  amount: z.coerce.number().gt(0, "Debe ser mayor a 0"),
  payment_date: z.string().min(1, "Requerido"),
  method: z.string().optional(),
  reference: z.string().optional(),
})

type PaymentFormInput = z.input<typeof paymentSchema>
type PaymentFormValues = z.output<typeof paymentSchema>

interface PaymentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PaymentFormDialog({ open, onOpenChange }: PaymentFormDialogProps) {
  const queryClient = useQueryClient()
  const { data: units } = useQuery({ queryKey: ["units"], queryFn: listUnits })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormInput, unknown, PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { payment_date: today },
  })

  useEffect(() => {
    if (open) {
      reset({
        unit_id: units?.[0]?.id,
        amount: undefined,
        payment_date: today,
        method: "",
        reference: "",
      })
    }
  }, [open, units, reset])

  const mutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] })
      queryClient.invalidateQueries({ queryKey: ["charges"] })
      blurActiveElement()
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Registrar Pago</DialogTitle>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          El monto se aplicará automáticamente a los cargos pendientes de la unidad, del más antiguo al más reciente.
        </p>
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
            <Label htmlFor="amount">Monto *</Label>
            <div className="relative mt-1 flex items-center">
              <span className="pointer-events-none absolute left-3 text-body-lg font-semibold text-on-surface-variant">$</span>
              <Input id="amount" type="number" step="0.01" min={0} className="pl-6" placeholder="185.00" {...register("amount")} />
            </div>
            {errors.amount && <p className="mt-1 text-body-sm text-danger">{errors.amount.message}</p>}
          </div>

          <div>
            <Label htmlFor="payment_date">Fecha de pago *</Label>
            <Input id="payment_date" type="date" className="mt-1" {...register("payment_date")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="method">Método</Label>
              <Input id="method" autoComplete="off" className="mt-1" placeholder="Transferencia" {...register("method")} />
            </div>
            <div>
              <Label htmlFor="reference">Referencia</Label>
              <Input id="reference" autoComplete="off" className="mt-1" placeholder="#REC-001" {...register("reference")} />
            </div>
          </div>

          {mutation.isError && (
            <p className="rounded-lg bg-danger-bg px-3 py-2 text-body-sm text-danger-text">
              No se pudo registrar el pago. Intenta de nuevo.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending || !units?.length}>
              {mutation.isPending ? "Guardando…" : "Registrar pago"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
