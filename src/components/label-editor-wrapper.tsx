"use client"

import dynamic from "next/dynamic"

const LabelEditor = dynamic(() => import("@/components/label-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center">
      Cargando editor gráfico...
    </div>
  )
})

export default function LabelEditorWrapper({ initialLabels = [] }: { initialLabels?: any[] }) {
  return <LabelEditor initialLabels={initialLabels} />
}
