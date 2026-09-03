import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Building2, Check, Home, Image as ImageIcon, Mail, Phone, Store } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { blurActiveElement, cn } from "@/shared/lib/utils"

import { createProperty, updateProperty } from "./api"
import { propertyTypeLabels } from "./labels"
import type { PropertyRead, PropertyType } from "./types"

const propertySchema = z.object({
  name: z.string().min(2, "Ingresa el nombre"),
  type: z.enum(["PH", "CASA", "LOCAL"]),
  address: z.string().min(2, "Ingresa la dirección"),
  max_units: z.coerce.number().int().min(1, "Debe ser al menos 1"),
  phone: z.string().optional(),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  website: z.string().optional(),
  photo_url: z.string().url("URL inválida").optional().or(z.literal("")),
})

type PropertyFormInput = z.input<typeof propertySchema>
type PropertyFormValues = z.output<typeof propertySchema>

interface PropertyFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: PropertyRead | null
}

export function PropertyFormDialog({ open, onOpenChange, editing }: PropertyFormDialogProps) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PropertyFormInput, unknown, PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: { type: "PH", max_units: 50 },
  })

  useEffect(() => {
    if (open) {
      reset(
        editing
          ? {
              name: editing.name,
              type: editing.type,
              address: editing.address,
              max_units: editing.max_units,
              phone: editing.phone ?? "",
              email: editing.email ?? "",
              website: editing.website ?? "",
              photo_url: editing.photo_url ?? "",
            }
          : { name: "", type: "PH", address: "", max_units: 50, phone: "", email: "", website: "", photo_url: "" }
      )
    }
  }, [open, editing, reset])

  const type = watch("type")
  const photoUrl = watch("photo_url")

  const mutation = useMutation({
    mutationFn: (values: PropertyFormValues) => {
      const clean = { ...values, email: values.email || undefined, photo_url: values.photo_url || undefined }
      return editing ? updateProperty(editing.id, clean) : createProperty(clean)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] })
      blurActiveElement()
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{editing ? "Editar Propiedad" : "Nueva Propiedad"}</DialogTitle>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" autoComplete="off" className="mt-1" placeholder="Residencial Las Palmas" {...register("name")} />
            {errors.name && <p className="mt-1 text-body-sm text-danger">{errors.name.message}</p>}
          </div>

          <div>
            <Label>Tipo</Label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {(
                [
                  { value: "PH" as PropertyType, icon: Building2 },
                  { value: "CASA" as PropertyType, icon: Home },
                  { value: "LOCAL" as PropertyType, icon: Store },
                ]
              ).map(({ value, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("type", value, { shouldValidate: true })}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl p-2 text-center transition-colors",
                    type === value ? "bg-secondary-fixed text-on-secondary-fixed" : "bg-surface-container-low hover:bg-surface-container"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-label-sm font-semibold">{propertyTypeLabels[value].title}</span>
                  {type === value && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="address">Dirección *</Label>
            <Input id="address" autoComplete="off" className="mt-1" placeholder="Av. Las Condes 12400" {...register("address")} />
            {errors.address && <p className="mt-1 text-body-sm text-danger">{errors.address.message}</p>}
          </div>

          <div>
            <Label htmlFor="max_units">Máximo de unidades</Label>
            <Input id="max_units" type="number" min={1} className="mt-1" {...register("max_units")} />
            {errors.max_units && <p className="mt-1 text-body-sm text-danger">{errors.max_units.message}</p>}
          </div>

          <div>
            <Label htmlFor="photo_url">Foto (URL de la imagen)</Label>
            <div className="mt-1 flex items-center gap-3">
              <div className="relative flex flex-1 items-center">
                <ImageIcon className="pointer-events-none absolute left-3 h-4 w-4 text-outline" />
                <Input id="photo_url" autoComplete="off" className="pl-9" placeholder="https://…" {...register("photo_url")} />
              </div>
              {photoUrl && (
                <img
                  src={photoUrl}
                  alt=""
                  className="h-9 w-14 flex-shrink-0 rounded-md object-cover"
                  onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                  onLoad={(e) => (e.currentTarget.style.visibility = "visible")}
                />
              )}
            </div>
            {errors.photo_url && <p className="mt-1 text-body-sm text-danger">{errors.photo_url.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <div className="relative mt-1 flex items-center">
                <Phone className="pointer-events-none absolute left-3 h-4 w-4 text-outline" />
                <Input id="phone" autoComplete="off" className="pl-9" placeholder="+56 9 8765 4321" {...register("phone")} />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1 flex items-center">
                <Mail className="pointer-events-none absolute left-3 h-4 w-4 text-outline" />
                <Input id="email" type="email" autoComplete="off" className="pl-9" placeholder="conserjeria@..." {...register("email")} />
              </div>
              {errors.email && <p className="mt-1 text-body-sm text-danger">{errors.email.message}</p>}
            </div>
          </div>

          {mutation.isError && (
            <p className="rounded-lg bg-danger-bg px-3 py-2 text-body-sm text-danger-text">
              No se pudo guardar la propiedad. Intenta de nuevo.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Guardando…" : editing ? "Guardar cambios" : "Crear propiedad"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
