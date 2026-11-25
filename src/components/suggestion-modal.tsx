"use client"

import { useState, useEffect, useTransition } from "react"
import { 
  Lightbulb, 
  X, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ListOrdered, 
  PlusCircle, 
  AlertCircle,
  Tag
} from "lucide-react"
import { guardarSugerencia, obtenerSugerencias } from "@/app/actions/sugerencias"

const CATEGORIES = [
  { id: "Patronaje & Moldes", label: "📐 Patronaje & Moldes" },
  { id: "Inventario & Telas", label: "🧵 Inventario & Telas" },
  { id: "Diseño & IA", label: "🎨 Diseño & IA" },
  { id: "Presupuestos & Clientes", label: "💼 Clientes & Precios" },
  { id: "General", label: "💡 Idea General" },
]

const PRIORITIES = [
  { id: "Urgente", label: "🔥 Me re serviría ya", color: "text-red-500 border-red-200 bg-red-50 dark:bg-red-950/30" },
  { id: "Media", label: "💡 Estaría genial", color: "text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-950/30" },
  { id: "Deseo", label: "✨ Lindo para después", color: "text-purple-500 border-purple-200 bg-purple-50 dark:bg-purple-950/30" },
]

export function SuggestionModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"nueva" | "historial">("nueva")
  
  // Form fields
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Patronaje & Moldes")
  const [priority, setPriority] = useState("Media")

  // Status & Feedback
  const [isPending, startTransition] = useTransition()
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [suggestionsList, setSuggestionsList] = useState<any[]>([])

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true)
      cargarHistorial()
    }
    window.addEventListener("open-suggestion-modal", handleOpen)
    return () => window.removeEventListener("open-suggestion-modal", handleOpen)
  }, [])

  const cargarHistorial = async () => {
    try {
      const res = await obtenerSugerencias()
      if (res.success) {
        setSuggestionsList(res.suggestions)
      }
    } catch {
      // Ignorar si la DB aún no responde
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      setErrorMessage("Por favor completá el título y la descripción de tu sugerencia.")
      return
    }

    setErrorMessage("")
    setSuccessMessage("")

    startTransition(async () => {
      try {
        const res = await guardarSugerencia({
          title,
          description,
          category,
          priority,
        })

        if (res.success) {
          setSuccessMessage("¡Sugerencia guardada con éxito! Ya quedó registrada para programarla en la próxima actualización. ❤️")
          setTitle("")
          setDescription("")
          cargarHistorial()
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Ocurrió un error al guardar la sugerencia.")
      }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 z-20 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl text-white shadow-md shadow-orange-500/20">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                Buzón de Sugerencias & Mejoras
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Anotá cualquier idea o función que te gustaría tener en la próxima actualización.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 my-4 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
          <button
            onClick={() => setActiveTab("nueva")}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === "nueva" 
                ? "bg-white dark:bg-slate-900 text-primary shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Nueva Sugerencia
          </button>
          <button
            onClick={() => {
              setActiveTab("historial")
              cargarHistorial()
            }}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === "historial" 
                ? "bg-white dark:bg-slate-900 text-primary shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            Ideas Registradas ({suggestionsList.length})
          </button>
        </div>

        {/* Tab 1: Formulario Nueva Sugerencia */}
        {activeTab === "nueva" && (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
            {successMessage && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-3 text-emerald-800 dark:text-emerald-200 text-sm animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{successMessage}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    También podés verla en la pestaña &ldquo;Ideas Registradas&rdquo;.
                  </p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-red-700 dark:text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Título de la idea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                ¿Qué te gustaría agregar o mejorar? *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Poder imprimir patrones en hojas A4, o agregar cálculo de metros de tela..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Área del sistema
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      category === cat.id
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Prioridad */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                ¿Qué tan necesaria te resulta?
              </label>
              <div className="flex flex-wrap gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPriority(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      priority === p.id
                        ? `${p.color} ring-2 ring-primary/20 shadow-sm font-bold`
                        : "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Descripción detallada */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Contame cómo te gustaría que funcione *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explicá con tus palabras qué te gustaría que haga la función, qué botones debería tener, o qué problema te resolvería al confeccionar..."
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                required
              />
            </div>

            {/* Botón de Enviar */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 shadow-lg shadow-orange-500/20 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando sugerencia...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Guardar para la próxima actualización 🚀
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Historial de Sugerencias */}
        {activeTab === "historial" && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {suggestionsList.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-3">
                  <Lightbulb className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-base mb-1">
                  Aún no hay sugerencias anotadas
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                  Cualquier detalle que sientas que le falta al sistema, escribilo en la pestaña anterior para que lo trabajemos.
                </p>
                <button
                  onClick={() => setActiveTab("nueva")}
                  className="px-4 py-2 text-xs font-semibold bg-primary text-white rounded-xl shadow-sm hover:bg-primary/90 transition-all"
                >
                  Anotar primera sugerencia ✨
                </button>
              </div>
            ) : (
              suggestionsList.map((item) => {
                const isPendingState = item.status === "Pendiente"
                const isDoneState = item.status === "Implementado"

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:shadow-sm transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        {item.title}
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        isDoneState 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : isPendingState
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
                        <Tag className="w-3 h-3" />
                        {item.category}
                      </span>
                      <span>•</span>
                      <span>Prioridad: <strong>{item.priority}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString("es-AR")}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
