import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/shared/api/client"

/**
 * Pantalla temporal: confirma visualmente que el login funcionó de punta a
 * punta contra el backend real. Se reemplaza por el Selector de Organización
 * en el siguiente módulo.
 */
export default function PostLoginPlaceholder() {
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await apiClient.get("/auth/me")).data,
  })

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="w-full max-w-lg rounded-2xl border border-primary-container/8 bg-surface-container-lowest p-8 shadow-sm">
        <h1 className="text-headline-md text-primary-container">Sesión iniciada</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Próximo módulo: Selector de Organización.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-surface-container-low p-4 text-body-sm text-on-surface">
          {isLoading ? "Cargando…" : JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </main>
  )
}
