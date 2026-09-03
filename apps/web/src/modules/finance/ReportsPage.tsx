import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, Building2, Download, TrendingUp, Wallet } from "lucide-react"
import { useState } from "react"

import { Button } from "@/shared/ui/button"

import { formatCurrency } from "./labels"
import { getReportsByProperty, getReportsOverview } from "./reportsApi"

const now = new Date()
const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n")
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function ReportsPage() {
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["reports-overview", month, year],
    queryFn: () => getReportsOverview(month, year),
  })

  const { data: byProperty, isLoading: byPropertyLoading } = useQuery({
    queryKey: ["reports-by-property"],
    queryFn: getReportsByProperty,
  })

  function exportByPropertyCsv() {
    if (!byProperty) return
    const rows: (string | number)[][] = [
      ["Propiedad", "Total cargado", "Total pagado", "Pendiente", "Unidades en mora"],
      ...byProperty.map((r) => [r.property_name, r.total_charged, r.total_paid, r.total_pending, r.units_overdue]),
    ]
    downloadCsv(`reporte-propiedades-${year}-${String(month).padStart(2, "0")}.csv`, rows)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="heading-gradient text-headline-lg font-bold">Reportería</h1>
          <p className="mt-0.5 text-body-sm text-on-surface-variant">Panorama financiero de la organización</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-body-sm text-on-surface focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
          >
            {monthNames.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-9 w-24 rounded-md border border-slate-300 bg-white px-3 text-body-sm text-on-surface focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
          />
        </div>
      </div>

      {overviewLoading && <p className="text-body-md text-on-surface-variant">Cargando…</p>}

      {overview && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-gradient-to-br from-secondary-fixed to-secondary-fixed/60 p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-1.5 text-label-sm uppercase text-on-secondary-fixed/80">
              <TrendingUp className="h-3.5 w-3.5" />
              Recaudado este mes
            </div>
            <div className="mt-1 font-numeric-data text-title-lg font-bold text-on-secondary-fixed">
              {formatCurrency(overview.total_recaudado_mes)}
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-surface-container-low to-surface-container p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-1.5 text-label-sm uppercase text-on-surface-variant">
              <Wallet className="h-3.5 w-3.5" />
              Cargos del mes
            </div>
            <div className="mt-1 font-numeric-data text-title-lg font-bold text-on-surface">
              {formatCurrency(overview.total_cargos_mes)}
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-danger-bg to-danger/10 p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-1.5 text-label-sm uppercase text-danger-text">
              <AlertTriangle className="h-3.5 w-3.5" />
              Morosidad
            </div>
            <div className="mt-1 font-numeric-data text-title-lg font-bold text-danger-text">
              {formatCurrency(overview.total_morosidad)}
            </div>
            <div className="mt-0.5 text-body-sm text-danger-text/80">
              {overview.unidades_en_mora} {overview.unidades_en_mora === 1 ? "unidad" : "unidades"}
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-surface-container-low to-surface-container p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-1.5 text-label-sm uppercase text-on-surface-variant">
              <Building2 className="h-3.5 w-3.5" />
              Saldo pendiente total
            </div>
            <div className="mt-1 font-numeric-data text-title-lg font-bold text-primary-container">
              {formatCurrency(overview.total_pendiente)}
            </div>
          </div>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <h2 className="text-title-sm text-on-surface">Por propiedad</h2>
        <Button variant="ghost" size="sm" onClick={exportByPropertyCsv} disabled={!byProperty?.length}>
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {byPropertyLoading && <p className="text-body-md text-on-surface-variant">Cargando…</p>}

      {!byPropertyLoading && byProperty?.length === 0 && (
        <p className="text-body-sm text-on-surface-variant">No hay propiedades con actividad financiera todavía.</p>
      )}

      {!!byProperty?.length && (
        <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="h-9 bg-surface-container-low text-label-sm uppercase tracking-wider text-on-surface-variant">
                <th className="px-4">Propiedad</th>
                <th className="px-3 text-right">Total cargado</th>
                <th className="px-3 text-right">Total pagado</th>
                <th className="px-3 text-right">Pendiente</th>
                <th className="px-3 text-right">Unidades en mora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {byProperty.map((row) => (
                <tr key={row.property_id} className="h-12 transition-colors hover:bg-surface-container-low/50">
                  <td className="px-4 font-semibold text-on-surface">{row.property_name}</td>
                  <td className="px-3 text-right font-numeric-data text-on-surface">{formatCurrency(row.total_charged)}</td>
                  <td className="px-3 text-right font-numeric-data text-on-surface">{formatCurrency(row.total_paid)}</td>
                  <td className="px-3 text-right font-numeric-data text-primary-container">{formatCurrency(row.total_pending)}</td>
                  <td className="px-3 text-right">
                    {row.units_overdue > 0 ? (
                      <span className="rounded-full bg-danger-bg px-2 py-0.5 text-label-sm font-semibold text-danger-text">
                        {row.units_overdue}
                      </span>
                    ) : (
                      <span className="text-body-sm text-on-surface-variant">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
