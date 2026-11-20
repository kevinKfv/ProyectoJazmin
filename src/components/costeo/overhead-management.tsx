"use client"

import { useState } from "react"
import { Building2, DollarSign, Clock, Plus, Trash2, Edit2, Settings2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { upsertFixedExpense, deleteFixedExpense, updateWorkshopSettings } from "@/app/actions/costeo"

interface FixedExpense {
  id: string
  name: string
  monthlyCost: number
}

interface WorkshopSettings {
  id: string
  monthlyWorkingHours: number
  hourlyLaborRate: number
  electricityRateKwh: number
  wholesaleMarginPct: number
  retailMarginPct: number
}

interface OverheadManagementProps {
  fixedExpenses: FixedExpense[]
  settings: WorkshopSettings | null
  totalMonthlyOverhead: number
  hourlyOverheadRate: number
}

export function OverheadManagement({
  fixedExpenses,
  settings,
  totalMonthlyOverhead,
  hourlyOverheadRate,
}: OverheadManagementProps) {
  const [isEditingExpense, setIsEditingExpense] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<FixedExpense | null>(null)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metric Cards Summary */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl border-none">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-400" /> Total Gastos Fijos
              </span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                Mensual
              </span>
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-emerald-400">
              ${totalMonthlyOverhead.toFixed(2)} <span className="text-sm font-normal text-slate-400">/ mes</span>
            </div>
            <p className="text-xs text-slate-400">
              Suma de alquiler, luz, agua, internet y gastos administrativos mensuales del taller.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white shadow-xl border-none">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" /> Horas Trabajadas Taller
              </span>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-semibold">
                Capacidad
              </span>
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-indigo-300">
              {settings?.monthlyWorkingHours || 160} <span className="text-sm font-normal text-slate-400">hrs / mes</span>
            </div>
            <p className="text-xs text-slate-400">
              Basado en {((settings?.monthlyWorkingHours || 160) / 4 / 5).toFixed(1)} horas diarias de confección activa.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white shadow-xl border-none">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-400" /> Prorrateo Gasto Fijo / Hora
              </span>
              <span className="text-xs bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-semibold">
                Distribuido
              </span>
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-teal-300">
              ${hourlyOverheadRate.toFixed(2)} <span className="text-sm font-normal text-slate-400">/ hora</span>
            </div>
            <p className="text-xs text-slate-400">
              Este valor se suma al costo por hora de cada proyecto confeccionado.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fixed Expenses List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-tight">Gastos Fijos del Taller</h3>
            <Button
              onClick={() => {
                setSelectedExpense(null)
                setIsEditingExpense(true)
              }}
              size="sm"
              variant="outline"
              className="border-slate-300"
            >
              <Plus className="h-4 w-4 mr-1" /> Agregar Gasto Fijo
            </Button>
          </div>

          {isEditingExpense && (
            <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-950/10">
              <CardContent className="p-4">
                <form action={async (formData) => {
                  await upsertFixedExpense(formData)
                  setIsEditingExpense(false)
                  setSelectedExpense(null)
                }} className="flex flex-col sm:flex-row gap-4 items-end">
                  {selectedExpense && <input type="hidden" name="id" value={selectedExpense.id} />}
                  
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="expenseName">Concepto / Nombre</Label>
                    <Input
                      id="expenseName"
                      name="name"
                      placeholder="Ej: Alquiler del local"
                      defaultValue={selectedExpense?.name || ""}
                      required
                    />
                  </div>

                  <div className="w-full sm:w-44 space-y-1">
                    <Label htmlFor="monthlyCost">Costo Mensual ($)</Label>
                    <Input
                      id="monthlyCost"
                      name="monthlyCost"
                      type="number"
                      step="0.01"
                      placeholder="250.00"
                      defaultValue={selectedExpense?.monthlyCost || ""}
                      required
                    />
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsEditingExpense(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      Guardar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            {fixedExpenses.map((fe) => (
              <div key={fe.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{fe.name}</h4>
                    <p className="text-xs text-slate-400">Gastos fijos mensuales</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    ${fe.monthlyCost.toFixed(2)}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-slate-400 hover:text-slate-700"
                      onClick={() => {
                        setSelectedExpense(fe)
                        setIsEditingExpense(true)
                      }}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <form action={async () => {
                      if (confirm(`¿Eliminar gasto ${fe.name}?`)) {
                        await deleteFixedExpense(fe.id)
                      }
                    }}>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600" type="submit">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workshop Settings Form */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-indigo-500" /> Configuración del Taller
            </CardTitle>
            <CardDescription className="text-xs">
              Ajusta parámetros generales de mano de obra y tarifa eléctrica.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateWorkshopSettings} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="monthlyWorkingHours">Horas Trabajadas por Mes</Label>
                <Input
                  id="monthlyWorkingHours"
                  name="monthlyWorkingHours"
                  type="number"
                  defaultValue={settings?.monthlyWorkingHours || 160}
                  required
                />
                <p className="text-[11px] text-slate-400">Total de horas productivas del taller al mes.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hourlyLaborRate">Tarifa Base Mano de Obra ($/hr)</Label>
                <Input
                  id="hourlyLaborRate"
                  name="hourlyLaborRate"
                  type="number"
                  step="0.1"
                  defaultValue={settings?.hourlyLaborRate || 15}
                  required
                />
                <p className="text-[11px] text-slate-400">Costo por hora de la costurera/modista.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="electricityRateKwh">Tarifa de Luz por kWh ($)</Label>
                <Input
                  id="electricityRateKwh"
                  name="electricityRateKwh"
                  type="number"
                  step="0.01"
                  defaultValue={settings?.electricityRateKwh || 0.15}
                  required
                />
                <p className="text-[11px] text-slate-400">Costo de energía eléctrica por kilovatio hora.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <Label htmlFor="wholesaleMarginPct">Margen Mayorista (%)</Label>
                  <Input
                    id="wholesaleMarginPct"
                    name="wholesaleMarginPct"
                    type="number"
                    defaultValue={settings?.wholesaleMarginPct || 40}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="retailMarginPct">Margen Minorista (%)</Label>
                  <Input
                    id="retailMarginPct"
                    name="retailMarginPct"
                    type="number"
                    defaultValue={settings?.retailMarginPct || 100}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800">
                Guardar Ajustes Taller
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
