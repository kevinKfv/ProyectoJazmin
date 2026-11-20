"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function toggleProjectVisibility(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("No estás autenticado")
  }

  const projectId = formData.get("projectId") as string
  const isPublic = formData.get("isPublic") === "true"
  const publicPriceStr = formData.get("publicPrice") as string
  const file = formData.get("file") as File | null

  if (!projectId) return

  let publicImageUrl = undefined

  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const dirPath = path.join(process.cwd(), 'public/uploads/portfolio')
    try {
      await mkdir(dirPath, { recursive: true })
    } catch (error) {
      // Ignore error if exists
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
    const filepath = path.join(dirPath, filename)

    await writeFile(filepath, buffer)
    publicImageUrl = `/uploads/portfolio/${filename}`
  }

  await db.project.update({
    where: { 
      id: projectId,
      userId: session.user.id
    },
    data: {
      isPublic,
      publicPrice: publicPriceStr ? parseFloat(publicPriceStr) : null,
      ...(publicImageUrl ? { publicImageUrl } : {})
    }
  })

  revalidatePath("/dashboard/catalogo")
  revalidatePath(`/portfolio/${session.user.id}`)
}
