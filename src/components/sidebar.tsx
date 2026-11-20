"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FolderKanban, Package, Tag, Scissors, LogOut, Sparkles, Globe, Users, Calculator } from "lucide-react"
import { signOut } from "next-auth/react"

const navItems = [
  { name: "Resumen", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clientes & CRM", href: "/dashboard/clientes", icon: Users },
  { name: "Diseño & Producción IA", href: "/dashboard/diseno-ia", icon: Sparkles },
  { name: "Proyectos", href: "/dashboard/proyectos", icon: FolderKanban },
  { name: "Inventario", href: "/dashboard/inventario", icon: Package },
  { name: "Costeo & Finanzas", href: "/dashboard/costeo", icon: Calculator },
  { name: "Etiquetas", href: "/dashboard/etiquetas", icon: Tag },
  { name: "Patrones", href: "/dashboard/patrones", icon: Scissors },
  { name: "Catálogo", href: "/dashboard/catalogo", icon: Globe },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-72 flex-col bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 transition-all">
      <div className="flex h-20 items-center px-6 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <Scissors className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
            SewStudio
          </h1>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-6">
        <nav className="grid gap-2 px-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Menu Principal</div>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 translate-x-1" 
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-50 hover:translate-x-1"
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="border-t border-slate-200/50 dark:border-slate-800/50 p-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 transition-all duration-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
        >
          <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}
