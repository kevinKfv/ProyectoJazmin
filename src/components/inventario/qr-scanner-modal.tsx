"use client"

import { useState } from "react"
import { QrCode, Camera, Scan, CheckCircle2, AlertCircle, Plus, Minus, Search, Printer, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { adjustStockByCode } from "@/app/actions/inventario"

interface Material {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  costPerUnit: number
  supplier?: string | null
  location?: string | null
  qrCode?: string | null
  barcode?: string | null
}

interface QrScannerModalProps {
  materiales: Material[]
}

export function QrScannerModal({ materiales }: QrScannerModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const [isScanningSim, setIsScanningSim] = useState(false)
  const [scannedItem, setScannedItem] = useState<Material | null>(null)
  const [adjustmentQty, setAdjustmentQty] = useState<number>(1)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleScanCode = async (codeToSearch: string) => {
    setFeedbackMsg(null)
    const found = materiales.find(
      (m) =>
        m.id === codeToSearch ||
        m.qrCode === codeToSearch ||
        m.barcode === codeToSearch ||
        m.name.toLowerCase().includes(codeToSearch.toLowerCase())
    )

    if (found) {
      setScannedItem(found)
    } else {
      try {
        const item = await adjustStockByCode(codeToSearch, 0)
        setScannedItem(item as unknown as Material)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Error al buscar código"
        setFeedbackMsg({ type: "error", text: errorMessage })
        setScannedItem(null)
      }
    }
  }

  const handleApplyMovement = async (delta: number) => {
    if (!scannedItem) return
    try {
      await adjustStockByCode(scannedItem.id, delta, `Ajuste escaneado (${delta > 0 ? "+" : ""}${delta} ${scannedItem.unit})`)
      setFeedbackMsg({
        type: "success",
        text: `¡Stock actualizado! Nuevo total: ${scannedItem.quantity + delta} ${scannedItem.unit}`
      })
      setScannedItem({ ...scannedItem, quantity: scannedItem.quantity + delta })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar stock"
      setFeedbackMsg({ type: "error", text: errorMessage })
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md font-medium"
      >
        <QrCode className="mr-2 h-4 w-4" /> Escáner QR / Código
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Scan className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Escáner de Inventario QR</h3>
                  <p className="text-xs text-slate-400">Escanea etiquetas fijadas en rollos o cajas de hilos</p>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setIsOpen(false)} className="h-8 w-8 text-slate-400">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Simulated Camera Viewfinder */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-indigo-500/40 p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[160px]">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-indigo-500/10 pointer-events-none animate-pulse" />
                <Camera className="h-10 w-10 text-indigo-400 animate-bounce" />
                <div className="text-xs text-slate-300 font-medium z-10">
                  Cámara en vivo escaneando... Apunta el código QR del rollo de tela
                </div>
                <div className="flex flex-wrap justify-center gap-1.5 z-10">
                  {materiales.slice(0, 4).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSearchInput(m.qrCode || m.id)
                        handleScanCode(m.qrCode || m.id)
                      }}
                      className="text-[11px] bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/50 px-2 py-0.5 rounded-full transition-colors"
                    >
                      Simular escaneo: {m.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Input Search */}
              <div className="space-y-2">
                <Label htmlFor="codeInput" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  O ingresa manualmente el código QR / Código de Barras
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="codeInput"
                      placeholder="Ej: QR-TELA-LINO-001 o MAT-102"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && searchInput) {
                          handleScanCode(searchInput)
                        }
                      }}
                      className="pl-9 text-xs"
                    />
                  </div>
                  <Button onClick={() => searchInput && handleScanCode(searchInput)} className="bg-indigo-600 text-white text-xs">
                    Buscar
                  </Button>
                </div>
              </div>

              {/* Feedback messages */}
              {feedbackMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    feedbackMsg.type === "success"
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200"
                      : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200"
                  }`}
                >
                  {feedbackMsg.type === "success" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-red-500" />}
                  <span>{feedbackMsg.text}</span>
                </div>
              )}

              {/* Scanned Result & Quick Stock Adjuster */}
              {scannedItem && (
                <Card className="border-indigo-200 dark:border-indigo-900 bg-indigo-50/20 dark:bg-indigo-950/20">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full">
                          {scannedItem.category}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base mt-1">{scannedItem.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Ubicación: {scannedItem.location || "General"}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Stock Actual</div>
                        <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                          {scannedItem.quantity} {scannedItem.unit}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-indigo-100 dark:border-indigo-900/60 pt-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Entrada / Salida Rápida:</span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={adjustmentQty}
                          onChange={(e) => setAdjustmentQty(parseFloat(e.target.value) || 1)}
                          className="w-16 h-8 text-center text-xs"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApplyMovement(-Math.abs(adjustmentQty))}
                          className="h-8 border-red-200 hover:bg-red-50 text-red-600"
                        >
                          <Minus className="h-3.5 w-3.5 mr-1" /> Salida
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApplyMovement(Math.abs(adjustmentQty))}
                          className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" /> Entrada
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
