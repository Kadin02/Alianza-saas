import { useQuery } from "@tanstack/react-query"
import { Printer } from "lucide-react"
import { useParams } from "react-router-dom"

import { Logo } from "@/shared/ui/Logo"

import { getPaymentReceipt } from "./api"
import { formatCurrency, formatDate } from "./labels"

export default function ReceiptPage() {
  const { paymentId } = useParams<{ paymentId: string }>()
  const id = Number(paymentId)

  const { data: receipt, isLoading, isError } = useQuery({
    queryKey: ["payment-receipt", id],
    queryFn: () => getPaymentReceipt(id),
    enabled: Number.isFinite(id),
  })

  if (isLoading) {
    return <div className="p-8 text-body-md text-on-surface-variant">Cargando recibo…</div>
  }

  if (isError || !receipt) {
    return <div className="p-8 text-body-md text-danger">No se pudo cargar el recibo.</div>
  }

  return (
    <div className="min-h-screen bg-surface-container-low py-8 print:bg-white print:py-0">
      <div className="mx-auto flex max-w-2xl justify-end px-4 pb-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-blue px-4 py-2 text-body-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-hover"
        >
          <Printer className="h-4 w-4" />
          Imprimir / Guardar PDF
        </button>
      </div>

      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-lg print:max-w-none print:rounded-none print:p-0 print:shadow-none">
        <div className="flex items-start justify-between border-b border-outline-variant pb-6">
          <div>
            <Logo />
            <div className="mt-3 text-title-sm text-on-surface">{receipt.property_name}</div>
            <div className="text-body-sm text-on-surface-variant">{receipt.property_address}</div>
            {receipt.property_phone && <div className="text-body-sm text-on-surface-variant">{receipt.property_phone}</div>}
            {receipt.property_email && <div className="text-body-sm text-on-surface-variant">{receipt.property_email}</div>}
          </div>
          <div className="text-right">
            <div className="text-title-sm text-primary-container">Recibo de Pago</div>
            <div className="mt-1 text-body-sm text-on-surface-variant">N.º {String(receipt.payment_id).padStart(6, "0")}</div>
            <div className="text-body-sm text-on-surface-variant">{formatDate(receipt.payment_date)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b border-outline-variant py-6">
          <div>
            <div className="text-label-sm uppercase text-on-surface-variant">Recibido de</div>
            <div className="mt-0.5 font-semibold text-on-surface">{receipt.owner_name ?? "—"}</div>
          </div>
          <div>
            <div className="text-label-sm uppercase text-on-surface-variant">Unidad</div>
            <div className="mt-0.5 font-semibold text-on-surface">{receipt.unit_number}</div>
          </div>
          <div>
            <div className="text-label-sm uppercase text-on-surface-variant">Método de pago</div>
            <div className="mt-0.5 text-body-md text-on-surface">{receipt.method || "—"}</div>
          </div>
          <div>
            <div className="text-label-sm uppercase text-on-surface-variant">Referencia</div>
            <div className="mt-0.5 text-body-md text-on-surface">{receipt.reference || "—"}</div>
          </div>
        </div>

        <table className="mt-6 w-full text-left">
          <thead>
            <tr className="h-9 border-b border-outline-variant text-label-sm uppercase tracking-wider text-on-surface-variant">
              <th>Concepto</th>
              <th className="text-right">Monto aplicado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low">
            {receipt.applications.map((line) => (
              <tr key={line.charge_id} className="h-11">
                <td className="text-body-sm text-on-surface">
                  {line.description}
                  {line.is_recargo && <span className="ml-1.5 text-label-sm text-danger">(mora)</span>}
                </td>
                <td className="text-right font-numeric-data text-body-sm text-on-surface">
                  {formatCurrency(line.applied_amount)}
                </td>
              </tr>
            ))}
            {receipt.applications.length === 0 && (
              <tr>
                <td colSpan={2} className="py-4 text-center text-body-sm text-on-surface-variant">
                  Este pago no se aplicó a ningún cargo.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-6 ml-auto max-w-xs space-y-1.5 border-t border-outline-variant pt-4">
          <div className="flex justify-between text-body-sm text-on-surface-variant">
            <span>Subtotal</span>
            <span className="font-numeric-data">{formatCurrency(receipt.subtotal)}</span>
          </div>
          {Number(receipt.recargo) > 0 && (
            <div className="flex justify-between text-body-sm text-danger">
              <span>Mora</span>
              <span className="font-numeric-data">{formatCurrency(receipt.recargo)}</span>
            </div>
          )}
          {Number(receipt.credit_generated) > 0 && (
            <div className="flex justify-between text-body-sm text-on-surface-variant">
              <span>Saldo a favor generado</span>
              <span className="font-numeric-data">{formatCurrency(receipt.credit_generated)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-outline-variant pt-1.5 text-title-sm font-semibold text-primary-container">
            <span>Total pagado</span>
            <span className="font-numeric-data">{formatCurrency(receipt.amount)}</span>
          </div>
        </div>

        <p className="mt-8 text-center text-body-sm text-on-surface-variant">Gracias por su pago.</p>
      </div>
    </div>
  )
}
