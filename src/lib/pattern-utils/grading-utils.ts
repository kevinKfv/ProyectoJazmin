import { Shape, Point } from "@/store/pattern-editor-store"

export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL"

export const SIZES: Size[] = ["XS", "S", "M", "L", "XL", "XXL"]

export const SIZE_COLORS: Record<Size, string> = {
  XS: "#eab308", // Amarillo
  S: "#10b981",  // Verde
  M: "#2563eb",  // Azul Base
  L: "#ef4444",  // Rojo
  XL: "#a855f7", // Púrpura
  XXL: "#f97316",// Naranja
}

// Incrementos de escalado en porcentaje relativo a Talla M (Base)
export const SIZE_SCALE_FACTORS: Record<Size, number> = {
  XS: 0.92, // -8%
  S: 0.96,  // -4%
  M: 1.0,   // Base 0%
  L: 1.05,  // +5%
  XL: 1.10, // +10%
  XXL: 1.15 // +15%
}

/**
 * Calcula el centroide (centro geométrico) de un conjunto de puntos
 */
export function getCentroid(points: Point[]): Point {
  if (!points || points.length === 0) return { x: 0, y: 0 }
  let sumX = 0
  let sumY = 0
  points.forEach(p => {
    sumX += p.x
    sumY += p.y
  })
  return {
    x: sumX / points.length,
    y: sumY / points.length
  }
}

/**
 * Escala los puntos de una pieza hacia una talla específica manteniendo la forma
 */
export function scaleShapeForSize(shape: Shape, targetSize: Size): Shape {
  if (targetSize === "M") return shape

  const factor = SIZE_SCALE_FACTORS[targetSize] || 1.0
  const centroid = getCentroid(shape.points)

  const scaledPoints = shape.points.map(p => {
    const dx = p.x - centroid.x
    const dy = p.y - centroid.y
    return {
      x: centroid.x + dx * factor,
      y: centroid.y + dy * factor
    }
  })

  return {
    ...shape,
    id: `${shape.id}_${targetSize}`,
    name: `${shape.name} (Talla ${targetSize})`,
    points: scaledPoints,
    stroke: SIZE_COLORS[targetSize] || shape.stroke,
  }
}

/**
 * Genera el nido de escalado (Grading Nest) con todas las tallas superpuestas
 */
export function generateGradingNestForShape(shape: Shape): Shape[] {
  return SIZES.map(size => scaleShapeForSize(shape, size))
}
