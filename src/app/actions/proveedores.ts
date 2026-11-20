"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getSuppliers() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No estás autenticado")

  const suppliers = await db.supplier.findMany({
    where: { userId: session.user.id },
    include: {
      materials: true,
      priceHistory: {
        orderBy: { date: "desc" }
      }
    },
    orderBy: { rating: "desc" }
  })

  return suppliers
}

export async function upsertSupplier(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No estás autenticado")

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const contactName = formData.get("contactName") as string || ""
  const phone = formData.get("phone") as string || ""
  const email = formData.get("email") as string || ""
  const address = formData.get("address") as string || ""
  const rating = parseInt(formData.get("rating") as string) || 5
  const notes = formData.get("notes") as string || ""

  if (!name) throw new Error("El nombre del proveedor es requerido")

  if (id) {
    await db.supplier.update({
      where: { id, userId: session.user.id },
      data: {
        name,
        contactName,
        phone,
        email,
        address,
        rating,
        notes,
      }
    })
  } else {
    await db.supplier.create({
      data: {
        userId: session.user.id,
        name,
        contactName,
        phone,
        email,
        address,
        rating,
        notes,
      }
    })
  }

  revalidatePath("/dashboard/inventario")
}

export async function deleteSupplier(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No estás autenticado")

  await db.supplier.delete({
    where: { id, userId: session.user.id }
  })

  revalidatePath("/dashboard/inventario")
}

export async function addSupplierPriceRecord(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No estás autenticado")

  const supplierId = formData.get("supplierId") as string
  const materialName = formData.get("materialName") as string
  const unit = formData.get("unit") as string || "m"
  const pricePerUnit = parseFloat(formData.get("pricePerUnit") as string) || 0
  const notes = formData.get("notes") as string || ""

  if (!supplierId || !materialName || pricePerUnit <= 0) {
    throw new Error("Datos de precio inválidos")
  }

  await db.supplierPriceHistory.create({
    data: {
      supplierId,
      materialName,
      unit,
      pricePerUnit,
      notes,
    }
  })

  revalidatePath("/dashboard/inventario")
}
