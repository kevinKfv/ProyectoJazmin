"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Stage, Layer, Line, Circle, Text, Group, Rect } from "react-konva"
import { usePatternEditorStore, Point, Shape } from "@/store/pattern-editor-store"
import { generateGradingNestForShape, SIZE_COLORS } from "@/lib/pattern-utils/grading-utils"

interface EditorCanvasProps {
  initialData?: string | null
}

export default function EditorCanvas({ initialData }: EditorCanvasProps) {
  const {
    tool, shapes, textElements, currentShapeId, selectedShapeId, selectedTextId, selectedPointIndex,
    scale, pan, setScale, setPan, showGradingNest,
    startNewShape, addPointToCurrentShape, closeCurrentShape,
    selectShape, selectText, selectPoint, updatePoint, updateTextElement,
    deleteSelected, loadDesign
  } = usePatternEditorStore()

  const [mousePos, setMousePos] = useState<Point | null>(null)
  const stageRef = useRef<any>(null)
  const [mounted, setMounted] = useState(false)
  const [measureStart, setMeasureStart] = useState<Point | null>(null)
  const [measureCurrent, setMeasureCurrent] = useState<Point | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 })

  useEffect(() => {
    if (initialData) {
      loadDesign(initialData)
    }
    setMounted(true)
  }, [initialData, loadDesign])

  // Atajos de teclado (Keyboard Shortcuts)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Evitar atajos si se está escribiendo en un input o textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected()
      } else if (e.key === 'Escape') {
        closeCurrentShape()
        selectShape(null)
        selectText(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deleteSelected, closeCurrentShape, selectShape, selectText])

  if (!mounted) {
    return (
      <div className="flex-1 bg-slate-100 flex items-center justify-center text-slate-500 font-medium">
        Cargando mesa digitalizadora de patrones...
      </div>
    )
  }

  // 📐 Cálculo de distancias en cm (1px = 1mm en escala por defecto)
  const getDistancePx = (p1: Point, p2: Point) => {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  const pxToCm = (px: number) => (px / 10).toFixed(1)

  // Manejo de Zoom con Rueda del Mouse (Wheel Zoom)
  const handleWheel = (e: any) => {
    e.evt.preventDefault()
    const stage = stageRef.current
    if (!stage) return

    const oldScale = scale
    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const zoomFactor = e.evt.deltaY < 0 ? 1.08 : 0.92
    const newScale = Math.max(0.2, Math.min(4, oldScale * zoomFactor))

    const mousePointPx = {
      x: (pointer.x - pan.x) / oldScale,
      y: (pointer.y - pan.y) / oldScale,
    }

    const newPan = {
      x: pointer.x - mousePointPx.x * newScale,
      y: pointer.y - mousePointPx.y * newScale,
    }

    setScale(newScale)
    setPan(newPan)
  }

  // Manejo de clicks en el escenario
  const handleStageClick = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.id() === 'grid_bg'
    
    if (clickedOnEmpty) {
      if (tool === 'select' || tool === 'node') {
        selectShape(null)
        selectText(null)
      }
    }

    const stage = stageRef.current
    if (!stage) return
    const rawPos = stage.getPointerPosition()
    if (!rawPos) return

    // Transformar a coordenadas del canvas considerando Pan y Scale
    const canvasPos: Point = {
      x: (rawPos.x - pan.x) / scale,
      y: (rawPos.y - pan.y) / scale,
    }

    if (tool === 'draw') {
      if (!currentShapeId) {
        startNewShape(canvasPos)
      } else {
        addPointToCurrentShape(canvasPos)
      }
    } else if (tool === 'measure') {
      if (!measureStart) {
        setMeasureStart(canvasPos)
        setMeasureCurrent(canvasPos)
      } else {
        setMeasureStart(null)
        setMeasureCurrent(null)
      }
    }
  }

  // Manejo de arrastre de panorámica (Pan)
  const handleMouseDown = (e: any) => {
    if (tool === 'hand' || e.evt.button === 1 || e.evt.spaceKey) {
      setIsPanning(true)
      setPanStart({ x: e.evt.clientX - pan.x, y: e.evt.clientY - pan.y })
    }
  }

  const handleMouseMove = (e: any) => {
    const stage = stageRef.current
    if (!stage) return
    const rawPos = stage.getPointerPosition()

    if (rawPos) {
      const canvasPos: Point = {
        x: (rawPos.x - pan.x) / scale,
        y: (rawPos.y - pan.y) / scale,
      }
      setMousePos(canvasPos)

      if (tool === 'measure' && measureStart) {
        setMeasureCurrent(canvasPos)
      }
    }

    if (isPanning) {
      setPan({
        x: e.evt.clientX - panStart.x,
        y: e.evt.clientY - panStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const handleDragMovePoint = (e: any, shapeId: string, pointIndex: number) => {
    const newPoint = { x: e.target.x(), y: e.target.y() }
    updatePoint(shapeId, pointIndex, newPoint)
  }

  // Generar puntos para el Margen de Costura (Seam Allowance Offset)
  const calculateOffsetPoints = (points: Point[], offsetPx: number) => {
    if (points.length < 3) return []
    // Desplazamiento simplificado para visualización de margen de costura
    const offsetPoints: number[] = []
    for (let i = 0; i < points.length; i++) {
      const prev = points[(i - 1 + points.length) % points.length]
      const curr = points[i]
      const next = points[(i + 1) % points.length]

      const dx1 = curr.x - prev.x
      const dy1 = curr.y - prev.y
      const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) || 1

      const dx2 = next.x - curr.x
      const dy2 = next.y - curr.y
      const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1

      const nx = -(dy1 / len1 + dy2 / len2)
      const ny = (dx1 / len1 + dx2 / len2)
      const nlen = Math.sqrt(nx * nx + ny * ny) || 1

      offsetPoints.push(curr.x + (nx / nlen) * offsetPx, curr.y + (ny / nlen) * offsetPx)
    }
    return offsetPoints
  }

  return (
    <div className="flex-1 overflow-hidden bg-slate-200 dark:bg-slate-950 flex relative cursor-crosshair select-none">
      <Stage
        width={window.innerWidth - 320} // Descontar ancho del sidebar
        height={window.innerHeight - 56} // Descontar alto de toolbar
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleStageClick}
        onWheel={handleWheel}
        ref={stageRef}
      >
        <Layer x={pan.x} y={pan.y} scaleX={scale} scaleY={scale}>
          {/* 📐 Fondo con Rejilla Milimétrica / Centimétrica (Grid) */}
          <Rect
            id="grid_bg"
            x={-5000}
            y={-5000}
            width={10000}
            height={10000}
            fill="#f8fafc"
          />

          {/* Líneas de Cuadrícula Mayor cada 50px (5cm) */}
          {Array.from({ length: 100 }).map((_, i) => {
            const pos = (i - 50) * 100
            return (
              <Group key={i}>
                <Line points={[pos, -5000, pos, 5000]} stroke="#e2e8f0" strokeWidth={1} dash={[4, 4]} />
                <Line points={[-5000, pos, 5000, pos]} stroke="#e2e8f0" strokeWidth={1} dash={[4, 4]} />
                <Text x={pos + 4} y={4} text={`${pos / 10} cm`} fontSize={10} fill="#94a3b8" />
              </Group>
            )
          })}

          {/* 🧵 Renderizar Formas y Moldes (Shapes) */}
          {shapes.map((shape) => {
            const isSelected = shape.id === selectedShapeId
            const isCurrent = shape.id === currentShapeId
            const flatPoints = shape.points.flatMap((p) => [p.x, p.y])

            let displayPoints = [...flatPoints]
            if (isCurrent && mousePos && tool === 'draw') {
              displayPoints.push(mousePos.x, mousePos.y)
            }

            // Puntos para Margen de Costura
            const seamPx = (shape.seamAllowance || 0) * 10
            const seamPoints = shape.closed && seamPx > 0 ? calculateOffsetPoints(shape.points, seamPx) : []

            // Nido de Escalado Multitalla (si showGradingNest está activo)
            const nestShapes = showGradingNest ? generateGradingNestForShape(shape) : []

            return (
              <Group key={shape.id}>
                {/* Renderizado de Nido Multitalla (XS a XXL) */}
                {showGradingNest && nestShapes.map((nestShape, nIdx) => {
                  const nestDisplayPoints = nestShape.points.flatMap(p => [p.x, p.y])
                  return (
                    <Line
                      key={`nest_${nIdx}`}
                      points={nestDisplayPoints}
                      stroke={nestShape.stroke}
                      strokeWidth={1.5}
                      dash={[5, 3]}
                      closed={nestShape.closed}
                      opacity={0.8}
                    />
                  )
                })}

                {/* Línea de Margen de Costura (Punteada) */}
                {seamPoints.length > 0 && (
                  <Line
                    points={seamPoints}
                    stroke="#94a3b8"
                    strokeWidth={1}
                    dash={[6, 4]}
                    closed={shape.closed}
                  />
                )}

                {/* Contorno Principal del Molde */}
                <Line
                  points={displayPoints}
                  stroke={isSelected ? '#2563eb' : shape.stroke}
                  strokeWidth={isSelected ? shape.strokeWidth + 1 : shape.strokeWidth}
                  fill={shape.closed ? (shape.fill || 'rgba(37, 99, 235, 0.05)') : undefined}
                  closed={shape.closed}
                  hitStrokeWidth={15}
                  onClick={(e) => {
                    e.cancelBubble = true
                    if (tool === 'select' || tool === 'node') {
                      selectShape(shape.id)
                    }
                  }}
                  onTap={(e) => {
                    e.cancelBubble = true
                    if (tool === 'select' || tool === 'node') {
                      selectShape(shape.id)
                    }
                  }}
                />

                {/* Etiqueta de Nombre de Pieza y Medidas de Segmentos */}
                {shape.closed && shape.points.length > 0 && (
                  <Text
                    x={shape.points[0].x + 10}
                    y={shape.points[0].y + 10}
                    text={shape.name}
                    fontSize={13}
                    fontStyle="bold"
                    fill={isSelected ? '#1d4ed8' : '#475569'}
                  />
                )}

                {/* Medidas de cada segmento en cm */}
                {(isSelected || tool === 'node') && shape.points.map((p, idx) => {
                  const nextP = shape.points[(idx + 1) % shape.points.length]
                  if (!shape.closed && idx === shape.points.length - 1) return null

                  const midX = (p.x + nextP.x) / 2
                  const midY = (p.y + nextP.y) / 2
                  const distCm = pxToCm(getDistancePx(p, nextP))

                  return (
                    <Text
                      key={`len_${idx}`}
                      x={midX}
                      y={midY - 12}
                      text={`${distCm} cm`}
                      fontSize={11}
                      fill="#2563eb"
                      fontStyle="bold"
                    />
                  )
                })}
              </Group>
            )
          })}

          {/* ✍️ Renderizar Anotaciones de Texto */}
          {textElements.map((t) => {
            const isSelected = t.id === selectedTextId
            return (
              <Text
                key={t.id}
                id={t.id}
                x={t.x}
                y={t.y}
                text={t.text}
                fontSize={t.fontSize}
                fill={isSelected ? '#2563eb' : t.fill}
                fontStyle={isSelected ? 'bold' : 'normal'}
                draggable={tool === 'select'}
                onClick={(e) => {
                  e.cancelBubble = true
                  selectText(t.id)
                }}
                onDragEnd={(e) => {
                  updateTextElement(t.id, { x: e.target.x(), y: e.target.y() })
                }}
              />
            )
          })}

          {/* 📍 Nodos / Puntos de Control de Edición */}
          {tool === 'node' && selectedShapeId && shapes.find((s) => s.id === selectedShapeId)?.points.map((p, i) => (
            <Circle
              key={i}
              x={p.x}
              y={p.y}
              radius={7}
              fill={selectedPointIndex === i ? '#ef4444' : '#ffffff'}
              stroke="#2563eb"
              strokeWidth={2}
              draggable
              onDragMove={(e) => handleDragMovePoint(e, selectedShapeId, i)}
              onMouseDown={() => selectPoint(selectedShapeId, i)}
            />
          ))}

          {/* 📏 Cinta Métrica / Regla Interactiva (Measure Tool) */}
          {tool === 'measure' && measureStart && measureCurrent && (
            <Group>
              <Line
                points={[measureStart.x, measureStart.y, measureCurrent.x, measureCurrent.y]}
                stroke="#f59e0b"
                strokeWidth={2}
                dash={[6, 4]}
              />
              <Rect
                x={(measureStart.x + measureCurrent.x) / 2 - 25}
                y={(measureStart.y + measureCurrent.y) / 2 - 20}
                width={70}
                height={24}
                fill="#fef3c7"
                stroke="#f59e0b"
                cornerRadius={4}
              />
              <Text
                x={(measureStart.x + measureCurrent.x) / 2 - 20}
                y={(measureStart.y + measureCurrent.y) / 2 - 15}
                text={`${pxToCm(getDistancePx(measureStart, measureCurrent))} cm`}
                fontSize={12}
                fontStyle="bold"
                fill="#b45309"
              />
            </Group>
          )}
        </Layer>
      </Stage>

      {/* 💡 Panel de Ayuda e Indicaciones */}
      <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur p-3 rounded-lg shadow-lg border text-xs max-w-xs space-y-1 z-10">
        {tool === 'draw' && (
          <p className="text-slate-700 dark:text-slate-300">
            Haz clic para colocar vértices.
            {currentShapeId && (
              <button
                onClick={closeCurrentShape}
                className="ml-2 font-bold text-blue-600 hover:underline inline-block"
              >
                ✓ Cerrar Molde
              </button>
            )}
          </p>
        )}
        {tool === 'node' && <p className="text-slate-700 dark:text-slate-300">Arrastra los nodos circulares para modificar la forma del molde.</p>}
        {tool === 'measure' && <p className="text-amber-700 dark:text-amber-400 font-medium">Haz clic para fijar punto de origen y mueve para medir en cm.</p>}
        {tool === 'select' && <p className="text-slate-700 dark:text-slate-300">Haz clic en una pieza o texto para seleccionarla y editar sus propiedades.</p>}
        {tool === 'hand' && <p className="text-slate-700 dark:text-slate-300">Arrastra con el mouse para navegar por la mesa de trabajo.</p>}
      </div>
    </div>
  )
}
