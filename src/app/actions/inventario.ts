"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function createMaterial(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("No estás autenticado")
  }

  const name = formData.get("name") as string
  const category = formData.get("category") as string
  const quantity = parseFloat(formData.get("quantity") as string) || 0
  const unit = formData.get("unit") as string
  const costPerUnit = parseFloat(formData.get("costPerUnit") as string) || 0
  const supplier = formData.get("supplier") as string || ""
  const supplierId = formData.get("supplierId") as string || null
  const barcode = formData.get("barcode") as string || null
  const qrCode = formData.get("qrCode") as string || null
  const shrinkageRatePct = parseFloat(formData.get("shrinkageRatePct") as string) || 0
  
  if (!name || !category || !unit) {
    throw new Error("Nombre, Categoría y Unidad son requeridos")
  }

  const usableQuantity = quantity * (1 - shrinkageRatePct / 100)

  await db.material.create({
    data: {
      name,
      category,
      quantity,
      unit,
      costPerUnit,
      supplier,
      supplierId,
      barcode,
      qrCode: qrCode || `QR-${name.replace(/\s+/g, '-').toUpperCase()}-${Date.now().toString().slice(-4)}`,
      shrinkageRatePct,
      usableQuantity,
      userId: session.user.id,
    }
  })

  redirect("/dashboard/inventario")
}

export async function adjustStock(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No estás autenticado")

  const materialId = formData.get("materialId") as string
  const adjustment = parseFloat(formData.get("adjustment") as string) || 0
  const notes = formData.get("notes") as string || "Ajuste manual"
  const type = adjustment > 0 ? "ENTRADA" : "SALIDA"
  
  if (adjustment === 0) {
    redirect("/dashboard/inventario")
  }

  await db.$transaction([
    db.inventoryMovement.create({
      data: {
        materialId,
        quantity: Math.abs(adjustment),
        type,
        notes,
      }
    }),
    db.material.update({
      where: { id: materialId, userId: session.user.id },
      data: {
        quantity: {
          increment: adjustment
        }
      }
    })
  ])

  revalidatePath("/dashboard/inventario")
}

export async function adjustStockByCode(code: string, adjustment: number, notes?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No estás autenticado")

  const cleanCode = code.trim()
  const material = await db.material.findFirst({
    where: {
      userId: session.user.id,
      OR: [
        { id: cleanCode },
        { qrCode: cleanCode },
        { barcode: cleanCode },
        { name: { contains: cleanCode, mode: "insensitive" } }
      ]
    }
  })

  if (!material) {
    throw new Error(`No se encontró ningún insumo con el código / nombre "${code}"`)
  }

  const type = adjustment > 0 ? "ENTRADA" : "SALIDA"

  await db.$transaction([
    db.inventoryMovement.create({
      data: {
        materialId: material.id,
        quantity: Math.abs(adjustment),
        type,
        notes: notes || `Movimiento escaneado (${type})`,
      }
    }),
    db.material.update({
      where: { id: material.id },
      data: {
        quantity: {
          increment: adjustment
        }
      }
    })
  ])

  revalidatePath("/dashboard/inventario")
  return material
}

export async function applyFabricShrinkage(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No estás autenticado")

  const materialId = formData.get("materialId") as string
  const originalMeters = parseFloat(formData.get("originalMeters") as string) || 0
  const shrinkageRatePct = parseFloat(formData.get("shrinkageRatePct") as string) || 0
  const recordMovement = formData.get("recordMovement") === "on"

  if (!materialId || shrinkageRatePct <= 0 || originalMeters <= 0) {
    throw new Error("Parámetros de merma inválidos")
  }

  const material = await db.material.findUnique({ where: { id: materialId, userId: session.user.id } })
  if (!material) throw new Error("Material no encontrado")

  const lostMeters = originalMeters * (shrinkageRatePct / 100)
  const netUsableMeters = originalMeters - lostMeters

  // Adjusted real cost per usable meter
  const adjustedCostPerUnit = netUsableMeters > 0 ? (originalMeters * material.costPerUnit) / netUsableMeters : material.costPerUnit

  if (recordMovement) {
    await db.$transaction([
      db.inventoryMovement.create({
        data: {
          materialId,
          type: "SALIDA",
          quantity: lostMeters,
          notes: `Merma por encogimiento / lavado previo (-${shrinkageRatePct}%)`,
        }
      }),
      db.material.update({
        where: { id: materialId },
        data: {
          quantity: { decrement: lostMeters },
          shrinkageRatePct,
          usableQuantity: netUsableMeters,
          costPerUnit: adjustedCostPerUnit,
        }
      })
    ])
  } else {
    await db.material.update({
      where: { id: materialId },
      data: {
        shrinkageRatePct,
        usableQuantity: netUsableMeters,
        costPerUnit: adjustedCostPerUnit,
      }
    })
  }

  revalidatePath("/dashboard/inventario")
}
