import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid"

export default async function PortfolioPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, image: true }
  })

  if (!user) {
    notFound()
  }

  const projects = await db.project.findMany({
    where: { 
      userId,
      isPublic: true,
    },
    orderBy: { updatedAt: "desc" }
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-sans">
      {/* Header Estético */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-16 text-center shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-sky-500/5 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10 space-y-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            💳 Reservas Online Disponibles
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Catálogo & Atelier de Creaciones
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto font-medium">
            Colección por <span className="text-primary font-bold">{user.name || "Diseñador"}</span>. Reserva tu prenda abonando una seña online protegida por MercadoPago.
          </p>
        </div>
      </header>

      {/* Grid de Proyectos */}
      <main className="container mx-auto px-4 mt-12 max-w-6xl">
        {projects.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-slate-500">
            Aún no hay prendas públicas disponibles para reserva en este catálogo.
          </div>
        ) : (
          <PortfolioGrid projects={projects} userName={user.name || "el Atelier"} />
        )}
      </main>
    </div>
  )
}
