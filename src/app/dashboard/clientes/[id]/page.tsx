import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { updateClient, deleteClient } from "@/app/actions/clientes"
import { InteractiveSilhouette } from "@/components/crm/interactive-silhouette"
import { MeasurementHistoryView } from "@/components/crm/measurement-history"
import { FitCalendar } from "@/components/crm/fit-calendar"
import { QuotePdfBuilder } from "@/components/crm/quote-pdf-builder"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, User, Phone, Mail, MapPin, MessageSquare, Ruler, Calendar, FileText, Trash2, Edit } from "lucide-react"

export default async function ClientDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const { id } = await params

  const client = await db.client.findFirst({
    where: {
      id,
      userId: session.user.id
    },
    include: {
      measurements: { orderBy: { recordedAt: "desc" } },
      fitSessions: { orderBy: { date: "asc" }, include: { project: true } },
      quotes: { orderBy: { createdAt: "desc" } },
      projects: { orderBy: { updatedAt: "desc" } }
    }
  })

  if (!client) {
    notFound()
  }

  const latestMeasurements = client.measurements[0] ? (() => {
    try {
      return JSON.parse(client.measurements[0].dataJson)
    } catch {
      return {}
    }
  })() : {}

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/clientes"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al directorio de clientes
        </Link>
      </div>

      {/* Profile Banner Header */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-md bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white overflow-hidden">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center font-bold text-2xl md:text-3xl shadow-xl shadow-primary/20 shrink-0">
              {client.name.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{client.name}</h1>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-slate-300 pt-1">
                {client.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-primary" /> {client.phone}
                  </span>
                )}
                {client.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary" /> {client.email}
                  </span>
                )}
                {client.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> {client.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Direct Actions */}
          <div className="flex items-center gap-3">
            {client.phone && (
              <a
                href={`https://wa.me/${client.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all"
              >
                <MessageSquare className="h-4 w-4" /> Enviar WhatsApp
              </a>
            )}

            <form action={async () => {
              "use server"
              await deleteClient(client.id)
            }}>
              <Button type="submit" variant="destructive" size="sm" className="gap-1 text-xs">
                <Trash2 className="h-3.5 w-3.5" /> Eliminar
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs Container */}
      <div className="space-y-8">
        {/* Tab 1: Ficha de Medidas Anatómicas & Silueta Humana */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Ruler className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Ficha de Medidas Anatómicas</h2>
          </div>

          <InteractiveSilhouette
            clientId={client.id}
            initialData={latestMeasurements}
          />

          <div className="pt-4">
            <MeasurementHistoryView history={client.measurements} />
          </div>
        </section>

        {/* Tab 2: Calendario de Pruebas de Calce */}
        <section className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Calendario de Pruebas de Calce</h2>
          </div>

          <FitCalendar
            clientId={client.id}
            clientName={client.name}
            clientPhone={client.phone}
            clientEmail={client.email}
            sessions={client.fitSessions}
            projects={client.projects}
          />
        </section>

        {/* Tab 3: Presupuestos y Cotizaciones en PDF */}
        <section className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Presupuestos y Cotizaciones PDF</h2>
          </div>

          <QuotePdfBuilder
            clientId={client.id}
            clientName={client.name}
            clientEmail={client.email}
            clientPhone={client.phone}
            clientAddress={client.address}
            quotes={client.quotes}
          />
        </section>
      </div>
    </div>
  )
}
