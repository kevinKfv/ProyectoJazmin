"use client"

import { Heart, Lightbulb } from "lucide-react"

export function DashboardQuickActions() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => window.dispatchEvent(new CustomEvent("open-birthday-letter"))}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
        title="Volver a leer la carta de cumpleaños"
      >
        <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
        <span>Carta Especial 💌</span>
      </button>

      <button
        onClick={() => window.dispatchEvent(new CustomEvent("open-suggestion-modal"))}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-200 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-950/50 dark:to-orange-950/50 border border-amber-300/80 dark:border-amber-700/60 hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        title="Enviar una idea o función para la próxima actualización"
      >
        <Lightbulb className="w-3.5 h-3.5 text-amber-600 fill-amber-500/20" />
        <span>Sugerir Mejora / Idea 💡</span>
      </button>
    </div>
  )
}
