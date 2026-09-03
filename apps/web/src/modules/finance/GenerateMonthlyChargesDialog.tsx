import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { listProperties } from "@/modules/properties/api"
import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog"
import { Label } from "@/shared/ui/label"
import { blurActiveElement } from "@/shared/lib/utils"

import { generateMonthlyCharges } from "./api"
import type { GenerateMonthlyChargesResult } from "./types"

const now = new Date()

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

const schema = z.object({
  property_id: z.string().optional().transform((v) => (v ? Number(v) : undefined)),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
})

type FormInput = z.input<typeof schema>
type FormValues = z.output<typeof schema>

interface GenerateMonthlyChargesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GenerateMonthlyChargesDialog({ open, onOpenChange }: GenerateMonthlyChargesDialogProps) {
  const queryClient = useQueryClient()
  const { data: properties } = useQuery({ queryKey: ["properties"], queryFn: listProperties })
  const [result, setResult] = useState<GenerateMonthlyChargesResult | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { month: now.getMonth() + 1, year: now.getFullYear() },
  })

  useEffect(() => {
    if (open) {
      setResult(null)
      reset({ property_id: "", month: now.getMonth() + 1, year: now.getFullYear() })
    }
  }, [open, reset])

  const mutation = useMutation({
    mutationFn: generateMonthlyCharges,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["charges"] })
      setResult(data)
    },
  })

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) blurActiveElement()
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogTitle>Generar Cuotas del Mes</DialogTitle>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Crea el cargo mensual para cada unidad con cuota configurada. Si una unidad ya tiene el cargo de ese mes, se omite —
          puedes correrlo varias veces sin duplicar.
        </p>

        {!result && (
          <form className="mt-4 space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
            <div>
              <Label htmlFor="property_id">Propiedad</Label>
              <select
                id="property_id"
                className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-body-lg text-on-surface focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                {...register("property_id")}
              >
                <option value="">Todas las propiedades</option>
                {properties?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="month">Mes *</Label>
                <select
                  id="month"
                  className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-body-lg text-on-surface focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  {...register("month")}
                >
                  {monthNames.map((name, i) => (
                    <option key={name} value={i + 1}>
                      {name}
                    </option>
                  ))}
                </select>
                {errors.month && <p className="mt-1 text-body-sm text-danger">{errors.month.message}</p>}
              </div>
              <div>
                <Label htmlFor="year">Año *</Label>
                <input
                  id="year"
                  type="number"
                  className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-body-lg text-on-surface focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  {...register("year")}
                />
                {errors.year && <p className="mt-1 text-body-sm text-danger">{errors.year.message}</p>}
              </div>
            </div>

            {mutation.isError && (
              <p className="rounded-lg bg-danger-bg px-3 py-2 text-body-sm text-danger-text">
                No se pudieron generar los cargos. Verifica que existan unidades con cuota mensual configurada.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => handleClose(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Generando…" : "Generar cuotas"}
              </Button>
            </div>
          </form>
        )}

        {result && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-secondary-fixed p-3 text-on-secondary-fixed">
                <div className="text-label-sm uppercase">Cargos creados</div>
                <div className="mt-1 font-numeric-data text-title-lg">{result.created}</div>
              </div>
              <div className="rounded-xl bg-surface-container-low p-3">
                <div className="text-label-sm uppercase text-on-surface-variant">Ya existían (omitidos)</div>
                <div className="mt-1 font-numeric-data text-title-lg text-on-surface">{result.skipped}</div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => handleClose(false)}>Listo</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
