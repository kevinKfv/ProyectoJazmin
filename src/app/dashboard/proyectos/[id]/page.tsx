import { db } from "@/lib/db"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Cpu, Plus, Trash2, AlertTriangle, CheckCircle2, TrendingUp, Tag, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { updateProjectCost } from "@/app/actions/proyectos"
import { addEquipmentToProject, removeEquipmentFromProject, saveProjectCostEstimation } from "@/app/actions/costeo"

export default async function ProyectoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const project = await db.project.findUnique({
    where: { 
      id,
      userId: session.user.id
    },
    include: {
      materials: {
        include: {
          material: true
        }
      },
      equipments: {
        include: {
          equipment: true
        }
      }
    }
  })

  if (!project) {
    return <div>Proyecto no encontrado</div>
  }

  const userEquipments = await db.equipment.findMany({
    where: { userId: session.user.id }
  })

  const settings = await db.workshopSettings.findUnique({
    where: { userId: session.user.id }
  })

  const fixedExpenses = await db.fixedExpense.findMany({
    where: { userId: session.user.id }
  })

  const totalFixedMonthly = fixedExpenses.reduce((acc, f) => acc + f.monthlyCost, 0)
  const hourlyOverhead = settings && settings.monthlyWorkingHours > 0 ? totalFixedMonthly / settings.monthlyWorkingHours : 0

  // Cost variance calculations
  const estimatedCost = project.estimatedTotalCost || 0
  const realCost = project.totalCost || 0
  const variance = realCost - estimatedCost
  const isOverBudget = estimatedCost > 0 && variance > 0.01
  const variancePct = estimatedCost > 0 ? (variance / estimatedCost) * 100 : 0

  const actualHours = project.actualHours || 0
  const estimatedHours = project.estimatedHours || 0
  const extraHours = Math.max(0, actualHours - estimatedHours)
  
  const actualMaterialsCost = project.actualMaterialsCost || project.materials.reduce((acc, pm) => acc + (pm.quantityUsed * pm.material.costPerUnit), 0)
  const estimatedMaterialsCost = project.estimatedMaterialsCost || 0
  const extraMaterialsCost = Math.max(0, actualMaterialsCost - estimatedMaterialsCost)

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center space-x-2 mb-6">
        <Link href="/dashboard/proyectos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{project.name}</h2>
          <p className="text-muted-foreground">{project.status} | {project.category}</p>
        </div>
      </div>

      {/* Cost Variance Alert Header Banner */}
      {estimatedCost > 0 && isOverBudget && (
        <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 font-bold text-red-700 dark:text-red-300 text-lg">
              <AlertTriangle className="h-6 w-6 text-red-500 animate-pulse" />
              <span>Alerta de Variación Presupuestaria: Sobrecosto Detectado</span>
            </div>
            <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold">
              +${variance.toFixed(2)} (+{variancePct.toFixed(1)}%)
            </span>
          </div>
          <p className="text-xs text-red-800 dark:text-red-300">
            El costo real final (${realCost.toFixed(2)}) superó la estimación inicial (${estimatedCost.toFixed(2)}).
          </p>
          <div className="text-xs bg-white dark:bg-slate-900 p-3 rounded-xl border border-red-200 dark:border-red-900 text-slate-700 dark:text-slate-300 space-y-1">
            <div className="font-semibold text-slate-900 dark:text-slate-100">Causas de la variación:</div>
            {extraHours > 0 && (
              <div>• <strong>Horas Extra:</strong> {extraHours.toFixed(1)}h adicionales respecto a las {estimatedHours}h presupuestadas.</div>
            )}
            {extraMaterialsCost > 0 && (
              <div>• <strong>Insumos Adicionales:</strong> +${extraMaterialsCost.toFixed(2)} invertidos en materiales respecto al estimado inicial (${estimatedMaterialsCost.toFixed(2)}).</div>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Descripción</p>
              <p className="text-sm text-muted-foreground">{project.description || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Fecha de Creación</p>
              <p className="text-sm text-muted-foreground">{new Date(project.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Presupuesto Estimado Inicial */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold">Presupuesto Estimado Inicial:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">${estimatedCost.toFixed(2)}</span>
              </div>

              <form action={saveProjectCostEstimation} className="grid grid-cols-3 gap-2 pt-2 text-xs">
                <input type="hidden" name="projectId" value={project.id} />
                <div>
                  <Label className="text-[11px]">Horas Est.</Label>
                  <Input name="estimatedLaborHours" type="number" step="0.1" defaultValue={project.estimatedHours || 0} />
                </div>
                <div>
                  <Label className="text-[11px]">Insumos Est. ($)</Label>
                  <Input name="estimatedMaterialsCost" type="number" step="0.1" defaultValue={project.estimatedMaterialsCost || 0} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" size="sm" variant="outline" className="w-full">Guardar</Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Costeo Financiero Completo */}
        <Card>
          <CardHeader>
            <CardTitle>Costeo Financiero & Prorrateo</CardTitle>
            <CardDescription>
              Resumen de horas, amortización de máquinas y gastos fijos del taller.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={updateProjectCost} className="space-y-4">
              <input type="hidden" name="projectId" value={project.id} />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="actualHours">Horas Invertidas</Label>
                  <Input id="actualHours" name="actualHours" type="number" step="0.1" defaultValue={project.actualHours || 0} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Tarifa Mano de Obra ($/h)</Label>
                  <Input id="hourlyRate" name="hourlyRate" type="number" step="0.1" defaultValue={project.hourlyLaborRate || settings?.hourlyLaborRate || 15} />
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Actualizar Horas
              </Button>
            </form>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl space-y-2 text-xs border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between">
                <span>• Materiales / Insumos:</span>
                <span className="font-semibold">${actualMaterialsCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>• Mano de Obra ({(project.actualHours || 0)}h):</span>
                <span className="font-semibold">${((project.actualHours || 0) * (project.hourlyLaborRate || settings?.hourlyLaborRate || 15)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>• Amortización y Consumo Máquinas:</span>
                <span className="font-semibold">${(project.equipmentCosts || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>• Gastos Fijos Taller Prorrateados:</span>
                <span className="font-semibold">${((project.actualHours || 0) * hourlyOverhead).toFixed(2)}</span>
              </div>

              <div className="border-t pt-2 flex justify-between text-sm font-bold text-indigo-600 dark:text-indigo-400">
                <span>COSTO REAL TOTAL:</span>
                <span>${(project.totalCost || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Suggested Prices Cards */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 text-xs">
                <div className="text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" /> Precio Mayorista (+{settings?.wholesaleMarginPct || 40}%)
                </div>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  ${(project.suggestedWholesalePrice || ((project.totalCost || 0) * 1.4)).toFixed(2)}
                </div>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-200 dark:border-indigo-900 text-xs">
                <div className="text-indigo-800 dark:text-indigo-300 font-semibold flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> Precio Minorista (+{settings?.retailMarginPct || 100}%)
                </div>
                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  ${(project.suggestedRetailPrice || ((project.totalCost || 0) * 2.0)).toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Machinery Usage Assignment Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-indigo-500" /> Amortización y Desgaste de Maquinaria
            </CardTitle>
            <CardDescription>
              Asigna horas de uso de máquinas (Overlock, Recta, Collareta, Plancha industrial) para sumar amortización y consumo eléctrico.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.equipments.length > 0 && (
              <div className="border rounded-md divide-y text-xs">
                {project.equipments.map((pe) => (
                  <div key={pe.id} className="flex justify-between items-center p-3">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{pe.equipment.name}</span>
                      <span className="text-slate-400 ml-2">({pe.hoursUsed} horas @ ${pe.equipment.hourlyRate.toFixed(2)}/h)</span>
                    </div>
                    <div className="flex items-center gap-3 font-semibold">
                      <span>${pe.cost.toFixed(2)}</span>
                      <form action={async () => {
                        "use server"
                        await removeEquipmentFromProject(project.id, pe.equipmentId)
                      }}>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-red-600" type="submit">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form action={addEquipmentToProject} className="flex gap-4 items-end pt-2">
              <input type="hidden" name="projectId" value={project.id} />
              
              <div className="flex-1 space-y-2">
                <Label htmlFor="equipmentId">Seleccionar Máquina</Label>
                <select
                  id="equipmentId"
                  name="equipmentId"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Selecciona máquina...</option>
                  {userEquipments.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} (${eq.hourlyRate.toFixed(2)}/h)
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-32 space-y-2">
                <Label htmlFor="hoursUsed">Horas de Uso</Label>
                <Input id="hoursUsed" name="hoursUsed" type="number" step="0.1" min="0.1" required />
              </div>

              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="h-4 w-4 mr-1" /> Asignar Máquina
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Materiales Usados */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Materiales e Insumos Consumidos</CardTitle>
            <CardDescription>
              Materiales asignados del inventario al proyecto.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {project.materials.length > 0 && (
              <div className="border rounded-md divide-y">
                {project.materials.map((pm) => (
                  <div key={pm.id} className="flex justify-between items-center p-3 text-sm">
                    <div>
                      <span className="font-medium">{pm.material.name}</span>
                      <span className="text-muted-foreground ml-2">({pm.quantityUsed} {pm.material.unit})</span>
                    </div>
                    <div className="font-medium">
                      ${(pm.quantityUsed * pm.material.costPerUnit).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Agregar Material</h4>
              <form action={async (formData) => {
                "use server"
                const { addMaterialToProject } = await import("@/app/actions/proyectos")
                await addMaterialToProject(formData)
              }} className="flex gap-4 items-end">
                <input type="hidden" name="projectId" value={project.id} />
                
                <div className="flex-1 space-y-2">
                  <Label htmlFor="materialId">Material</Label>
                  <select 
                    id="materialId" 
                    name="materialId" 
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Selecciona un material...</option>
                    {(await db.material.findMany({ where: { userId: session.user.id, quantity: { gt: 0 } } })).map(m => (
                      <option key={m.id} value={m.id}>{m.name} (Disp: {m.quantity} {m.unit})</option>
                    ))}
                  </select>
                </div>

                <div className="w-32 space-y-2">
                  <Label htmlFor="quantityUsed">Cantidad</Label>
                  <Input id="quantityUsed" name="quantityUsed" type="number" step="0.01" min="0.01" required />
                </div>

                <Button type="submit">Agregar</Button>
              </form>
            </div>
            
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
