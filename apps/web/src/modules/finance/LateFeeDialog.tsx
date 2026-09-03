import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { blurActiveElement } from "@/shared/lib/utils"

import { createLateFee } from "./api"
import type { ChargeRead } from "./types"

const lateFeeSchema = z.object({
  amount: z.coerce.number().gt(0, "Debe ser mayor a 0"),
})

type LateFeeFormInput = z.input<typeof lateFeeSchema>
type LateFeeFormValues = z.output<typeof lateFeeSchema>

interface LateFeeDialogProps {
  charge: ChargeRead | null
  onOpenChange: (open: boolean) => void
}

export function LateFeeDialog({ charge, onOpenChange }: LateFeeDialogProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LateFeeFormInput, unknown, LateFeeFormValues>({
    resolver: zodResolver(lateFeeSchema),
  })

  useEffect(() => {
    if (charge) reset({ amount: undefined })
  }, [charge, reset])

  const mutation = useMutation({
    mutationFn: (values: LateFeeFormValues) => createLateFee(charge!.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charges"] })
      blurActiveElement()
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={charge !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Aplicar Mora</DialogTitle>
        {charge && (
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Sobre <span className="font-semibold text-on-surface">{charge.description}</span> ({charge.unit_number}), vencido el{" "}
            {charge.due_date}. Se creará como un cargo adicional vinculado.
          </p>
        )}
        <form className="mt-4 space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <div>
            <Label htmlFor="amount">Monto de la mora *</Label>
            <div className="relative mt-1 flex items-center">
              <span className="pointer-events-none absolute left-3 text-body-lg font-semibold text-on-surface-variant">$</span>
              <Input id="amount" type="number" step="0.01" min={0} className="pl-6" placeholder="15.00" {...register("amount")} />
            </div>
            {errors.amount && <p className="mt-1 text-body-sm text-danger">{errors.amount.message}</p>}
          </div>

          {mutation.isError && (
            <p className="rounded-lg bg-danger-bg px-3 py-2 text-body-sm text-danger-text">
              No se pudo aplicar la mora. Verifica que el cargo esté vencido y con saldo pendiente.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Aplicando…" : "Aplicar mora"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
