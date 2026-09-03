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

import { createOwner, updateOwner } from "./api"
import type { OwnerRead } from "./types"

const ownerSchema = z.object({
  full_name: z.string().min(2, "Ingresa el nombre"),
  identification: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  unit_id: z.coerce.number().optional(),
})

type OwnerFormInput = z.input<typeof ownerSchema>
type OwnerFormValues = z.output<typeof ownerSchema>

interface OwnerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: OwnerRead | null
}

export function OwnerFormDialog({ open, onOpenChange, editing }: OwnerFormDialogProps) {
  const queryClient = useQueryClient()
  const { data: units } = useQuery({ queryKey: ["units"], queryFn: listUnits, enabled: !editing })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OwnerFormInput, unknown, OwnerFormValues>({
    resolver: zodResolver(ownerSchema),
  })

  useEffect(() => {
    if (open) {
      reset(
        editing
          ? {
              full_name: editing.full_name,
              identification: editing.identification ?? "",
              phone: editing.phone ?? "",
              email: editing.email ?? "",
            }
          : { full_name: "", identification: "", phone: "", email: "" }
      )
    }
  }, [open, editing, reset])

  const mutation = useMutation({
    mutationFn: (values: OwnerFormValues) => {
      const clean = { ...values, email: values.email || undefined }
      return editing ? updateOwner(editing.id, clean) : createOwner(clean)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owners"] })
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{editing ? "Editar Propietario" : "Nuevo Propietario"}</DialogTitle>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <div>
            <Label htmlFor="full_name">Nombre completo *</Label>
            <Input id="full_name" className="mt-1" placeholder="Carlos Mendoza" {...register("full_name")} />
            {errors.full_name && <p className="mt-1 text-body-sm text-danger">{errors.full_name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="identification">Identificación / Cédula</Label>
              <Input id="identification" className="mt-1" placeholder="8-123-4567" {...register("identification")} />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" className="mt-1" placeholder="+507 6123 4567" {...register("phone")} />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" className="mt-1" placeholder="carlos@correo.com" {...register("email")} />
            {errors.email && <p className="mt-1 text-body-sm text-danger">{errors.email.message}</p>}
          </div>

          {!editing && (
            <div>
              <Label htmlFor="unit_id">Asignar a una unidad (opcional)</Label>
              <select
                id="unit_id"
                className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-body-lg text-on-surface focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                {...register("unit_id")}
              >
                <option value="">Sin asignar</option>
                {units?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.unit_number} — {u.property_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mutation.isError && (
            <p className="rounded-lg bg-danger-bg px-3 py-2 text-body-sm text-danger-text">
              No se pudo guardar el propietario. Intenta de nuevo.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Guardando…" : editing ? "Guardar cambios" : "Crear propietario"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
