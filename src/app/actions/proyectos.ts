"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export async function createProject(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("No estás autenticado")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const status = formData.get("status") as string || "Idea"
  const category = formData.get("category") as string
  
  if (!name) {
    throw new Error("El nombre es requerido")
  }

  await db.project.create({
    data: {
      name,
      description,
      status,
      category,
      userId: session.user.id,
    }
  })

  redirect("/dashboard/proyectos")
}

export async function updateProjectCost(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("No estás autenticado")
  }

  const projectId = formData.get("projectId") as string
  const actualHours = parseFloat(formData.get("actualHours") as string) || 0
  const hourlyRate = parseFloat(formData.get("hourlyRate") as string) || 0
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { materials: { include: { material: true } } }
  })
  
  if (!project) throw new Error("Proyecto no encontrado")

  const materialCosts = project.materials.reduce((acc, pm) => {
    return acc + (pm.quantityUsed * pm.material.costPerUnit)
  }, 0)

  const totalCost = materialCosts + (actualHours * hourlyRate)
  await db.project.update({
    where: { 
      id: projectId,
      userId: session.user.id 
    },
    data: {
      actualHours,
      totalCost
    }
  })

  redirect(`/dashboard/proyectos/${projectId}`)
}

export async function addMaterialToProject(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("No estás autenticado")
  }

  const projectId = formData.get("projectId") as string
  const materialId = formData.get("materialId") as string
  const quantityUsed = parseFloat(formData.get("quantityUsed") as string) || 0

  if (!projectId || !materialId || quantityUsed <= 0) {
    throw new Error("Datos inválidos")
  }

  // Transaction to add ProjectMaterial, subtract stock, record movement
  await db.$transaction(async (tx) => {
    const material = await tx.material.findUnique({ where: { id: materialId } })
    if (!material) throw new Error("Material no encontrado")
    
    if (material.quantity < quantityUsed) {
      throw new Error(`Stock insuficiente. Disponible: ${material.quantity}`)
    }

    // 1. Create relation
    await tx.projectMaterial.create({
      data: {
        projectId,
        materialId,
        quantityUsed
      }
    })

    // 2. Reduce stock
    await tx.material.update({
      where: { id: materialId },
      data: { quantity: { decrement: quantityUsed } }
    })

    // 3. Movement history
    await tx.inventoryMovement.create({
      data: {
        materialId,
        type: "SALIDA",
        quantity: quantityUsed,
        notes: `Uso en proyecto: ${projectId}`
      }
    })

    // 4. Recalculate Project Cost
    const project = await tx.project.findUnique({
      where: { id: projectId },
      include: {
        materials: { include: { material: true } }
      }
    })

    if (project) {
      const materialCosts = project.materials.reduce((acc, pm) => {
        return acc + (pm.quantityUsed * pm.material.costPerUnit)
      }, 0)
      
      const newTotalCost = materialCosts + ((project.actualHours || 0) * 15) // assuming fixed rate for simplicity since we don't store rate
      
      await tx.project.update({
        where: { id: projectId },
        data: { totalCost: newTotalCost }
      })
    }
  })

  redirect(`/dashboard/proyectos/${projectId}`)
}

export async function updateProjectStatus(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("No estás autenticado")
  }

  const projectId = formData.get("projectId") as string
  const status = formData.get("status") as string

  if (!projectId || !status) {
    throw new Error("Datos inválidos")
  }

  await db.project.update({
    where: { 
      id: projectId,
      userId: session.user.id 
    },
    data: { status }
  })
}
