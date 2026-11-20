import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/app/actions/clientes"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, UserPlus, Search, Calendar, FileText, Ruler, MessageSquare, Phone, Mail, MapPin, ChevronRight, Sparkles } from "lucide-react"

export default async function ClientesPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const clients = await db.client.findMany({
    where: { userId: session.user.id },
    include: {
      measurements: { orderBy: { recordedAt: "desc" }, take: 1 },
      fitSessions: { orderBy: { date: "asc" } },
      quotes: true,
      projects: true,
    },
    orderBy: { updatedAt: "desc" }
  })

  // KPIs
  const totalClients = clients.length
  const totalUpcomingSessions = clients.reduce((acc, c) => acc + c.fitSessions.filter(s => s.status === "PENDIENTE" || s.status === "CONFIRMADA").length, 0)
  const totalQuotes = clients.reduce((acc, c) => acc + c.quotes.length, 0)
  const totalDeposits = clients.reduce((acc, c) => acc + c.quotes.reduce((s, q) => s + q.depositPaid, 0), 0)

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 dark:from-white dark:via-purple-200 dark:to-white bg-clip-text text-transparent">
            Clientes & CRM Textil
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gestión de fichas de medidas corporales, calendario de calces y cotizaciones
          </p>
        </div>

        {/* Modal trigger or quick creation form */}
        <form action={createClient} className="flex items-center gap-2">
          <Input
            name="name"
            placeholder="Nombre completo del cliente..."
            required
            className="w-64 bg-white dark:bg-slate-900"
          />
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-md shadow-primary/20">
            <UserPlus className="h-4 w-4" /> Nuevo Cliente
          </Button>
        </form>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Clientes</p>
              <h3 className="text-2xl font-bold mt-1">{totalClients}</h3>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-primary">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Citas Próximas</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{totalUpcomingSessions}</h3>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Calendar className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Presupuestos</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{totalQuotes}</h3>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Señas Acumuladas</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">${totalDeposits.toLocaleString("es-AR")}</h3>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Ruler className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Directory Grid */}
      {clients.length === 0 ? (
        <Card className="border-dashed border-slate-300 dark:border-slate-800">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No tienes clientes registrados aún</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
              Empieza registrando tu primer cliente para tomar sus medidas corporales en la silueta interactiva y agendar pruebas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => {
            const hasMeasurements = client.measurements.length > 0
            const upcomingSession = client.fitSessions.find(s => s.status === "PENDIENTE" || s.status === "CONFIRMADA")

            return (
              <Card key={client.id} className="border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-primary/20">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                          {client.name}
                        </CardTitle>
                        <CardDescription className="text-xs flex items-center gap-2 mt-0.5">
                          {client.phone ? (
                            <span className="flex items-center gap-1 text-slate-500">
                              <Phone className="h-3 w-3" /> {client.phone}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Sin teléfono</span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pb-4">
                  {/* Badges / Quick stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Ficha de Medidas</span>
                      <span className={`font-semibold ${hasMeasurements ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}`}>
                        {hasMeasurements ? "Registradas ✓" : "Pendiente"}
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Próxima Prueba</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">
                        {upcomingSession ? new Date(upcomingSession.date).toLocaleDateString("es-AR") : "Sin agendar"}
                      </span>
                    </div>
                  </div>

                  {client.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                      "{client.notes}"
                    </p>
                  )}
                </CardContent>

                {/* Footer Action */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80 rounded-b-xl flex items-center justify-between">
                  {client.phone ? (
                    <a
                      href={`https://wa.me/${client.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                      title="WhatsApp directo"
                    >
                      <MessageSquare className="h-4 w-4" /> Chat
                    </a>
                  ) : <span />}

                  <Link
                    href={`/dashboard/clientes/${client.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:translate-x-0.5 transition-transform"
                  >
                    Ver Ficha Completa <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
