import { useQuery } from "@tanstack/react-query"
import {
  Banknote,
  BarChart3,
  Building2,
  CalendarDays,
  Grid2x2,
  Handshake,
  LayoutGrid,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"

import { apiClient } from "@/shared/api/client"
import { clearToken } from "@/shared/lib/auth-storage"
import { clearActiveOrgId } from "@/shared/lib/org-storage"
import { cn } from "@/shared/lib/utils"
import { Logo } from "@/shared/ui/Logo"

interface NavItem {
  label: string
  to?: string
  icon: typeof LayoutGrid
}

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/app", icon: LayoutGrid },
  { label: "Propiedades", to: "/app/properties", icon: Building2 },
  { label: "Unidades", to: "/app/units", icon: Grid2x2 },
  { label: "Propietarios", to: "/app/owners", icon: Users },
  { label: "Finanzas", to: "/app/finance", icon: Banknote },
  { label: "Reportes", to: "/app/reports", icon: BarChart3 },
  { label: "Proveedores", to: "/app/vendors", icon: Handshake },
  { label: "Agenda", icon: CalendarDays },
  { label: "Garita", icon: ShieldCheck },
  { label: "Administración", icon: Settings },
]

export default function AppShell() {
  const navigate = useNavigate()

  const { data: org } = useQuery({
    queryKey: ["organizations", "current"],
    queryFn: async () => (await apiClient.get("/organizations/current")).data,
  })

  function logout() {
    clearToken()
    clearActiveOrgId()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-50 flex w-sidebar-width flex-col bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex h-14 flex-shrink-0 items-center gap-2 px-4">
          <Logo />
          <span className="rounded bg-surface-container px-1.5 py-0.5 text-label-sm uppercase text-on-surface-variant">
            SaaS
          </span>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            if (!item.to) {
              return (
                <div
                  key={item.label}
                  className="flex cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 text-on-surface-variant/40"
                  title="Próximamente"
                >
                  <Icon className="h-5 w-5" />
                  <span className="truncate text-body-md">{item.label}</span>
                </div>
              )
            }
            return (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === "/app"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-secondary-fixed to-secondary-fixed/70 font-semibold text-on-secondary-fixed shadow-sm"
                      : "text-on-surface-variant hover:translate-x-0.5 hover:bg-surface-container hover:text-on-surface"
                  )
                }
              >
                <Icon className="h-5 w-5" />
                <span className="truncate text-body-md">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-col pl-sidebar-width">
        <header className="fixed inset-x-0 top-0 left-sidebar-width z-40 flex h-14 items-center justify-between bg-surface-container-lowest px-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-secondary-fixed text-on-secondary-fixed">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-label-md font-semibold leading-none text-on-surface">
                {org?.name ?? "Cargando…"}
              </div>
              <button
                onClick={() => navigate("/select-organization")}
                className="mt-0.5 text-body-sm leading-none text-on-surface-variant hover:text-brand-blue"
              >
                Cambiar organización
              </button>
            </div>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-body-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </header>
        <main className="flex-1 px-container-padding pb-space-2xl pt-[4.5rem]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
