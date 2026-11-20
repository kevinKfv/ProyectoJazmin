"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, CreditCard, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react"
import { ReservationModal } from "./reservation-modal"

interface Project {
  id: string
  name: string
  description?: string | null
  publicPrice?: number | null
  publicImageUrl?: string | null
  category?: string | null
}

interface PortfolioGridProps {
  projects: Project[]
  userName: string
}

export function PortfolioGrid({ projects, userName }: PortfolioGridProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  return (
    <div>
      {/* Grid de Proyectos */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {projects.map(project => (
          <Card key={project.id} className="overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 flex flex-col justify-between group">
            <div>
              {project.publicImageUrl ? (
                <div className="w-full aspect-[4/3] relative bg-slate-950 overflow-hidden">
                  <Image 
                    src={project.publicImageUrl} 
                    alt={project.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {project.category && (
                    <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10">
                      {project.category}
                    </span>
                  )}
                </div>
              ) : (
                <div className="w-full aspect-[4/3] relative bg-slate-100 dark:bg-slate-950 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 italic text-xs">Sin imagen de portada</span>
                </div>
              )}

              <CardHeader className="pb-2 pt-5">
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {project.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-0 pb-4">
                <p className="text-slate-600 dark:text-slate-300 line-clamp-3 text-xs leading-relaxed">
                  {project.description || "Diseño exclusivo a medida de alta calidad."}
                </p>
              </CardContent>
            </div>

            <CardContent className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              {project.publicPrice ? (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Precio Total</span>
                    <span className="text-2xl font-black text-primary">${project.publicPrice.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Seña 50%</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">${(project.publicPrice * 0.5).toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confección a medida</span>
                  <span className="text-sm font-semibold text-slate-500">Consultar precio</span>
                </div>
              )}

              {project.publicPrice ? (
                <button
                  onClick={() => setSelectedProject(project)}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <CreditCard className="h-4 w-4" /> Reservar con Seña (MercadoPago)
                </button>
              ) : (
                <button
                  onClick={() => alert(`Contacta a ${userName} para solicitar cotización de esta prenda.`)}
                  className="w-full h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="h-4 w-4" /> Encargar a Medida
                </button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Reserva */}
      {selectedProject && selectedProject.publicPrice && (
        <ReservationModal
          project={{
            id: selectedProject.id,
            name: selectedProject.name,
            description: selectedProject.description,
            publicPrice: selectedProject.publicPrice,
            publicImageUrl: selectedProject.publicImageUrl
          }}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  )
}
