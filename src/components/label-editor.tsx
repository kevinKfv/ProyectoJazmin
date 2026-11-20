"use client"

import { useState, useRef, useEffect } from "react"
import { Stage, Layer, Text, Rect, Image as KonvaImage, Transformer } from "react-konva"
import useImage from "use-image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Download, Type, Square, Image as ImageIcon, QrCode, Save, Trash2, Edit3, FolderKanban, Sparkles, Plus, RefreshCw } from "lucide-react"
import { saveLabelAction, deleteLabelAction } from "@/app/actions/etiquetas"
import { useRouter } from "next/navigation"

interface LabelEditorProps {
  initialLabels?: any[]
}

const URLImage = ({ image, shapeProps, isSelected, onSelect, onChange }: any) => {
  const [img] = useImage(image.url, "anonymous")
  const imageRef = useRef<any>(null)

  return (
    <KonvaImage
      image={img}
      x={shapeProps.x}
      y={shapeProps.y}
      width={shapeProps.width || 100}
      height={shapeProps.height || 100}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      ref={imageRef}
      id={shapeProps.id}
      onDragEnd={(e) => {
        onChange({
          ...shapeProps,
          x: e.target.x(),
          y: e.target.y(),
        })
      }}
      onTransformEnd={(e) => {
        const node = imageRef.current
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()
        node.scaleX(1)
        node.scaleY(1)
        onChange({
          ...shapeProps,
          x: node.x(),
          y: node.y(),
          width: Math.max(5, node.width() * scaleX),
          height: Math.max(5, node.height() * scaleY),
        })
      }}
    />
  )
}

export default function LabelEditor({ initialLabels = [] }: LabelEditorProps) {
  const router = useRouter()
  const [labels, setLabels] = useState<any[]>(initialLabels)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [labelName, setLabelName] = useState<string>("Mi Nueva Etiqueta")
  const [labelType, setLabelType] = useState<string>("Marca")
  const [elements, setElements] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const stageRef = useRef<any>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setLabels(initialLabels)
  }, [initialLabels])

  // Cargar una etiqueta guardada en el editor
  const loadLabelIntoEditor = (label: any) => {
    setCurrentId(label.id)
    setLabelName(label.name)
    setLabelType(label.type || "Marca")
    try {
      const parsed = JSON.parse(label.designJson)
      if (parsed.elements && Array.isArray(parsed.elements)) {
        setElements(parsed.elements)
      } else if (Array.isArray(parsed)) {
        setElements(parsed)
      } else {
        setElements([])
      }
    } catch {
      setElements([])
    }
    setSelectedId(null)
  }

  // Limpiar editor para crear una nueva etiqueta
  const resetEditor = () => {
    setCurrentId(null)
    setLabelName("Nueva Etiqueta " + (labels.length + 1))
    setLabelType("Marca")
    setElements([
      { id: "text-1", type: "text", text: "SEWSTUDIO", x: 180, y: 50, fontSize: 32, fill: "#1e293b" },
      { id: "text-2", type: "text", text: "100% Hecho a Mano", x: 200, y: 110, fontSize: 16, fill: "#64748b" },
    ])
    setSelectedId(null)
  }

  // Guardar etiqueta actual en la base de datos
  const handleSave = async () => {
    if (!labelName.trim()) {
      alert("Por favor ingresa un nombre para la etiqueta.")
      return
    }

    setIsSaving(true)
    try {
      const designJson = JSON.stringify({
        width: 600,
        height: 400,
        elements,
      })

      const saved = await saveLabelAction({
        id: currentId || undefined,
        name: labelName,
        type: labelType,
        designJson,
      })

      if (!currentId && saved?.id) {
        setCurrentId(saved.id)
      }

      router.refresh()
    } catch (err: any) {
      alert("Error al guardar la etiqueta: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Eliminar etiqueta del historial
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta etiqueta del historial?")) return

    setIsDeleting(id)
    try {
      await deleteLabelAction(id)
      if (currentId === id) {
        resetEditor()
      }
      setLabels(labels.filter(l => l.id !== id))
      router.refresh()
    } catch (err: any) {
      alert("Error al eliminar la etiqueta: " + err.message)
    } finally {
      setIsDeleting(null)
    }
  }

  const addText = () => {
    setElements([...elements, { id: Date.now().toString(), type: "text", text: "Nuevo Texto", x: 80, y: 80, fontSize: 24, fill: "#333333" }])
  }

  const addRect = () => {
    setElements([...elements, { id: Date.now().toString(), type: "rect", x: 100, y: 100, width: 150, height: 60, fill: "#f1f5f9" }])
  }

  const addImage = () => {
    const url = prompt("Introduce la URL de la imagen (ej: https://...):")
    if (url) {
      setElements([...elements, { id: Date.now().toString(), type: "image", url, x: 150, y: 150, width: 100, height: 100 }])
    }
  }

  const addQR = () => {
    const qrText = prompt("Introduce el enlace o texto para el código QR:", "https://sewstudio.app")
    if (qrText) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrText)}`
      setElements([...elements, { id: Date.now().toString(), type: "image", url: qrUrl, x: 200, y: 200, width: 120, height: 120 }])
    }
  }

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.id() === "bg"
    if (clickedOnEmpty) {
      setSelectedId(null)
    }
  }

  const exportImage = () => {
    setSelectedId(null)
    setTimeout(() => {
      if (!stageRef.current) return
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 })
      const link = document.createElement("a")
      link.download = `${labelName.toLowerCase().replace(/\s+/g, "_")}.png`
      link.href = uri
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }, 100)
  }

  if (!isMounted) return <div className="h-[400px] bg-slate-100 animate-pulse rounded-lg flex items-center justify-center">Cargando lienzo de etiquetas...</div>

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "Marca": return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300"
      case "Lavado": return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
      case "Producto": return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300"
      case "QR": return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
      default: return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  return (
    <div className="space-y-8">
      {/* 📚 SECCIÓN HISTORIAL DE ETIQUETAS GUARDADAS */}
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-primary" />
              Historial de Etiquetas Guardadas
            </CardTitle>
            <CardDescription className="mt-1">
              {labels.length > 0 
                ? `Tienes ${labels.length} etiqueta(s) guardadas en tu catálogo personal.` 
                : "Aún no has guardado etiquetas. Diseña una abajo y haz clic en Guardar."}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={resetEditor} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nueva Etiqueta Desde Cero
          </Button>
        </CardHeader>

        <CardContent>
          {labels.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
              <Sparkles className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No hay etiquetas guardadas en el historial</p>
              <p className="text-xs text-slate-500 mt-1">Utiliza el editor interactivo de abajo para crear y guardar tu primera etiqueta.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {labels.map((lbl) => {
                const isSelected = currentId === lbl.id
                return (
                  <div
                    key={lbl.id}
                    className={`group relative p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between bg-white dark:bg-slate-900 shadow-sm hover:shadow-md ${
                      isSelected ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant="outline" className={`text-xs font-semibold px-2 py-0.5 ${getTypeBadgeColor(lbl.type)}`}>
                          {lbl.type || "Etiqueta"}
                        </Badge>
                        <span className="text-[10px] text-slate-400">
                          {new Date(lbl.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm line-clamp-2 mb-3">
                        {lbl.name}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => loadLabelIntoEditor(lbl)}
                      >
                        <Edit3 className="h-3.5 w-3.5 mr-1" />
                        {isSelected ? "Editando..." : "Cargar"}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                        disabled={isDeleting === lbl.id}
                        onClick={() => handleDelete(lbl.id)}
                        title="Eliminar del historial"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🎨 SECCIÓN EDITOR GRÁFICO */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Barra Lateral de Herramientas y Datos */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Propiedades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Nombre de la Etiqueta
                </label>
                <Input
                  value={labelName}
                  onChange={(e) => setLabelName(e.target.value)}
                  placeholder="Ej: Etiqueta de Marca Seda"
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Categoría / Tipo
                </label>
                <select
                  value={labelType}
                  onChange={(e) => setLabelType(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="Marca">🏷️ Marca</option>
                  <option value="Lavado">🧼 Lavado / Cuidado</option>
                  <option value="Producto">👗 Producto / Talla</option>
                  <option value="QR">📱 Código QR</option>
                </select>
              </div>

              <div className="pt-2 border-t space-y-2">
                <Button
                  className="w-full justify-center bg-primary hover:bg-primary/90 text-white font-medium"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {currentId ? "Actualizar Etiqueta" : "Guardar en Historial"}
                </Button>

                <Button variant="outline" className="w-full justify-center text-slate-700 dark:text-slate-300" onClick={exportImage}>
                  <Download className="mr-2 h-4 w-4 text-emerald-600" /> Exportar PNG
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-md">Añadir Elementos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-xs" onClick={addText}>
                <Type className="mr-2 h-4 w-4 text-blue-500" /> Añadir Texto
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs" onClick={addRect}>
                <Square className="mr-2 h-4 w-4 text-amber-500" /> Añadir Rectángulo
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs" onClick={addImage}>
                <ImageIcon className="mr-2 h-4 w-4 text-emerald-500" /> Añadir Logo / Imagen
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs" onClick={addQR}>
                <QrCode className="mr-2 h-4 w-4 text-purple-500" /> Generar Código QR
              </Button>
            </CardContent>
          </Card>

          {selectedId && elements.find(el => el.id === selectedId)?.type === "text" && (
            <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                  Editar Texto Seleccionado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  value={elements.find(el => el.id === selectedId)?.text}
                  onChange={(e) => {
                    const newElements = elements.map(el =>
                      el.id === selectedId ? { ...el, text: e.target.value } : el
                    )
                    setElements(newElements)
                  }}
                  className="bg-white text-sm"
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={elements.find(el => el.id === selectedId)?.fontSize || 24}
                    onChange={(e) => {
                      const newElements = elements.map(el =>
                        el.id === selectedId ? { ...el, fontSize: parseInt(e.target.value) || 12 } : el
                      )
                      setElements(newElements)
                    }}
                    placeholder="Tamaño px"
                    className="w-1/2 bg-white text-xs"
                  />
                  <Input
                    type="color"
                    value={elements.find(el => el.id === selectedId)?.fill || "#333333"}
                    onChange={(e) => {
                      const newElements = elements.map(el =>
                        el.id === selectedId ? { ...el, fill: e.target.value } : el
                      )
                      setElements(newElements)
                    }}
                    className="w-1/2 h-9 p-1 bg-white cursor-pointer"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Lienzo Interactivo Konva */}
        <div className="md:col-span-3 border rounded-xl bg-white overflow-hidden shadow-sm flex flex-col items-center justify-center min-h-[500px] p-6 bg-slate-50 dark:bg-slate-900">
          <div className="mb-2 text-xs text-slate-500 flex items-center justify-between w-full max-w-[600px] px-1">
            <span>Lienzo de Etiqueta (600px × 400px)</span>
            {currentId && <span className="text-emerald-600 font-medium">● Editando etiqueta existente</span>}
          </div>

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg shadow-lg bg-white overflow-hidden">
            <Stage
              width={600}
              height={400}
              onMouseDown={checkDeselect}
              onTouchStart={checkDeselect}
              ref={stageRef}
              className="bg-white"
            >
              <Layer>
                {/* Fondo base de la etiqueta */}
                <Rect id="bg" x={0} y={0} width={600} height={400} fill="#ffffff" />

                {elements.map((el) => {
                  if (el.type === "text") {
                    return (
                      <Text
                        key={el.id}
                        id={el.id}
                        x={el.x}
                        y={el.y}
                        text={el.text}
                        fontSize={el.fontSize || 24}
                        fontFamily={el.fontFamily || "sans-serif"}
                        draggable
                        fill={el.fill || "#333333"}
                        onClick={() => setSelectedId(el.id)}
                        onTap={() => setSelectedId(el.id)}
                        onDragEnd={(e) => {
                          const newElements = elements.map(item =>
                            item.id === el.id ? { ...item, x: e.target.x(), y: e.target.y() } : item
                          )
                          setElements(newElements)
                        }}
                      />
                    )
                  }
                  if (el.type === "rect") {
                    return (
                      <Rect
                        key={el.id}
                        id={el.id}
                        x={el.x}
                        y={el.y}
                        width={el.width}
                        height={el.height}
                        fill={el.fill}
                        draggable
                        onClick={() => setSelectedId(el.id)}
                        onTap={() => setSelectedId(el.id)}
                        onDragEnd={(e) => {
                          const newElements = elements.map(item =>
                            item.id === el.id ? { ...item, x: e.target.x(), y: e.target.y() } : item
                          )
                          setElements(newElements)
                        }}
                      />
                    )
                  }
                  if (el.type === "image") {
                    return (
                      <URLImage
                        key={el.id}
                        image={el}
                        shapeProps={el}
                        isSelected={el.id === selectedId}
                        onSelect={() => setSelectedId(el.id)}
                        onChange={(newAttrs: any) => {
                          const newElements = elements.map(item =>
                            item.id === el.id ? newAttrs : item
                          )
                          setElements(newElements)
                        }}
                      />
                    )
                  }
                  return null
                })}
                {selectedId && (
                  <Transformer
                    ref={(node) => {
                      if (node && stageRef.current) {
                        const selectedNode = stageRef.current.findOne('#' + selectedId)
                        if (selectedNode) {
                          node.nodes([selectedNode])
                          node.getLayer()?.batchDraw()
                        }
                      }
                    }}
                  />
                )}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
    </div>
  )
}
