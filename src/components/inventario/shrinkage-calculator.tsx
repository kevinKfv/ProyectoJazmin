"use client"

import { useState } from "react"
import { Droplets, RefreshCw, ArrowRight, CheckCircle2, DollarSign, Calculator, Layers, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { applyFabricShrinkage } from "@/app/actions/inventario"

interface Material {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  costPerUnit: number
  shrinkageRatePct?: number | null
  usableQuantity?: number | null
}

interface ShrinkageCalculatorProps {
  materiales: Material[]
}

export function ShrinkageCalculator({ materiales }: ShrinkageCalculatorProps) {
  // Filter for fabric/tela category
  const telas = materiales.filter((m) => m.category.toLowerCase().includes("tela") || m.unit === "m")
  const selectedDefault = telas[0] || materiales[0]

  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(selectedDefault?.id || "")
  const selectedMat = materiales.find((m) => m.id === selectedMaterialId) || selectedDefault

  const [originalMeters, setOriginalMeters] = useState<number>(selectedMat?.quantity || 10)
  const [shrinkageRatePct, setShrinkageRatePct] = useState<number>(selectedMat?.shrinkageRatePct || 5)

  // Calculations
  const lostMeters = originalMeters * (shrinkageRatePct / 100)
  const netUsableMeters = Math.max(0, originalMeters - lostMeters)
  const originalUnitCost = selectedMat?.costPerUnit || 14.5
  const totalSpend = originalMeters * originalUnitCost
  const adjustedUnitCost = netUsableMeters > 0 ? totalSpend / netUsableMeters : originalUnitCost
  const costIncreasePct = originalUnitCost > 0 ? ((adjustedUnitCost - originalUnitCost) / originalUnitCost) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            Conversor de Unidades & Mermas por Encogimiento
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Calcula la merma exacta de tela por encogimiento/lavado previo y el ajuste real del costo unitario utilizable.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Card */}
        <Card className="lg:col-span-5 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Calculator className="h-4 w-4 text-blue-500" /> Parámetros del Lavado Previo
            </CardTitle>
            <CardDescription className="text-xs">
              Selecciona la tela y define el porcentaje de encogimiento esperado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <form action={applyFabricShrinkage} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="materialId">Seleccionar Tela del Inventario</Label>
                <select
                  id="materialId"
                  name="materialId"
                  value={selectedMaterialId}
                  onChange={(e) => {
                    setSelectedMaterialId(e.target.value)
                    const m = materiales.find((mat) => mat.id === e.target.value)
                    if (m) {
                      setOriginalMeters(m.quantity)
                      setShrinkageRatePct(m.shrinkageRatePct || 5)
                    }
                  }}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {materiales.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.quantity} {m.unit} @ ${m.costPerUnit}/{m.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="originalMeters">Metros Comprados</Label>
                  <Input
                    id="originalMeters"
                    name="originalMeters"
                    type="number"
                    step="0.1"
                    value={originalMeters}
                    onChange={(e) => setOriginalMeters(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="shrinkageRatePct">% Encogimiento (Merma)</Label>
                  <Input
                    id="shrinkageRatePct"
                    name="shrinkageRatePct"
                    type="number"
                    step="0.5"
                    value={shrinkageRatePct}
                    onChange={(e) => setShrinkageRatePct(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  id="recordMovement"
                  name="recordMovement"
                  defaultChecked
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="recordMovement" className="cursor-pointer text-xs font-normal">
                  Registrar automáticamente la salida por merma en el historial de inventario
                </Label>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <RefreshCw className="h-3.5 w-3.5 mr-2" /> Aplicar Merma al Inventario
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Metric Results Card */}
        <Card className="lg:col-span-7 border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-50/50 to-slate-50 dark:from-slate-900 dark:to-slate-900/60">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-500" /> Resultado del Recálculo de Stock y Costo
            </CardTitle>
            <CardDescription className="text-xs">
              Métricas corrigiendo la pérdida por lavado previo (Lino, Algodón, Seda, Lana).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="text-xs text-slate-400 font-medium">Metros Netos Útiles</div>
                <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                  {netUsableMeters.toFixed(2)} <span className="text-xs font-normal text-slate-400">{selectedMat?.unit || "m"}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Pérdida por lavado: <strong>-{lostMeters.toFixed(2)} {selectedMat?.unit || "m"}</strong> ({shrinkageRatePct}%).
                </p>
              </div>

              <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="text-xs text-slate-400 font-medium">Costo Original / Metro</div>
                <div className="text-2xl font-extrabold text-slate-700 dark:text-slate-300">
                  ${originalUnitCost.toFixed(2)}
                </div>
                <p className="text-[11px] text-slate-400">Inversión total: ${totalSpend.toFixed(2)}</p>
              </div>

              <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-blue-200 dark:border-blue-900 space-y-1">
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Costo Ajustado Real</div>
                <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                  ${adjustedUnitCost.toFixed(2)}
                </div>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                  Aumento de costo real: +{costIncreasePct.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Explanatory Banner */}
            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl p-4 text-xs text-blue-900 dark:text-blue-200 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-blue-800 dark:text-blue-300">
                <Droplets className="h-4 w-4 text-blue-500" /> Impacto en el Costeo del Proyecto:
              </div>
              <p className="text-blue-800 dark:text-blue-300">
                Al lavar previamente la tela <strong>{selectedMat?.name}</strong>, el costo real por metro útil pasa de <strong>${originalUnitCost.toFixed(2)}</strong> a <strong>${adjustedUnitCost.toFixed(2)}</strong>. SewStudio actualizará automáticamente tus proyectos para que no pierdas margen de ganancia.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
