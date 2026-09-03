import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Building2, Globe, Mail, MapPin, Pencil, Phone, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/shared/ui/button"

import { deleteProperty, listProperties } from "./api"
import { propertyTypeLabels } from "./labels"
import { PropertyFormDialog } from "./PropertyFormDialog"
import type { PropertyRead } from "./types"

export default function PropertiesPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PropertyRead | null>(null)

  const { data: properties, isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: listProperties,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["properties"] }),
  })

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(property: PropertyRead) {
    setEditing(property)
    setDialogOpen(true)
  }

  function handleDelete(property: PropertyRead) {
    if (window.confirm(`¿Eliminar "${property.name}"? Esta acción no se puede deshacer.`)) {
      deleteMutation.mutate(property.id)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="heading-gradient text-headline-lg font-bold">Propiedades</h1>
            <span className="rounded-full bg-surface-container-high px-2.5 py-0.5 text-label-sm font-semibold text-on-surface-variant">
              {properties?.length ?? 0} {properties?.length === 1 ? "activa" : "activas"}
            </span>
          </div>
          <p className="mt-0.5 text-body-sm text-on-surface-variant">
            Portafolio de edificios, condominios y locales administrados
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nueva Propiedad
        </Button>
      </div>

      {isLoading && <p className="text-body-md text-on-surface-variant">Cargando…</p>}

      {!isLoading && properties?.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest py-16 text-center">
          <Building2 className="h-10 w-10 text-outline" />
          <p className="text-title-sm text-on-surface">Todavía no tienes propiedades</p>
          <p className="max-w-sm text-body-sm text-on-surface-variant">
            Crea tu primer edificio, condominio o local para empezar a administrar unidades.
          </p>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nueva Propiedad
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {properties?.map((property) => (
          <div
            key={property.id}
            className="group flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-container/10"
          >
            {property.photo_url ? (
              <div className="relative h-32 w-full overflow-hidden">
                <img
                  src={property.photo_url}
                  alt={property.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />
              </div>
            ) : (
              <div className="h-1.5 w-full bg-gradient-to-r from-brand-blue to-secondary" />
            )}
            <div className="flex flex-1 flex-col p-4">
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="rounded-full bg-secondary-fixed px-2 py-0.5 text-label-sm font-semibold tracking-wide text-on-secondary-fixed">
                    {propertyTypeLabels[property.type].badge}
                  </span>
                  <h2 className="mt-1.5 truncate text-title-sm font-bold text-primary-container" title={property.name}>
                    {property.name}
                  </h2>
                </div>
                <div className="flex flex-shrink-0 gap-1">
                  <button
                    onClick={() => openEdit(property)}
                    className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                    aria-label="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(property)}
                    className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-danger-bg hover:text-danger"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mb-3 flex items-center gap-1 text-body-sm text-on-surface-variant">
                <MapPin className="h-4 w-4 flex-shrink-0 text-outline" />
                <span className="truncate">{property.address}</span>
              </div>

              <div className="mb-3 space-y-1.5 rounded-lg bg-surface-container-low p-2.5 text-label-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-on-surface-variant">Capacidad máxima</span>
                  <span className="font-numeric-data font-bold text-primary-container">{property.max_units} unidades</span>
                </div>
              </div>

              <div className="mt-auto space-y-1 text-body-sm text-on-surface-variant">
                {property.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-outline" />
                    {property.phone}
                  </div>
                )}
                {property.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-outline" />
                    {property.email}
                  </div>
                )}
                {property.website && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-outline" />
                    {property.website}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <PropertyFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />
    </div>
  )
}
