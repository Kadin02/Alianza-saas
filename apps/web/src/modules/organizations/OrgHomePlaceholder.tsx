import { useQuery } from "@tanstack/react-query"
import { LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { apiClient } from "@/shared/api/client"
import { clearToken } from "@/shared/lib/auth-storage"
import { clearActiveOrgId, getActiveOrgId } from "@/shared/lib/org-storage"
import { Button } from "@/shared/ui/button"

/**
 * Pantalla temporal: confirma que ya hay una organización activa y que el
 * header X-Organization-Id llega bien al backend. Se reemplaza por el
 * Dashboard en un módulo posterior.
 */
export default function OrgHomePlaceholder() {
  const navigate = useNavigate()
  const activeOrgId = getActiveOrgId()

  const { data, isLoading } = useQuery({
    queryKey: ["organizations", "current", activeOrgId],
    queryFn: async () => (await apiClient.get("/organizations/current")).data,
    enabled: !!activeOrgId,
  })

  function logout() {
    clearToken()
    clearActiveOrgId()
    navigate("/login")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="w-full max-w-lg rounded-2xl border border-primary-container/8 bg-surface-container-lowest p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-headline-md text-primary-container">Organización activa</h1>
            <p className="mt-1 text-body-md text-on-surface-variant">Próximo módulo: Dashboard.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Salir
          </Button>
        </div>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-surface-container-low p-4 text-body-sm text-on-surface">
          {isLoading ? "Cargando…" : JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </main>
  )
}
