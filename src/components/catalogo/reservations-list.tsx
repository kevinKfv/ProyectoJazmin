"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CreditCard, CheckCircle2, Clock, Calendar, User, Phone, Mail, FileText } from "lucide-react"

interface ReservationItem {
  id: string
  quoteNumber: string
  depositPaid: number
  balanceDue: number
  total: number
  paymentStatus: string
  status: string
  notes?: string | null
  createdAt: Date | string
  client: {
    name: string
    email?: string | null
    phone?: string | null
  }
  project?: {
    name: string
    publicImageUrl?: string | null
  } | null
}

interface ReservationsListProps {
  reservations: ReservationItem[]
}

export function ReservationsList({ reservations }: ReservationsListProps) {
  if (reservations.length === 0) {
    return (
      <Card className="border-dashed border-slate-300 dark:border-slate-800">
        <CardContent className="py-12 flex flex-col items-center justify-center text-center">
          <CreditCard className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">Sin señas ni reservas online aún</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Las reservas realizadas por tus clientes desde tu catálogo público con MercadoPago aparecerán automáticamente aquí.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {reservations.map((res) => (
          <Card key={res.id} className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-500">
                  {res.quoteNumber}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Seña Pagada (MercadoPago)
                </span>
              </div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                {res.project?.name || "Encargo a Medida"}
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
              {/* Cliente info */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold">
                    <User className="h-3.5 w-3.5 text-primary" /> {res.client.name}
                  </div>
                  {res.client.phone && (
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Phone className="h-3 w-3" /> {res.client.phone}
                    </div>
                  )}
                </div>

                <div className="text-right space-y-0.5">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Seña Recibida</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">${res.depositPaid.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 block">Saldo pendiente: ${res.balanceDue.toFixed(2)}</span>
                </div>
              </div>

              {res.notes && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                  💬 {res.notes}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {new Date(res.createdAt).toISOString().split('T')[0]}
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">Total: ${res.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
