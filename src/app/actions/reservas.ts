"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function createCatalogReservation(data: {
  projectId: string
  clientName: string
  clientEmail: string
  clientPhone: string
  sizeOrNotes?: string
  depositAmount: number
  totalPrice: number
  mpPaymentId?: string
}) {
  const project = await db.project.findUnique({
    where: { id: data.projectId },
    include: { user: true }
  })

  if (!project) {
    throw new Error("El diseño no fue encontrado")
  }

  // 1. Buscar o crear cliente rápido por email/nombre
  let client = await db.client.findFirst({
    where: {
      userId: project.userId,
      email: data.clientEmail
    }
  })

  if (!client) {
    client = await db.client.create({
      data: {
        userId: project.userId,
        name: data.clientName,
        email: data.clientEmail,
        phone: data.clientPhone,
        notes: `Cliente registrado desde Reserva Online del Catálogo para: ${project.name}`
      }
    })
  }

  // 2. Crear presupuesto/reserva formal con seña pagada
  const quoteNumber = `RES-MP-${Math.floor(100000 + Math.random() * 900000)}`
  const balanceDue = Math.max(0, data.totalPrice - data.depositAmount)

  const itemsJson = JSON.stringify([
    {
      description: `Reserva & Encarco de Prenda: ${project.name}`,
      qty: 1,
      price: data.totalPrice,
      total: data.totalPrice,
      sizeNotes: data.sizeOrNotes || "Talle Estándar"
    }
  ])

  const quote = await db.quote.create({
    data: {
      quoteNumber,
      clientId: client.id,
      projectId: project.id,
      itemsJson,
      subtotal: data.totalPrice,
      total: data.totalPrice,
      depositPaid: data.depositAmount,
      balanceDue: balanceDue,
      paymentStatus: "SENA_50",
      status: "APROBADO",
      notes: `Reserva abonada con MercadoPago (ID Pago: ${data.mpPaymentId || 'MP-' + Date.now()}). Observaciones de talle: ${data.sizeOrNotes || 'Sin especificaciones'}`
    }
  })

  revalidatePath(`/portfolio/${project.userId}`)
  revalidatePath(`/dashboard/catalogo`)

  return {
    success: true,
    reservationId: quote.id,
    quoteNumber: quote.quoteNumber,
    depositPaid: data.depositAmount,
    balanceDue: balanceDue,
    clientName: client.name
  }
}

export async function getCatalogReservations() {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("No estás autenticado")
  }

  const quotes = await db.quote.findMany({
    where: {
      client: {
        userId: session.user.id
      }
    },
    include: {
      client: true,
      project: true
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  return quotes
}
