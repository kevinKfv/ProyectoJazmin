"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import fs from "fs"
import path from "path"

export async function guardarSugerencia(data: {
  title: string
  description: string
  category: string
  priority: string
}) {
  const session = await auth()
  const userName = session?.user?.name || "Jazmín"
  const userEmail = session?.user?.email || "jazmin@sewstudio.com"
  const userId = session?.user?.id || undefined

  if (!data.title?.trim() || !data.description?.trim()) {
    throw new Error("El título y la descripción son requeridos")
  }

  const now = new Date()
  const dateStr = now.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })

  // 1. Guardar en Base de Datos (si la DB está disponible)
  let dbRecord = null
  try {
    dbRecord = await db.suggestion.create({
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category || "General",
        priority: data.priority || "Media",
        status: "Pendiente",
        userId: userId,
      },
    })
  } catch (error) {
    console.warn("Nota: No se pudo guardar en la base de datos, guardando en archivo local:", error)
  }

  // 2. Guardar y anexar en SUGERENCIAS_Y_MEJORAS.md en la raíz del proyecto
  try {
    const filePath = path.join(process.cwd(), "SUGERENCIAS_Y_MEJORAS.md")
    
    // Si el archivo no existe, crearlo con encabezado
    if (!fs.existsSync(filePath)) {
      const header = `# 💡 Buzón de Sugerencias y Mejoras — SewStudio\n\n> Este archivo registra automáticamente cada sugerencia, idea y necesidad que Jazmín escribe desde la aplicación.\n> Cada ítem se toma como base para trabajar y programar las próximas actualizaciones del proyecto. 🚀\n\n---\n\n## 📋 Registro de Sugerencias para Actualizaciones\n`
      fs.writeFileSync(filePath, header, "utf-8")
    }

    const categoryEmoji: Record<string, string> = {
      "Patronaje & Moldes": "📐",
      "Inventario & Telas": "🧵",
      "Diseño & IA": "🎨",
      "Presupuestos & Clientes": "💼",
      "General": "💡",
    }
    const emoji = categoryEmoji[data.category] || "💡"

    const entry = `\n### ${emoji} [${dateStr}] ${data.title.trim()}\n` +
      `- **Estado:** 🟡 Pendiente para próxima actualización\n` +
      `- **Categoría:** ${data.category || "General"}\n` +
      `- **Prioridad:** ${data.priority || "Media"}\n` +
      `- **Solicitado por:** ${userName} (${userEmail})\n` +
      `- **Detalle de la propuesta:**\n  > ${data.description.trim().replace(/\n/g, "\n  > ")}\n` +
      `\n---\n`

    // Si aún tiene el mensaje de "Aún no hay sugerencias", removerlo antes de anexar
    let currentContent = fs.readFileSync(filePath, "utf-8")
    const placeholder = "*Aún no hay sugerencias registradas. Cuando Jazmín use el botón \"Sugerir Mejora / Idea\" en la app, aparecerán automáticamente aquí.*\n"
    if (currentContent.includes(placeholder)) {
      currentContent = currentContent.replace(placeholder, "")
      fs.writeFileSync(filePath, currentContent, "utf-8")
    }

    fs.appendFileSync(filePath, entry, "utf-8")
  } catch (fsError) {
    console.error("Error al anexar sugerencia en SUGERENCIAS_Y_MEJORAS.md:", fsError)
  }

  return { success: true, record: dbRecord }
}

export async function obtenerSugerencias() {
  try {
    const list = await db.suggestion.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    return { success: true, suggestions: list }
  } catch (error) {
    console.warn("Nota: No se pudo consultar la lista de sugerencias en DB:", error)
    return { success: false, suggestions: [] }
  }
}
