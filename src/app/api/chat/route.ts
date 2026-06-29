import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Eres AcademIA, el asistente de inteligencia artificial de AutonomaCampus AI, una plataforma educativa universitaria. Tu misión es ayudar a los estudiantes a aprender mejor, comprender conceptos difíciles y aprovechar al máximo su experiencia académica.
Responde siempre en español de manera cálida, clara y amigable. Adapta tus explicaciones al nivel universitario. Sé conciso pero completo.`;

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your-gemini-api-key") {
      return NextResponse.json(
        { error: "La clave de API de Gemini no está configurada." },
        { status: 503 }
      );
    }

    const { messages, systemPrompt: customPrompt } = await req.json() as {
      messages: { role: "user" | "assistant"; content: string }[];
      systemPrompt?: string;
    };

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No se recibieron mensajes" }, { status: 400 });
    }

    const activePrompt = customPrompt ?? SYSTEM_PROMPT;

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;

    const contents = [
      { role: "user", parts: [{ text: `[Instrucciones del sistema]: ${activePrompt}` }] },
      { role: "model", parts: [{ text: "Entendido. Estoy listo para ayudarte." }] },
      ...history,
      { role: "user", parts: [{ text: lastMessage }] },
    ];

    const body = {
      contents,
      generationConfig: { temperature: 0.8, maxOutputTokens: 1024 },
    };

    let lastError = "";
    for (const model of MODELS) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        return NextResponse.json({ content: text });
      }

      const errData = await res.json().catch(() => ({}));
      lastError = `[${model}] ${errData?.error?.message ?? `HTTP ${res.status}`}`;
      console.error("[Chat API]", lastError);

      if (res.status !== 404 && res.status !== 429) break;
    }

    return NextResponse.json({ error: `Error de Gemini: ${lastError}` }, { status: 500 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Chat API]", message);
    return NextResponse.json({ error: `Error: ${message}` }, { status: 500 });
  }
}
