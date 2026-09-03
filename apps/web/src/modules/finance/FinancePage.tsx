import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, Banknote, CalendarClock, FileText, Plus, Receipt } from "lucide-react"
import { useState } from "react"

import { Button } from "@/shared/ui/button"
import { cn } from "@/shared/lib/utils"

import { listCharges, listPayments } from "./api"
import { ChargeFormDialog } from "./ChargeFormDialog"
import { GenerateMonthlyChargesDialog } from "./GenerateMonthlyChargesDialog"
import { chargeStatusLabels, chargeStatusStyles, formatCurrency, formatDate } from "./labels"
import { LateFeeDialog } from "./LateFeeDialog"
import { PaymentFormDialog } from "./PaymentFormDialog"
import { StatementDialog } from "./StatementDialog"
import type { ChargeRead } from "./types"

type Tab = "charges" | "payments"

const today = new Date().toISOString().slice(0, 10)

export default function FinancePage() {
  const [tab, setTab] = useState<Tab>("charges")
  const [chargeDialogOpen, setChargeDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [statementUnitId, setStatementUnitId] = useState<number | null>(null)
  const [lateFeeCharge, setLateFeeCharge] = useState<ChargeRead | null>(null)

  const { data: charges, isLoading: chargesLoading } = useQuery({ queryKey: ["charges"], queryFn: () => listCharges() })
  const { data: payments, isLoading: paymentsLoading } = useQuery({ queryKey: ["payments"], queryFn: () => listPayments() })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="heading-gradient text-headline-lg font-bold">Finanzas</h1>
          <p className="mt-0.5 text-body-sm text-on-surface-variant">Cargos, pagos y estado de cuenta por unidad</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setGenerateDialogOpen(true)}>
            <CalendarClock className="h-4 w-4" />
            Generar Cuotas del Mes
          </Button>
          <Button variant="ghost" onClick={() => setChargeDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Nuevo Cargo
          </Button>
          <Button onClick={() => setPaymentDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Registrar Pago
          </Button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-outline-variant">
        <button
          onClick={() => setTab("charges")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 text-body-md font-semibold transition-colors",
            tab === "charges"
              ? "border-b-2 border-brand-blue text-brand-blue"
              : "text-on-surface-variant hover:text-on-surface"
          )}
        >
          <Receipt className="h-4 w-4" />
          Cargos
        </button>
        <button
          onClick={() => setTab("payments")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 text-body-md font-semibold transition-colors",
            tab === "payments"
              ? "border-b-2 border-brand-blue text-brand-blue"
              : "text-on-surface-variant hover:text-on-surface"
          )}
        >
          <Banknote className="h-4 w-4" />
          Pagos
        </button>
      </div>

      {tab === "charges" && (
        <>
          {chargesLoading && <p className="text-body-md text-on-surface-variant">Cargando…</p>}

          {!chargesLoading && charges?.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest py-16 text-center">
              <FileText className="h-10 w-10 text-outline" />
              <p className="text-title-sm text-on-surface">Todavía no hay cargos</p>
              <p className="max-w-sm text-body-sm text-on-surface-variant">
                Crea el primer cargo (cuota, gasto extraordinario, etc.) para una unidad.
              </p>
              <Button onClick={() => setChargeDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Nuevo Cargo
              </Button>
            </div>
          )}

          {!!charges?.length && (
            <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="h-9 bg-surface-container-low text-label-sm uppercase tracking-wider text-on-surface-variant">
                    <th className="px-4">Unidad</th>
                    <th className="px-3">Descripción</th>
                    <th className="px-3">Vencimiento</th>
                    <th className="px-3 text-right">Monto</th>
                    <th className="px-3 text-right">Saldo</th>
                    <th className="px-3">Estado</th>
                    <th className="px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {charges.map((charge) => {
                    const isOverdue = charge.due_date < today && charge.status !== "PAGADO"
                    const canApplyLateFee = isOverdue && !charge.is_recargo
                    return (
                      <tr
                        key={charge.id}
                        className="h-12 cursor-pointer transition-colors hover:bg-surface-container-low/50"
                        onClick={() => setStatementUnitId(charge.unit_id)}
                      >
                        <td className="px-4">
                          <div className="font-semibold text-on-surface">{charge.unit_number}</div>
                          <div className="text-body-sm text-on-surface-variant">{charge.property_name}</div>
                        </td>
                        <td className="px-3 text-body-sm text-on-surface">
                          <div className="flex items-center gap-1.5">
                            {charge.description}
                            {charge.is_recargo && (
                              <span className="rounded-full bg-danger-bg px-1.5 py-0.5 text-label-sm font-semibold text-danger-text">
                                Mora
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={cn("px-3 text-body-sm", isOverdue ? "font-semibold text-danger" : "text-on-surface-variant")}>
                          {formatDate(charge.due_date)}
                        </td>
                        <td className="px-3 text-right font-numeric-data text-on-surface">{formatCurrency(charge.amount)}</td>
                        <td className="px-3 text-right font-numeric-data text-primary-container">{formatCurrency(charge.balance)}</td>
                        <td className="px-3">
                          <span className={cn("rounded-full px-2 py-0.5 text-label-sm font-semibold", chargeStatusStyles[charge.status])}>
                            {chargeStatusLabels[charge.status]}
                          </span>
                        </td>
                        <td className="px-3 text-right">
                          {canApplyLateFee && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setLateFeeCharge(charge)
                              }}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-label-sm font-semibold text-danger transition-colors hover:bg-danger-bg"
                              aria-label="Aplicar mora"
                            >
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Aplicar mora
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === "payments" && (
        <>
          {paymentsLoading && <p className="text-body-md text-on-surface-variant">Cargando…</p>}

          {!paymentsLoading && payments?.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest py-16 text-center">
              <Banknote className="h-10 w-10 text-outline" />
              <p className="text-title-sm text-on-surface">Todavía no hay pagos</p>
              <p className="max-w-sm text-body-sm text-on-surface-variant">
                Registra el primer pago — se aplicará automáticamente a los cargos pendientes de la unidad.
              </p>
              <Button onClick={() => setPaymentDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Registrar Pago
              </Button>
            </div>
          )}

          {!!payments?.length && (
            <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="h-9 bg-surface-container-low text-label-sm uppercase tracking-wider text-on-surface-variant">
                    <th className="px-4">N.º</th>
                    <th className="px-3">Unidad</th>
                    <th className="px-3">Propietario</th>
                    <th className="px-3">Fecha</th>
                    <th className="px-3">Método / Ref.</th>
                    <th className="px-3 text-right">Monto</th>
                    <th className="px-3 text-right">Aplicado</th>
                    <th className="px-3 text-right">Recibo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="h-12 cursor-pointer transition-colors hover:bg-surface-container-low/50"
                      onClick={() => setStatementUnitId(payment.unit_id)}
                    >
                      <td className="px-4 font-numeric-data text-body-sm text-on-surface-variant">
                        {payment.receipt_number ?? `#${payment.id}`}
                      </td>
                      <td className="px-3">
                        <div className="font-semibold text-on-surface">{payment.unit_number}</div>
                        <div className="text-body-sm text-on-surface-variant">{payment.property_name}</div>
                      </td>
                      <td className="px-3 text-body-sm text-on-surface-variant">{payment.owner_name ?? "—"}</td>
                      <td className="px-3 text-body-sm text-on-surface-variant">{formatDate(payment.payment_date)}</td>
                      <td className="px-3 text-body-sm text-on-surface-variant">
                        {payment.method || "—"}
                        {payment.reference ? ` · ${payment.reference}` : ""}
                      </td>
                      <td className="px-3 text-right font-numeric-data text-on-surface">{formatCurrency(payment.amount)}</td>
                      <td className="px-3 text-right font-numeric-data text-primary-container">
                        {formatCurrency(payment.applied_to_charges)}
                      </td>
                      <td className="px-3 text-right">
                        <a
                          href={`/print/receipts/${payment.id}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-label-sm font-semibold text-brand-blue transition-colors hover:bg-surface-container"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Ver recibo
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <ChargeFormDialog open={chargeDialogOpen} onOpenChange={setChargeDialogOpen} />
      <PaymentFormDialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen} />
      <StatementDialog unitId={statementUnitId} onOpenChange={(open) => !open && setStatementUnitId(null)} />
      <LateFeeDialog charge={lateFeeCharge} onOpenChange={(open) => !open && setLateFeeCharge(null)} />
      <GenerateMonthlyChargesDialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen} />
    </div>
  )
}
