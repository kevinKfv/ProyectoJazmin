import { auth } from "@/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scissors, Package, FolderKanban } from "lucide-react"
import { DashboardQuickActions } from "@/components/dashboard-quick-actions"

export default async function DashboardPage() {
  const session = await auth()
  
  // Resumen de datos (YAGNI: Consultas simples)
  const projectsCount = await db.project.count({ where: { userId: session?.user?.id } })
  const materialsCount = await db.material.count({ where: { userId: session?.user?.id } })
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">¡Hola, {session?.user?.name}!</h2>
        <DashboardQuickActions />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 shadow-lg shadow-primary/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-slate-900 group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
            <FolderKanban className="w-24 h-24 text-primary" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Proyectos Totales
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <FolderKanban className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-slate-800 dark:text-slate-100">{projectsCount}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              Proyectos activos e ideas.
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-secondary"></div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-slate-900 group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
            <Package className="w-24 h-24 text-blue-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Materiales en Inventario
            </CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-full text-blue-500">
              <Package className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-slate-800 dark:text-slate-100">{materialsCount}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              Telas, hilos, botones.
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-400"></div>
        </Card>
      </div>
      
      {/* TODO: Add Recent Projects and Low Stock Alerts */}
    </div>
  )
}
