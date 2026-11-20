"use client"

import React, { useState } from "react"
import { createQuote, updateQuotePaymentStatus, deleteQuote } from "@/app/actions/clientes"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Printer, Plus, Trash2, CheckCircle2, DollarSign, Scissors, ShieldAlert, Sparkles } from "lucide-react"

interface QuoteItem {
  description: string
  quantity: number
  price: number
  total: number
}

interface QuoteData {
  id: string
  quoteNumber: string
  date: Date | string
  itemsJson: string
  subtotal: number
  discount: number
  total: number
  depositPaid: number
  balanceDue: number
  paymentStatus: string
  status: string
  notes?: string | null
}

interface QuotePdfBuilderProps {
  clientId: string
  clientName: string
  clientEmail?: string | null
  clientPhone?: string | null
  clientAddress?: string | null
  quotes: QuoteData[]
}

export function QuotePdfBuilder({
  clientId,
  clientName,
  clientEmail,
  clientPhone,
  clientAddress,
  quotes = []
}: QuotePdfBuilderProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [activePrintQuote, setActivePrintQuote] = useState<QuoteData | null>(null)
  
  // New Quote Form State
  const [items, setItems] = useState<QuoteItem[]>([
    { description: "Confección a medida (Diseño y Muestra)", quantity: 1, price: 150000, total: 150000 },
    { description: "Materiales y telas principales", quantity: 1, price: 50000, total: 50000 },
  ])
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState("Seña del 50% requerida para iniciar la confección. Saldo restante contra entrega final.")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items]
    const updatedItem = { ...newItems[index], [field]: value }
    if (field === "quantity" || field === "price") {
      const q = field === "quantity" ? parseFloat(value) || 0 : updatedItem.quantity
      const p = field === "price" ? parseFloat(value) || 0 : updatedItem.price
      updatedItem.total = q * p
    }
    newItems[index] = updatedItem
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0, total: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0)
  const total = Math.max(0, subtotal - discount)
  const deposit50 = total * 0.5
  const balanceDue = total - deposit50

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("clientId", clientId)
      formData.append("quoteNumber", `PRES-${Date.now().toString().slice(-6)}`)
      formData.append("itemsJson", JSON.stringify(items))
      formData.append("subtotal", subtotal.toString())
      formData.append("discount", discount.toString())
      formData.append("total", total.toString())
      formData.append("depositPaid", deposit50.toString())
      formData.append("balanceDue", balanceDue.toString())
      formData.append("paymentStatus", "SENA_50")
      formData.append("notes", notes)
      
      await createQuote(formData)
      setShowCreate(false)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentStatusUpdate = async (quoteId: string, status: string) => {
    try {
      await updateQuotePaymentStatus(quoteId, status)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (quoteId: string) => {
    if (confirm("¿Seguro que deseas eliminar este presupuesto?")) {
      await deleteQuote(quoteId)
    }
  }

  const parseItems = (itemsJson: string): QuoteItem[] => {
    try {
      return JSON.parse(itemsJson)
    } catch {
      return []
    }
  }

  const triggerPrint = (quote: QuoteData) => {
    setActivePrintQuote(quote)
    setTimeout(() => {
      window.print()
    }, 300)
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Presupuestos & Cotizaciones en PDF
              </CardTitle>
              <CardDescription>Generación de cotizaciones formales con registro de Seña del 50% y Saldo pendiente</CardDescription>
            </div>

            <Button
              onClick={() => setShowCreate(!showCreate)}
              className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" /> Crear Presupuesto
            </Button>
          </div>
        </CardHeader>

        {showCreate && (
          <CardContent className="border-t border-slate-100 dark:border-slate-800 pt-4 bg-slate-50/50 dark:bg-slate-900/40">
            <form onSubmit={handleCreateQuote} className="space-y-5">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Detalle de Ítems y Servicios</h4>

              {/* Items Rows */}
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="col-span-6 sm:col-span-6">
                      <Label className="text-[10px] text-slate-400">Descripción / Prenda</Label>
                      <Input
                        placeholder="Ej. Confección Vestido de Fiesta en Seda"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                        required
                        className="text-xs h-8"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-2">
                      <Label className="text-[10px] text-slate-400">Cant.</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-3">
                      <Label className="text-[10px] text-slate-400">Precio Unit. ($)</Label>
                      <Input
                        type="number"
                        step="100"
                        value={item.price}
                        onChange={(e) => handleItemChange(idx, "price", e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                    <div className="col-span-1 text-right pt-4">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addItem} className="text-xs gap-1">
                  <Plus className="h-3.5 w-3.5" /> Agregar Ítem
                </Button>
              </div>

              {/* Totals Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <Label className="text-xs font-semibold">Descuento ($)</Label>
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="mt-1 text-xs bg-white dark:bg-slate-950"
                  />
                </div>

                <div className="sm:col-span-2 bg-purple-50 dark:bg-purple-950/30 p-3 rounded-xl border border-purple-200 dark:border-purple-800 space-y-1">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${subtotal.toLocaleString("es-AR")}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span>Total Final:</span>
                    <span className="font-bold text-sm text-purple-700 dark:text-purple-300">${total.toLocaleString("es-AR")}</span>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-700 dark:text-emerald-400 pt-1 border-t border-purple-200 dark:border-purple-800/60 font-semibold">
                    <span>Seña del 50% requerida:</span>
                    <span>${deposit50.toLocaleString("es-AR")}</span>
                  </div>
                  <div className="flex justify-between text-xs text-amber-700 dark:text-amber-400 font-semibold">
                    <span>Saldo pendiente a la entrega:</span>
                    <span>${balanceDue.toLocaleString("es-AR")}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Notas / Condición de Pago</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 text-xs bg-white dark:bg-slate-950"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreate(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} size="sm" className="bg-primary text-white">
                  {isSubmitting ? "Guardando..." : "Guardar Presupuesto"}
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Existing Quotes List */}
      {quotes.length === 0 ? (
        <Card className="border-dashed border-slate-300 dark:border-slate-800 print:hidden">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <DollarSign className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">Sin presupuestos emitidos</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Crea una cotización formal para calcular la seña del 50% y generar el PDF para el cliente antes de confeccionar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 print:hidden">
          {quotes.map((q) => {
            const itemsList = parseItems(q.itemsJson)
            return (
              <Card key={q.id} className="border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-bold text-primary">{q.quoteNumber}</span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        Presupuesto de Confección
                      </h4>
                      <span suppressHydrationWarning className="text-xs text-slate-400">
                        Fecha: {new Date(q.date).toLocaleDateString("es-AR").replace(/\s/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Payment Status Dropdown */}
                      <select
                        value={q.paymentStatus}
                        onChange={(e) => handlePaymentStatusUpdate(q.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border shadow-2xs ${
                          q.paymentStatus === "PAGADO_TOTAL" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                          q.paymentStatus === "SENA_50" ? "bg-purple-100 text-purple-800 border-purple-300" :
                          "bg-amber-100 text-amber-800 border-amber-300"
                        }`}
                      >
                        <option value="PENDIENTE">PENDIENTE (Sin seña)</option>
                        <option value="SENA_50">SEÑA 50% PAGADA</option>
                        <option value="PAGADO_TOTAL">PAGADO 100% (TOTAL)</option>
                      </select>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => triggerPrint(q)}
                        className="gap-1.5 text-xs font-semibold"
                      >
                        <Printer className="h-3.5 w-3.5" /> PDF / Imprimir
                      </Button>

                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Items Preview Table */}
                  <div className="space-y-1">
                    {itemsList.map((it, i) => (
                      <div key={i} className="flex justify-between text-xs text-slate-600 dark:text-slate-300 py-1 border-b border-slate-50 dark:border-slate-900">
                        <span>{it.quantity}x {it.description}</span>
                        <span className="font-medium">${it.total?.toLocaleString("es-AR")}</span>
                      </div>
                    ))}
                  </div>

                  {/* Amount Breakdown */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 block">Total Cotizado:</span>
                      <span className="font-bold text-slate-900 dark:text-white">${q.total.toLocaleString("es-AR")}</span>
                    </div>
                    <div>
                      <span className="text-purple-600 dark:text-purple-400 font-medium block">Seña 50%:</span>
                      <span className="font-bold text-purple-700 dark:text-purple-300">${q.depositPaid.toLocaleString("es-AR")}</span>
                    </div>
                    <div>
                      <span className="text-amber-600 dark:text-amber-400 font-medium block">Saldo a Entrega:</span>
                      <span className="font-bold text-amber-700 dark:text-amber-300">${q.balanceDue.toLocaleString("es-AR")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Hidden PDF / Printable Layout */}
      {activePrintQuote && (
        <div className="hidden print:block fixed inset-0 bg-white text-slate-900 p-8 z-50">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Studio Header */}
            <div className="flex justify-between items-start border-b border-slate-300 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                  <Scissors className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">SewStudio Confección</h1>
                  <p className="text-xs text-slate-500">Diseño, Alta Costura & Patronaje A Medida</p>
                </div>
              </div>

              <div className="text-right">
                <h2 className="text-lg font-bold text-purple-700">{activePrintQuote.quoteNumber}</h2>
                <p className="text-xs text-slate-500">Fecha: {new Date(activePrintQuote.date).toLocaleDateString("es-AR")}</p>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-bold block mb-1">Cliente</span>
                <p className="font-bold text-sm text-slate-900">{clientName}</p>
                {clientEmail && <p className="text-slate-600">{clientEmail}</p>}
                {clientPhone && <p className="text-slate-600">Tel: {clientPhone}</p>}
              </div>
              <div className="text-right">
                <span className="text-slate-400 uppercase font-bold block mb-1">Dirección de Entrega</span>
                <p className="text-slate-700">{clientAddress || "En Estudio Principal"}</p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase">
                  <th className="p-2">Descripción del Servicio / Confección</th>
                  <th className="p-2 text-center">Cantidad</th>
                  <th className="p-2 text-right">Precio Unit.</th>
                  <th className="p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {parseItems(activePrintQuote.itemsJson).map((it, i) => (
                  <tr key={i}>
                    <td className="p-2 font-medium">{it.description}</td>
                    <td className="p-2 text-center">{it.quantity}</td>
                    <td className="p-2 text-right">${it.price?.toLocaleString("es-AR")}</td>
                    <td className="p-2 text-right font-bold">${it.total?.toLocaleString("es-AR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Breakdown Box */}
            <div className="flex justify-end pt-4">
              <div className="w-64 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-semibold">${activePrintQuote.subtotal?.toLocaleString("es-AR")}</span>
                </div>
                {activePrintQuote.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Descuento:</span>
                    <span>-${activePrintQuote.discount?.toLocaleString("es-AR")}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm border-t border-slate-300 pt-2 text-slate-900">
                  <span>TOTAL ESTIMADO:</span>
                  <span className="text-purple-700">${activePrintQuote.total?.toLocaleString("es-AR")}</span>
                </div>
                <div className="flex justify-between text-purple-700 font-bold pt-1 border-t border-slate-200">
                  <span>Seña Requerida (50%):</span>
                  <span>${activePrintQuote.depositPaid?.toLocaleString("es-AR")}</span>
                </div>
                <div className="flex justify-between text-slate-700 font-semibold">
                  <span>Saldo a la Entrega:</span>
                  <span>${activePrintQuote.balanceDue?.toLocaleString("es-AR")}</span>
                </div>
              </div>
            </div>

            {/* Terms and Notes */}
            <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-700">Condiciones de Trabajo:</p>
              <p>• La confección se inicia una vez acreditada la seña del 50%.</p>
              <p>• El saldo del 50% restante se abona en la prueba final al momento de retirar la prenda.</p>
              <p>• Validez del presupuesto: 15 días corridos a partir de la fecha de emisión.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
