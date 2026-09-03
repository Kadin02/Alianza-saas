import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  Building2,
  Grid2x2,
  Handshake,
  ReceiptText,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react"

import { formatCurrency } from "@/modules/finance/labels"

import { getDashboardSummary } from "./api"

const monthNames = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]

export default function DashboardPage() {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
  })

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="heading-gradient text-headline-lg font-bold">Panorama general</h1>
        <p className="mt-0.5 text-body-sm text-on-surface-variant">
          {data ? `Resumen de ${monthNames[data.finance.month - 1]} ${data.finance.year}` : "Cargando resumen…"}
        </p>
      </div>

      {isLoading && <p className="text-body-md text-on-surface-variant">Cargando…</p>}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl bg-gradient-to-br from-secondary-fixed to-secondary-fixed/60 p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center gap-1.5 text-label-sm uppercase text-on-secondary-fixed/80">
                <TrendingUp className="h-3.5 w-3.5" />
                Recaudado este mes
              </div>
              <div className="mt-1 font-numeric-data text-title-lg font-bold text-on-secondary-fixed">
                {formatCurrency(data.finance.total_recaudado_mes)}
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-surface-container-low to-surface-container p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center gap-1.5 text-label-sm uppercase text-on-surface-variant">
                <Wallet className="h-3.5 w-3.5" />
                Cargos del mes
              </div>
              <div className="mt-1 font-numeric-data text-title-lg font-bold text-on-surface">
                {formatCurrency(data.finance.total_cargos_mes)}
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-danger-bg to-danger/10 p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center gap-1.5 text-label-sm uppercase text-danger-text">
                <AlertTriangle className="h-3.5 w-3.5" />
                Morosidad
              </div>
              <div className="mt-1 font-numeric-data text-title-lg font-bold text-danger-text">
                {formatCurrency(data.finance.total_morosidad)}
              </div>
              <div className="mt-0.5 text-body-sm text-danger-text/80">
                {data.finance.unidades_en_mora} {data.finance.unidades_en_mora === 1 ? "unidad" : "unidades"}
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-surface-container-low to-surface-container p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center gap-1.5 text-label-sm uppercase text-on-surface-variant">
                <Banknote className="h-3.5 w-3.5" />
                Saldo pendiente total
              </div>
              <div className="mt-1 font-numeric-data text-title-lg font-bold text-primary-container">
                {formatCurrency(data.finance.total_pendiente)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
            {[
              { label: "Propiedades", value: data.properties_count, icon: Building2, to: "/app/properties" },
              { label: "Unidades", value: data.units_count, icon: Grid2x2, to: "/app/units" },
              { label: "Ocupación", value: `${data.occupancy_rate}%`, icon: Grid2x2, to: "/app/units" },
              { label: "Propietarios", value: data.owners_count, icon: Users, to: "/app/owners" },
              { label: "Proveedores", value: data.vendors_count, icon: Handshake, to: "/app/vendors" },
            ].map((stat) => (
              <button
                key={stat.label}
                onClick={() => navigate(stat.to)}
                className="group flex flex-col items-start gap-1 rounded-xl bg-surface-container-lowest p-3.5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex w-full items-center justify-between text-on-surface-variant">
                  <stat.icon className="h-4 w-4" />
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="font-numeric-data text-title-md font-bold text-on-surface">{stat.value}</div>
                <div className="text-label-sm text-on-surface-variant">{stat.label}</div>
              </button>
            ))}
          </div>

          <div className="rounded-xl bg-surface-container-lowest shadow-sm">
            <div className="flex items-center gap-1.5 border-b border-surface-container-low px-4 py-3">
              <ReceiptText className="h-4 w-4 text-on-surface-variant" />
              <h2 className="text-title-sm text-on-surface">Actividad reciente</h2>
            </div>
            {data.recent_activity.length === 0 ? (
              <p className="px-4 py-6 text-body-sm text-on-surface-variant">
                Todavía no hay cargos ni pagos registrados.
              </p>
            ) : (
              <div className="divide-y divide-surface-container-low">
                {data.recent_activity.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span
                        className={
                          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full " +
                          (item.type === "PAGO"
                            ? "bg-secondary-fixed text-on-secondary-fixed"
                            : "bg-surface-container text-on-surface-variant")
                        }
                      >
                        {item.type === "PAGO" ? <TrendingUp className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
                      </span>
                      <div>
                        <div className="text-body-sm font-semibold text-on-surface">{item.label}</div>
                        <div className="text-label-sm text-on-surface-variant">{item.detail}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-numeric-data text-body-sm font-bold text-on-surface">
                        {formatCurrency(item.amount)}
                      </div>
                      <div className="text-label-sm text-on-surface-variant">{item.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
