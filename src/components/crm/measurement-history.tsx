"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { History, Calendar, ArrowRightLeft, TrendingUp, TrendingDown, Minus, Clock } from "lucide-react"

interface MeasurementHistoryItem {
  id: string
  recordedAt: Date | string
  notes?: string | null
  dataJson: string
}

interface MeasurementHistoryProps {
  history: MeasurementHistoryItem[]
}

const LABELS: Record<string, string> = {
  busto: "Contorno de Busto",
  bajoBusto: "Bajo Busto",
  cintura: "Contorno de Cintura",
  cadera: "Contorno de Cadera",
  altoBusto: "Altura de Busto",
  separacionBusto: "Separación Busto",
  talleDelantero: "Talle Delantero",
  talleEspalda: "Talle Espalda",
  anchoHombro: "Ancho Hombro",
  anchoEspalda: "Ancho Espalda",
  largoManga: "Largo Manga",
  contornoBrazo: "Contorno Brazo",
  contornoMuneca: "Contorno Muñeca",
  contornoCuello: "Contorno Cuello",
  alturaCadera: "Altura Cadera",
  tiro: "Tiro Total",
  contornoMuslo: "Contorno Muslo",
  entrepierna: "Largo Entrepierna",
  contornoTobillo: "Contorno Tobillo",
  largoTotal: "Largo Total",
  alturaRodilla: "Altura Rodilla"
}

export function MeasurementHistoryView({ history }: MeasurementHistoryProps) {
  const [selectedIdx1, setSelectedIdx1] = useState<number>(0)
  const [selectedIdx2, setSelectedIdx2] = useState<number>(history.length > 1 ? 1 : 0)

  if (!history || history.length === 0) {
    return (
      <Card className="border-dashed border-slate-300 dark:border-slate-800">
        <CardContent className="py-12 flex flex-col items-center justify-center text-center">
          <History className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">Sin historial registrado</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Los cambios de medidas corporales del cliente se registrarán automáticamente aquí cada vez que guardes una nueva ficha.
          </p>
        </CardContent>
      </Card>
    )
  }

  const parseData = (jsonStr: string): Record<string, number> => {
    try {
      return JSON.parse(jsonStr)
    } catch {
      return {}
    }
  }

  const rec1 = history[selectedIdx1]
  const rec2 = history[selectedIdx2]
  const data1 = rec1 ? parseData(rec1.dataJson) : {}
  const data2 = rec2 ? parseData(rec2.dataJson) : {}

  const allKeys = Array.from(new Set([...Object.keys(data1), ...Object.keys(data2)]))

  return (
    <div className="space-y-6">
      {/* Selector & Comparison Header */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-primary" />
                Comparador de Cambios Anatómicos
              </CardTitle>
              <CardDescription>Compara cómo han evolucionado las medidas entre dos fechas registradas</CardDescription>
            </div>

            {history.length > 1 && (
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-xs">
                  <span className="text-slate-400 block font-medium">Registro A:</span>
                  <select
                    value={selectedIdx1}
                    onChange={(e) => setSelectedIdx1(Number(e.target.value))}
                    className="text-xs font-semibold bg-white dark:bg-slate-850 border border-slate-300 dark:border-slate-700 rounded px-2 py-1"
                  >
                    {history.map((h, i) => (
                      <option key={h.id} value={i}>
                        {new Date(h.recordedAt).toISOString().split('T')[0]}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-slate-400 font-bold">vs</span>

                <div className="text-xs">
                  <span className="text-slate-400 block font-medium">Registro B:</span>
                  <select
                    value={selectedIdx2}
                    onChange={(e) => setSelectedIdx2(Number(e.target.value))}
                    className="text-xs font-semibold bg-white dark:bg-slate-850 border border-slate-300 dark:border-slate-700 rounded px-2 py-1"
                  >
                    {history.map((h, i) => (
                      <option key={h.id} value={i}>
                        {new Date(h.recordedAt).toISOString().split('T')[0]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-lg">Medida Corporal (Zona)</th>
                  <th className="p-3 text-center" suppressHydrationWarning>
                    {rec1 ? new Date(rec1.recordedAt).toISOString().split('T')[0] : "Reg 1"}
                  </th>
                  {history.length > 1 && (
                    <>
                      <th className="p-3 text-center" suppressHydrationWarning>
                        {rec2 ? new Date(rec2.recordedAt).toISOString().split('T')[0] : "Reg 2"}
                      </th>
                      <th className="p-3 text-right rounded-r-lg">Diferencia</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {allKeys.map((key) => {
                  const val1 = data1[key]
                  const val2 = data2[key]
                  const diff = val1 !== undefined && val2 !== undefined ? val1 - val2 : null
                  const labelName = LABELS[key] || key

                  return (
                    <tr key={key} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        {labelName}
                      </td>
                      <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">
                        {val1 !== undefined ? `${val1} cm` : "--"}
                      </td>
                      {history.length > 1 && (
                        <>
                          <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">
                            {val2 !== undefined ? `${val2} cm` : "--"}
                          </td>
                          <td className="p-3 text-right font-bold">
                            {diff === null ? (
                              <span className="text-slate-400">--</span>
                            ) : diff > 0 ? (
                              <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                                <TrendingUp className="h-3.5 w-3.5" /> +{diff.toFixed(1)} cm
                              </span>
                            ) : diff < 0 ? (
                              <span className="text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
                                <TrendingDown className="h-3.5 w-3.5" /> {diff.toFixed(1)} cm
                              </span>
                            ) : (
                              <span className="text-slate-400 inline-flex items-center gap-1">
                                <Minus className="h-3.5 w-3.5" /> Sin cambio
                              </span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Timeline list of all recordings */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            Línea de Tiempo de Tomas de Medida ({history.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-6 py-2">
            {history.map((item, idx) => {
              const data = parseData(item.dataJson)
              const count = Object.keys(data).length
              return (
                <div key={item.id} className="relative pl-6">
                  {/* Dot */}
                  <div className="absolute -left-[9px] top-0.5 h-4 w-4 rounded-full bg-primary border-4 border-white dark:border-slate-950 shadow-sm" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span suppressHydrationWarning className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                        {new Date(item.recordedAt).toLocaleDateString("es-AR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).replace(/\s/g, ' ')}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                        {count} medidas registradas
                      </span>
                    </div>
                    <span suppressHydrationWarning className="text-xs text-slate-400">
                      {new Date(item.recordedAt).toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit' }).replace(/\s/g, ' ')}
                    </span>
                  </div>

                  {item.notes && (
                    <p className="text-xs italic text-slate-500 dark:text-slate-400 mt-1">
                      "{item.notes}"
                    </p>
                  )}

                  {/* Highlights preview */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {data.busto && <span className="text-[11px] px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-medium">Busto: {data.busto}cm</span>}
                    {data.cintura && <span className="text-[11px] px-2 py-0.5 rounded bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 font-medium">Cintura: {data.cintura}cm</span>}
                    {data.cadera && <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium">Cadera: {data.cadera}cm</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
