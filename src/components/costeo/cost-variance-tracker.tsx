"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle2, TrendingUp, Clock, Package, DollarSign, Save, Edit3, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { saveProjectCostEstimation } from "@/app/actions/costeo"

interface ProjectMaterial {
  quantityUsed: number
  material: {
    name: string
    costPerUnit: number
    unit: string
  }
}

interface ProjectEquipment {
  hoursUsed: number
  equipment: {
    name: string
    hourlyRate: number
  }
}

interface Project {
  id: string
  name: string
  status: string
  category?: string | null
  estimatedHours?: number | null
  actualHours?: number | null
  estimatedMaterialsCost?: number | null
  estimatedTotalCost?: number | null
  totalCost?: number | null
  actualMaterialsCost?: number | null
  equipmentCosts?: number | null
  overheadCosts?: number | null
  hourlyLaborRate?: number | null
  materials: ProjectMaterial[]
  equipments: ProjectEquipment[]
}

interface CostVarianceTrackerProps {
  projects: Project[]
  defaultLaborRate: number
}

export function CostVarianceTracker({ projects, defaultLaborRate }: CostVarianceTrackerProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Control de Variaciones de Costo Presupuestario
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitorea en tiempo real las desviaciones entre el costo estimado inicial y el costo real ejecutado.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {projects.map((project) => {
          const estimatedCost = project.estimatedTotalCost || 0
          const realCost = project.totalCost || 0
          const variance = realCost - estimatedCost
          const isOverBudget = estimatedCost > 0 && variance > 0.01
          const variancePct = estimatedCost > 0 ? (variance / estimatedCost) * 100 : 0

          // Calculate causes of variance
          const estimatedHours = project.estimatedHours || 0
          const actualHours = project.actualHours || 0
          const extraHours = Math.max(0, actualHours - estimatedHours)
          const laborRate = project.hourlyLaborRate || defaultLaborRate || 15
          const extraHoursCost = extraHours * laborRate

          const estimatedMat = project.estimatedMaterialsCost || 0
          const actualMat = project.actualMaterialsCost || 0
          const extraMatCost = Math.max(0, actualMat - estimatedMat)

          const isEditingThis = selectedProjectId === project.id

          return (
            <Card
              key={project.id}
              className={`border transition-all shadow-sm ${
                isOverBudget
                  ? "border-red-300 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10"
                  : estimatedCost > 0
                  ? "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/10 dark:bg-emerald-950/5"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">{project.name}</h4>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {project.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Categoría: {project.category || "General"}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    {estimatedCost > 0 ? (
                      isOverBudget ? (
                        <div className="bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-xl flex items-center gap-2 text-red-700 dark:text-red-300 font-bold text-xs">
                          <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                          <span>⚠️ Sobrecosto: +${variance.toFixed(2)} (+{variancePct.toFixed(1)}%)</span>
                        </div>
                      ) : (
                        <div className="bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span>En Presupuesto (Diferencia: ${variance.toFixed(2)})</span>
                        </div>
                      )
                    ) : (
                      <span className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200">
                        Sin Presupuesto Estimado
                      </span>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProjectId(isEditingThis ? null : project.id)}
                    >
                      <Edit3 className="h-3.5 w-3.5 mr-1" />
                      {isEditingThis ? "Cerrar Estimación" : "Editar Presupuesto"}
                    </Button>
                  </div>
                </div>

                {/* Form to update estimation */}
                {isEditingThis && (
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <h5 className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                      Establecer Presupuesto Estimado Inicial
                    </h5>
                    <form
                      action={async (formData) => {
                        await saveProjectCostEstimation(formData)
                        setSelectedProjectId(null)
                      }}
                      className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
                    >
                      <input type="hidden" name="projectId" value={project.id} />
                      <div className="space-y-1">
                        <Label htmlFor="estimatedLaborHours" className="text-[11px]">Horas Estimadas</Label>
                        <Input
                          id="estimatedLaborHours"
                          name="estimatedLaborHours"
                          type="number"
                          step="0.1"
                          defaultValue={project.estimatedHours || 0}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="estimatedMaterialsCost" className="text-[11px]">Insumos Estimados ($)</Label>
                        <Input
                          id="estimatedMaterialsCost"
                          name="estimatedMaterialsCost"
                          type="number"
                          step="0.1"
                          defaultValue={project.estimatedMaterialsCost || 0}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="hourlyLaborRate" className="text-[11px]">Tarifa Hora ($/h)</Label>
                        <Input
                          id="hourlyLaborRate"
                          name="hourlyLaborRate"
                          type="number"
                          step="0.1"
                          defaultValue={project.hourlyLaborRate || defaultLaborRate}
                          required
                        />
                      </div>
                      <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Save className="h-3.5 w-3.5 mr-1" /> Guardar Presupuesto
                      </Button>
                    </form>
                  </div>
                )}

                {/* Detailed Comparison Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1 text-xs">
                    <div className="text-slate-400 font-medium">Costo Presupuestado Inicial</div>
                    <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                      ${estimatedCost.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {project.estimatedHours || 0}h estimadas + ${project.estimatedMaterialsCost || 0} insumos
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1 text-xs">
                    <div className="text-slate-400 font-medium">Costo Real Ejecutado</div>
                    <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      ${realCost.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {project.actualHours || 0}h reales + ${project.actualMaterialsCost || 0} insumos
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1 text-xs">
                    <div className="text-slate-400 font-medium">Desviación (Variación)</div>
                    <div className={`text-lg font-bold ${isOverBudget ? "text-red-600 dark:text-red-400" : "text-emerald-600"}`}>
                      {variance > 0 ? `+$${variance.toFixed(2)}` : `$${variance.toFixed(2)}`}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isOverBudget ? "Sobrepasó el estimado inicial" : "Dentro del límite presupuestado"}
                    </div>
                  </div>
                </div>

                {/* Overbudget Cause Analysis Banner */}
                {isOverBudget && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-xl p-3.5 text-xs text-red-900 dark:text-red-200 space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-red-700 dark:text-red-300">
                      <AlertTriangle className="h-4 w-4" /> Desglose del Sobrecosto Detectado:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-red-800 dark:text-red-300">
                      {extraHours > 0 && (
                        <li>
                          <strong>Horas de trabajo extra:</strong> Se trabajaron {extraHours.toFixed(1)} horas adicionales a las {estimatedHours}h estimadas iniciales (Costo adicional: +${extraHoursCost.toFixed(2)}).
                        </li>
                      )}
                      {extraMatCost > 0 && (
                        <li>
                          <strong>Insumos y materiales extra:</strong> Se consumió un adicional de +${extraMatCost.toFixed(2)} en materiales respecto al estimado.
                        </li>
                      )}
                      {extraHours === 0 && extraMatCost === 0 && (
                        <li>
                          <strong>Ajuste de máquinas o gastos fijos:</strong> El sobrecosto se debe a horas de maquinaria o prorrateo de taller asignado.
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
