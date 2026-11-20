import { auth } from "@/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Package, QrCode, Droplets, Building, History, Search } from "lucide-react"
import { QrScannerModal } from "@/components/inventario/qr-scanner-modal"
import { ShrinkageCalculator } from "@/components/inventario/shrinkage-calculator"
import { SupplierDirectory } from "@/components/inventario/supplier-directory"
import { getSuppliers } from "@/app/actions/proveedores"

export default async function InventarioPage() {
  const session = await auth()
  if (!session?.user?.id) return <div>Debes iniciar sesión.</div>

  const materiales = await db.material.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" }
  })

  const suppliers = await getSuppliers()

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Package className="h-5 w-5" />
            </div>
            Inventario Inteligente & Proveedores
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Gestión de stock con escáner QR, calculadora de mermas por encogimiento de tela y directorio de proveedores.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <QrScannerModal materiales={materiales} />
          <Link href="/dashboard/inventario/movimientos">
            <Button variant="outline">
              <History className="mr-2 h-4 w-4" /> Historial
            </Button>
          </Link>
          <Link href="/dashboard/inventario/nuevo">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Insumo
            </Button>
          </Link>
        </div>
      </div>

      {/* Sections Container */}
      <div className="space-y-8">
        {/* Section 1: Catálogo de Materiales */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-500" /> Catálogo de Materiales ({materiales.length})
            </h3>
          </div>

          {materiales.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
              <Package className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Tu inventario está vacío.</p>
              <Link href="/dashboard/inventario/nuevo">
                <Button variant="outline">Añadir material</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {materiales.map((material) => (
                <Card key={material.id} className="hover:shadow-lg transition-all border-slate-200 dark:border-slate-800">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base font-bold">{material.name}</CardTitle>
                      {material.qrCode && (
                        <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-full font-mono">
                          QR Ready
                        </span>
                      )}
                    </div>
                    <CardDescription className="text-xs">{material.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stock Total:</span>
                        <span className={`font-bold ${material.quantity <= (material.reorderLevel || 2) ? 'text-red-500 font-extrabold' : ''}`}>
                          {material.quantity} {material.unit}
                        </span>
                      </div>

                      {material.usableQuantity && material.usableQuantity !== material.quantity && (
                        <div className="flex justify-between text-blue-600 dark:text-blue-400 font-medium">
                          <span>Stock Útil (Post-Lavado):</span>
                          <span>{material.usableQuantity.toFixed(2)} {material.unit}</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Costo Unitario:</span>
                        <span className="font-medium">${material.costPerUnit.toFixed(2)}</span>
                      </div>

                      {material.supplier && (
                        <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span>Proveedor:</span>
                          <span className="font-medium text-slate-600 dark:text-slate-300">{material.supplier}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* Section 2: Conversor de Mermas por Encogimiento */}
        <section>
          <ShrinkageCalculator materiales={materiales} />
        </section>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* Section 3: Directorio de Proveedores */}
        <section>
          <SupplierDirectory suppliers={suppliers} />
        </section>
      </div>
    </div>
  )
}
