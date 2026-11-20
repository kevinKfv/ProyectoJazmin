"use client"

import { useState, useEffect } from "react"
import { Smartphone, Download, X, CheckCircle2, Scissors } from "lucide-react"

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("[SewStudio PWA] Service Worker registrado en scope:", reg.scope))
          .catch((err) => console.warn("[SewStudio PWA] Error al registrar Service Worker:", err))
      })
    }

    // Capture beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)

    // Check if running as standalone
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log("[SewStudio PWA] Install prompt outcome:", outcome)
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  if (!showPrompt || isInstalled) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-primary/30 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shrink-0 shadow-md">
          <Scissors className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-100">Instalar SewStudio App</h4>
          <p className="text-[11px] text-slate-400">Usar en celular/tablet con modo taller offline</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-all flex items-center gap-1 shadow-sm"
        >
          <Download className="h-3.5 w-3.5" /> Instalar
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
