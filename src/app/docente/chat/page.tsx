"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Send, Bot, Loader2, Sparkles, Plus, Trash2, MessageSquare, Copy, Check, History, X } from "lucide-react";
import { clsx } from "clsx";
import { createClient } from "@/lib/supabase/client";

const SYSTEM_PROMPT = `Eres DocenIA, el asistente de inteligencia artificial para docentes de AutonomaCampus AI. Tu misión es ayudar a los profesores a crear contenido educativo de alta calidad de forma rápida y eficiente.

Puedes generar: exámenes y cuestionarios con preguntas variadas (opción múltiple, verdadero/falso, desarrollo), rúbricas de evaluación detalladas, materiales de estudio y guías de aprendizaje, actividades y dinámicas de clase, planes de lección estructurados, y retroalimentación para estudiantes.

Responde siempre en español. Sé estructurado, claro y práctico. Cuando generes exámenes o rúbricas, usa formato bien organizado con secciones claras.`;

const PRESETS = [
  { icon: "📝", label: "Crear examen", prompt: "Crea un examen de 10 preguntas sobre el tema: [escribe el tema]. Incluye preguntas de opción múltiple, verdadero/falso y una pregunta de desarrollo. Indica la respuesta correcta en cada pregunta." },
  { icon: "📊", label: "Crear rúbrica", prompt: "Crea una rúbrica de evaluación para calificar [tipo de trabajo] sobre [tema]. Incluye criterios claros con niveles: Excelente, Bueno, Regular e Insuficiente. Puntuación sobre 20." },
  { icon: "📚", label: "Material de estudio", prompt: "Crea un material de estudio completo sobre [tema]. Incluye: resumen, conceptos clave, ejemplos prácticos y preguntas de reflexión para los estudiantes." },
  { icon: "🗓️", label: "Plan de clase", prompt: "Diseña un plan de clase de [duración] para enseñar [tema]. Incluye: objetivo, actividades de inicio, desarrollo y cierre, recursos necesarios y forma de evaluación." },
];

type Message = { id: string; role: "user" | "assistant"; content: string };
type Session = { id: string; title: string; created_at: string };

function groupByDate(sessions: Session[]) {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const groups: { label: string; items: Session[] }[] = [];
  const map: Record<string, Session[]> = {};
  for (const s of sessions) {
    const d = new Date(s.created_at).toDateString();
    const label = d === today ? "Hoy" : d === yesterday ? "Ayer"
      : new Date(s.created_at).toLocaleDateString("es-PE", { day: "numeric", month: "long" });
    if (!map[label]) { map[label] = []; groups.push({ label, items: map[label] }); }
    map[label].push(s);
  }
  return groups;
}

export default function GeneradorIAPage() {
  const supabase = createClient();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    loadSessions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function loadSessions() {
    setLoadingHistory(true);
    const { data } = await supabase
      .from("chat_sessions")
      .select("id, title, created_at")
      .order("updated_at", { ascending: false });
    setSessions(data ?? []);
    setLoadingHistory(false);
  }

  async function selectSession(sessionId: string) {
    setCurrentSessionId(sessionId);
    setError(null);
    const { data } = await supabase
      .from("chat_messages")
      .select("id, role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    setMessages((data ?? []).map((m) => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content })));
  }

  function newChat() {
    setCurrentSessionId(null);
    setMessages([]);
    setError(null);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  async function deleteSession(sessionId: string, e: React.MouseEvent) {
    e.stopPropagation();
    await supabase.from("chat_sessions").delete().eq("id", sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (currentSessionId === sessionId) newChat();
  }

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }

  async function copyMessage(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    setError(null);

    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    try {
      let sessionId = currentSessionId;
      if (!sessionId) {
        const title = text.trim().slice(0, 50) + (text.length > 50 ? "..." : "");
        const { data: session, error: sessionError } = await supabase
          .from("chat_sessions")
          .insert({ title, user_id: userId })
          .select("id")
          .single();
        if (sessionError || !session) {
          setError(`Error al crear sesión: ${sessionError?.message}`);
          setLoading(false);
          return;
        }
        sessionId = session.id;
        setCurrentSessionId(sessionId);
        setSessions((prev) => [{ id: sessionId!, title, created_at: new Date().toISOString() }, ...prev]);
      }

      await supabase.from("chat_messages").insert({ session_id: sessionId, role: "user", content: text.trim() });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          systemPrompt: SYSTEM_PROMPT,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setError(data.error || "Error desconocido"); setLoading(false); return; }

      const assistantMessage: Message = { id: crypto.randomUUID(), role: "assistant", content: data.content };
      setMessages((prev) => [...prev, assistantMessage]);

      await supabase.from("chat_messages").insert({ session_id: sessionId, role: "assistant", content: data.content });
      await supabase.from("chat_sessions").update({ updated_at: new Date().toISOString() }).eq("id", sessionId);

    } catch {
      setError("No se pudo conectar. Revisa tu conexión.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) { e.preventDefault(); sendMessage(input); }
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  const groups = groupByDate(sessions);
  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full w-full relative">

      {/* Mobile overlay for history panel */}
      {historyOpen && (
        <div className="fixed inset-0 bg-black/40 z-10 md:hidden" onClick={() => setHistoryOpen(false)} />
      )}

      {/* Sidebar historial */}
      <div className={clsx(
        "bg-white border-r border-gray-100 flex flex-col",
        "fixed inset-y-0 left-0 w-72 z-20 transition-transform duration-300",
        "md:relative md:inset-auto md:left-auto md:w-64 md:shrink-0 md:z-auto md:!translate-x-0",
        historyOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-3 border-b border-gray-100 flex items-center gap-2">
          <button
            onClick={() => { newChat(); setHistoryOpen(false); }}
            className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            Nueva sesión
          </button>
          <button
            onClick={() => setHistoryOpen(false)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Aún no tienes sesiones</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group.label}>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1">{group.label}</p>
                  <div className="space-y-0.5">
                    {group.items.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => { selectSession(session.id); setHistoryOpen(false); }}
                        className={clsx(
                          "group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors",
                          currentSessionId === session.id
                            ? "bg-orange-50 text-orange-700"
                            : "hover:bg-gray-50 text-gray-600"
                        )}
                      >
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-50" />
                        <span className="text-xs truncate flex-1">{session.title}</span>
                        <button
                          onClick={(e) => deleteSession(session.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Panel principal */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setHistoryOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-orange-50 text-gray-500 hover:text-orange-600 transition-colors shrink-0"
            >
              <History className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-sm shadow-orange-200 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-gray-900 text-base">DocenIA</h1>
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  En línea
                </span>
              </div>
              <p className="text-xs text-gray-400">Generador de contenido educativo · AutonomaCampus AI</p>
            </div>
            <button
              onClick={newChat}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo chat</span>
            </button>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gray-50/50">

          {isEmpty && (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center pt-16 pb-8">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-200 mx-auto mb-3">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1.5">¿Qué quieres crear hoy?</h2>
                <p className="text-sm text-gray-500 max-w-xs">
                  Soy DocenIA, tu asistente para crear contenido educativo. Elige una plantilla o escribe lo que necesitas.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => { setInput(p.prompt); textareaRef.current?.focus(); }}
                    className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-2xl hover:border-orange-200 hover:bg-orange-50 transition-all text-left group shadow-sm"
                  >
                    <span className="text-xl">{p.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-700">{p.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{p.prompt.substring(0, 55)}...</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={clsx("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-orange-200">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="relative max-w-[78%] group">
                <div className={clsx(
                  "px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                  msg.role === "user"
                    ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-tr-sm shadow-sm shadow-orange-200"
                    : "bg-white text-gray-800 rounded-tl-sm border border-gray-100 shadow-sm"
                )}>
                  {msg.content}
                </div>
                {msg.role === "assistant" && (
                  <button
                    onClick={() => copyMessage(msg.id, msg.content)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg"
                    title="Copiar respuesta"
                  >
                    {copied === msg.id
                      ? <Check className="w-3 h-3 text-green-500" />
                      : <Copy className="w-3 h-3 text-gray-400" />
                    }
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-orange-200">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm px-4 py-3">
                <div className="flex items-center gap-1 py-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-100 px-4 py-3 shrink-0">
          {/* Chips de plantillas rápidas cuando ya hay chat */}
          {!isEmpty && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => { setInput(p.prompt); textareaRef.current?.focus(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-medium rounded-lg whitespace-nowrap transition-colors shrink-0"
                >
                  <span>{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); autoResize(); }}
              onKeyDown={handleKeyDown}
              placeholder="Describe qué quieres generar… (Enter para enviar, Shift+Enter para nueva línea)"
              rows={1}
              disabled={loading}
              className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 disabled:opacity-60 transition-all"
              style={{ minHeight: "44px", maxHeight: "140px" }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 flex items-center justify-center shrink-0 disabled:opacity-40 transition-all shadow-sm shadow-orange-200 active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
            </button>
          </form>
          <p className="text-center text-[10px] text-gray-400 mt-2">
            DocenIA puede cometer errores. Revisa el contenido antes de usarlo con tus estudiantes.
          </p>
        </div>
      </div>
    </div>
  );
}
