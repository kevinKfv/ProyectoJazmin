"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function createPattern(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("No estás autenticado")
  }

  const name = formData.get("name") as string
  const category = formData.get("category") as string
  const description = formData.get("description") as string
  
  if (!name) {
    throw new Error("Nombre es requerido")
  }

  let finalImageUrl = ""
  
  const file = formData.get("file") as File
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Crear el directorio si no existe
    const uploadDir = path.join(process.cwd(), "public/uploads/patrones")
    await mkdir(uploadDir, { recursive: true })
    
    // Generar nombre de archivo único
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const filename = `${uniqueSuffix}-${file.name.replace(/\s+/g, "_")}`
    const filepath = path.join(uploadDir, filename)
    
    await writeFile(filepath, buffer)
    finalImageUrl = `/uploads/patrones/${filename}`
  } else {
    // Fallback if URL is provided instead of file
    finalImageUrl = formData.get("imageUrl") as string || ""
  }

  await db.pattern.create({
    data: {
      name,
      category,
      description,
      imageUrl: finalImageUrl,
      userId: session.user.id,
    }
  })

  redirect("/dashboard/patrones")
}

export async function updatePatternDesign(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("No estás autenticado")
  }

  const patternId = formData.get("patternId") as string
  const designJson = formData.get("designJson") as string

  if (!patternId || !designJson) return

  await db.pattern.update({
    where: { id: patternId, userId: session.user.id },
    data: { dataJson: designJson }
  })
}
