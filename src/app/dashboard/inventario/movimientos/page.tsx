import { auth } from "@/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function MovimientosPage() {
  const session = await auth()
  
  const movimientos = await db.inventoryMovement.findMany({
    where: { 
      material: {
        userId: session?.user?.id
      }
    },
    include: {
      material: true
    },
    orderBy: { date: "desc" }
  })
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center space-x-2 mb-6">
        <Link href="/dashboard/inventario">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Historial de Movimientos</h2>
          <p className="text-muted-foreground">Registro de entradas y salidas de stock.</p>
        </div>
      </div>
      
      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Material</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Cantidad</th>
                <th className="px-4 py-3 font-medium">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {movimientos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No hay movimientos registrados.
                  </td>
                </tr>
              ) : (
                movimientos.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(mov.date).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {mov.material.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        mov.type === 'ENTRADA' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {mov.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {mov.type === 'ENTRADA' ? '+' : '-'}{mov.quantity} {mov.material.unit}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {mov.notes || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
