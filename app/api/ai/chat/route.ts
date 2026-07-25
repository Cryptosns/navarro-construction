import { getOpenAI, requireAuth, buildAssistantContext, trimChatHistory, languageInstruction } from "@/lib/ai/server";

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAuth();
    if (!user) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "OpenAI API key no configurada" }, { status: 500 });
    }

    const body = await request.json();
    const { messages, language = "auto" } = body;

    if (!messages?.length) {
      return Response.json({ error: "Mensajes requeridos" }, { status: 400 });
    }

    const context = await buildAssistantContext(supabase, user.id);
    const systemPrompt = `Eres Dave, asistente de construcción de NavarroConstruction.
${languageInstruction(language)}

Datos actuales del usuario:
${context}`;

    const openai = getOpenAI();
    const history = trimChatHistory(messages);

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...history],
      max_tokens: 350,
      temperature: 0.6,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`),
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Stream error" })}\n\n`,
            ),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("OpenAI API error:", err);
    return Response.json(
      { error: "Error al conectar con OpenAI. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
