import { auth } from "@/auth"
import { getLabels } from "@/app/actions/etiquetas"
import LabelEditorWrapper from "@/components/label-editor-wrapper"

export default async function EtiquetasPage() {
  const session = await auth()
  const labels = await getLabels()
  
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Diseñador e Historial de Etiquetas</h2>
          <p className="text-muted-foreground mt-1">
            Diseña, guarda en tu historial y exporta etiquetas personalizadas para tus prendas y colecciones.
          </p>
        </div>
      </div>
      
      <div className="mt-6">
        <LabelEditorWrapper initialLabels={labels} />
      </div>
    </div>
  )
}
