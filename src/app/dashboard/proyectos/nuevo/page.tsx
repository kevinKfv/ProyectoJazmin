import { createProject } from "@/app/actions/proyectos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NuevoProyectoPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center space-x-2">
        <Link href="/dashboard/proyectos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Crear Nuevo Proyecto</h2>
      </div>

      <div className="max-w-2xl mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Proyecto</CardTitle>
            <CardDescription>
              Ingresa la información básica de tu nueva prenda o diseño.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createProject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Proyecto</Label>
                <Input id="name" name="name" placeholder="Ej: Vestido de Verano Floral" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input id="description" name="description" placeholder="Detalles, cliente, medidas, etc." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <select 
                    id="status" 
                    name="status" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Idea">Idea</option>
                    <option value="Diseño">Diseño</option>
                    <option value="Corte">Corte</option>
                    <option value="Costura">Costura</option>
                    <option value="Ajustes">Ajustes</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Input id="category" name="category" placeholder="Ej: Vestidos, Camisas" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <Link href="/dashboard/proyectos">
                  <Button variant="outline" type="button">Cancelar</Button>
                </Link>
                <Button type="submit">Guardar Proyecto</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
