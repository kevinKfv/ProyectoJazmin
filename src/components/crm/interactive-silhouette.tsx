"use client"

import React, { useState } from "react"
import { saveClientMeasurements } from "@/app/actions/clientes"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Save, RotateCcw, User, Eye, Info, Check } from "lucide-react"

export interface MeasurementData {
  busto?: number
  bajoBusto?: number
  cintura?: number
  cadera?: number
  altoBusto?: number
  separacionBusto?: number
  talleDelantero?: number
  talleEspalda?: number
  anchoHombro?: number
  anchoEspalda?: number
  largoManga?: number
  contornoBrazo?: number
  contornoMuneca?: number
  contornoCuello?: number
  alturaCadera?: number
  tiro?: number
  contornoMuslo?: number
  entrepierna?: number
  contornoTobillo?: number
  largoTotal?: number
  alturaRodilla?: number
  [key: string]: number | undefined
}

interface InteractiveSilhouetteProps {
  clientId: string
  initialData?: MeasurementData
}

const MEASUREMENT_FIELDS: { id: keyof MeasurementData; label: string; group: string; cx: number; cy: number; view: "front" | "back"; hint: string }[] = [
  { id: "contornoCuello", label: "Contorno Cuello", group: "Tórax y Cuello", cx: 100, cy: 65, view: "front", hint: "Alrededor de la base del cuello" },
  { id: "anchoHombro", label: "Ancho de Hombro", group: "Tórax y Cuello", cx: 65, cy: 80, view: "front", hint: "Desde base del cuello hasta hueso del hombro" },
  { id: "busto", label: "Contorno de Busto / Pecho", group: "Tórax y Cuello", cx: 100, cy: 110, view: "front", hint: "Zona más prominente del busto con cinta horizontal" },
  { id: "separacionBusto", label: "Separación de Busto", group: "Tórax y Cuello", cx: 100, cy: 125, view: "front", hint: "Distancia entre pezón y pezón" },
  { id: "altoBusto", label: "Altura de Busto", group: "Tórax y Cuello", cx: 88, cy: 100, view: "front", hint: "Desde hombro hasta la punta del busto" },
  { id: "bajoBusto", label: "Contorno Bajo Busto", group: "Tórax y Cuello", cx: 100, cy: 135, view: "front", hint: "Justo por debajo de la base del busto" },
  { id: "talleDelantero", label: "Talle Delantero", group: "Tronco", cx: 100, cy: 155, view: "front", hint: "Desde hombro sobre el pezón hasta cintura" },
  
  { id: "cintura", label: "Contorno de Cintura", group: "Tronco", cx: 100, cy: 170, view: "front", hint: "Parte más estrecha del torso" },
  { id: "alturaCadera", label: "Altura de Cadera", group: "Tronco", cx: 100, cy: 195, view: "front", hint: "Desde cintura hasta parte más ancha de la cadera" },
  { id: "cadera", label: "Contorno de Cadera", group: "Tronco", cx: 100, cy: 220, view: "front", hint: "Alrededor de la parte más prominente de los glúteos/cadera" },
  
  { id: "anchoEspalda", label: "Ancho de Espalda", group: "Brazos y Espalda", cx: 100, cy: 90, view: "back", hint: "De hombro a hombro por la espalda" },
  { id: "talleEspalda", label: "Talle Espalda", group: "Brazos y Espalda", cx: 100, cy: 150, view: "back", hint: "Desde cervical hasta la línea de cintura" },
  { id: "contornoBrazo", label: "Contorno de Brazo (Bíceps)", group: "Brazos y Espalda", cx: 40, cy: 130, view: "front", hint: "Parte más abultada del bíceps relajado" },
  { id: "largoManga", label: "Largo de Manga", group: "Brazos y Espalda", cx: 35, cy: 170, view: "front", hint: "Desde el hombro hasta el hueso de la muñeca" },
  { id: "contornoMuneca", label: "Contorno de Muñeca", group: "Brazos y Espalda", cx: 30, cy: 215, view: "front", hint: "Alrededor del hueso del muñeca" },
  
  { id: "tiro", label: "Tiro Total", group: "Piernas", cx: 100, cy: 240, view: "front", hint: "Cintura delantera pasando por la entrepierna hasta cintura espalda" },
  { id: "contornoMuslo", label: "Contorno de Muslo", group: "Piernas", cx: 80, cy: 260, view: "front", hint: "Parte más ancha del muslo justo debajo de entrepierna" },
  { id: "alturaRodilla", label: "Altura de Rodilla", group: "Piernas", cx: 78, cy: 320, view: "front", hint: "Desde la cintura hasta el centro de la rodilla" },
  { id: "entrepierna", label: "Largo Entrepierna", group: "Piernas", cx: 88, cy: 300, view: "front", hint: "Desde entrepierna hasta el suelo o tobillo" },
  { id: "contornoTobillo", label: "Contorno de Tobillo", group: "Piernas", cx: 75, cy: 375, view: "front", hint: "Parte más estrecha sobre los maléolos del tobillo" },
  { id: "largoTotal", label: "Largo Total Prenda", group: "Piernas", cx: 125, cy: 300, view: "front", hint: "Medida del largo deseado de la prenda (vestido/pantalón)" },
]

export function InteractiveSilhouette({ clientId, initialData = {} }: InteractiveSilhouetteProps) {
  const [measurements, setMeasurements] = useState<MeasurementData>(initialData)
  const [activeId, setActiveId] = useState<keyof MeasurementData | null>("busto")
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [viewMode, setViewMode] = useState<"front" | "back">("front")

  const handleInputChange = (id: keyof MeasurementData, val: string) => {
    const num = val === "" ? undefined : parseFloat(val)
    setMeasurements(prev => ({ ...prev, [id]: num }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      // Clean undefined values
      const cleanData: Record<string, number> = {}
      Object.entries(measurements).forEach(([k, v]) => {
        if (typeof v === "number" && !isNaN(v)) {
          cleanData[k] = v
        }
      })
      await saveClientMeasurements(clientId, cleanData, notes || undefined)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const activeField = MEASUREMENT_FIELDS.find(f => f.id === activeId)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Visual Silhouette Box */}
      <Card className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between">
        <CardHeader className="border-b border-slate-800/80 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center border border-primary/30">
                <User className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-white">Silueta Anatómica</CardTitle>
                <CardDescription className="text-xs text-slate-400">Haz clic en una zona del cuerpo para medir</CardDescription>
              </div>
            </div>
            <div className="flex bg-slate-800/80 rounded-lg p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode("front")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === "front" ? "bg-primary text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
              >
                Frente
              </button>
              <button
                type="button"
                onClick={() => setViewMode("back")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === "back" ? "bg-primary text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
              >
                Espalda
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 flex-1 flex flex-col items-center justify-center relative min-h-[420px]">
          {/* Interactive SVG Diagram */}
          <div className="relative w-full max-w-[280px] h-[390px] flex items-center justify-center">
            <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <defs>
                <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
                <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
                </radialGradient>
              </defs>

              {/* Body Outline Graphic */}
              {viewMode === "front" ? (
                <g stroke="#64748b" strokeWidth="1.8" fill="url(#bodyGrad)">
                  {/* Head */}
                  <ellipse cx="100" cy="35" rx="18" ry="22" />
                  {/* Neck */}
                  <path d="M 90 55 L 90 68 L 110 68 L 110 55 Z" />
                  {/* Torso & Arms */}
                  <path d="M 90 68 C 70 72 55 80 50 95 L 35 150 L 25 210 C 24 218 32 220 35 215 L 48 160 L 55 160 L 52 210 C 51 220 60 220 62 210 L 68 150 L 72 170 C 70 195 65 215 62 230 L 72 320 L 70 380 L 85 380 L 86 310 L 98 245 L 102 245 L 114 310 L 115 380 L 130 380 L 128 320 L 138 230 C 135 215 130 195 128 170 L 132 150 L 138 210 C 140 220 149 220 148 210 L 145 160 L 152 160 L 165 215 C 168 220 176 218 175 210 L 150 95 C 145 80 130 72 110 68 Z" />
                  {/* Chest & Waist Guidelines */}
                  <line x1="70" y1="110" x2="130" y2="110" stroke="#a855f7" strokeDasharray="3 3" strokeWidth="1.2" opacity="0.6" />
                  <line x1="75" y1="170" x2="125" y2="170" stroke="#ec4899" strokeDasharray="3 3" strokeWidth="1.2" opacity="0.6" />
                  <line x1="68" y1="220" x2="132" y2="220" stroke="#3b82f6" strokeDasharray="3 3" strokeWidth="1.2" opacity="0.6" />
                </g>
              ) : (
                <g stroke="#64748b" strokeWidth="1.8" fill="url(#bodyGrad)">
                  {/* Head */}
                  <ellipse cx="100" cy="35" rx="18" ry="22" />
                  {/* Neck */}
                  <path d="M 90 55 L 90 68 L 110 68 L 110 55 Z" />
                  {/* Back & Shoulders */}
                  <path d="M 90 68 C 70 72 55 80 50 95 L 35 150 L 25 210 C 24 218 32 220 35 215 L 48 160 L 55 160 L 52 210 C 51 220 60 220 62 210 L 68 150 L 72 170 C 70 195 65 215 62 230 L 72 320 L 70 380 L 85 380 L 86 310 L 98 245 L 102 245 L 114 310 L 115 380 L 130 380 L 128 320 L 138 230 C 135 215 130 195 128 170 L 132 150 L 138 210 C 140 220 149 220 148 210 L 145 160 L 152 160 L 165 215 C 168 220 176 218 175 210 L 150 95 C 145 80 130 72 110 68 Z" />
                  {/* Spine and Shoulder Guidelines */}
                  <line x1="100" y1="68" x2="100" y2="230" stroke="#64748b" strokeDasharray="2 2" opacity="0.4" />
                  <line x1="65" y1="90" x2="135" y2="90" stroke="#a855f7" strokeDasharray="3 3" strokeWidth="1.2" opacity="0.6" />
                </g>
              )}

              {/* Clickable Hotspots */}
              {MEASUREMENT_FIELDS.filter(f => f.view === viewMode || (viewMode === "front" && f.view === "front")).map((field) => {
                const isActive = activeId === field.id
                const val = measurements[field.id]
                const hasValue = val !== undefined && val !== null && val > 0

                return (
                  <g
                    key={field.id}
                    onClick={() => setActiveId(field.id)}
                    className="cursor-pointer transition-all duration-200"
                  >
                    {/* Glow ring when active */}
                    {isActive && (
                      <circle cx={field.cx} cy={field.cy} r="14" fill="url(#nodeGlow)" className="animate-pulse" />
                    )}
                    {/* Circle Node */}
                    <circle
                      cx={field.cx}
                      cy={field.cy}
                      r={isActive ? "7" : "5"}
                      fill={isActive ? "#ec4899" : hasValue ? "#10b981" : "#94a3b8"}
                      stroke="#ffffff"
                      strokeWidth={isActive ? "2" : "1.5"}
                      className="hover:scale-125 transition-transform"
                    />
                    {/* Value Badge next to node */}
                    {hasValue && (
                      <g transform={`translate(${field.cx + 8}, ${field.cy + 4})`}>
                        <rect x="-2" y="-10" width="34" height="14" rx="4" fill="#0f172a" stroke="#10b981" strokeWidth="0.8" opacity="0.9" />
                        <text x="15" y="0" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold">
                          {val} cm
                        </text>
                      </g>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Selected Field Indicator Card */}
          {activeField && (
            <div className="w-full mt-4 p-3 rounded-xl bg-slate-800/90 border border-slate-700/80 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-start gap-2.5">
                <Info className="h-4 w-4 text-pink-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">{activeField.label}</div>
                  <div className="text-[11px] text-slate-400">{activeField.hint}</div>
                </div>
              </div>
              <div className="text-right pl-3">
                <div className="text-xs text-slate-400">Actual</div>
                <div className="text-sm font-bold text-emerald-400">
                  {measurements[activeField.id] ? `${measurements[activeField.id]} cm` : "--"}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Numerical Input Form Tabs/Grid */}
      <Card className="lg:col-span-7 border-slate-200 dark:border-slate-800 shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold tracking-tight">Registro de Medidas Anatómicas</CardTitle>
              <CardDescription>Edita directamente o selecciona puntos en la silueta ({MEASUREMENT_FIELDS.length} medidas corporales)</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMeasurements({})}
              className="text-xs gap-1 text-slate-500 hover:text-slate-900"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Limpiar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Groups */}
          {["Tórax y Cuello", "Tronco", "Brazos y Espalda", "Piernas"].map(group => {
            const groupFields = MEASUREMENT_FIELDS.filter(f => f.group === group)
            return (
              <div key={group} className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center justify-between">
                  <span>{group}</span>
                  <span className="text-[10px] font-normal text-slate-400">({groupFields.length} campos)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {groupFields.map(field => {
                    const isActive = activeId === field.id
                    return (
                      <div
                        key={field.id}
                        onClick={() => setActiveId(field.id)}
                        className={`p-2.5 rounded-xl border transition-all duration-200 ${
                          isActive
                            ? "bg-purple-50/60 dark:bg-purple-950/20 border-purple-400 dark:border-purple-600 shadow-sm"
                            : "bg-slate-50/50 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Label className="text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer">
                            {field.label}
                          </Label>
                          {isActive && (
                            <span className="h-2 w-2 rounded-full bg-pink-500 animate-ping" />
                          )}
                        </div>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.5"
                            placeholder="0.0"
                            value={measurements[field.id] ?? ""}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            onFocus={() => setActiveId(field.id)}
                            className="pr-9 h-9 text-sm font-semibold bg-white dark:bg-slate-950"
                          />
                          <span className="absolute right-3 top-2 text-xs font-bold text-slate-400 pointer-events-none">
                            cm
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Notes & Save Section */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Notas u Observaciones del Calce</Label>
              <Input
                placeholder="Ej. Postura encorvada ligera, prefiere ropa holgada en cadera..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {saveSuccess ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <Check className="h-4 w-4" /> Medidas guardadas exitosamente en el historial
                </div>
              ) : (
                <span className="text-xs text-slate-400">Las medidas se guardarán como una nueva entrada en el historial.</span>
              )}

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white shadow-md shadow-primary/20 gap-2 px-6"
              >
                {isSaving ? (
                  <>Guardando...</>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Guardar Ficha de Medidas
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
