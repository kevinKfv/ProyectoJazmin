"use client"

import dynamic from "next/dynamic"

const EditorCanvas = dynamic(() => import("@/components/pattern-editor/editor-canvas"), {
  ssr: false,
})

export default function EditorCanvasWrapper({ initialData }: { initialData?: string | null }) {
  return <EditorCanvas initialData={initialData} />
}
