import { createPattern } from "@/app/actions/patrones"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NuevoPatronPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center space-x-2">
        <Link href="/dashboard/patrones">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Nuevo Patrón</h2>
      </div>

      <div className="max-w-2xl mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Patrón</CardTitle>
            <CardDescription>
              Añade un nuevo molde a tu biblioteca (El almacenamiento en la nube se agregará después).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createPattern} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Molde</Label>
                  <Input id="name" name="name" placeholder="Ej: Camisa Base Talla M" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Input id="category" name="category" placeholder="Ej: Camisas, Vestidos" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input id="description" name="description" placeholder="Medidas, tipo de tela recomendada..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Archivo de Imagen o Molde</Label>
                <Input id="file" name="file" type="file" accept="image/*,application/pdf" />
                <p className="text-xs text-muted-foreground">Sube un archivo desde tu computadora para el patrón.</p>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <Label htmlFor="imageUrl">URL de Imagen (Alternativa)</Label>
                <Input id="imageUrl" name="imageUrl" placeholder="https://..." type="url" />
                <p className="text-xs text-muted-foreground">O pega un link de imagen para la vista previa si no subes un archivo.</p>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Link href="/dashboard/patrones">
                  <Button variant="outline" type="button">Cancelar</Button>
                </Link>
                <Button type="submit">Guardar Patrón</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
