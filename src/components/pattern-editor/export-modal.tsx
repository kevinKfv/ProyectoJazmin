"use client"

import React, { useState } from "react"
import { usePatternEditorStore } from "@/store/pattern-editor-store"
import { exportToDXF, exportToPLT, generatePDFA0SVG, downloadFile } from "@/lib/pattern-utils/exporter-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, FileCode, Printer, Layers, X, CheckCircle2, Scissors, Sparkles } from "lucide-react"

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  patternName?: string
}

export default function ExportModal({ isOpen, onClose, patternName = "Patron_Corte" }: ExportModalProps) {
  const { shapes } = usePatternEditorStore()
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null)

  if (!isOpen) return null

  const cleanName = patternName.replace(/[^a-zA-Z0-9_]/g, "_")

  const handleExportDXF = () => {
    const dxf = exportToDXF(shapes, cleanName)
    downloadFile(dxf, `${cleanName}_DXF_AAMA.dxf`, "application/dxf")
    setDownloadedFormat("DXF-AAMA")
  }

  const handleExportPLT = () => {
    const plt = exportToPLT(shapes)
    downloadFile(plt, `${cleanName}_Plotter.plt`, "text/plain")
    setDownloadedFormat("PLT (Plotter HPGL)")
  }

  const handleExportPDFA0 = () => {
    const svgContent = generatePDFA0SVG(shapes, patternName)
    downloadFile(svgContent, `${cleanName}_PDF_A0_Capas.svg`, "image/svg+xml")
    setDownloadedFormat("PDF A0 Multitalla")
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Exportación Industrial de Patronaje</h2>
              <p className="text-xs text-slate-500">Descarga en formatos compatibles con plóters y mesas de corte láser</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Format 1: DXF-AAMA */}
            <Card className="border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between">
              <CardContent className="p-4 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <FileCode className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">DXF-AAMA Industrial</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Compatible con Lectra, Gerber, Audaces y máquinas de corte láser.</p>
                </div>
                <Button onClick={handleExportDXF} size="sm" className="w-full text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                  <Download className="h-3.5 w-3.5" /> Descargar DXF
                </Button>
              </CardContent>
            </Card>

            {/* Format 2: PLT HPGL */}
            <Card className="border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between">
              <CardContent className="p-4 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                  <Printer className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">PLT (Plóter HPGL)</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Formato directo para impresoras vectoriales y plóters de patrones.</p>
                </div>
                <Button onClick={handleExportPLT} size="sm" className="w-full text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 text-white">
                  <Download className="h-3.5 w-3.5" /> Descargar PLT
                </Button>
              </CardContent>
            </Card>

            {/* Format 3: PDF A0 Capas */}
            <Card className="border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between">
              <CardContent className="p-4 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">PDF A0 Capas Multitalla</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Formato gigantografía A0 con capas organizadas por talla (XS a XXL).</p>
                </div>
                <Button onClick={handleExportPDFA0} size="sm" className="w-full text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Download className="h-3.5 w-3.5" /> Descargar A0
                </Button>
              </CardContent>
            </Card>
          </div>

          {downloadedFormat && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Archivo en formato {downloadedFormat} descargado exitosamente.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-slate-50 dark:bg-slate-850 flex justify-end">
          <Button variant="ghost" onClick={onClose} className="text-xs">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
