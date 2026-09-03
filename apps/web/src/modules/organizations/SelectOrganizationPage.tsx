import { useQuery } from "@tanstack/react-query"
import { ArrowRight, LogOut, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"

import loginBackground from "@/assets/images/login-background.jpg"
import { clearToken, getToken } from "@/shared/lib/auth-storage"
import { clearActiveOrgId, setActiveOrgId } from "@/shared/lib/org-storage"
import { cn } from "@/shared/lib/utils"
import { Logo } from "@/shared/ui/Logo"

import { listMyOrganizations } from "./api"
import { orgGradient, orgInitials, planLabels, roleLabels } from "./labels"

export default function SelectOrganizationPage() {
  const navigate = useNavigate()

  const { data: memberships, isLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: listMyOrganizations,
  })

  function enterOrganization(orgId: number) {
    setActiveOrgId(orgId)
    navigate("/org-home")
  }

  function logout() {
    clearToken()
    clearActiveOrgId()
    navigate("/login")
  }

  if (!getToken()) {
    navigate("/login")
    return null
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between overflow-x-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <img
          src={loginBackground}
          alt=""
          className="h-full w-full scale-105 transform object-cover object-center blur-[2px] brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-[#1a2538]/90 to-[#0f172a]/95" />
      </div>

      <header className="relative z-10 flex w-full items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/10 px-3.5 py-1.5 text-white backdrop-blur-md">
          <Logo />
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-body-sm font-medium text-slate-300 transition-colors hover:bg-white/15 hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" />
          Cerrar sesión
        </button>
      </header>

      <main className="relative z-10 mx-auto my-auto w-full max-w-2xl px-4 py-6 sm:py-10">
        <div className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-black/40">
          <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white px-6 pb-6 pt-8 text-center sm:px-10">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-100/80 bg-blue-50 px-3 py-1 text-label-md text-brand-blue">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-blue" />
              Entorno Multi-Organización B2B
            </div>
            <h1 className="text-headline-lg text-primary-container">Selecciona una organización</h1>
            <p className="mx-auto mt-2 max-w-md text-body-md text-on-surface-variant">
              Tu cuenta tiene acceso a las siguientes organizaciones. Elige con cuál quieres trabajar ahora.
            </p>
          </div>

          <div className="space-y-3.5 bg-slate-50/50 p-6 sm:p-8">
            {isLoading && (
              <p className="py-6 text-center text-body-md text-on-surface-variant">Cargando organizaciones…</p>
            )}
            {memberships?.map((membership) => (
              <button
                key={membership.id}
                onClick={() => enterOrganization(membership.organization.id)}
                className="group relative flex w-full items-center justify-between rounded-xl border-2 border-transparent bg-white p-4 text-left shadow-sm transition-all duration-200 hover:border-brand-blue hover:shadow-md sm:p-5"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className={cn(
                      "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-tr text-lg font-bold text-white shadow-sm ring-2 ring-blue-50 transition-transform group-hover:scale-105",
                      orgGradient(membership.organization.id)
                    )}
                  >
                    <span className="tracking-tighter">{orgInitials(membership.organization.name)}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-title-sm text-primary-container transition-colors group-hover:text-brand-blue">
                        {membership.organization.name}
                      </h2>
                      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        {planLabels[membership.organization.plan]}
                      </span>
                    </div>
                    <div className="mt-1 text-body-sm text-on-surface-variant">
                      Rol: <strong className="font-semibold text-primary-container">{roleLabels[membership.role]}</strong>
                    </div>
                  </div>
                </div>
                <div className="flex items-center pl-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-400 transition-colors group-hover:bg-brand-blue group-hover:text-white">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 bg-white p-6 sm:flex-row sm:px-10">
            <button
              type="button"
              onClick={() => navigate("/onboarding")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-body-md font-semibold text-on-surface-variant shadow-sm transition-all hover:border-brand-blue hover:bg-slate-50 hover:text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30 sm:w-auto"
            >
              <Plus className="h-4 w-4 text-brand-blue" />
              Crear nueva organización
            </button>
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full py-4 text-center text-body-sm text-slate-400">
        <p>© 2026 Alianza. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
