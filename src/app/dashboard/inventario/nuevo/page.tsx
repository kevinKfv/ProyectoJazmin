import { createMaterial } from "@/app/actions/inventario"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NuevoMaterialPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center space-x-2">
        <Link href="/dashboard/inventario">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Añadir Material</h2>
      </div>

      <div className="max-w-2xl mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Material</CardTitle>
            <CardDescription>
              Registra telas, hilos, botones y otros insumos en tu taller.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createMaterial} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" name="name" placeholder="Ej: Tela Algodón Blanca" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <select 
                    id="category" 
                    name="category" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="Tela">Tela</option>
                    <option value="Hilo">Hilo</option>
                    <option value="Cremallera">Cremallera</option>
                    <option value="Botón">Botón</option>
                    <option value="Elástico">Elástico</option>
                    <option value="Entretela">Entretela</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Stock Inicial</Label>
                  <Input id="quantity" name="quantity" type="number" step="0.01" defaultValue="0" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unidad de Medida</Label>
                  <select 
                    id="unit" 
                    name="unit" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="Metros">Metros</option>
                    <option value="Unidades">Unidades</option>
                    <option value="Bobinas">Bobinas</option>
                    <option value="Cm">Centímetros</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costPerUnit">Costo por Unidad ($)</Label>
                  <Input id="costPerUnit" name="costPerUnit" type="number" step="0.01" defaultValue="0" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Proveedor (Opcional)</Label>
                <Input id="supplier" name="supplier" placeholder="Nombre de la tienda o proveedor" />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Link href="/dashboard/inventario">
                  <Button variant="outline" type="button">Cancelar</Button>
                </Link>
                <Button type="submit">Guardar Material</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
