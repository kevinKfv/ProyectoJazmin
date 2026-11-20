import { create } from 'zustand'

export type ToolType = 'select' | 'draw' | 'node' | 'text' | 'measure' | 'hand'

export interface Point {
  x: number
  y: number
}

export interface Shape {
  id: string
  name: string
  points: Point[]
  closed: boolean
  stroke: string
  strokeWidth: number
  fill?: string
  seamAllowance?: number // Margen de costura en cm (ej: 1.5)
}

export interface TextElement {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  fill: string
}

interface PatternEditorState {
  tool: ToolType
  shapes: Shape[]
  textElements: TextElement[]
  currentShapeId: string | null
  selectedShapeId: string | null
  selectedTextId: string | null
  selectedPointIndex: number | null
  scale: number
  pan: { x: number; y: number }
  
  // Escalado (Grading) y Anidamiento (Nesting)
  currentSize: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
  showGradingNest: boolean
  fabricWidthCm: number

  // Historial Deshacer/Rehacer
  history: { shapes: Shape[]; textElements: TextElement[] }[]
  historyIndex: number

  // Acciones
  setTool: (tool: ToolType) => void
  setCurrentSize: (size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL') => void
  setShowGradingNest: (show: boolean) => void
  setFabricWidthCm: (widthCm: number) => void
  startNewShape: (point: Point) => void
  addPointToCurrentShape: (point: Point) => void
  closeCurrentShape: () => void
  selectShape: (id: string | null) => void
  selectText: (id: string | null) => void
  selectPoint: (shapeId: string, pointIndex: number | null) => void
  updatePoint: (shapeId: string, pointIndex: number, newPoint: Point) => void
  updateShape: (id: string, partial: Partial<Shape>) => void
  deleteSelected: () => void
  
  addTextElement: (point: Point, text?: string) => void
  updateTextElement: (id: string, partial: Partial<TextElement>) => void
  
  addBaseTemplate: (type: 'delantero' | 'espalda' | 'manga' | 'falda' | 'cuello' | 'bolsillo') => void
  
  setScale: (scale: number | ((prev: number) => number)) => void
  setPan: (pan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void
  
  undo: () => void
  redo: () => void
  
  loadDesign: (json: string) => void
  exportDesign: () => string
}

const saveHistory = (state: PatternEditorState) => {
  const newHistory = state.history.slice(0, state.historyIndex + 1)
  newHistory.push({
    shapes: JSON.parse(JSON.stringify(state.shapes)),
    textElements: JSON.parse(JSON.stringify(state.textElements)),
  })
  return {
    history: newHistory,
    historyIndex: newHistory.length - 1,
  }
}

export const usePatternEditorStore = create<PatternEditorState>((set, get) => ({
  tool: 'select',
  shapes: [],
  textElements: [],
  currentShapeId: null,
  selectedShapeId: null,
  selectedTextId: null,
  selectedPointIndex: null,
  scale: 1,
  pan: { x: 0, y: 0 },
  currentSize: 'M',
  showGradingNest: false,
  fabricWidthCm: 140,
  history: [],
  historyIndex: -1,

  setTool: (tool) => set({ tool, selectedShapeId: null, selectedTextId: null, selectedPointIndex: null }),
  setCurrentSize: (currentSize) => set({ currentSize }),
  setShowGradingNest: (showGradingNest) => set({ showGradingNest }),
  setFabricWidthCm: (fabricWidthCm) => set({ fabricWidthCm }),

  startNewShape: (point) => {
    const newId = "shape_" + Date.now()
    set((state) => {
      const newShapes = [...state.shapes, {
        id: newId,
        name: `Pieza Molde ${state.shapes.length + 1}`,
        points: [point],
        closed: false,
        stroke: '#2563eb',
        strokeWidth: 2,
        fill: 'rgba(37, 99, 235, 0.05)',
        seamAllowance: 1.5,
      }]
      const hist = saveHistory({ ...state, shapes: newShapes })
      return {
        shapes: newShapes,
        currentShapeId: newId,
        selectedShapeId: newId,
        ...hist,
      }
    })
  },

  addPointToCurrentShape: (point) => {
    set((state) => {
      if (!state.currentShapeId) return state
      const newShapes = state.shapes.map(s => {
        if (s.id === state.currentShapeId) {
          return { ...s, points: [...s.points, point] }
        }
        return s
      })
      const hist = saveHistory({ ...state, shapes: newShapes })
      return { shapes: newShapes, ...hist }
    })
  },

  closeCurrentShape: () => {
    set((state) => {
      if (!state.currentShapeId) return state
      const newShapes = state.shapes.map(s => {
        if (s.id === state.currentShapeId) {
          return { ...s, closed: true }
        }
        return s
      })
      const hist = saveHistory({ ...state, shapes: newShapes })
      return {
        shapes: newShapes,
        currentShapeId: null,
        ...hist,
      }
    })
  },

  selectShape: (id) => set({ selectedShapeId: id, selectedTextId: null, selectedPointIndex: null }),
  
  selectText: (id) => set({ selectedTextId: id, selectedShapeId: null, selectedPointIndex: null }),

  selectPoint: (shapeId, pointIndex) => set({ selectedShapeId: shapeId, selectedPointIndex: pointIndex }),

  updatePoint: (shapeId, pointIndex, newPoint) => {
    set((state) => {
      const newShapes = state.shapes.map(s => {
        if (s.id === shapeId) {
          const newPoints = [...s.points]
          newPoints[pointIndex] = newPoint
          return { ...s, points: newPoints }
        }
        return s
      })
      return { shapes: newShapes }
    })
  },

  updateShape: (id, partial) => {
    set((state) => {
      const newShapes = state.shapes.map(s => s.id === id ? { ...s, ...partial } : s)
      const hist = saveHistory({ ...state, shapes: newShapes })
      return { shapes: newShapes, ...hist }
    })
  },

  deleteSelected: () => {
    set((state) => {
      let newShapes = state.shapes
      let newTexts = state.textElements

      if (state.selectedShapeId) {
        newShapes = state.shapes.filter(s => s.id !== state.selectedShapeId)
      }
      if (state.selectedTextId) {
        newTexts = state.textElements.filter(t => t.id !== state.selectedTextId)
      }

      const hist = saveHistory({ ...state, shapes: newShapes, textElements: newTexts })
      return {
        shapes: newShapes,
        textElements: newTexts,
        selectedShapeId: null,
        selectedTextId: null,
        selectedPointIndex: null,
        currentShapeId: null,
        ...hist,
      }
    })
  },

  addTextElement: (point, text = "Delantero Talla M") => {
    set((state) => {
      const newText: TextElement = {
        id: "text_" + Date.now(),
        text,
        x: point.x,
        y: point.y,
        fontSize: 16,
        fill: '#1e293b',
      }
      const newTexts = [...state.textElements, newText]
      const hist = saveHistory({ ...state, textElements: newTexts })
      return {
        textElements: newTexts,
        selectedTextId: newText.id,
        selectedShapeId: null,
        ...hist,
      }
    })
  },

  updateTextElement: (id, partial) => {
    set((state) => {
      const newTexts = state.textElements.map(t => t.id === id ? { ...t, ...partial } : t)
      const hist = saveHistory({ ...state, textElements: newTexts })
      return { textElements: newTexts, ...hist }
    })
  },

  addBaseTemplate: (type) => {
    set((state) => {
      const newId = "template_" + type + "_" + Date.now()
      let points: Point[] = []
      let name = ""
      let textOffset = { x: 200, y: 250 }

      if (type === 'delantero') {
        name = "Talle Delantero Base"
        points = [
          { x: 150, y: 100 }, { x: 280, y: 100 }, { x: 330, y: 160 },
          { x: 310, y: 240 }, { x: 300, y: 380 }, { x: 150, y: 380 }
        ]
      } else if (type === 'espalda') {
        name = "Talle Espalda Base"
        points = [
          { x: 400, y: 100 }, { x: 530, y: 100 }, { x: 580, y: 170 },
          { x: 560, y: 240 }, { x: 550, y: 380 }, { x: 400, y: 380 }
        ]
      } else if (type === 'manga') {
        name = "Manga Base Sastre"
        points = [
          { x: 200, y: 150 }, { x: 260, y: 90 }, { x: 340, y: 90 },
          { x: 400, y: 150 }, { x: 370, y: 400 }, { x: 230, y: 400 }
        ]
      } else if (type === 'falda') {
        name = "Falda Midi A-Line"
        points = [
          { x: 200, y: 100 }, { x: 350, y: 100 }, { x: 420, y: 450 }, { x: 130, y: 450 }
        ]
      } else if (type === 'cuello') {
        name = "Cuello Camisero"
        points = [
          { x: 150, y: 200 }, { x: 380, y: 200 }, { x: 400, y: 260 }, { x: 130, y: 260 }
        ]
      } else if (type === 'bolsillo') {
        name = "Bolsillo de Parche"
        points = [
          { x: 200, y: 200 }, { x: 320, y: 200 }, { x: 320, y: 320 },
          { x: 260, y: 360 }, { x: 200, y: 320 }
        ]
      }

      const newShape: Shape = {
        id: newId,
        name,
        points,
        closed: true,
        stroke: '#2563eb',
        strokeWidth: 2,
        fill: 'rgba(37, 99, 235, 0.08)',
        seamAllowance: 1.5,
      }

      const newText: TextElement = {
        id: "text_tpl_" + Date.now(),
        text: `${name} (Cortar 2)`,
        x: points[0].x + 30,
        y: points[0].y + 40,
        fontSize: 15,
        fill: '#1e293b',
      }

      const newShapes = [...state.shapes, newShape]
      const newTexts = [...state.textElements, newText]
      const hist = saveHistory({ ...state, shapes: newShapes, textElements: newTexts })

      return {
        shapes: newShapes,
        textElements: newTexts,
        selectedShapeId: newId,
        ...hist,
      }
    })
  },

  setScale: (scaleParam) => set((state) => {
    const newScale = typeof scaleParam === 'function' ? scaleParam(state.scale) : scaleParam
    return { scale: Math.max(0.2, Math.min(4, newScale)) }
  }),

  setPan: (panParam) => set((state) => {
    const newPan = typeof panParam === 'function' ? panParam(state.pan) : panParam
    return { pan: newPan }
  }),

  undo: () => {
    set((state) => {
      if (state.historyIndex <= 0) return state
      const nextIndex = state.historyIndex - 1
      const target = state.history[nextIndex]
      return {
        shapes: JSON.parse(JSON.stringify(target.shapes)),
        textElements: JSON.parse(JSON.stringify(target.textElements)),
        historyIndex: nextIndex,
      }
    })
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state
      const nextIndex = state.historyIndex + 1
      const target = state.history[nextIndex]
      return {
        shapes: JSON.parse(JSON.stringify(target.shapes)),
        textElements: JSON.parse(JSON.stringify(target.textElements)),
        historyIndex: nextIndex,
      }
    })
  },

  loadDesign: (json) => {
    try {
      if (!json) return
      const data = JSON.parse(json)

      let loadedShapes: Shape[] = []
      let loadedTexts: TextElement[] = []

      if (data.shapes && Array.isArray(data.shapes)) {
        loadedShapes = data.shapes
      } else if (data.elements && Array.isArray(data.elements)) {
        // Adaptar formato legacy de canvas
        loadedShapes = data.elements.filter((e: any) => e.points).map((e: any, index: number) => ({
          id: e.id || "shape_" + index,
          name: e.id || `Pieza ${index + 1}`,
          points: (e.points || []).map((p: any) => Array.isArray(p) ? { x: p[0], y: p[1] } : p),
          closed: true,
          stroke: e.stroke || "#2563eb",
          strokeWidth: e.strokeWidth || 2,
          fill: "rgba(37, 99, 235, 0.08)",
          seamAllowance: 1.5,
        }))

        loadedTexts = data.elements.filter((e: any) => e.text).map((e: any, index: number) => ({
          id: e.id || "text_" + index,
          text: e.text,
          x: e.x || 100,
          y: e.y || 100,
          fontSize: e.fontSize || 16,
          fill: e.fill || "#1e293b",
        }))
      }

      set({
        shapes: loadedShapes,
        textElements: loadedTexts,
        history: [{ shapes: loadedShapes, textElements: loadedTexts }],
        historyIndex: 0,
      })
    } catch (e) {
      console.error("Failed to load design", e)
    }
  },

  exportDesign: () => {
    const { shapes, textElements, scale, pan } = get()
    return JSON.stringify({
      version: "2.0",
      shapes,
      textElements,
      scale,
      pan,
    })
  }
}))
