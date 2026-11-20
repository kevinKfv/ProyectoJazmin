import { auth } from "@/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Scissors } from "lucide-react"
import Image from "next/image"

export default async function PatronesPage() {
  const session = await auth()
  
  const patrones = await db.pattern.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: "desc" }
  })
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Biblioteca de Patrones</h2>
        <Link href="/dashboard/patrones/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Subir Patrón
          </Button>
        </Link>
      </div>
      
      {patrones.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
          <Scissors className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No tienes patrones guardados.</p>
          <Link href="/dashboard/patrones/nuevo">
            <Button variant="outline">Crear mi primer patrón</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {patrones.map((patron) => (
            <Card key={patron.id} className="hover:shadow-md transition-shadow overflow-hidden">
              {patron.imageUrl && (
                <div className="w-full h-40 relative bg-slate-100">
                  <Image 
                    src={patron.imageUrl} 
                    alt={patron.name} 
                    fill 
                    className="object-cover"
                  />
                </div>
              )}
              {!patron.imageUrl && (
                <div className="w-full h-40 bg-slate-100 flex items-center justify-center">
                  <Scissors className="h-10 w-10 text-slate-300" />
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{patron.name}</CardTitle>
                <CardDescription>{patron.category}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {patron.description || "Sin descripción."}
                </p>
                <div className="flex gap-2 pt-2">
                  <Link href={`/dashboard/patrones/${patron.id}/editor`} className="w-full">
                    <Button variant="outline" className="w-full" size="sm">
                      <Scissors className="mr-2 h-4 w-4" />
                      Editor de Molde
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
