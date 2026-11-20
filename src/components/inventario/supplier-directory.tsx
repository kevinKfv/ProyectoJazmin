"use client"

import { useState } from "react"
import { Star, Phone, Mail, MapPin, User, Plus, Trash2, Edit2, History, DollarSign, Building, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { upsertSupplier, deleteSupplier, addSupplierPriceRecord } from "@/app/actions/proveedores"

interface SupplierPriceHistory {
  id: string
  materialName: string
  unit: string
  pricePerUnit: number
  date: Date
  notes?: string | null
}

interface Material {
  id: string
  name: string
  unit: string
  costPerUnit: number
}

interface Supplier {
  id: string
  name: string
  contactName?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  rating: number
  notes?: string | null
  materials: Material[]
  priceHistory: SupplierPriceHistory[]
}

interface SupplierDirectoryProps {
  suppliers: Supplier[]
}

export function SupplierDirectory({ suppliers }: SupplierDirectoryProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [addingPriceHistorySupplierId, setAddingPriceHistorySupplierId] = useState<string | null>(null)

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-700"
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Building className="h-5 w-5 text-indigo-500" />
            Directorio & Calificación de Proveedores
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Registra tus proveedores habituales, evalúa su cumplimiento y monitorea el historial de precios por metro.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedSupplier(null)
            setIsEditing(true)
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" /> Agregar Proveedor
        </Button>
      </div>

      {/* Supplier Upsert Form */}
      {isEditing && (
        <Card className="border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/20">
          <CardHeader>
            <CardTitle className="text-base font-bold text-indigo-900 dark:text-indigo-200">
              {selectedSupplier ? `Editar Proveedor: ${selectedSupplier.name}` : "Registrar Nuevo Proveedor"}
            </CardTitle>
            <CardDescription className="text-xs">
              Ingresa los datos de contacto y otorga una calificación de 1 a 5 estrellas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData) => {
                await upsertSupplier(formData)
                setIsEditing(false)
                setSelectedSupplier(null)
              }}
              className="space-y-4 text-xs"
            >
              {selectedSupplier && <input type="hidden" name="id" value={selectedSupplier.id} />}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nombre de la Empresa / Proveedor</Label>
                  <Input id="name" name="name" placeholder="Ej: Textiles del Sur S.A." defaultValue={selectedSupplier?.name || ""} required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contactName">Persona de Contacto</Label>
                  <Input id="contactName" name="contactName" placeholder="Ej: Carlos Gómez" defaultValue={selectedSupplier?.contactName || ""} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Teléfono / WhatsApp</Label>
                  <Input id="phone" name="phone" placeholder="+5491143218765" defaultValue={selectedSupplier?.phone || ""} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" name="email" type="email" placeholder="ventas@textilesdelsur.com" defaultValue={selectedSupplier?.email || ""} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address">Dirección / Depósito</Label>
                  <Input id="address" name="address" placeholder="Av. Corrientes 1234, CABA" defaultValue={selectedSupplier?.address || ""} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rating">Calificación (1 a 5 estrellas)</Label>
                  <select
                    id="rating"
                    name="rating"
                    defaultValue={selectedSupplier?.rating || 5}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ 5 Estrellas (Excelente)</option>
                    <option value="4">⭐⭐⭐⭐ 4 Estrellas (Muy Bueno)</option>
                    <option value="3">⭐⭐⭐ 3 Estrellas (Aceptable)</option>
                    <option value="2">⭐⭐ 2 Estrellas (Regular)</option>
                    <option value="1">⭐ 1 Estrella (Incapaz / Malo)</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                  <Label htmlFor="notes">Notas de Calidad o Condiciones Comerciales</Label>
                  <Input id="notes" name="notes" placeholder="Ej: Descuento del 10% por compras superiores a 50 metros. Entregas en 48hs." defaultValue={selectedSupplier?.notes || ""} />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Guardar Proveedor
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suppliers.map((sup) => (
          <Card key={sup.id} className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">{sup.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(sup.rating)}
                    <span className="text-xs text-slate-400">({sup.rating}/5)</span>
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-slate-400 hover:text-indigo-600"
                    onClick={() => {
                      setSelectedSupplier(sup)
                      setIsEditing(true)
                    }}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <form
                    action={async () => {
                      if (confirm(`¿Eliminar proveedor ${sup.name}?`)) {
                        await deleteSupplier(sup.id)
                      }
                    }}
                  >
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600" type="submit">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 text-slate-600 dark:text-slate-400">
                {sup.contactName && (
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>{sup.contactName}</span>
                  </div>
                )}
                {sup.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{sup.phone}</span>
                  </div>
                )}
                {sup.email && (
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{sup.email}</span>
                  </div>
                )}
                {sup.address && (
                  <div className="flex items-center gap-1.5 col-span-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{sup.address}</span>
                  </div>
                )}
              </div>

              {sup.notes && (
                <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-500 italic">
                  "{sup.notes}"
                </div>
              )}

              {/* Price History Records */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <History className="h-3.5 w-3.5 text-indigo-500" /> Historial de Precios por Metro / Unidad
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[11px] text-indigo-600 dark:text-indigo-400"
                    onClick={() =>
                      setAddingPriceHistorySupplierId(
                        addingPriceHistorySupplierId === sup.id ? null : sup.id
                      )
                    }
                  >
                    + Registrar Precio
                  </Button>
                </div>

                {addingPriceHistorySupplierId === sup.id && (
                  <form
                    action={async (formData) => {
                      await addSupplierPriceRecord(formData)
                      setAddingPriceHistorySupplierId(null)
                    }}
                    className="bg-indigo-50/40 dark:bg-indigo-950/20 p-3 rounded-lg border border-indigo-200 dark:border-indigo-900 space-y-2"
                  >
                    <input type="hidden" name="supplierId" value={sup.id} />
                    <div className="grid grid-cols-3 gap-2">
                      <Input name="materialName" placeholder="Insumo / Tela" required className="h-8 text-[11px]" />
                      <Input name="pricePerUnit" type="number" step="0.01" placeholder="Precio ($)" required className="h-8 text-[11px]" />
                      <Input name="unit" defaultValue="m" placeholder="Unidad" className="h-8 text-[11px]" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setAddingPriceHistorySupplierId(null)}>
                        Cancelar
                      </Button>
                      <Button type="submit" size="sm" className="h-7 text-[11px] bg-indigo-600 text-white">
                        Guardar Registro
                      </Button>
                    </div>
                  </form>
                )}

                {sup.priceHistory.length > 0 ? (
                  <div className="space-y-1 bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-[11px]">
                    {sup.priceHistory.slice(0, 3).map((ph) => (
                      <div key={ph.id} className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                        <span>
                          {ph.materialName} ({new Date(ph.date).toLocaleDateString()})
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          ${ph.pricePerUnit.toFixed(2)} / {ph.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400">Sin historial de precio registrado aún.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
