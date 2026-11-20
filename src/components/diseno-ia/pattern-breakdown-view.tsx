"use client"

import { useState } from "react"
import { 
  Scissors, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  FolderPlus, 
  FileText, 
  AlertCircle,
  HelpCircle,
  Maximize2,
  Minimize2,
  ChevronRight,
  Info
} from "lucide-react"
import { saveFigurineAsPattern, createProjectFromAIAnalysis } from "@/app/actions/diseno-ia"

interface PatternPiece {
  id: string
  name: string
  quantity: number
  cutDirection: string
  seamAllowance: string
  description: string
  category: string
}

interface FabricRecommendation {
  fabricName: string
  weightGsm: string
  drapeRating: number
  stiffnessRating: number
  stretchRating: number
  isPrimary: boolean
  reason: string
  needleType: string
  threadType: string
}

interface PatternAnalysisData {
  cutType: string
  cutDescription: string
  difficulty: string
  estimatedFabricMeters: string
  patternPieces: PatternPiece[]
  fabricRecommendations: FabricRecommendation[]
  constructionSteps?: string[]
  suppliesNeeded?: string[]
}

interface PatternBreakdownViewProps {
  analysis: PatternAnalysisData
  uploadedImage: string | null
}

export function PatternBreakdownView({ analysis, uploadedImage }: PatternBreakdownViewProps) {
  const [activeTab, setActiveTab] = useState<"corte" | "piezas" | "telas" | "pasos">("corte")
  const [savingPattern, setSavingPattern] = useState(false)
  const [creatingProject, setCreatingProject] = useState(false)
  const [statusMsg, setStatusMsg] = useState("")

  const handleSavePattern = async () => {
    setSavingPattern(true)
    setStatusMsg("")
    try {
      const formData = new FormData()
      formData.append("name", `Patrón: ${analysis.cutType}`)
      formData.append("category", "Desglose Foto IA")
      formData.append("description", `Analizado por IA. Corte: ${analysis.cutType}. Piezas: ${analysis.patternPieces.length}. Tela recomendada: ${analysis.fabricRecommendations[0]?.fabricName || ''}`)
      formData.append("imageUrl", uploadedImage || "")
      formData.append("dataJson", JSON.stringify(analysis))

      const res = await saveFigurineAsPattern(formData)
      if (res.success) {
        setStatusMsg("¡Patrón y desglose guardados exitosamente en Patrones!")
      }
    } catch (err: any) {
      alert("Error al guardar patrón: " + err.message)
    } finally {
      setSavingPattern(false)
    }
  }

  const handleCreateProject = async () => {
    setCreatingProject(true)
    setStatusMsg("")
    try {
      const formData = new FormData()
      formData.append("name", `Proyecto: Prenda ${analysis.cutType}`)
      formData.append("category", "Confección")
      formData.append("description", `Silueta: ${analysis.cutType}. Complejidad: ${analysis.difficulty}. Consumo de tela: ${analysis.estimatedFabricMeters}.`)

      const res = await createProjectFromAIAnalysis(formData)
      if (res.success) {
        setStatusMsg("¡Proyecto creado en tu tablero de Proyectos con la estructura inicial!")
      }
    } catch (err: any) {
      alert("Error al crear proyecto: " + err.message)
    } finally {
      setCreatingProject(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Resumen Superior en Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-900/50 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-white uppercase tracking-wider">
                Corte Detectado
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200">
                Complejidad: {analysis.difficulty}
              </span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-white">
              {analysis.cutType}
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {analysis.cutDescription}
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-xl shrink-0 min-w-[200px] space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Consumo de Tela</span>
            <div className="text-lg font-extrabold text-emerald-400">{analysis.estimatedFabricMeters}</div>
            <span className="text-[11px] text-slate-400 block">Total piezas: {analysis.patternPieces.length} moldes</span>
          </div>
        </div>

        {statusMsg && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> {statusMsg}
          </div>
        )}
      </div>

      {/* Navegación por Pestañas Secundarias */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("corte")}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
            activeTab === "corte"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          <Scissors className="h-4 w-4" /> Tipo de Corte & Foto
        </button>

        <button
          onClick={() => setActiveTab("piezas")}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
            activeTab === "piezas"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          <Layers className="h-4 w-4" /> Desglose de Piezas ({analysis.patternPieces.length})
        </button>

        <button
          onClick={() => setActiveTab("telas")}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
            activeTab === "telas"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          <Sparkles className="h-4 w-4" /> Telas Recomendadas
        </button>

        {analysis.constructionSteps && (
          <button
            onClick={() => setActiveTab("pasos")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "pasos"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            <FileText className="h-4 w-4" /> Guía de Confección & Avíos
          </button>
        )}
      </div>

      {/* Contenido según pestaña */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        {activeTab === "corte" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {uploadedImage && (
              <div className="md:col-span-5 bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-center items-center">
                <img
                  src={uploadedImage}
                  alt="Prenda analizada"
                  className="max-h-[320px] object-contain rounded-lg shadow-lg"
                />
              </div>
            )}

            <div className={`space-y-4 ${uploadedImage ? 'md:col-span-7' : 'md:col-span-12'}`}>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" /> Estructura y Silueta de Patronaje
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                {analysis.cutDescription}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Silueta / Tipo de Corte</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{analysis.cutType}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Complejidad de Patronaje</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{analysis.difficulty}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "piezas" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Piezas de Patrón Requeridas
                </h4>
                <p className="text-xs text-slate-500">
                  Listado de piezas de moldería necesarias para cortar la prenda con sus respectivos sentidos de hilo y márgenes.
                </p>
              </div>
            </div>

            {/* Esquema visual de tendido de moldes */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">📐 Mapa Esquemático de Piezas de Moldería</span>
                <span>Ancho de tela ref: 1.50 m</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {analysis.patternPieces.map((piece, idx) => (
                  <div 
                    key={piece.id || idx}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-primary/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold mb-1">
                        <span>{piece.category}</span>
                        <span className="text-primary">x{piece.quantity}</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-100 line-clamp-1">{piece.name}</h5>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>🧵 {piece.seamAllowance}</span>
                      <span className="truncate">{piece.cutDirection}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabla Detallada */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Pieza</th>
                    <th className="py-2.5 px-3">Categoría</th>
                    <th className="py-2.5 px-3 text-center">Cant.</th>
                    <th className="py-2.5 px-3">Sentido de Hilo</th>
                    <th className="py-2.5 px-3">Margen Costura</th>
                    <th className="py-2.5 px-3">Descripción Técnica</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {analysis.patternPieces.map((piece, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">{piece.name}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{piece.category}</td>
                      <td className="py-3 px-3 text-center font-bold text-primary">x{piece.quantity}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{piece.cutDirection}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">{piece.seamAllowance}</td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{piece.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "telas" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Telas Recomendadas por Estructura y Caída
              </h4>
              <p className="text-xs text-slate-500">
                La IA analiza el peso, rigidez y fluidez necesarios para reproducir fielmente el vuelo y entalle de la prenda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.fabricRecommendations.map((fab, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    fab.isPrimary
                      ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-md ring-1 ring-primary/30"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {fab.isPrimary ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-primary text-white uppercase tracking-wider">
                          Recomendación Principal ⭐
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Alternativa {idx}
                        </span>
                      )}
                      <span className="text-xs font-mono font-semibold text-slate-500">{fab.weightGsm}</span>
                    </div>

                    <h5 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {fab.fabricName}
                    </h5>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {fab.reason}
                    </p>

                    {/* Calificaciones visuales */}
                    <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-500">Caída y Fluidez:</span>
                          <span className="font-bold text-primary">{fab.drapeRating}/10</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${fab.drapeRating * 10}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-500">Estructura / Rigidez:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{fab.stiffnessRating}/10</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-400 dark:bg-slate-600 rounded-full" style={{ width: `${fab.stiffnessRating * 10}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                    <div>📍 <strong>Aguja:</strong> {fab.needleType}</div>
                    <div>🧵 <strong>Hilo:</strong> {fab.threadType}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "pasos" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Secuencia de Ensamble y Confección
              </h4>
              <div className="space-y-2">
                {analysis.constructionSteps?.map((step, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="mt-0.5">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {analysis.suppliesNeeded && (
              <div className="md:col-span-5 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-primary" /> Avíos e Insumos Adicionales
                </h4>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  {analysis.suppliesNeeded.map((sup, idx) => (
                    <div key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                      {sup}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Acciones Finales */}
      <div className="flex flex-wrap gap-4 pt-2">
        <button
          onClick={handleSavePattern}
          disabled={savingPattern}
          className="flex-1 h-12 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 dark:hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Scissors className="h-4 w-4" />
          {savingPattern ? "Guardando Patrón..." : "Crear Patrón con estas Piezas"}
        </button>

        <button
          onClick={handleCreateProject}
          disabled={creatingProject}
          className="flex-1 h-12 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-primary/25"
        >
          <FolderPlus className="h-4 w-4" />
          {creatingProject ? "Creando Proyecto..." : "Crear Proyecto en SewStudio"}
        </button>
      </div>
    </div>
  )
}
