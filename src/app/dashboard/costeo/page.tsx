import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getCostingData } from "@/app/actions/costeo"
import { EquipmentManagement } from "@/components/costeo/equipment-management"
import { OverheadManagement } from "@/components/costeo/overhead-management"
import { ProfitMarginCalculator } from "@/components/costeo/profit-margin-calculator"
import { CostVarianceTracker } from "@/components/costeo/cost-variance-tracker"
import { Calculator, Cpu, Building2, TrendingUp, AlertTriangle } from "lucide-react"

export default async function CosteoPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const {
    settings,
    equipments,
    fixedExpenses,
    totalMonthlyOverhead,
    hourlyOverheadRate,
    projects,
  } = await getCostingData()

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white shadow-md">
              <Calculator className="h-5 w-5" />
            </div>
            Costeo Financiero & Amortización
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Gestión integral de desgaste de máquinas, prorrateo de gastos fijos, márgenes comerciales y alertas de desviación presupuestaria.
          </p>
        </div>
      </div>

      {/* Main Tabs Container using CSS/HTML tab pattern */}
      <div className="space-y-8">
        {/* Section 1: Amortización de Maquinaria y Gastos Fijos */}
        <section className="space-y-6">
          <EquipmentManagement
            equipments={equipments}
            electricityRateKwh={settings?.electricityRateKwh || 0.15}
          />

          <OverheadManagement
            fixedExpenses={fixedExpenses}
            settings={settings}
            totalMonthlyOverhead={totalMonthlyOverhead}
            hourlyOverheadRate={hourlyOverheadRate}
          />
        </section>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* Section 2: Calculadora de Margen de Ganancia Comercial */}
        <section className="space-y-6">
          <ProfitMarginCalculator
            equipments={equipments}
            hourlyOverheadRate={hourlyOverheadRate}
            defaultLaborRate={settings?.hourlyLaborRate || 15}
            defaultWholesaleMargin={settings?.wholesaleMarginPct || 40}
            defaultRetailMargin={settings?.retailMarginPct || 100}
          />
        </section>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* Section 3: Control de Variaciones de Costo */}
        <section className="space-y-6">
          <CostVarianceTracker
            projects={projects}
            defaultLaborRate={settings?.hourlyLaborRate || 15}
          />
        </section>
      </div>
    </div>
  )
}
