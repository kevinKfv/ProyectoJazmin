"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getLabels() {
  const session = await auth()
  if (!session?.user?.id) return []

  return db.label.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })
}

export async function saveLabelAction(data: {
  id?: string
  name: string
  type: string
  designJson: string
}) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("No estás autenticado")
  }

  if (!data.name || !data.type || !data.designJson) {
    throw new Error("Faltan campos obligatorios")
  }

  let label
  if (data.id) {
    label = await db.label.update({
      where: { id: data.id, userId: session.user.id },
      data: {
        name: data.name,
        type: data.type,
        designJson: data.designJson,
      },
    })
  } else {
    label = await db.label.create({
      data: {
        name: data.name,
        type: data.type,
        designJson: data.designJson,
        userId: session.user.id,
      },
    })
  }

  revalidatePath("/dashboard/etiquetas")
  return label
}

export async function deleteLabelAction(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("No estás autenticado")
  }

  await db.label.delete({
    where: { id, userId: session.user.id },
  })

  revalidatePath("/dashboard/etiquetas")
}
