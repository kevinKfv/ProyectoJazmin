import { groq } from '@ai-sdk/groq'
import { streamText } from 'ai'
import { auth } from "@/auth"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    // Temporalmente comentado para permitir pruebas sin iniciar sesión
    // if (!session?.user?.id) {
    //   return new Response("Unauthorized", { status: 401 })
    // }

    const { messages } = await req.json()

    // Sanitize messages to ensure 'content' is always a string and compatible with streamText
    const sanitizedMessages = messages.map((m: any) => {
      let content = m.content;
      if (content === undefined || content === null) {
        if (m.parts && Array.isArray(m.parts)) {
          content = m.parts.map((p: any) => p.text || '').join('');
        } else {
          content = '';
        }
      }
      return {
        role: m.role,
        content: content,
      };
    });

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      messages: sanitizedMessages,
      system: "Eres SewStudio AI, un asistente experto en costura, moldería, diseño de modas y confección textil. Ayudas a los usuarios a estimar costos de materiales, resolver problemas de costura, elegir telas y entender patrones. Si el usuario sube una imagen de una prenda, debes analizarla, decir qué tipo de prenda es, estimar su complejidad de costura (Baja, Media, Alta), y sugerir qué materiales (tipo de tela, avíos) se necesitarían para confeccionarla.",
    })

    return result.toUIMessageStreamResponse()
  } catch (error: any) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Error desconocido', stack: error.stack }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
