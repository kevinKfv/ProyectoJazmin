"use client"

import { useState } from "react"
import { Cpu, Zap, Clock, Plus, Trash2, Edit2, ShieldAlert, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { upsertEquipment, deleteEquipment } from "@/app/actions/costeo"

interface Equipment {
  id: string
  name: string
  purchasePrice: number
  usefulLifeHours: number
  maintenanceCost: number
  powerWatts: number
  electricityRateKwh: number
  hourlyWearCost: number
  hourlyEnergyCost: number
  hourlyRate: number
  notes?: string | null
}

interface EquipmentManagementProps {
  equipments: Equipment[]
  electricityRateKwh: number
}

export function EquipmentManagement({ equipments, electricityRateKwh }: EquipmentManagementProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)

  const handleEdit = (eq: Equipment) => {
    setSelectedEquipment(eq)
    setIsEditing(true)
  }

  const handleNew = () => {
    setSelectedEquipment(null)
    setIsEditing(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-500" />
            Amortización de Maquinaria y Consumo Eléctrico
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Calcula el desgaste real por hora y el consumo eléctrico de cada máquina (Overlock, Recta, Collareta, Plancha industrial).
          </p>
        </div>
        <Button onClick={handleNew} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Máquina
        </Button>
      </div>

      {isEditing && (
        <Card className="border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/20 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-indigo-900 dark:text-indigo-200">
              {selectedEquipment ? `Editar: ${selectedEquipment.name}` : "Registrar Nueva Maquinaria"}
            </CardTitle>
            <CardDescription>
              Ingresa el costo de compra, vida útil en horas y potencia para calcular automáticamente el costo por hora.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={async (formData) => {
              await upsertEquipment(formData)
              setIsEditing(false)
              setSelectedEquipment(null)
            }} className="space-y-4">
              {selectedEquipment && <input type="hidden" name="id" value={selectedEquipment.id} />}
              <input type="hidden" name="electricityRateKwh" value={electricityRateKwh} />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Máquina</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ej: Overlock 4 Hilos"
                    defaultValue={selectedEquipment?.name || ""}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Precio de Compra ($)</Label>
                  <Input
                    id="purchasePrice"
                    name="purchasePrice"
                    type="number"
                    step="0.01"
                    placeholder="650.00"
                    defaultValue={selectedEquipment?.purchasePrice || ""}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usefulLifeHours">Vida Útil Estimada (Horas)</Label>
                  <Input
                    id="usefulLifeHours"
                    name="usefulLifeHours"
                    type="number"
                    placeholder="6000"
                    defaultValue={selectedEquipment?.usefulLifeHours || 6000}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maintenanceCost">Mantenimiento Estimado Total ($)</Label>
                  <Input
                    id="maintenanceCost"
                    name="maintenanceCost"
                    type="number"
                    step="0.01"
                    placeholder="150.00"
                    defaultValue={selectedEquipment?.maintenanceCost || 0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="powerWatts">Potencia (Watts / Vatios)</Label>
                  <Input
                    id="powerWatts"
                    name="powerWatts"
                    type="number"
                    placeholder="550"
                    defaultValue={selectedEquipment?.powerWatts || 500}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2 lg:col-span-1">
                  <Label htmlFor="notes">Notas o Observaciones</Label>
                  <Input
                    id="notes"
                    name="notes"
                    placeholder="Ej: Service anual programado"
                    defaultValue={selectedEquipment?.notes || ""}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Guardar Maquinaria
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {equipments.map((eq) => (
          <Card key={eq.id} className="relative group overflow-hidden border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all">
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{eq.name}</h4>
                  <span className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                    <Zap className="h-3 w-3" /> {eq.powerWatts}W | ${eq.electricityRateKwh}/kWh
                  </span>
                </div>
                <div className="flex gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-indigo-600" onClick={() => handleEdit(eq)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <form action={async () => {
                    if (confirm(`¿Eliminar ${eq.name}?`)) {
                      await deleteEquipment(eq.id)
                    }
                  }}>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-red-600" type="submit">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-slate-400" /> Amortización/hr:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">${eq.hourlyWearCost.toFixed(3)}/h</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-amber-500" /> Consumo Eléctrico/hr:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">${eq.hourlyEnergyCost.toFixed(3)}/h</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-1.5 flex justify-between items-center font-bold text-sm text-indigo-600 dark:text-indigo-400">
                  <span>Costo Total Hora:</span>
                  <span>${eq.hourlyRate.toFixed(2)} / hora</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Compra: ${eq.purchasePrice}</span>
                <span>Vida útil: {eq.usefulLifeHours} hrs</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
