import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Handshake, Mail, MapPin, Pencil, Phone, Plus, Trash2, User } from "lucide-react"
import { useState } from "react"

import { Button } from "@/shared/ui/button"

import { deleteVendor, listVendors } from "./api"
import { vendorCategoryLabels } from "./labels"
import { VendorFormDialog } from "./VendorFormDialog"
import type { VendorRead } from "./types"

export default function VendorsPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<VendorRead | null>(null)

  const { data: vendors, isLoading } = useQuery({
    queryKey: ["vendors"],
    queryFn: listVendors,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteVendor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vendors"] }),
  })

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(vendor: VendorRead) {
    setEditing(vendor)
    setDialogOpen(true)
  }

  function handleDelete(vendor: VendorRead) {
    if (window.confirm(`¿Eliminar "${vendor.name}"? Esta acción no se puede deshacer.`)) {
      deleteMutation.mutate(vendor.id)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="heading-gradient text-headline-lg font-bold">Proveedores</h1>
            <span className="rounded-full bg-surface-container-high px-2.5 py-0.5 text-label-sm font-semibold text-on-surface-variant">
              {vendors?.length ?? 0} {vendors?.length === 1 ? "registrado" : "registrados"}
            </span>
          </div>
          <p className="mt-0.5 text-body-sm text-on-surface-variant">
            Contratistas y servicios externos de mantenimiento, seguridad y más
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nuevo Proveedor
        </Button>
      </div>

      {isLoading && <p className="text-body-md text-on-surface-variant">Cargando…</p>}

      {!isLoading && vendors?.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest py-16 text-center">
          <Handshake className="h-10 w-10 text-outline" />
          <p className="text-title-sm text-on-surface">Todavía no tienes proveedores</p>
          <p className="max-w-sm text-body-sm text-on-surface-variant">
            Registra contratistas, empresas de seguridad, limpieza o mantenimiento.
          </p>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nuevo Proveedor
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {vendors?.map((vendor) => (
          <div
            key={vendor.id}
            className="group flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-container/10"
          >
            <div className="mb-1.5 flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-secondary-fixed px-2 py-0.5 text-label-sm font-semibold tracking-wide text-on-secondary-fixed">
                    {vendorCategoryLabels[vendor.category]}
                  </span>
                  {!vendor.is_active && (
                    <span className="rounded-full bg-surface-container px-2 py-0.5 text-label-sm font-semibold text-on-surface-variant">
                      Inactivo
                    </span>
                  )}
                </div>
                <h2 className="mt-1.5 truncate text-title-sm font-bold text-primary-container" title={vendor.name}>
                  {vendor.name}
                </h2>
              </div>
              <div className="flex flex-shrink-0 gap-1">
                <button
                  onClick={() => openEdit(vendor)}
                  className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                  aria-label="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(vendor)}
                  className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-danger-bg hover:text-danger"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-1 space-y-1 text-body-sm text-on-surface-variant">
              {vendor.contact_name && (
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 flex-shrink-0 text-outline" />
                  <span className="truncate">{vendor.contact_name}</span>
                </div>
              )}
              {vendor.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0 text-outline" />
                  {vendor.phone}
                </div>
              )}
              {vendor.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0 text-outline" />
                  <span className="truncate">{vendor.email}</span>
                </div>
              )}
              {vendor.address && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-outline" />
                  <span className="truncate">{vendor.address}</span>
                </div>
              )}
            </div>

            {vendor.notes && (
              <p className="mt-3 rounded-lg bg-surface-container-low p-2.5 text-body-sm text-on-surface-variant">
                {vendor.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      <VendorFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />
    </div>
  )
}
