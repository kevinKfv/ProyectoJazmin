"use client"

import React from "react"
import { usePatternEditorStore } from "@/store/pattern-editor-store"
import { SIZES, SIZE_COLORS, Size } from "@/lib/pattern-utils/grading-utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Layers, Eye, EyeOff, Sparkles, Sliders } from "lucide-react"

export default function GradingPanel() {
  const { currentSize, setCurrentSize, showGradingNest, setShowGradingNest } = usePatternEditorStore()

  return (
    <div className="p-4 border-b bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-purple-600" /> Escalado de Tallas (Grading)
        </h3>
        <Button
          variant={showGradingNest ? "default" : "outline"}
          size="sm"
          onClick={() => setShowGradingNest(!showGradingNest)}
          className={`h-7 text-[11px] gap-1 px-2.5 font-semibold ${
            showGradingNest ? "bg-purple-600 hover:bg-purple-700 text-white shadow-sm" : ""
          }`}
          title="Ver o ocultar superposición de todas las tallas"
        >
          {showGradingNest ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          {showGradingNest ? "Nido Activo" : "Ver Nido"}
        </Button>
      </div>

      {/* Selector de Talla Activa */}
      <div className="space-y-1.5">
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          Talla Activa de Trabajo:
        </span>
        <div className="grid grid-cols-6 gap-1">
          {SIZES.map((sz) => {
            const isSelected = currentSize === sz
            const color = SIZE_COLORS[sz]
            return (
              <button
                key={sz}
                onClick={() => setCurrentSize(sz)}
                style={{ borderColor: isSelected ? color : "transparent" }}
                className={`h-8 text-xs font-bold rounded-lg border-2 transition-all flex items-center justify-center ${
                  isSelected
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md scale-105"
                    : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: color }} />
                {sz}
              </button>
            )
          })}
        </div>
      </div>

      {showGradingNest && (
        <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 text-[11px] text-purple-900 dark:text-purple-300">
          <p className="font-semibold flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-purple-600" /> Nido Multitalla Visible
          </p>
          <p className="text-[10px] text-purple-700 dark:text-purple-400 mt-0.5">
            Las tallas XS a XXL se visualizan superpuestas en trazos de colores para verificar graduación.
          </p>
        </div>
      )}
    </div>
  )
}
