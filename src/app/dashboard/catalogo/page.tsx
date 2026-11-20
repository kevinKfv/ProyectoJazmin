import { auth } from "@/auth"
import { db } from "@/lib/db"
import CatalogCard from "@/components/catalogo/catalog-card"
import { ReservationsList } from "@/components/catalogo/reservations-list"
import { Button } from "@/components/ui/button"
import { ExternalLink, Globe, CreditCard, Layers } from "lucide-react"
import Link from "next/link"

export default async function CatalogoPage() {
  const session = await auth()
  
  const projects = await db.project.findMany({
    where: { 
      userId: session?.user?.id,
      status: "Finalizado"
    },
    orderBy: { updatedAt: "desc" }
  })

  // Obtener reservas online recibidas vía MercadoPago
  const reservations = await db.quote.findMany({
    where: {
      client: {
        userId: session?.user?.id
      },
      paymentStatus: "SENA_50"
    },
    include: {
      client: true,
      project: true
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  const publicUrl = `/portfolio/${session?.user?.id}`

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="h-8 w-8 text-primary" />
            Catálogo Público & Reservas
          </h2>
          <p className="text-muted-foreground mt-1">Gestiona las prendas públicas exhibidas en tu portfolio y administra las señas recibidas por MercadoPago.</p>
        </div>
        
        <div className="flex gap-2">
          <Link href={publicUrl} target="_blank">
            <Button variant="default" className="shadow-md">
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver mi Catálogo Público
            </Button>
          </Link>
        </div>
      </div>

      {/* Sección 1: Señas & Reservas Recibidas */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Señas & Reservas Online Recibidas ({reservations.length})
          </h3>
        </div>
        <ReservationsList reservations={reservations} />
      </section>

      {/* Sección 2: Gestión de Catálogo de prendas públicas */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Layers className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Prendas Finalizadas para Exhibir en el Catálogo ({projects.length})
          </h3>
        </div>
        
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
            <p className="text-muted-foreground mb-4">No tienes proyectos marcados como "Finalizado".</p>
            <p className="text-sm text-slate-500">Ve a tus proyectos y cambia el estado de alguno a "Finalizado" para que aparezca aquí.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map(project => (
              <CatalogCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
