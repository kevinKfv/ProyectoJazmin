"use client"

import { useState } from "react"
import { Sparkles, Scissors, Wand2, Layers, Cpu } from "lucide-react"
import { FigurineGenerator } from "@/components/diseno-ia/figurine-generator"
import { PatternAnalyzer } from "@/components/diseno-ia/pattern-analyzer"

export default function DisenoIAPage() {
  const [activeTab, setActiveTab] = useState<"figurines" | "analizador">("figurines")

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Encabezado principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary dark:bg-primary/20 border border-primary/20">
              <Cpu className="h-3.5 w-3.5" /> SewStudio AI Engine v2.0
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Inteligencia Artificial para Diseño & Producción
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Genera figurines de moda ilustrados por descripción e identifica piezas de patrón y telas a partir de fotografías de prendas.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto shadow-inner">
          <button
            onClick={() => setActiveTab("figurines")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "figurines"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-md shadow-slate-200/50 dark:shadow-none"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            <Sparkles className="h-4 w-4 text-primary" /> Generador de Figurines
          </button>

          <button
            onClick={() => setActiveTab("analizador")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "analizador"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-md shadow-slate-200/50 dark:shadow-none"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            <Scissors className="h-4 w-4 text-secondary" /> Analizador de Fotos & Moldes
          </button>
        </div>
      </div>

      {/* Renderizado de Tab Activo */}
      {activeTab === "figurines" && <FigurineGenerator />}
      {activeTab === "analizador" && <PatternAnalyzer />}
    </div>
  )
}
