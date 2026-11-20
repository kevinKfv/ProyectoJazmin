"use client"

import { useState } from "react"
import { 
  Sparkles, 
  Wand2, 
  Download, 
  Scissors, 
  FolderPlus, 
  Palette, 
  RefreshCw, 
  Check, 
  Layers, 
  FileText,
  Eye,
  ZoomIn,
  ZoomOut,
  Info
} from "lucide-react"
import { saveFigurineAsPattern, createProjectFromAIAnalysis } from "@/app/actions/diseno-ia"

const PRESET_PROMPTS = [
  "Vestido de fiesta midi en satén verde con escote drapeado cowl y falda fluida",
  "Chaqueta sastre estructurada cruzada con solapa de muesca y pantalón palazo",
  "Mono de noche elegante en terciopelo azul noche con escote asimétrico",
  "Vestido corte princesa en encaje rosa pálido con falda de tul multicapa",
  "Corset drapeado en tafetán dorado con falda sirena entallada"
]

const STYLES = [
  { id: "watercolour", label: "Acuarela de Moda", desc: "Estilo artístico ilustrado con pinceladas de color y elegancia" },
  { id: "vector", label: "Figurín Técnico Vectorial", desc: "Líneas pulidas estilo plano de taller con detalles de costura" },
  { id: "pencil", label: "Boceto Lápiz Digital", desc: "Trazos artísticos a mano alzada tipo croquis de pasarela" },
  { id: "photorealistic", label: "Render Realista 3D", desc: "Previsualización fotorrealista con textura e iluminación de tela" }
]

const COLOR_PALETTES = [
  { id: "emerald", name: "Esmeralda & Oro", primary: "#10b981", accent: "#f59e0b" },
  { id: "sapphire", name: "Azul Zafiro", primary: "#2563eb", accent: "#93c5fd" },
  { id: "ruby", name: "Rojo Rubí", primary: "#dc2626", accent: "#fca5a5" },
  { id: "champagne", name: "Champán & Marfil", primary: "#d97706", accent: "#fef3c7" },
  { id: "black", name: "Negro Azabache", primary: "#18181b", accent: "#a1a1aa" },
  { id: "blush", name: "Rosa Palo", primary: "#ec4899", accent: "#fbcfe8" }
]

export function FigurineGenerator() {
  const [prompt, setPrompt] = useState("Vestido de fiesta midi en satén verde con escote drapeado")
  const [selectedStyle, setSelectedStyle] = useState("watercolour")
  const [selectedPalette, setSelectedPalette] = useState("emerald")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [savingPattern, setSavingPattern] = useState(false)
  const [creatingProject, setCreatingProject] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [zoomLevel, setZoomLevel] = useState(1)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setSuccessMsg("")

    try {
      const palette = COLOR_PALETTES.find(p => p.id === selectedPalette)
      const res = await fetch("/api/ai/diseno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-figurine",
          prompt,
          style: STYLES.find(s => s.id === selectedStyle)?.label,
          colorScheme: palette?.name
        })
      })

      const data = await res.json()
      if (data.success) {
        setResult(data)
      } else {
        alert(data.error || "No se pudo generar el figurín")
      }
    } catch (err) {
      console.error(err)
      alert("Ocurrió un error al conectarse con SewStudio AI Engine.")
    } finally {
      setLoading(false)
    }
  }

  const handleSavePattern = async () => {
    if (!result) return
    setSavingPattern(true)
    try {
      const formData = new FormData()
      formData.append("name", result.design?.title || prompt.slice(0, 30))
      formData.append("category", result.design?.category || "Boceto IA")
      formData.append("description", `Generado por IA. Silueta: ${result.design?.silhouette}. Tela recomendada: ${result.design?.fabricName}.`)
      formData.append("imageUrl", result.imageUrl || "")
      formData.append("dataJson", JSON.stringify(result.design))

      const res = await saveFigurineAsPattern(formData)
      if (res.success) {
        setSuccessMsg("¡Patrón guardado con éxito en tu catálogo de Patrones!")
      }
    } catch (err: any) {
      alert("Error al guardar patrón: " + err.message)
    } finally {
      setSavingPattern(false)
    }
  }

  const handleCreateProject = async () => {
    if (!result) return
    setCreatingProject(true)
    try {
      const formData = new FormData()
      formData.append("name", `Proyecto: ${result.design?.title || prompt.slice(0, 30)}`)
      formData.append("category", result.design?.category || "Alta Costura")
      formData.append("description", `Silueta: ${result.design?.silhouette}. Escote: ${result.design?.neckline}. Tela sugerida: ${result.design?.fabricName}. Notas: ${result.design?.technicalNotes}`)

      const res = await createProjectFromAIAnalysis(formData)
      if (res.success) {
        setSuccessMsg("¡Proyecto creado exitosamente en tu tablero de Proyectos!")
      }
    } catch (err: any) {
      alert("Error al crear proyecto: " + err.message)
    } finally {
      setCreatingProject(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Encabezado descriptivo */}
      <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-secondary/10 p-6 border border-primary/20 backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Generador de Figurines & Bocetos por IA
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Transforma tus ideas en figurines de moda estilizados al instante. Describe la silueta, largo, escote y tipo de tela para obtener la ilustración y ficha técnica inicial.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Panel Izquierdo: Controles e Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Descripción de la Prenda
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Ej: Vestido de fiesta midi en satén verde con escote drapeado..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-slate-100 transition-all resize-none"
              />
            </div>

            {/* Presets Rápidos */}
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Sugerencias de Diseño
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(p)}
                    className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg transition-all text-left truncate max-w-full"
                  >
                    ✨ {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Estilo de Ilustración */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Estilo de Ilustración
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStyle(st.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedStyle === st.id
                        ? "border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary/30"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="text-xs font-bold">{st.label}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{st.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Paleta de Colores */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Paleta Cromática Sugerida
              </label>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_PALETTES.map((cp) => (
                  <button
                    key={cp.id}
                    type="button"
                    onClick={() => setSelectedPalette(cp.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                      selectedPalette === cp.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex -space-x-1">
                      <span className="h-4 w-4 rounded-full border border-white dark:border-slate-900 shadow-xs" style={{ backgroundColor: cp.primary }} />
                      <span className="h-4 w-4 rounded-full border border-white dark:border-slate-900 shadow-xs" style={{ backgroundColor: cp.accent }} />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{cp.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Botón de Generar */}
            <button
              type="button"
              disabled={loading || !prompt.trim()}
              onClick={handleGenerate}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-primary via-purple-600 to-secondary text-white font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Diseñando Figurín e Ilustración...
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5" />
                  Generar Figurín de Moda
                </>
              )}
            </button>
          </div>
        </div>

        {/* Panel Derecho: Previsualización & Ficha Técnica */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm min-h-[520px] flex flex-col justify-between">
            {result ? (
              <div className="space-y-6">
                {/* Header del resultado */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-1">
                      {result.design?.category || "Diseño de Moda"}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {result.design?.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2))}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      title="Acercar"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      title="Alejar"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Grid Imagen + Ficha */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Visor de Figurín */}
                  <div className="md:col-span-6 flex flex-col items-center justify-center bg-slate-950 rounded-xl p-4 border border-slate-800 overflow-hidden relative group min-h-[380px]">
                    <div 
                      className="transition-transform duration-300 ease-out flex justify-center items-center"
                      style={{ transform: `scale(${zoomLevel})` }}
                    >
                      <img
                        src={result.imageUrl}
                        alt={result.design?.title}
                        className="max-h-[360px] object-contain rounded-lg shadow-2xl"
                        onError={(e) => {
                          // Fallback si la imagen externa tarda en cargar
                          (e.target as HTMLElement).style.display = 'none'
                        }}
                      />
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/50 flex justify-between items-center text-xs text-slate-300">
                      <span>Estilo: {selectedStyle}</span>
                      <a
                        href={result.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary font-medium hover:underline flex items-center gap-1"
                      >
                        <Download className="h-3.5 w-3.5" /> HD
                      </a>
                    </div>
                  </div>

                  {/* Detalle Técnico */}
                  <div className="md:col-span-6 space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-primary" /> Ficha Técnica de Diseño
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Silueta</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{result.design?.silhouette}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Escote</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{result.design?.neckline}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Cintura</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{result.design?.waistline}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Largo</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{result.design?.hemline}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                          🧵 Tela Sugerida
                        </span>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                          {result.design?.fabricName}
                        </div>
                      </div>

                      {result.design?.details && (
                        <div>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                            ✨ Detalles Destacados
                          </span>
                          <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                            {result.design.details.map((d: string, i: number) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {result.design?.technicalNotes && (
                      <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                        <Info className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                          <span className="font-semibold">Recomendación de Taller: </span>
                          {result.design.technicalNotes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mensaje de confirmación */}
                {successMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <Check className="h-4 w-4" /> {successMsg}
                  </div>
                )}

                {/* Botones de Acción */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3">
                  <button
                    onClick={handleSavePattern}
                    disabled={savingPattern}
                    className="flex-1 h-11 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs hover:bg-slate-800 dark:hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Scissors className="h-4 w-4" />
                    {savingPattern ? "Guardando..." : "Guardar como Patrón"}
                  </button>

                  <button
                    onClick={handleCreateProject}
                    disabled={creatingProject}
                    className="flex-1 h-11 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <FolderPlus className="h-4 w-4" />
                    {creatingProject ? "Creando..." : "Crear Proyecto de Confección"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl my-auto">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Palette className="h-8 w-8" />
                </div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Sin Figurín Generado
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Escribe la descripción de tu prenda a la izquierda y presiona <strong>Generar Figurín de Moda</strong> para visualizar la ilustración y ficha técnica.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
