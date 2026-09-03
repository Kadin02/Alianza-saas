import { useQuery } from "@tanstack/react-query"

import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog"

import { getUnitStatement } from "./api"
import { formatCurrency, formatDate } from "./labels"

interface StatementDialogProps {
  unitId: number | null
  onOpenChange: (open: boolean) => void
}

export function StatementDialog({ unitId, onOpenChange }: StatementDialogProps) {
  const { data: statement, isLoading } = useQuery({
    queryKey: ["unit-statement", unitId],
    queryFn: () => getUnitStatement(unitId as number),
    enabled: unitId !== null,
  })

  return (
    <Dialog open={unitId !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {isLoading && <p className="text-body-md text-on-surface-variant">Cargando…</p>}
        {statement && (
          <>
            <DialogTitle>Estado de Cuenta — {statement.unit_number}</DialogTitle>
            <p className="mt-0.5 text-body-sm text-on-surface-variant">
              {statement.property_name} · {statement.owner_name ?? "Sin propietario"}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-surface-container-low p-3">
                <div className="text-label-sm uppercase text-on-surface-variant">Total cargos</div>
                <div className="mt-1 font-numeric-data text-title-sm text-on-surface">
                  {formatCurrency(statement.total_cargos)}
                </div>
              </div>
              <div className="rounded-xl bg-surface-container-low p-3">
                <div className="text-label-sm uppercase text-on-surface-variant">Total pagado</div>
                <div className="mt-1 font-numeric-data text-title-sm text-on-surface">
                  {formatCurrency(statement.total_pagos)}
                </div>
              </div>
              <div className="rounded-xl bg-danger-bg p-3">
                <div className="text-label-sm uppercase text-danger-text">Saldo pendiente</div>
                <div className="mt-1 font-numeric-data text-title-sm text-danger-text">
                  {formatCurrency(statement.total_due)}
                </div>
              </div>
            </div>

            <div className="mt-4 max-h-80 overflow-y-auto rounded-xl bg-surface-container-lowest shadow-sm">
              <table className="w-full text-left">
                <thead className="sticky top-0">
                  <tr className="h-9 bg-surface-container-low text-label-sm uppercase tracking-wider text-on-surface-variant">
                    <th className="px-3">Fecha</th>
                    <th className="px-3">Concepto</th>
                    <th className="px-3 text-right">Cargo</th>
                    <th className="px-3 text-right">Pago</th>
                    <th className="px-3 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {statement.ledger.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-body-sm text-on-surface-variant">
                        Sin movimientos todavía
                      </td>
                    </tr>
                  )}
                  {statement.ledger.map((row, i) => (
                    <tr key={i} className="h-11">
                      <td className="px-3 text-body-sm text-on-surface-variant">{formatDate(row.fecha)}</td>
                      <td className="px-3 text-body-sm text-on-surface">{row.concepto}</td>
                      <td className="px-3 text-right font-numeric-data text-body-sm text-on-surface">
                        {Number(row.cargo) > 0 ? formatCurrency(row.cargo) : "—"}
                      </td>
                      <td className="px-3 text-right font-numeric-data text-body-sm text-on-surface">
                        {Number(row.pago) > 0 ? formatCurrency(row.pago) : "—"}
                      </td>
                      <td className="px-3 text-right font-numeric-data text-body-sm font-semibold text-primary-container">
                        {formatCurrency(row.saldo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
