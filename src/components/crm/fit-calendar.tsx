"use client"

import React, { useState } from "react"
import { createFitSession, updateFitSessionStatus, deleteFitSession } from "@/app/actions/clientes"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar as CalendarIcon, Clock, MessageSquare, Mail, Plus, CheckCircle2, XCircle, AlertCircle, Trash2, ExternalLink } from "lucide-react"

interface FitSessionItem {
  id: string
  title: string
  date: Date | string
  status: string
  reminderSent: boolean
  notes?: string | null
  project?: { id: string; name: string } | null
}

interface FitCalendarProps {
  clientId: string
  clientName: string
  clientPhone?: string | null
  clientEmail?: string | null
  sessions: FitSessionItem[]
  projects?: { id: string; name: string }[]
}

const SESSION_TYPES = [
  "Primera Prueba de Calce",
  "Segunda Prueba de Calce",
  "Ajuste Final y Retoque",
  "Entrega Final de Prenda"
]

export function FitCalendar({
  clientId,
  clientName,
  clientPhone,
  clientEmail,
  sessions = [],
  projects = []
}: FitCalendarProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [title, setTitle] = useState(SESSION_TYPES[0])
  const [date, setDate] = useState("")
  const [notes, setNotes] = useState("")
  const [projectId, setProjectId] = useState("none")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("clientId", clientId)
      formData.append("title", title)
      formData.append("date", date)
      formData.append("notes", notes)
      formData.append("projectId", projectId)
      await createFitSession(formData)
      setShowAddForm(false)
      setDate("")
      setNotes("")
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (sessionId: string, status: string) => {
    try {
      await updateFitSessionStatus(sessionId, status)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (sessionId: string) => {
    if (confirm("¿Deseas eliminar esta cita del calendario?")) {
      await deleteFitSession(sessionId)
    }
  }

  const generateWhatsAppUrl = (session: FitSessionItem) => {
    if (!clientPhone) return "#"
    const cleanPhone = clientPhone.replace(/[^0-9]/g, "")
    const d = new Date(session.date)
    const formattedDate = d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
    const formattedTime = d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
    
    const message = `Hola ${clientName}! 👋 Te recordamos tu cita de *${session.title}* en SewStudio agendada para el *${formattedDate}* a las *${formattedTime}*. 🧵✨\n\nPor favor confirma tu asistencia. ¡Te esperamos!`
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
  }

  const generateMailtoUrl = (session: FitSessionItem) => {
    if (!clientEmail) return "#"
    const d = new Date(session.date)
    const formattedDate = d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
    const formattedTime = d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })

    const subject = `Recordatorio de Cita de Prueba - SewStudio`
    const body = `Hola ${clientName},\n\nTe recordamos tu cita de "${session.title}" agendada para el ${formattedDate} a las ${formattedTime}.\n\nNotas adicionales: ${session.notes || "Ninguna"}\n\n¡Te esperamos en nuestro estudio!\n\nAtentamente,\nEquipo SewStudio`
    return `mailto:${clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Calendario de Pruebas de Calce (Fit Sessions)
              </CardTitle>
              <CardDescription>Agendamintos de 1ª, 2ª prueba y entrega final con recordatorios automáticos</CardDescription>
            </div>

            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" /> Agendar Nueva Cita
            </Button>
          </div>
        </CardHeader>

        {showAddForm && (
          <CardContent className="border-t border-slate-100 dark:border-slate-800 pt-4 bg-slate-50/50 dark:bg-slate-900/40">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Tipo de Cita</Label>
                  <select
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full mt-1 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2 font-medium"
                  >
                    {SESSION_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Fecha y Hora</Label>
                  <Input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="mt-1 text-sm bg-white dark:bg-slate-950"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Proyecto Asociado (Opcional)</Label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full mt-1 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2 font-medium"
                  >
                    <option value="none">Sin proyecto específico</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Observaciones para la prueba</Label>
                <Input
                  placeholder="Ej. Traer zapatos de taco, traer corsé de soporte..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 text-xs bg-white dark:bg-slate-950"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} size="sm" className="bg-primary text-white">
                  {isSubmitting ? "Agendando..." : "Confirmar Cita"}
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Sessions Grid */}
      {sessions.length === 0 ? (
        <Card className="border-dashed border-slate-300 dark:border-slate-800">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <Clock className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">No hay citas agendadas</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Programa las fechas de primera prueba, segunda prueba y entrega para enviar avisos dinámicos por WhatsApp.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((session) => {
            const d = new Date(session.date)
            const isPast = d < new Date()
            const formattedDate = d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
            const formattedTime = d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })

            return (
              <Card key={session.id} className="border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden">
                {/* Status top bar accent */}
                <div className={`h-1.5 w-full ${
                  session.status === "COMPLETADA" ? "bg-emerald-500" :
                  session.status === "CONFIRMADA" ? "bg-blue-500" :
                  session.status === "CANCELADA" ? "bg-red-500" : "bg-amber-500"
                }`} />

                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {session.project ? session.project.name : "Cita General"}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {session.title}
                      </h4>
                    </div>

                    {/* Status Pill */}
                    <div className="flex items-center gap-1">
                      <select
                        value={session.status}
                        onChange={(e) => handleStatusChange(session.id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border border-transparent shadow-2xs ${
                          session.status === "COMPLETADA" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" :
                          session.status === "CONFIRMADA" ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300" :
                          session.status === "CANCELADA" ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300" :
                          "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        }`}
                      >
                        <option value="PENDIENTE">PENDIENTE</option>
                        <option value="CONFIRMADA">CONFIRMADA</option>
                        <option value="COMPLETADA">COMPLETADA</option>
                        <option value="CANCELADA">CANCELADA</option>
                      </select>

                      <button
                        onClick={() => handleDelete(session.id)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
                        title="Eliminar cita"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Date and Time Box */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      <CalendarIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div suppressHydrationWarning className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">
                        {formattedDate.replace(/\s/g, ' ')}
                      </div>
                      <div suppressHydrationWarning className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" /> {formattedTime.replace(/\s/g, ' ')} hs {isPast && <span className="text-amber-600 font-semibold">(Pasada)</span>}
                      </div>
                    </div>
                  </div>

                  {session.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      "{session.notes}"
                    </p>
                  )}

                  {/* Reminder Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    {clientPhone ? (
                      <a
                        href={generateWhatsAppUrl(session)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                      >
                        <MessageSquare className="h-4 w-4" /> Recordatorio WhatsApp
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic flex-1">Sin teléfono para WhatsApp</span>
                    )}

                    {clientEmail && (
                      <a
                        href={generateMailtoUrl(session)}
                        className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium"
                        title="Enviar por Email"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
