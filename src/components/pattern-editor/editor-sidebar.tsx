"use client"

import { usePatternEditorStore } from "@/store/pattern-editor-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Trash2, Type, Layers, Scissors, Plus, Sparkles, SlidersHorizontal } from "lucide-react"
import GradingPanel from "./grading-panel"

export default function EditorSidebar() {
  const {
    shapes,
    textElements,
    selectedShapeId,
    selectedTextId,
    selectShape,
    selectText,
    updateShape,
    updateTextElement,
    deleteSelected,
    addBaseTemplate,
  } = usePatternEditorStore()

  const selectedShape = shapes.find((s) => s.id === selectedShapeId)
  const selectedText = textElements.find((t) => t.id === selectedTextId)

  return (
    <aside className="w-80 border-l bg-white dark:bg-slate-900 flex flex-col h-full shadow-sm z-20 overflow-y-auto">
      {/* 📏 SECCIÓN DE ESCALADO DE TALLAS (GRADING) */}
      <GradingPanel />

      {/* 🧩 SECCIÓN 1: PLANTILLAS DE MOLDE BASE */}
      <div className="p-4 border-b">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-purple-600" /> Moldes Base Predefinidos
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs justify-start hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/30"
            onClick={() => addBaseTemplate("delantero")}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Delantero
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs justify-start hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/30"
            onClick={() => addBaseTemplate("espalda")}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Espalda
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs justify-start hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/30"
            onClick={() => addBaseTemplate("manga")}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Manga Sastre
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs justify-start hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/30"
            onClick={() => addBaseTemplate("falda")}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Falda Midi
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs justify-start hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/30"
            onClick={() => addBaseTemplate("cuello")}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Cuello Camisero
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs justify-start hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/30"
            onClick={() => addBaseTemplate("bolsillo")}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Bolsillo
          </Button>
        </div>
      </div>

      {/* 🎛️ SECCIÓN 2: INSPECTOR DE PROPIEDADES */}
      <div className="p-4 border-b space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <SlidersHorizontal className="h-4 w-4 text-primary" /> Propiedades de Selección
        </h3>

        {selectedShape ? (
          <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border">
            <div>
              <Label className="text-xs font-medium">Nombre de la Pieza</Label>
              <Input
                value={selectedShape.name}
                onChange={(e) => updateShape(selectedShape.id, { name: e.target.value })}
                className="h-8 text-xs bg-white mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-medium flex justify-between">
                <span>Margen de Costura</span>
                <span className="font-bold text-primary">{selectedShape.seamAllowance || 0} cm</span>
              </Label>
              <select
                value={selectedShape.seamAllowance || 0}
                onChange={(e) => updateShape(selectedShape.id, { seamAllowance: parseFloat(e.target.value) })}
                className="w-full h-8 text-xs rounded-md border border-input bg-white px-2 mt-1"
              >
                <option value={0}>0 cm (Sin margen)</option>
                <option value={0.7}>0.7 cm (Costura Overlock)</option>
                <option value={1.0}>1.0 cm (Estándar)</option>
                <option value={1.5}>1.5 cm (Recomendado)</option>
                <option value={2.0}>2.0 cm (Dobladillo / Ajustes)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-medium">Color de Trazo</Label>
                <input
                  type="color"
                  value={selectedShape.stroke}
                  onChange={(e) => updateShape(selectedShape.id, { stroke: e.target.value })}
                  className="w-full h-8 p-1 bg-white rounded cursor-pointer mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-medium">Grosor Línea</Label>
                <select
                  value={selectedShape.strokeWidth}
                  onChange={(e) => updateShape(selectedShape.id, { strokeWidth: parseInt(e.target.value) })}
                  className="w-full h-8 text-xs rounded-md border border-input bg-white px-2 mt-1"
                >
                  <option value={1}>1px Fina</option>
                  <option value={2}>2px Estándar</option>
                  <option value={3}>3px Gruesa</option>
                  <option value={4}>4px Resaltada</option>
                </select>
              </div>
            </div>

            <Button
              variant="destructive"
              size="sm"
              className="w-full text-xs h-8 mt-2"
              onClick={deleteSelected}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar Pieza
            </Button>
          </div>
        ) : selectedText ? (
          <div className="space-y-4 bg-blue-50/50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200">
            <div>
              <Label className="text-xs font-medium">Texto de Anotación</Label>
              <Input
                value={selectedText.text}
                onChange={(e) => updateTextElement(selectedText.id, { text: e.target.value })}
                className="h-8 text-xs bg-white mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-medium">Tamaño Letra</Label>
                <Input
                  type="number"
                  value={selectedText.fontSize}
                  onChange={(e) => updateTextElement(selectedText.id, { fontSize: parseInt(e.target.value) || 12 })}
                  className="h-8 text-xs bg-white mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-medium">Color Texto</Label>
                <input
                  type="color"
                  value={selectedText.fill}
                  onChange={(e) => updateTextElement(selectedText.id, { fill: e.target.value })}
                  className="w-full h-8 p-1 bg-white rounded cursor-pointer mt-1"
                />
              </div>
            </div>

            <Button
              variant="destructive"
              size="sm"
              className="w-full text-xs h-8 mt-2"
              onClick={deleteSelected}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar Texto
            </Button>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic text-center py-2">
            Haz clic en una pieza o texto en el lienzo para ajustar sus propiedades.
          </p>
        )}
      </div>

      {/* 📑 SECCIÓN 3: CAPAS Y PIEZAS DEL PATRÓN */}
      <div className="p-4 flex-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-emerald-600" /> Piezas del Patrón ({shapes.length})
        </h3>

        {shapes.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">
            No hay piezas creadas aún. Dibuja una pieza o inserta un molde base arriba.
          </p>
        ) : (
          <div className="space-y-1.5">
            {shapes.map((s) => {
              const isSelected = s.id === selectedShapeId
              return (
                <div
                  key={s.id}
                  onClick={() => selectShape(s.id)}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                    isSelected
                      ? "bg-primary/10 border-primary text-primary font-semibold"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Scissors className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{s.name}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 shrink-0">
                    {s.points.length} pts
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}
