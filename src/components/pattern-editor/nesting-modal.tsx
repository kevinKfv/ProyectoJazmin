"use client"

import React, { useState } from "react"
import { usePatternEditorStore } from "@/store/pattern-editor-store"
import { calculateNesting, NestingResult } from "@/lib/pattern-utils/nesting-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Layers, Scissors, Sparkles, AlertCircle, CheckCircle2, RefreshCw, X, Percent, Ruler } from "lucide-react"

interface NestingModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function NestingModal({ isOpen, onClose }: NestingModalProps) {
  const { shapes, fabricWidthCm, setFabricWidthCm } = usePatternEditorStore()
  const [customWidth, setCustomWidth] = useState(fabricWidthCm)

  if (!isOpen) return null

  const nesting: NestingResult = calculateNesting(shapes, customWidth)

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Optimización de Corte / Anidamiento (Nesting)</h2>
              <p className="text-xs text-slate-500">Acomodamiento automático sobre el rollo de tela para reducir mermas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Controls & Fabric Width */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <Label className="text-xs font-semibold">Ancho del Rollo de Tela</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  value={customWidth}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 140
                    setCustomWidth(val)
                    setFabricWidthCm(val)
                  }}
                  className="h-9 text-sm font-bold bg-white dark:bg-slate-950"
                />
                <span className="text-xs font-bold text-slate-400">cm</span>
              </div>
            </div>

            <div className="flex items-end gap-1.5">
              <Button
                variant={customWidth === 140 ? "default" : "outline"}
                size="sm"
                onClick={() => { setCustomWidth(140); setFabricWidthCm(140); }}
                className="text-xs"
              >
                1.40m (Estándar)
              </Button>
              <Button
                variant={customWidth === 150 ? "default" : "outline"}
                size="sm"
                onClick={() => { setCustomWidth(150); setFabricWidthCm(150); }}
                className="text-xs"
              >
                1.50m (Ancho)
              </Button>
            </div>

            <div className="text-right flex flex-col justify-center">
              <span className="text-xs text-slate-400 font-medium">Piezas a acomodar</span>
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{shapes.length} piezas del patrón</span>
            </div>
          </div>

          {/* Metric Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-purple-50/60 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Metros a Comprar</span>
                <h3 className="text-2xl font-black text-purple-900 dark:text-purple-100 mt-1">
                  {nesting.fabricLengthMeters} m
                </h3>
                <span className="text-[11px] text-purple-600 dark:text-purple-400">({nesting.fabricLengthCm} cm lineales)</span>
              </CardContent>
            </Card>

            <Card className="bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Eficiencia de Corte</span>
                <h3 className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-1">
                  {nesting.efficiencyPercentage}%
                </h3>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Aprovechamiento de tela</span>
              </CardContent>
            </Card>

            <Card className="bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Desperdicio / Merma</span>
                <h3 className="text-2xl font-black text-amber-900 dark:text-amber-100 mt-1">
                  {nesting.wastePercentage}%
                </h3>
                <span className="text-[11px] text-amber-600 dark:text-amber-400">Sobrantes de retazo</span>
              </CardContent>
            </Card>

            <Card className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Área Utilizada</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {(nesting.usedAreaSqCm / 10000).toFixed(2)} m²
                </h3>
                <span className="text-[11px] text-slate-400">Superficie útil</span>
              </CardContent>
            </Card>
          </div>

          {/* Cutting Plan 2D Canvas Visualizer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Ruler className="h-4 w-4 text-purple-600" /> Plano de Tendido de Corte sobre Rollo ({customWidth} cm de ancho)
              </Label>
              <span className="text-xs text-slate-400">Líneas punteadas = Ancho de tela</span>
            </div>

            <div className="w-full h-64 bg-slate-900 rounded-xl border border-slate-800 overflow-auto p-4 flex items-center justify-center relative shadow-inner">
              {/* Fabric roll background */}
              <div
                style={{
                  width: `${customWidth * 3}px`,
                  minHeight: `${Math.max(200, nesting.fabricLengthCm * 3)}px`
                }}
                className="bg-slate-800/80 border-2 border-dashed border-purple-500/50 rounded-lg relative p-2 transition-all"
              >
                {/* Fabric ruler header */}
                <div className="absolute top-1 left-2 text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                  ANCHO TELA: {customWidth} cm
                </div>

                <svg className="w-full h-full min-h-[200px]">
                  {nesting.nestedPieces.map((piece, idx) => {
                    const pathData = piece.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x * 3} ${p.y * 3}`).join(' ') + ' Z'
                    return (
                      <g key={idx}>
                        <path
                          d={pathData}
                          fill="rgba(168, 85, 247, 0.25)"
                          stroke="#c084fc"
                          strokeWidth="2"
                        />
                        <text
                          x={piece.x * 3 + 10}
                          y={piece.y * 3 + 20}
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="bold"
                        >
                          {piece.originalShape.name}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-slate-50 dark:bg-slate-850 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} className="text-xs">
            Cerrar
          </Button>
          <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-white text-xs gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Aplicar Configuración de Tela
          </Button>
        </div>
      </div>
    </div>
  )
}
