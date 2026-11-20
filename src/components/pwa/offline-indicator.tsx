"use client"

import { useState, useEffect } from "react"
import { WifiOff, Wifi } from "lucide-react"

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false)
  const [showRestored, setShowRestored] = useState(false)

  useEffect(() => {
    const handleOffline = () => setIsOffline(true)
    const handleOnline = () => {
      setIsOffline(false)
      setShowRestored(true)
      setTimeout(() => setShowRestored(false), 4000)
    }

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine)
      window.addEventListener("offline", handleOffline)
      window.addEventListener("online", handleOnline)
    }

    return () => {
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("online", handleOnline)
    }
  }, [])

  if (showRestored) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-400 flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-5">
        <Wifi className="h-4 w-4 animate-bounce" />
        ¡Conexión del Taller Restablecida!
      </div>
    )
  }

  if (!isOffline) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-amber-500 dark:bg-amber-600 text-slate-950 dark:text-white px-4 py-2.5 rounded-2xl shadow-xl border border-amber-300 dark:border-amber-500 flex items-center gap-2 text-xs font-extrabold animate-pulse">
      <WifiOff className="h-4 w-4" />
      <span>Modo Taller Offline (Sin Conexión)</span>
    </div>
  )
}
