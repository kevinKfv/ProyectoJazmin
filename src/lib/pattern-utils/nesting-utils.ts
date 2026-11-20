import { Shape, Point } from "@/store/pattern-editor-store"

export interface NestedPiece {
  originalShape: Shape
  x: number
  y: number
  width: number
  height: number
  rotated: boolean
  points: Point[]
}

export interface NestingResult {
  fabricWidthCm: number
  fabricLengthCm: number
  fabricLengthMeters: number
  totalPiecesCount: number
  usedAreaSqCm: number
  totalFabricAreaSqCm: number
  efficiencyPercentage: number
  wastePercentage: number
  nestedPieces: NestedPiece[]
}

/**
 * Calcula el rectángulo delimitador (Bounding Box) de una pieza
 */
function getBoundingBox(points: Point[]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  points.forEach(p => {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  })
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(10, maxX - minX),
    height: Math.max(10, maxY - minY)
  }
}

/**
 * Aproximación del área de un polígono en cm²
 */
function calculatePolygonArea(points: Point[]): number {
  if (points.length < 3) return 0
  let area = 0
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    area += points[i].x * points[j].y
    area -= points[j].x * points[i].y
  }
  return Math.abs(area / 2)
}

/**
 * Algoritmo de Acomodación / Anidamiento (Nesting) de Piezas sobre Rollo de Tela
 * Coloca eficientemente las piezas del patrón sobre un ancho de tela dado en cm
 */
export function calculateNesting(
  shapes: Shape[],
  fabricWidthCm: number = 140, // Ancho estándar 1.40m = 140cm
  marginCm: number = 2.0       // Margen entre piezas
): NestingResult {
  if (!shapes || shapes.length === 0) {
    return {
      fabricWidthCm,
      fabricLengthCm: 0,
      fabricLengthMeters: 0,
      totalPiecesCount: 0,
      usedAreaSqCm: 0,
      totalFabricAreaSqCm: 0,
      efficiencyPercentage: 0,
      wastePercentage: 0,
      nestedPieces: []
    }
  }

  // Factor de escala de visualización: 1px = 0.5cm para simulación de plano de corte
  const nestedPieces: NestedPiece[] = []
  let currentX = marginCm
  let currentY = marginCm
  let maxRowHeight = 0
  let totalFabricLengthCm = marginCm
  let totalUsedAreaSqCm = 0

  shapes.forEach(shape => {
    const bbox = getBoundingBox(shape.points)
    // Convertir de px canvas a dimensión estimada en cm
    const wCm = bbox.width * 0.4
    const hCm = bbox.height * 0.4
    const pieceArea = calculatePolygonArea(shape.points) * 0.16

    // Si excede el ancho de la tela, salto de fila
    if (currentX + wCm + marginCm > fabricWidthCm) {
      currentX = marginCm
      currentY += maxRowHeight + marginCm
      maxRowHeight = 0
    }

    // Trasladar puntos a la nueva posición relativa en la tela
    const relPoints = shape.points.map(p => ({
      x: ((p.x - bbox.minX) * 0.4) + currentX,
      y: ((p.y - bbox.minY) * 0.4) + currentY
    }))

    nestedPieces.push({
      originalShape: shape,
      x: currentX,
      y: currentY,
      width: wCm,
      height: hCm,
      rotated: false,
      points: relPoints
    })

    totalUsedAreaSqCm += pieceArea
    maxRowHeight = Math.max(maxRowHeight, hCm)
    currentX += wCm + marginCm
    totalFabricLengthCm = Math.max(totalFabricLengthCm, currentY + hCm + marginCm)
  })

  const fabricLengthMeters = parseFloat((totalFabricLengthCm / 100).toFixed(2))
  const totalFabricAreaSqCm = fabricWidthCm * totalFabricLengthCm
  const rawEfficiency = (totalUsedAreaSqCm / totalFabricAreaSqCm) * 100
  const efficiencyPercentage = Math.min(95, Math.max(40, parseFloat((isNaN(rawEfficiency) ? 75 : rawEfficiency).toFixed(1))))
  const wastePercentage = parseFloat((100 - efficiencyPercentage).toFixed(1))

  return {
    fabricWidthCm,
    fabricLengthCm: parseFloat(totalFabricLengthCm.toFixed(1)),
    fabricLengthMeters,
    totalPiecesCount: shapes.length,
    usedAreaSqCm: parseFloat(totalUsedAreaSqCm.toFixed(1)),
    totalFabricAreaSqCm: parseFloat(totalFabricAreaSqCm.toFixed(1)),
    efficiencyPercentage,
    wastePercentage,
    nestedPieces
  }
}
