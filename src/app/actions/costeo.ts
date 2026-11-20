"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

// Configuración y datos por defecto iniciales
export async function ensureDefaultCostingData(userId: string) {
  // Check settings
  let settings = await db.workshopSettings.findUnique({
    where: { userId }
  })

  if (!settings) {
    settings = await db.workshopSettings.create({
      data: {
        userId,
        monthlyWorkingHours: 160,
        hourlyLaborRate: 15,
        electricityRateKwh: 0.15,
        wholesaleMarginPct: 40,
        retailMarginPct: 100,
      }
    })
  }

  // Check Equipment
  const countEquipment = await db.equipment.count({ where: { userId } })
  if (countEquipment === 0) {
    const defaultMachines = [
      {
        name: "Overlock 4 Hilos Industrial",
        purchasePrice: 650,
        usefulLifeHours: 6000,
        maintenanceCost: 150,
        powerWatts: 550,
      },
      {
        name: "Máquina Recta Industrial",
        purchasePrice: 500,
        usefulLifeHours: 8000,
        maintenanceCost: 100,
        powerWatts: 400,
      },
      {
        name: "Collareta Industrial",
        purchasePrice: 750,
        usefulLifeHours: 6000,
        maintenanceCost: 180,
        powerWatts: 550,
      },
      {
        name: "Plancha Industrial a Vapor",
        purchasePrice: 350,
        usefulLifeHours: 4000,
        maintenanceCost: 80,
        powerWatts: 1500,
      },
    ]

    for (const m of defaultMachines) {
      const hourlyWearCost = (m.purchasePrice / m.usefulLifeHours) + (m.maintenanceCost / m.usefulLifeHours)
      const hourlyEnergyCost = (m.powerWatts / 1000) * settings.electricityRateKwh
      const hourlyRate = hourlyWearCost + hourlyEnergyCost

      await db.equipment.create({
        data: {
          userId,
          name: m.name,
          purchasePrice: m.purchasePrice,
          usefulLifeHours: m.usefulLifeHours,
          maintenanceCost: m.maintenanceCost,
          powerWatts: m.powerWatts,
          electricityRateKwh: settings.electricityRateKwh,
          hourlyWearCost,
          hourlyEnergyCost,
          hourlyRate,
        }
      })
    }
  }

  // Check Fixed Expenses
  const countFixed = await db.fixedExpense.count({ where: { userId } })
  if (countFixed === 0) {
    const defaultExpenses = [
      { name: "Alquiler de Taller", monthlyCost: 250 },
      { name: "Luz / Electricidad Base Taller", monthlyCost: 60 },
      { name: "Internet & Teléfono", monthlyCost: 35 },
      { name: "Agua & Servicios Varios", monthlyCost: 20 },
    ]

    for (const e of defaultExpenses) {
      await db.fixedExpense.create({
        data: {
          userId,
          name: e.name,
          monthlyCost: e.monthlyCost,
        }
      })
    }
  }
}

export async function getCostingData() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("No estás autenticado")
  }

  const userId = session.user.id
  await ensureDefaultCostingData(userId)

  const [settings, equipments, fixedExpenses, projects] = await Promise.all([
    db.workshopSettings.findUnique({ where: { userId } }),
    db.equipment.findMany({ where: { userId }, orderBy: { name: "asc" } }),
    db.fixedExpense.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    db.project.findMany({
      where: { userId },
      include: {
        materials: { include: { material: true } },
        equipments: { include: { equipment: true } },
      },
      orderBy: { updatedAt: "desc" }
    })
  ])

  // Total monthly fixed expenses
  const totalMonthlyOverhead = fixedExpenses.reduce((acc, fe) => acc + fe.monthlyCost, 0)
  const hourlyOverheadRate = settings?.monthlyWorkingHours && settings.monthlyWorkingHours > 0
    ? totalMonthlyOverhead / settings.monthlyWorkingHours
    : 0

  return {
    settings,
    equipments,
    fixedExpenses,
    totalMonthlyOverhead,
    hourlyOverheadRate,
    projects,
  }
}

export async function upsertEquipment(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No estás autenticado")

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const purchasePrice = parseFloat(formData.get("purchasePrice") as string) || 0
  const usefulLifeHours = parseFloat(formData.get("usefulLifeHours") as string) || 5000
  const maintenanceCost = parseFloat(formData.get("maintenanceCost") as string) || 0
  const powerWatts = parseFloat(formData.get("powerWatts") as string) || 0
  const electricityRateKwh = parseFloat(formData.get("electricityRateKwh") as string) || 0.15
  const notes = formData.get("notes") as string || ""

  const hourlyWearCost = usefulLifeHours > 0 ? (purchasePrice / usefulLifeHours) + (maintenanceCost / usefulLifeHours) : 0
  const hourlyEnergyCost = (powerWatts / 1000) * electricityRateKwh
  const hourlyRate = hourlyWearCost + hourlyEnergyCost

  if (id) {
    await db.equipment.update({
      where: { id, userId: session.user.id },
      data: {
        name,
        purchasePrice,
        usefulLifeHours,
        maintenanceCost,
        powerWatts,
        electricityRateKwh,
        hourlyWearCost,
        hourlyEnergyCost,
        hourlyRate,
        notes,
      }
    })
  } else {
    await db.equipment.create({
      data: {
        userId: session.user.id,
        name,
        purchasePrice,
        usefulLifeHours,
        maintenanceCost,
        powerWatts,
        electricityRateKwh,
        hourlyWearCost,
        hourlyEnergyCost,
        hourlyRate,
        notes,
      }
    })
  }

  revalidatePath("/dashboard/costeo")
}

export async function deleteEquipment(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No estás autenticado")

  await db.equipment.delete({
    where: { id, userId: session.user.id }
  })

  revalidatePath("/dashboard/costeo")
}

export async function upsertFixedExpense(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No estás autenticado")

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const monthlyCost = parseFloat(formData.get("monthlyCost") as string) || 0

  if (id) {
    await db.fixedExpense.update({
      where: { id, userId: session.user.id },
      data: { name, monthlyCost }
    })
  } else {
    await db.fixedExpense.create({
      data: {
        userId: session.user.id,
        name,
        monthlyCost
      }
    })
  }

  revalidatePath("/dashboard/costeo")
}

export async function deleteFixedExpense(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No estás autenticado")

  await db.fixedExpense.delete({
    where: { id, userId: session.user.id }
  })

  revalidatePath("/dashboard/costeo")
}

export async function updateWorkshopSettings(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No estás autenticado")

  const monthlyWorkingHours = parseFloat(formData.get("monthlyWorkingHours") as string) || 160
  const hourlyLaborRate = parseFloat(formData.get("hourlyLaborRate") as string) || 15
  const electricityRateKwh = parseFloat(formData.get("electricityRateKwh") as string) || 0.15
  const wholesaleMarginPct = parseFloat(formData.get("wholesaleMarginPct") as string) || 40
  const retailMarginPct = parseFloat(formData.get("retailMarginPct") as string) || 100

  await db.workshopSettings.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      monthlyWorkingHours,
      hourlyLaborRate,
      electricityRateKwh,
      wholesaleMarginPct,
      retailMarginPct,
    },
    update: {
      monthlyWorkingHours,
      hourlyLaborRate,
      electricityRateKwh,
      wholesaleMarginPct,
      retailMarginPct,
    }
  })

  // Recalculate equipment energy costs for all equipment of user if electricity rate changed
  const equipments = await db.equipment.findMany({ where: { userId: session.user.id } })
  for (const eq of equipments) {
    const hourlyWearCost = eq.usefulLifeHours > 0 ? (eq.purchasePrice / eq.usefulLifeHours) + (eq.maintenanceCost / eq.usefulLifeHours) : 0
    const hourlyEnergyCost = (eq.powerWatts / 1000) * electricityRateKwh
    const hourlyRate = hourlyWearCost + hourlyEnergyCost

    await db.equipment.update({
      where: { id: eq.id },
      data: {
        electricityRateKwh,
        hourlyEnergyCost,
        hourlyRate
      }
    })
  }

  revalidatePath("/dashboard/costeo")
}

export async function saveProjectCostEstimation(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No estás autenticado")

  const projectId = formData.get("projectId") as string
  const estimatedLaborHours = parseFloat(formData.get("estimatedLaborHours") as string) || 0
  const estimatedMaterialsCost = parseFloat(formData.get("estimatedMaterialsCost") as string) || 0
  const hourlyLaborRate = parseFloat(formData.get("hourlyLaborRate") as string) || 15

  const settings = await db.workshopSettings.findUnique({ where: { userId: session.user.id } })
  const fixedExpenses = await db.fixedExpense.findMany({ where: { userId: session.user.id } })
  const totalFixed = fixedExpenses.reduce((acc, f) => acc + f.monthlyCost, 0)
  const hourlyOverhead = settings && settings.monthlyWorkingHours > 0 ? totalFixed / settings.monthlyWorkingHours : 0

  const estimatedTotalCost = estimatedMaterialsCost + (estimatedLaborHours * (hourlyLaborRate + hourlyOverhead))

  await db.project.update({
    where: { id: projectId, userId: session.user.id },
    data: {
      estimatedHours: estimatedLaborHours,
      estimatedLaborHours,
      estimatedMaterialsCost,
      estimatedTotalCost,
      hourlyLaborRate,
    }
  })

  revalidatePath(`/dashboard/proyectos/${projectId}`)
  revalidatePath("/dashboard/costeo")
}

export async function addEquipmentToProject(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No estás autenticado")

  const projectId = formData.get("projectId") as string
  const equipmentId = formData.get("equipmentId") as string
  const hoursUsed = parseFloat(formData.get("hoursUsed") as string) || 0

  if (!projectId || !equipmentId || hoursUsed <= 0) {
    throw new Error("Datos inválidos")
  }

  const equipment = await db.equipment.findUnique({ where: { id: equipmentId } })
  if (!equipment) throw new Error("Máquina no encontrada")

  const cost = hoursUsed * equipment.hourlyRate

  await db.projectEquipment.upsert({
    where: {
      projectId_equipmentId: { projectId, equipmentId }
    },
    create: {
      projectId,
      equipmentId,
      hoursUsed,
      cost
    },
    update: {
      hoursUsed: { increment: hoursUsed },
      cost: { increment: cost }
    }
  })

  // Recalculate Project total cost breakdown
  await recalculateProjectTotals(projectId, session.user.id)

  revalidatePath(`/dashboard/proyectos/${projectId}`)
  revalidatePath("/dashboard/costeo")
}

export async function removeEquipmentFromProject(projectId: string, equipmentId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No estás autenticado")

  await db.projectEquipment.delete({
    where: {
      projectId_equipmentId: { projectId, equipmentId }
    }
  })

  await recalculateProjectTotals(projectId, session.user.id)

  revalidatePath(`/dashboard/proyectos/${projectId}`)
  revalidatePath("/dashboard/costeo")
}

export async function recalculateProjectTotals(projectId: string, userId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      materials: { include: { material: true } },
      equipments: { include: { equipment: true } },
    }
  })

  if (!project) return

  const settings = await db.workshopSettings.findUnique({ where: { userId } })
  const fixedExpenses = await db.fixedExpense.findMany({ where: { userId } })

  const actualMaterialsCost = project.materials.reduce((acc, pm) => {
    return acc + (pm.quantityUsed * pm.material.costPerUnit)
  }, 0)

  const equipmentCosts = project.equipments.reduce((acc, pe) => {
    return acc + pe.cost
  }, 0)

  const actualHours = project.actualHours || 0
  const hourlyLaborRate = project.hourlyLaborRate || settings?.hourlyLaborRate || 15

  const totalMonthlyOverhead = fixedExpenses.reduce((acc, f) => acc + f.monthlyCost, 0)
  const hourlyOverheadRate = settings?.monthlyWorkingHours && settings.monthlyWorkingHours > 0
    ? totalMonthlyOverhead / settings.monthlyWorkingHours
    : 0

  const overheadCosts = actualHours * hourlyOverheadRate
  const laborCost = actualHours * hourlyLaborRate

  const totalCost = actualMaterialsCost + laborCost + equipmentCosts + overheadCosts

  const wholesaleMargin = settings?.wholesaleMarginPct || 40
  const retailMargin = settings?.retailMarginPct || 100

  const suggestedWholesalePrice = totalCost * (1 + wholesaleMargin / 100)
  const suggestedRetailPrice = totalCost * (1 + retailMargin / 100)

  await db.project.update({
    where: { id: projectId },
    data: {
      actualMaterialsCost,
      equipmentCosts,
      overheadCosts,
      totalCost,
      suggestedWholesalePrice,
      suggestedRetailPrice,
    }
  })
}
