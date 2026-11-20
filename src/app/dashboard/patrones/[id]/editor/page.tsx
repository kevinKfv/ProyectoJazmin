import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import EditorToolbar from "@/components/pattern-editor/editor-toolbar"
import EditorCanvasWrapper from "@/components/pattern-editor/editor-canvas-wrapper"
import EditorSidebar from "@/components/pattern-editor/editor-sidebar"

export default async function PatternEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const pattern = await db.pattern.findUnique({
    where: { 
      id,
      userId: session.user.id
    }
  })

  if (!pattern) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <p className="text-slate-600 font-medium">Patrón no encontrado</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen w-full fixed top-0 left-0 z-50 bg-background overflow-hidden">
      <EditorToolbar patternId={pattern.id} />
      <div className="flex-1 flex overflow-hidden relative">
        <EditorCanvasWrapper initialData={pattern.dataJson} />
        <EditorSidebar />
      </div>
    </div>
  )
}
