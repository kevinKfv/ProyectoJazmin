"use client"

import { useState } from "react"
import { 
  Upload, 
  Camera, 
  Sparkles, 
  RefreshCw, 
  Image as ImageIcon, 
  X, 
  Scissors, 
  Check, 
  FileSearch,
  Zap
} from "lucide-react"
import { PatternBreakdownView } from "./pattern-breakdown-view"

const SAMPLE_GARMENTS = [
  {
    name: "Vestido Satén Verde (Corte Princesa & Drapeado)",
    notes: "Vestido midi de fiesta en satén verde con corte princesa en el busto y escote drapeado cowl.",
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Chaqueta Sastre Cruzada",
    notes: "Chaqueta sastre estructurada con solapas de muesca, bolsillos ojal y entalle en cintura.",
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Vestido Noche Corte Sirena",
    notes: "Vestido de noche sin mangas en crepe, ajuste ceñido hasta la rodilla con falda acampanada sirena.",
    imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80"
  }
]

export function PatternAnalyzer() {
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    const reader = new FileReader()
    reader.onloadend = () => {
      setImageBase64(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSelectSample = (sample: typeof SAMPLE_GARMENTS[0]) => {
    setPreviewUrl(sample.imageUrl)
    setImageBase64(sample.imageUrl)
    setNotes(sample.notes)
  }

  const handleClearImage = () => {
    setPreviewUrl(null)
    setImageBase64(null)
    setAnalysisResult(null)
  }

  const handleAnalyze = async () => {
    if (!imageBase64 && !notes.trim()) return
    setLoading(true)

    try {
      const res = await fetch("/api/ai/diseno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze-pattern",
          imageBase64: imageBase64,
          notes: notes
        })
      })

      const data = await res.json()
      if (data.success) {
        setAnalysisResult(data.analysis)
      } else {
        alert(data.error || "No se pudo realizar el análisis")
      }
    } catch (err) {
      console.error(err)
      alert("Error al comunicarse con la IA de SewStudio.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Banner Encabezado */}
      <div className="rounded-2xl bg-gradient-to-r from-secondary/10 via-indigo-500/10 to-primary/10 p-6 border border-secondary/20 backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white shadow-lg shadow-secondary/20 shrink-0">
            <FileSearch className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Analizador de Fotos para Desglose de Moldes
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Sube la fotografía de una prenda. La IA identificará el tipo de corte (princesa, imperio, acampanado, etc.), sugerirá las piezas de patrón necesarias y recomendará las mejores telas por estructura y caída.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Subida & Parámetros */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            {/* Zona de Drop Zone / Preview */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Fotografía de la Prenda
              </label>

              {previewUrl ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-primary/30 bg-slate-950 p-2 group">
                  <img
                    src={previewUrl}
                    alt="Prenda a analizar"
                    className="w-full h-56 object-contain rounded-lg"
                  />
                  <button
                    onClick={handleClearImage}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition-all"
                    title="Quitar foto"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-3 left-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs text-slate-200 truncate">
                    Prenda lista para análisis de moldería
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-56 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900/80 cursor-pointer transition-all p-4 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <Upload className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Haz clic para subir o arrastra la foto de la prenda
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Formatos JPG, PNG, WEBP (Máx. 10MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Ejemplos de prueba rápida */}
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                O prueba con estos modelos de ejemplo
              </span>
              <div className="space-y-2">
                {SAMPLE_GARMENTS.map((samp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(samp)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
                  >
                    <img
                      src={samp.imageUrl}
                      alt={samp.name}
                      className="h-10 w-10 object-cover rounded-lg shrink-0"
                    />
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors truncate">
                        {samp.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {samp.notes}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notas opcionales */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Detalles / Observaciones Adicionales (Opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Ej: Tiene cierre posterior invisible, drapeado en escote, abertura en pierna..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-slate-100 transition-all resize-none"
              />
            </div>

            {/* Botón Analizar */}
            <button
              type="button"
              disabled={loading || (!imageBase64 && !notes.trim())}
              onClick={handleAnalyze}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-secondary via-indigo-600 to-primary text-white font-semibold text-sm shadow-lg shadow-secondary/25 hover:shadow-secondary/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Analizando Corte, Piezas & Telas...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Analizar Desglose de Moldes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Resultados del Desglose */}
        <div className="lg:col-span-7 space-y-6">
          {analysisResult ? (
            <PatternBreakdownView
              analysis={analysisResult}
              uploadedImage={previewUrl}
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm min-h-[520px] flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-4">
                <Scissors className="h-8 w-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Esperando Foto de Prenda
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Sube una imagen o selecciona un ejemplo de prueba y presiona <strong>Analizar Desglose de Moldes</strong> para obtener el desglose de silueta, piezas e insumos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
