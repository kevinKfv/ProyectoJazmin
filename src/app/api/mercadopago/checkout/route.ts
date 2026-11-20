import { NextResponse } from 'next/server'
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { projectId, clientName, clientEmail, clientPhone, sizeOrNotes, depositPct = 50 } = body

    if (!projectId) {
      return NextResponse.json({ error: "ID del proyecto requerido" }, { status: 400 })
    }

    const project = await db.project.findUnique({
      where: { id: projectId }
    })

    if (!project || !project.publicPrice) {
      return NextResponse.json({ error: "Prenda no disponible para reserva pública" }, { status: 404 })
    }

    const totalPrice = project.publicPrice
    const depositAmount = Math.round((totalPrice * (depositPct / 100)) * 100) / 100
    const balanceDue = Math.round((totalPrice - depositAmount) * 100) / 100

    // ID de pago de MercadoPago Sandbox
    const preferenceId = `MP-PREF-${Date.now()}-${Math.floor(Math.random() * 9000)}`
    
    // MercadoPago Checkout Preference Data
    const checkoutPreference = {
      id: preferenceId,
      items: [
        {
          id: project.id,
          title: `Seña 50% - Reserva Prenda: ${project.name}`,
          description: `Seña inicial para encargar la prenda. Saldo a pagar a la entrega: $${balanceDue}`,
          quantity: 1,
          currency_id: "ARS",
          unit_price: depositAmount
        }
      ],
      payer: {
        name: clientName,
        email: clientEmail,
        phone: { number: clientPhone }
      },
      back_urls: {
        success: `/portfolio/${project.userId}?payment=success`,
        failure: `/portfolio/${project.userId}?payment=failure`,
        pending: `/portfolio/${project.userId}?payment=pending`
      },
      auto_return: "approved",
      payment_methods: {
        excluded_payment_types: [],
        installments: 12
      },
      statement_descriptor: "SEWSTUDIO RES",
      external_reference: `PROJ-${project.id}`
    }

    return NextResponse.json({
      success: true,
      preference: checkoutPreference,
      project: {
        id: project.id,
        name: project.name,
        totalPrice,
        depositAmount,
        balanceDue,
        imageUrl: project.publicImageUrl
      }
    })

  } catch (error: any) {
    console.error("MercadoPago Checkout API Error:", error)
    return NextResponse.json({ error: error.message || "Error al generar la preferencia de MercadoPago" }, { status: 500 })
  }
}
