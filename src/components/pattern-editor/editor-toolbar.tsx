"use client"

import { useState } from "react"
import { usePatternEditorStore, ToolType } from "@/store/pattern-editor-store"
import { Button } from "@/components/ui/button"
import {
  MousePointer2, PenLine, GripHorizontal, Ruler, Save, Loader2, ArrowLeft,
  Type, Hand, Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, Download, Trash2, Scissors, Sparkles
} from "lucide-react"
import Link from "next/link"
import { useTransition } from "react"
import { updatePatternDesign } from "@/app/actions/patrones"
import NestingModal from "./nesting-modal"
import ExportModal from "./export-modal"

export default function EditorToolbar({ patternId }: { patternId: string }) {
  const {
    tool, setTool, exportDesign, scale, setScale, setPan, undo, redo,
    deleteSelected, selectedShapeId, selectedTextId, addTextElement
  } = usePatternEditorStore()
  const [isPending, startTransition] = useTransition()

  const [showNestingModal, setShowNestingModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  const handleSave = () => {
    startTransition(async () => {
      const designJson = exportDesign()
      const formData = new FormData()
      formData.append("patternId", patternId)
      formData.append("designJson", designJson)
      await updatePatternDesign(formData)
    })
  }

  const handleAddTextPrompt = () => {
    const text = prompt("Ingresa el texto para la anotación del patrón:", "Delantero Talla M")
    if (text) {
      addTextElement({ x: 250, y: 200 }, text)
    }
  }

  const tools: { id: ToolType; icon: any; label: string }[] = [
    { id: 'select', icon: MousePointer2, label: 'Seleccionar (S)' },
    { id: 'draw', icon: PenLine, label: 'Dibujar Trazo / Molde (D)' },
    { id: 'node', icon: GripHorizontal, label: 'Editar Nodos (N)' },
    { id: 'text', icon: Type, label: 'Añadir Texto (T)' },
    { id: 'measure', icon: Ruler, label: 'Medir Distancias (M)' },
    { id: 'hand', icon: Hand, label: 'Mover Lienzo / Pan (H)' },
  ]

  return (
    <>
      <div className="h-14 border-b bg-white dark:bg-slate-900 flex items-center justify-between px-4 z-30 shadow-sm">
        {/* Izquierda: Volver & Deshacer/Rehacer */}
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/patrones">
            <Button variant="ghost" size="icon" title="Volver a la Biblioteca de Patrones">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="h-6 w-px bg-border mx-1" />

          <Button variant="ghost" size="icon" onClick={undo} title="Deshacer (Ctrl+Z)">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={redo} title="Rehacer (Ctrl+Y)">
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Centro: Barra de Herramientas de Edición Vectorial */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border">
          {tools.map((t) => {
            const isSelected = tool === t.id
            return (
              <Button
                key={t.id}
                variant={isSelected ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setTool(t.id)
                  if (t.id === 'text') {
                    handleAddTextPrompt()
                  }
                }}
                title={t.label}
                className={`h-8 px-2.5 text-xs font-medium ${
                  isSelected ? "bg-primary text-white shadow-sm" : "text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <t.icon className="h-4 w-4 mr-1.5" />
                <span className="hidden md:inline">{t.label.split(' ')[0]}</span>
              </Button>
            );
          })}
        </div>

        {/* Herramientas de Nesting y Exportación Industrial */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNestingModal(true)}
            className="h-8 px-2.5 text-xs font-semibold border-purple-300 text-purple-700 dark:text-purple-300 hover:bg-purple-50"
            title="Optimizar corte de tela (Nesting)"
          >
            <Scissors className="h-3.5 w-3.5 mr-1" /> Anidamiento Tela
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExportModal(true)}
            className="h-8 px-2.5 text-xs font-semibold border-blue-300 text-blue-700 dark:text-blue-300 hover:bg-blue-50"
            title="Exportar DXF-AAMA, PLT y PDF A0"
          >
            <Download className="h-3.5 w-3.5 mr-1" /> Exportar CAD/PLT
          </Button>

          {/* Controles de Zoom */}
          <div className="flex items-center space-x-1 border rounded-md px-1 bg-slate-50 dark:bg-slate-800 h-8">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setScale((s) => s - 0.1)} title="Alejar (-)">
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs font-semibold px-1 min-w-[40px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setScale((s) => s + 0.1)} title="Acercar (+)">
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-400 hover:text-slate-700"
              onClick={() => {
                setScale(1)
                setPan({ x: 0, y: 0 })
              }}
              title="Restablecer vista"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          </div>

          {(selectedShapeId || selectedTextId) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
              onClick={deleteSelected}
              title="Eliminar elemento seleccionado (Supr)"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          <Button onClick={handleSave} disabled={isPending} className="h-8 px-3 text-xs bg-primary hover:bg-primary/90">
            {isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
            Guardar Cambios
          </Button>
        </div>
      </div>

      <NestingModal
        isOpen={showNestingModal}
        onClose={() => setShowNestingModal(false)}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </>
  )
}
