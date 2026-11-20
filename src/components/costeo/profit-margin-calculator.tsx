"use client"

import { useState } from "react"
import { Calculator, TrendingUp, DollarSign, PieChart, Layers, Tag, ArrowUpRight, Percent, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface Equipment {
  id: string
  name: string
  hourlyRate: number
}

interface ProfitMarginCalculatorProps {
  equipments: Equipment[]
  hourlyOverheadRate: number
  defaultLaborRate: number
  defaultWholesaleMargin: number
  defaultRetailMargin: number
}

export function ProfitMarginCalculator({
  equipments,
  hourlyOverheadRate,
  defaultLaborRate,
  defaultWholesaleMargin,
  defaultRetailMargin,
}: ProfitMarginCalculatorProps) {
  // Input states
  const [materialsCost, setMaterialsCost] = useState<number>(35)
  const [laborHours, setLaborHours] = useState<number>(4.5)
  const [laborRate, setLaborRate] = useState<number>(defaultLaborRate || 15)
  const [selectedMachineId, setSelectedMachineId] = useState<string>(equipments[0]?.id || "")
  const [machineHours, setMachineHours] = useState<number>(3.5)

  // Margins
  const [wholesaleMarginPct, setWholesaleMarginPct] = useState<number>(defaultWholesaleMargin || 40)
  const [retailMarginPct, setRetailMarginPct] = useState<number>(defaultRetailMargin || 100)

  // Selected Machine Rate
  const activeMachine = equipments.find((e) => e.id === selectedMachineId) || equipments[0]
  const machineHourlyRate = activeMachine?.hourlyRate || 0

  // Calculations
  const totalLaborCost = laborHours * laborRate
  const totalEquipmentCost = machineHours * machineHourlyRate
  const totalOverheadCost = laborHours * hourlyOverheadRate

  const totalProductionCost = materialsCost + totalLaborCost + totalEquipmentCost + totalOverheadCost

  // Suggested Prices
  const wholesalePrice = totalProductionCost * (1 + wholesaleMarginPct / 100)
  const wholesaleProfit = wholesalePrice - totalProductionCost

  const retailPrice = totalProductionCost * (1 + retailMarginPct / 100)
  const retailProfit = retailPrice - totalProductionCost

  // Percentages for stacked graphic bars
  const maxPriceVal = Math.max(retailPrice, 1)
  const costPct = (totalProductionCost / maxPriceVal) * 100
  const wholesalePct = (wholesalePrice / maxPriceVal) * 100
  const retailPct = 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Calculator className="h-5 w-5 text-emerald-500" />
            Calculadora de Margen de Ganancia Comercial
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Simula costos de producción e insumos y compara gráficamente tus precios mayoristas y minoristas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Section */}
        <Card className="lg:col-span-5 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-500" /> Parámetros de Costo de Prenda
            </CardTitle>
            <CardDescription className="text-xs">
              Ingresa los insumos y horas estimadas para simular el costo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="materialsCost">Costo Total Insumos / Materiales ($)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                <Input
                  id="materialsCost"
                  type="number"
                  step="0.1"
                  value={materialsCost}
                  onChange={(e) => setMaterialsCost(parseFloat(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="laborHours">Horas Mano Obra</Label>
                <Input
                  id="laborHours"
                  type="number"
                  step="0.1"
                  value={laborHours}
                  onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="laborRate">Tarifa Hora ($/h)</Label>
                <Input
                  id="laborRate"
                  type="number"
                  step="0.1"
                  value={laborRate}
                  onChange={(e) => setLaborRate(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="machine">Máquina Principal</Label>
                <select
                  id="machine"
                  value={selectedMachineId}
                  onChange={(e) => setSelectedMachineId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {equipments.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} (${eq.hourlyRate.toFixed(2)}/h)
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="machineHours">Horas de Máquina</Label>
                <Input
                  id="machineHours"
                  type="number"
                  step="0.1"
                  value={machineHours}
                  onChange={(e) => setMachineHours(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label className="font-semibold text-slate-700 dark:text-slate-300">Margen Mayorista (%)</Label>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">{wholesaleMarginPct}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="150"
                  value={wholesaleMarginPct}
                  onChange={(e) => setWholesaleMarginPct(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label className="font-semibold text-slate-700 dark:text-slate-300">Margen Minorista (%)</Label>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">{retailMarginPct}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="250"
                  value={retailMarginPct}
                  onChange={(e) => setRetailMarginPct(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Graphical Comparison Section */}
        <Card className="lg:col-span-7 border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-900/60">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" /> Comparativa Gráfica Comercial
            </CardTitle>
            <CardDescription className="text-xs">
              Visualización intuitiva del Costo Base frente a los Precios Sugeridos Mayorista y Minorista.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Visual Graphic Bars */}
            <div className="space-y-4 bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              {/* Item 1: Costo Base */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-slate-500"></span> Costo Real Producción
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">${totalProductionCost.toFixed(2)}</span>
                </div>
                <div className="h-5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-slate-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(costPct, 5)}%` }}
                  />
                </div>
              </div>

              {/* Item 2: Venta Mayorista */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-emerald-500"></span> Precio Sugerido Venta Mayorista
                  </span>
                  <span className="font-bold">${wholesalePrice.toFixed(2)}</span>
                </div>
                <div className="h-5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 relative">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                    style={{ width: `${Math.max(wholesalePct, 5)}%` }}
                  >
                    +{wholesaleMarginPct}%
                  </div>
                </div>
              </div>

              {/* Item 3: Venta Minorista */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-indigo-500"></span> Precio Sugerido Venta Minorista
                  </span>
                  <span className="font-bold">${retailPrice.toFixed(2)}</span>
                </div>
                <div className="h-5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                    style={{ width: `${Math.max(retailPct, 5)}%` }}
                  >
                    +{retailMarginPct}%
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Cost Breakdown & Profit Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-200/60 dark:border-emerald-900/50 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                  <span>Ganancia Mayorista</span>
                  <Tag className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  +${wholesaleProfit.toFixed(2)}
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Ganancia neta por unidad en volumen.
                </p>
              </div>

              <div className="bg-indigo-50/60 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-200/60 dark:border-indigo-900/50 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-indigo-900 dark:text-indigo-300">
                  <span>Ganancia Minorista</span>
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                </div>
                <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  +${retailProfit.toFixed(2)}
                </div>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-400">
                  Ganancia neta por unidad venta directa.
                </p>
              </div>
            </div>

            {/* Cost Breakdown Details Pill */}
            <div className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1">
              <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Composición del Costo Real (${totalProductionCost.toFixed(2)}):</div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>• Insumos: ${materialsCost.toFixed(2)}</div>
                <div>• Mano de obra: ${totalLaborCost.toFixed(2)}</div>
                <div>• Amortización / Luz: ${totalEquipmentCost.toFixed(2)}</div>
                <div>• Gastos Fijos: ${totalOverheadCost.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
