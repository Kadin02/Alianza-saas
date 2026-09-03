import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Building2, Mail, Pencil, Phone, Plus, Trash2, Users } from "lucide-react"
import { useState } from "react"

import { Button } from "@/shared/ui/button"

import { deleteOwner, listOwners } from "./api"
import { AssignUnitDialog } from "./AssignUnitDialog"
import { OwnerFormDialog } from "./OwnerFormDialog"
import type { OwnerRead } from "./types"

export default function OwnersPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<OwnerRead | null>(null)
  const [assigningOwner, setAssigningOwner] = useState<OwnerRead | null>(null)

  const { data: owners, isLoading } = useQuery({ queryKey: ["owners"], queryFn: listOwners })

  const deleteMutation = useMutation({
    mutationFn: deleteOwner,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["owners"] }),
  })

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(owner: OwnerRead) {
    setEditing(owner)
    setDialogOpen(true)
  }

  function handleDelete(owner: OwnerRead) {
    if (window.confirm(`¿Eliminar a "${owner.full_name}"? Esta acción no se puede deshacer.`)) {
      deleteMutation.mutate(owner.id)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="heading-gradient text-headline-lg font-bold">Propietarios</h1>
            <span className="rounded-full bg-surface-container-high px-2.5 py-0.5 text-label-sm font-semibold text-on-surface-variant">
              {owners?.length ?? 0} {owners?.length === 1 ? "registrado" : "registrados"}
            </span>
          </div>
          <p className="mt-0.5 text-body-sm text-on-surface-variant">Registro de propietarios y su unidad asignada</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nuevo Propietario
        </Button>
      </div>

      {isLoading && <p className="text-body-md text-on-surface-variant">Cargando…</p>}

      {!isLoading && owners?.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest py-16 text-center">
          <Users className="h-10 w-10 text-outline" />
          <p className="text-title-sm text-on-surface">Todavía no tienes propietarios</p>
          <p className="max-w-sm text-body-sm text-on-surface-variant">
            Registra al primer propietario y, si quieres, asígnalo a una unidad.
          </p>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nuevo Propietario
          </Button>
        </div>
      )}

      {!!owners?.length && (
        <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="h-9 bg-surface-container-low text-label-sm uppercase tracking-wider text-on-surface-variant">
                <th className="px-4">Nombre</th>
                <th className="px-3">Identificación</th>
                <th className="px-3">Contacto</th>
                <th className="px-3">Unidad</th>
                <th className="px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {owners.map((owner) => (
                <tr key={owner.id} className="h-14 transition-colors hover:bg-surface-container-low/50">
                  <td className="px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-container font-label-sm font-bold text-on-primary-container">
                        {owner.full_name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-on-surface">{owner.full_name}</span>
                    </div>
                  </td>
                  <td className="px-3 text-body-sm text-on-surface-variant">{owner.identification || "—"}</td>
                  <td className="px-3">
                    <div className="space-y-0.5 text-body-sm text-on-surface-variant">
                      {owner.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-outline" /> {owner.phone}
                        </div>
                      )}
                      {owner.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 text-outline" /> {owner.email}
                        </div>
                      )}
                      {!owner.phone && !owner.email && "—"}
                    </div>
                  </td>
                  <td className="px-3">
                    {owner.unit_number ? (
                      <div className="text-body-sm">
                        <div className="font-semibold text-on-surface">{owner.unit_number}</div>
                        <div className="text-on-surface-variant">{owner.property_name}</div>
                      </div>
                    ) : (
                      <span className="rounded-full bg-surface-container px-2 py-0.5 text-label-sm text-on-surface-variant">
                        Sin asignar
                      </span>
                    )}
                  </td>
                  <td className="px-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setAssigningOwner(owner)}
                        className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                        aria-label="Asignar unidad"
                        title="Asignar unidad"
                      >
                        <Building2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEdit(owner)}
                        className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(owner)}
                        className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-danger-bg hover:text-danger"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <OwnerFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />
      <AssignUnitDialog owner={assigningOwner} onOpenChange={(open) => !open && setAssigningOwner(null)} />
    </div>
  )
}
