"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function saveFigurineAsPattern(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Debes iniciar sesión para realizar esta acción")
  }

  const name = formData.get("name") as string
  const category = (formData.get("category") as string) || "Boceto IA"
  const description = formData.get("description") as string
  const imageUrl = (formData.get("imageUrl") as string) || ""
  const dataJson = (formData.get("dataJson") as string) || "{}"

  if (!name) {
    throw new Error("El nombre del patrón es obligatorio")
  }

  const pattern = await db.pattern.create({
    data: {
      name,
      category,
      description,
      imageUrl,
      dataJson,
      userId: session.user.id,
    }
  })

  revalidatePath("/dashboard/patrones")
  return { success: true, patternId: pattern.id }
}

export async function createProjectFromAIAnalysis(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Debes iniciar sesión para realizar esta acción")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const category = (formData.get("category") as string) || "Alta Costura"

  if (!name) {
    throw new Error("El nombre del proyecto es obligatorio")
  }

  const project = await db.project.create({
    data: {
      name,
      description,
      status: "Diseño",
      category,
      userId: session.user.id,
    }
  })

  revalidatePath("/dashboard/proyectos")
  return { success: true, projectId: project.id }
}
