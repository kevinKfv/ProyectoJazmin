import { auth } from "@/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import KanbanBoard from "@/components/kanban-board"

export default async function ProyectosPage() {
  const session = await auth()
  
  const proyectos = await db.project.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: "desc" }
  })
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Proyectos</h2>
        <Link href="/dashboard/proyectos/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proyecto
          </Button>
        </Link>
      </div>
      
      {proyectos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-muted-foreground mb-4">No tienes proyectos todavía.</p>
          <Link href="/dashboard/proyectos/nuevo">
            <Button variant="outline">Crear mi primer proyecto</Button>
          </Link>
        </div>
      ) : (
        <KanbanBoard initialProjects={proyectos} />
      )}
    </div>
  )
}
