"use client"

import { useState, useEffect } from "react"
import { Heart, Sparkles, X, Gift, Scissors, Star } from "lucide-react"

export function BirthdayLetterModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // 1. Verificar si es la primera vez que abre la aplicación
    const hasSeen = localStorage.getItem("sewstudio_birthday_letter_seen")
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        setIsAnimating(true)
      }, 700)
      return () => clearTimeout(timer)
    }

    // 2. Escuchar evento para reabrir la carta en cualquier momento desde el menú
    const handleReopen = () => {
      setIsOpen(true)
      setIsAnimating(true)
    }
    window.addEventListener("open-birthday-letter", handleReopen)
    return () => window.removeEventListener("open-birthday-letter", handleReopen)
  }, [])

  const handleClose = () => {
    localStorage.setItem("sewstudio_birthday_letter_seen", "true")
    setIsAnimating(false)
    setTimeout(() => setIsOpen(false), 250)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Fondo con desenfoque elegante */}
      <div 
        className={`fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Partículas flotantes decorativas (corazones y destellos) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
        <div className="absolute top-10 left-[15%] text-2xl animate-bounce duration-1000">💖</div>
        <div className="absolute top-24 right-[20%] text-xl animate-pulse">✨</div>
        <div className="absolute bottom-20 left-[10%] text-3xl animate-pulse">✂️</div>
        <div className="absolute bottom-16 right-[15%] text-2xl animate-bounce">🧵</div>
        <div className="absolute top-1/2 left-[5%] text-xl opacity-75">💕</div>
        <div className="absolute top-1/3 right-[8%] text-2xl opacity-75 animate-pulse">🌸</div>
      </div>

      {/* Contenedor de la Carta */}
      <div 
        className={`relative w-full max-w-2xl bg-gradient-to-b from-amber-50/95 via-rose-50/95 to-pink-50/95 dark:from-slate-900/95 dark:via-purple-950/90 dark:to-slate-900/95 border-2 border-amber-300/70 dark:border-pink-500/40 rounded-3xl shadow-2xl p-6 sm:p-10 z-20 transition-all duration-300 transform ${
          isAnimating ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        {/* Botón cerrar sutil */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
          title="Cerrar carta"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado con sello de regalo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 text-white shadow-lg shadow-pink-500/25 mb-4 animate-pulse">
            <Gift className="w-8 h-8" />
          </div>

          <div className="flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400 font-semibold tracking-wider uppercase text-xs">
            <Sparkles className="w-4 h-4" />
            <span>Un regalo hecho con todo el corazón</span>
            <Sparkles className="w-4 h-4" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white mt-1 bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            ¡Feliz Cumpleaños, Mi Amor! 🎂
          </h2>
        </div>

        {/* Pergamino interior con la carta */}
        <div className="relative bg-white/80 dark:bg-slate-900/80 rounded-2xl p-6 sm:p-8 border border-rose-200/60 dark:border-rose-900/40 shadow-inner">
          <div className="absolute -top-3 left-6 px-3 py-0.5 bg-rose-500 text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
            <Heart className="w-3 h-3 fill-current" /> De mí para vos
          </div>

          <p className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-200 font-medium italic text-center sm:text-left select-text">
            &ldquo;Feliz cumpleaños mi amor, este regalo es una herramienta que te va a ayudar con tus futuros proyectos y para que tengas todo en un lugar, y puedas organizarte mejor. segui tus sueños, tenes un gran talento, confio en vos, y que me vas a mantener, nunca te rinda. te amo mucho&rdquo;
          </p>

          <div className="mt-6 pt-4 border-t border-rose-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-rose-500 dark:text-rose-400 font-medium">
            <span className="flex items-center gap-1">
              <Scissors className="w-3.5 h-3.5" /> SewStudio creado para vos
            </span>
            <span className="flex items-center gap-1">
              Con todo mi amor <Heart className="w-3.5 h-3.5 fill-current text-rose-500" />
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:via-pink-600 hover:to-amber-600 shadow-lg shadow-pink-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-current text-white animate-pulse" />
            ¡Gracias mi amor! Comenzar a crear 🧵✨
          </button>
        </div>

        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-4">
          💌 Podés volver a abrir esta cartita cuando quieras desde el menú lateral en <strong>&ldquo;Carta Especial&rdquo;</strong>.
        </p>
      </div>
    </div>
  )
}
