"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createClient(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("No estás autenticado")
  }

  const name = formData.get("name") as string
  const email = formData.get("email") as string || null
  const phone = formData.get("phone") as string || null
  const address = formData.get("address") as string || null
  const notes = formData.get("notes") as string || null
  
  if (!name || name.trim() === "") {
    throw new Error("El nombre es obligatorio")
  }

  const client = await db.client.create({
    data: {
      name,
      email,
      phone,
      address,
      notes,
      userId: session.user.id,
    }
  })

  revalidatePath("/dashboard/clientes")
  redirect(`/dashboard/clientes/${client.id}`)
}

export async function updateClient(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("No estás autenticado")
  }

  const clientId = formData.get("clientId") as string
  const name = formData.get("name") as string
  const email = formData.get("email") as string || null
  const phone = formData.get("phone") as string || null
  const address = formData.get("address") as string || null
  const notes = formData.get("notes") as string || null
  
  if (!clientId || !name) {
    throw new Error("Datos inválidos")
  }

  await db.client.update({
    where: {
      id: clientId,
      userId: session.user.id
    },
    data: {
      name,
      email,
      phone,
      address,
      notes,
    }
  })

  revalidatePath(`/dashboard/clientes/${clientId}`)
}

export async function deleteClient(clientId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("No estás autenticado")
  }

  await db.client.delete({
    where: {
      id: clientId,
      userId: session.user.id
    }
  })

  revalidatePath("/dashboard/clientes")
  redirect("/dashboard/clientes")
}

export async function saveClientMeasurements(clientId: string, measurementData: Record<string, number>, notes?: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("No estás autenticado")
  }

  const client = await db.client.findFirst({
    where: { id: clientId, userId: session.user.id }
  })

  if (!client) {
    throw new Error("Cliente no encontrado")
  }

  await db.measurementHistory.create({
    data: {
      clientId,
      notes: notes || "Toma de medidas",
      dataJson: JSON.stringify(measurementData)
    }
  })

  revalidatePath(`/dashboard/clientes/${clientId}`)
}

export async function createFitSession(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("No estás autenticado")
  }

  const clientId = formData.get("clientId") as string
  const title = formData.get("title") as string
  const dateStr = formData.get("date") as string
  const notes = formData.get("notes") as string || null
  const projectId = (formData.get("projectId") as string) || null

  if (!clientId || !title || !dateStr) {
    throw new Error("Faltan datos obligatorios para agendar la cita")
  }

  await db.fitSession.create({
    data: {
      clientId,
      title,
      date: new Date(dateStr),
      notes,
      projectId: projectId && projectId !== "none" ? projectId : null,
      status: "PENDIENTE"
    }
  })

  revalidatePath(`/dashboard/clientes/${clientId}`)
}

export async function updateFitSessionStatus(sessionId: string, status: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("No estás autenticado")
  }

  const fitSession = await db.fitSession.findUnique({
    where: { id: sessionId },
    include: { client: true }
  })

  if (!fitSession || fitSession.client.userId !== session.user.id) {
    throw new Error("No tienes acceso a esta cita")
  }

  await db.fitSession.update({
    where: { id: sessionId },
    data: { status }
  })

  revalidatePath(`/dashboard/clientes/${fitSession.clientId}`)
}

export async function deleteFitSession(sessionId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("No estás autenticado")
  }

  const fitSession = await db.fitSession.findUnique({
    where: { id: sessionId },
    include: { client: true }
  })

  if (!fitSession || fitSession.client.userId !== session.user.id) {
    throw new Error("No tienes acceso a esta cita")
  }

  await db.fitSession.delete({
    where: { id: sessionId }
  })

  revalidatePath(`/dashboard/clientes/${fitSession.clientId}`)
}

export async function createQuote(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("No estás autenticado")
  }

  const clientId = formData.get("clientId") as string
  const quoteNumber = formData.get("quoteNumber") as string || `PRES-${Date.now().toString().slice(-6)}`
  const itemsJson = formData.get("itemsJson") as string
  const subtotal = parseFloat(formData.get("subtotal") as string) || 0
  const discount = parseFloat(formData.get("discount") as string) || 0
  const total = parseFloat(formData.get("total") as string) || 0
  const depositPaid = parseFloat(formData.get("depositPaid") as string) || 0
  const balanceDue = parseFloat(formData.get("balanceDue") as string) || 0
  const paymentStatus = formData.get("paymentStatus") as string || "PENDIENTE"
  const notes = formData.get("notes") as string || null
  const projectId = (formData.get("projectId") as string) || null

  if (!clientId || !itemsJson) {
    throw new Error("Faltan datos obligatorios en la cotización")
  }

  await db.quote.create({
    data: {
      quoteNumber,
      clientId,
      itemsJson,
      subtotal,
      discount,
      total,
      depositPaid,
      balanceDue,
      paymentStatus,
      notes,
      projectId: projectId && projectId !== "none" ? projectId : null,
      status: "BORRADOR"
    }
  })

  revalidatePath(`/dashboard/clientes/${clientId}`)
}

export async function updateQuotePaymentStatus(quoteId: string, paymentStatus: string, depositPaid?: number) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("No estás autenticado")
  }

  const quote = await db.quote.findUnique({
    where: { id: quoteId },
    include: { client: true }
  })

  if (!quote || quote.client.userId !== session.user.id) {
    throw new Error("No tienes acceso a este presupuesto")
  }

  const newDeposit = depositPaid !== undefined ? depositPaid : (paymentStatus === "SENA_50" ? quote.total * 0.5 : (paymentStatus === "PAGADO_TOTAL" ? quote.total : 0))
  const newBalance = Math.max(0, quote.total - newDeposit)

  await db.quote.update({
    where: { id: quoteId },
    data: {
      paymentStatus,
      depositPaid: newDeposit,
      balanceDue: newBalance,
      status: paymentStatus === "PAGADO_TOTAL" ? "APROBADO" : quote.status
    }
  })

  revalidatePath(`/dashboard/clientes/${quote.clientId}`)
}

export async function deleteQuote(quoteId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("No estás autenticado")
  }

  const quote = await db.quote.findUnique({
    where: { id: quoteId },
    include: { client: true }
  })

  if (!quote || quote.client.userId !== session.user.id) {
    throw new Error("No tienes acceso a este presupuesto")
  }

  await db.quote.delete({
    where: { id: quoteId }
  })

  revalidatePath(`/dashboard/clientes/${quote.clientId}`)
}
