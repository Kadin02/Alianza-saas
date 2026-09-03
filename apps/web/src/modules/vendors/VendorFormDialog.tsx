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

import { createVendor, updateVendor } from "./api"
import { vendorCategoryLabels } from "./labels"
import type { VendorRead } from "./types"

const vendorSchema = z.object({
  name: z.string().min(2, "Ingresa el nombre"),
  category: z.enum(["MANTENIMIENTO", "SEGURIDAD", "LIMPIEZA", "JARDINERIA", "PLOMERIA", "ELECTRICIDAD", "OTRO"]),
  contact_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.boolean(),
})

type VendorFormValues = z.infer<typeof vendorSchema>

interface VendorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: VendorRead | null
}

export function VendorFormDialog({ open, onOpenChange, editing }: VendorFormDialogProps) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: { category: "OTRO", is_active: true },
  })

  useEffect(() => {
    if (open) {
      reset(
        editing
          ? {
              name: editing.name,
              category: editing.category,
              contact_name: editing.contact_name ?? "",
              phone: editing.phone ?? "",
              email: editing.email ?? "",
              address: editing.address ?? "",
              notes: editing.notes ?? "",
              is_active: editing.is_active,
            }
          : {
              name: "",
              category: "OTRO",
              contact_name: "",
              phone: "",
              email: "",
              address: "",
              notes: "",
              is_active: true,
            }
      )
    }
  }, [open, editing, reset])

  const mutation = useMutation({
    mutationFn: (values: VendorFormValues) => {
      const clean = { ...values, email: values.email || undefined }
      return editing ? updateVendor(editing.id, clean) : createVendor(clean)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] })
      blurActiveElement()
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{editing ? "Editar Proveedor" : "Nuevo Proveedor"}</DialogTitle>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" autoComplete="off" className="mt-1" placeholder="Ascensores Panamá S.A." {...register("name")} />
            {errors.name && <p className="mt-1 text-body-sm text-danger">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="category">Categoría</Label>
            <select
              id="category"
              className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-body-sm text-on-surface focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              {...register("category")}
            >
              {Object.entries(vendorCategoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="contact_name">Persona de contacto</Label>
            <Input id="contact_name" autoComplete="off" className="mt-1" {...register("contact_name")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" autoComplete="off" className="mt-1" placeholder="+507 6000-0000" {...register("phone")} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="off" className="mt-1" {...register("email")} />
              {errors.email && <p className="mt-1 text-body-sm text-danger">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" autoComplete="off" className="mt-1" {...register("address")} />
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Input id="notes" autoComplete="off" className="mt-1" placeholder="Contrato, condiciones, horario…" {...register("notes")} />
          </div>

          <label className="flex items-center gap-2 text-body-sm text-on-surface">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register("is_active")} />
            Proveedor activo
          </label>

          {mutation.isError && (
            <p className="rounded-lg bg-danger-bg px-3 py-2 text-body-sm text-danger-text">
              No se pudo guardar el proveedor. Intenta de nuevo.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Guardando…" : editing ? "Guardar cambios" : "Crear proveedor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
