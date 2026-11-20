import { Shape } from "@/store/pattern-editor-store"
import { SIZES, scaleShapeForSize } from "./grading-utils"

/**
 * Exporta el patrón a formato estándar DXF-AAMA para mesas de corte industrial
 */
export function exportToDXF(shapes: Shape[], patternTitle: string = "Patron_SewStudio"): string {
  let dxfContent = `0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n`

  shapes.forEach(shape => {
    if (!shape.points || shape.points.length === 0) return

    dxfContent += `0\nPOLYLINE\n8\n${shape.name.replace(/[^a-zA-Z0-9_]/g, "_")}\n66\n1\n70\n${shape.closed ? 1 : 0}\n`
    shape.points.forEach(pt => {
      dxfContent += `0\nVERTEX\n8\n${shape.name.replace(/[^a-zA-Z0-9_]/g, "_")}\n10\n${pt.x.toFixed(2)}\n20\n${(pt.y * -1).toFixed(2)}\n30\n0.0\n`
    })
    dxfContent += `0\nSEQEND\n`
  })

  dxfContent += `0\nENDSEC\n0\nEOF\n`
  return dxfContent
}

/**
 * Exporta el patrón a lenguaje PLT (HPGL) para plóters de patronaje
 */
export function exportToPLT(shapes: Shape[]): string {
  let pltCommands = `IN;SP1;` // Initialize, Select Pen 1

  shapes.forEach(shape => {
    if (!shape.points || shape.points.length === 0) return

    const firstPt = shape.points[0]
    // Pen Up to first point
    pltCommands += `PU${Math.round(firstPt.x * 10)},${Math.round(firstPt.y * 10)};`
    // Pen Down along rest of points
    pltCommands += `PD`
    shape.points.slice(1).forEach(pt => {
      pltCommands += `${Math.round(pt.x * 10)},${Math.round(pt.y * 10)},`
    })

    if (shape.closed) {
      pltCommands += `${Math.round(firstPt.x * 10)},${Math.round(firstPt.y * 10)};`
    } else {
      pltCommands = pltCommands.slice(0, -1) + `;`
    }
  })

  pltCommands += `PU;`
  return pltCommands
}

/**
 * Genera el documento SVG para exportación en PDF A0 en capas por talla
 */
export function generatePDFA0SVG(shapes: Shape[], title: string = "Patrón A0 Multi-Talla"): string {
  const widthA0 = 3370 // ~841mm en px (300dpi / escalado A0)
  const heightA0 = 4760 // ~1189mm en px

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${widthA0} ${heightA0}" width="841mm" height="1189mm">\n`
  svg += `<rect width="100%" height="100%" fill="#ffffff" />\n`
  svg += `<text x="100" y="100" font-family="sans-serif" font-size="36" font-weight="bold" fill="#1e293b">${title} - SewStudio PDF A0 Capas</text>\n`

  SIZES.forEach(size => {
    svg += `<g id="TALLA_${size}" inkscape:groupmode="layer" inkscape:label="Talla ${size}">\n`

    shapes.forEach(shape => {
      const scaledShape = scaleShapeForSize(shape, size)
      if (!scaledShape.points || scaledShape.points.length === 0) return

      const pathData = scaledShape.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + (scaledShape.closed ? ' Z' : '')
      svg += `  <path d="${pathData}" stroke="${scaledShape.stroke}" stroke-width="3" fill="none" stroke-dasharray="${size === 'M' ? 'none' : '6 3'}" />\n`
    })

    svg += `</g>\n`
  })

  svg += `</svg>`
  return svg
}

/**
 * Dispara la descarga directa de un archivo en el navegador
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
