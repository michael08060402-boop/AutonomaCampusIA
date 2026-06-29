"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ClipboardList, BookOpen, Calendar, CheckCircle, Clock,
  Loader2, Send, X, ChevronDown, ChevronUp, AlertCircle,
  Paperclip, FileText, Download, XCircle,
} from "lucide-react";

type Submission = {
  id: string;
  content: string;
  submitted_at: string;
  grade: number | null;
  feedback: string | null;
  file_url: string | null;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  created_at: string;
  course: { id: string; title: string } | null;
  submission: Submission | null;
};

export default function TareasEstudiantePage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeFileTaskId, setActiveFileTaskId] = useState<string | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pendientes" | "entregadas">("pendientes");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [contents, setContents] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [submitMsg, setSubmitMsg] = useState<Record<string, { type: "ok" | "error"; text: string }>>({});

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", user.id);

      const courseIds = enrollments?.map((e) => e.course_id) ?? [];
      if (courseIds.length === 0) { setLoading(false); return; }

      const { data: taskRows } = await supabase
        .from("tasks")
        .select("id, title, description, due_date, created_at, course:course_id ( id, title )")
        .in("course_id", courseIds)
        .order("due_date", { ascending: true, nullsFirst: false });

      const taskIds = taskRows?.map((t) => t.id) ?? [];
      const { data: subRows } = taskIds.length > 0
        ? await supabase
            .from("submissions")
            .select("id, task_id, content, submitted_at, grade, feedback, file_url")
            .eq("student_id", user.id)
            .in("task_id", taskIds)
        : { data: [] };

      const subMap: Record<string, Submission> = {};
      for (const s of subRows ?? []) subMap[s.task_id] = s;

      setTasks(
        (taskRows ?? []).map((t) => ({
          ...t,
          course: Array.isArray(t.course) ? (t.course[0] ?? null) : (t.course as Task["course"]),
          submission: subMap[t.id] ?? null,
        }))
      );
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function triggerFileInput(taskId: string) {
    setActiveFileTaskId(taskId);
    fileInputRef.current?.click();
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeFileTaskId) return;
    if (file.size > 20 * 1024 * 1024) {
      setSubmitMsg((prev) => ({ ...prev, [activeFileTaskId]: { type: "error", text: "El archivo no puede superar 20 MB." } }));
      return;
    }
    setSelectedFiles((prev) => ({ ...prev, [activeFileTaskId]: file }));
    e.target.value = "";
  }

  function removeFile(taskId: string) {
    setSelectedFiles((prev) => { const n = { ...prev }; delete n[taskId]; return n; });
  }

  async function handleSubmit(taskId: string) {
    const content = contents[taskId]?.trim() ?? "";
    const file = selectedFiles[taskId];

    if (!content && !file) {
      setSubmitMsg((prev) => ({ ...prev, [taskId]: { type: "error", text: "Escribe una respuesta o adjunta un archivo." } }));
      return;
    }

    setSubmitting(taskId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let file_url: string | null = null;

    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${taskId}/${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("task-files")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        setSubmitMsg((prev) => ({ ...prev, [taskId]: { type: "error", text: `Storage: ${uploadError.message}` } }));
        setSubmitting(null);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from("task-files").getPublicUrl(path);
      file_url = publicUrl;
    }

    const { error } = await supabase.from("submissions").insert({
      task_id: taskId,
      student_id: user.id,
      content: content || "(Archivo adjunto)",
      ...(file_url ? { file_url } : {}),
    });

    if (error) {
      setSubmitMsg((prev) => ({ ...prev, [taskId]: { type: "error", text: error.message } }));
    } else {
      const now = new Date().toISOString();
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, submission: { id: crypto.randomUUID(), content: content || "(Archivo adjunto)", submitted_at: now, grade: null, feedback: null, file_url } }
            : t
        )
      );
      setExpandedId(null);
      setSelectedFiles((prev) => { const n = { ...prev }; delete n[taskId]; return n; });
      setContents((prev) => { const n = { ...prev }; delete n[taskId]; return n; });
    }
    setSubmitting(null);
  }

  function fileName(url: string) {
    try { return decodeURIComponent(url.split("/").pop()?.split("?")[0] ?? "Archivo"); } catch { return "Archivo"; }
  }

  const now = new Date();
  const pending = tasks.filter((t) => !t.submission);
  const submitted = tasks.filter((t) => t.submission);
  const displayed = tab === "pendientes" ? pending : submitted;

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>;
  }

  return (
    <div className="w-full">

      {/* Input de archivo oculto (compartido) */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.zip"
        onChange={handleFileSelected}
      />

      {/* Banner */}
      <div className="relative bg-gradient-to-br from-orange-500 to-orange-700 px-8 py-8 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Mis tareas</h1>
          <p className="text-white/70 text-sm mt-1">Revisa y entrega las tareas de tus cursos.</p>
          <div className="flex items-center gap-5 mt-4">
            <div>
              <p className="text-2xl font-bold text-white">{pending.length}</p>
              <p className="text-xs text-white/70">Pendientes</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <p className="text-2xl font-bold text-white">{submitted.length}</p>
              <p className="text-xs text-white/70">Entregadas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 pt-6">

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
          {(["pendientes", "entregadas"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "pendientes" ? "Pendientes" : "Entregadas"} ({t === "pendientes" ? pending.length : submitted.length})
            </button>
          ))}
        </div>

        {displayed.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
              {tab === "pendientes"
                ? <CheckCircle className="w-7 h-7 text-orange-400" />
                : <ClipboardList className="w-7 h-7 text-orange-400" />
              }
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {tab === "pendientes" ? "¡Al día con tus tareas!" : "Aún no has entregado tareas"}
            </h2>
            <p className="text-sm text-gray-400 max-w-xs">
              {tab === "pendientes"
                ? "No tienes tareas pendientes por el momento."
                : "Las tareas que entregues aparecerán aquí con su calificación."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((task) => {
              const isExpanded = expandedId === task.id;
              const isOverdue = task.due_date && new Date(task.due_date) < now && !task.submission;
              const dueDateStr = task.due_date
                ? new Date(task.due_date).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                : null;
              const selectedFile = selectedFiles[task.id];

              return (
                <div key={task.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

                  {/* Header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : task.id)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      task.submission ? "bg-orange-50" : isOverdue ? "bg-red-50" : "bg-orange-50"
                    }`}>
                      {task.submission
                        ? <CheckCircle className="w-5 h-5 text-orange-500" />
                        : isOverdue
                          ? <AlertCircle className="w-5 h-5 text-red-400" />
                          : <ClipboardList className="w-5 h-5 text-orange-500" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{task.title}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {task.course && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <BookOpen className="w-3 h-3" />{task.course.title}
                          </span>
                        )}
                        {dueDateStr && (
                          <span className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-400 font-medium" : "text-gray-400"}`}>
                            <Clock className="w-3 h-3" />
                            {isOverdue ? "Venció" : "Vence"} {dueDateStr}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {task.submission ? (
                        task.submission.grade !== null
                          ? <span className="text-sm font-bold text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">{task.submission.grade}/20</span>
                          : <span className="text-xs font-medium text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full">Entregada</span>
                      ) : isOverdue
                        ? <span className="text-xs font-medium text-red-500 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">Vencida</span>
                        : <span className="text-xs font-medium text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full">Pendiente</span>
                      }
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
                    </div>
                  </button>

                  {/* Detalle expandido */}
                  {isExpanded && (
                    <div className="px-6 pb-5 border-t border-gray-50">
                      {task.description && (
                        <div className="mt-4 mb-4 bg-gray-50 rounded-xl p-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Instrucciones del docente</p>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{task.description}</p>
                        </div>
                      )}

                      {task.submission ? (
                        /* Vista de entrega realizada */
                        <div className="space-y-3 mt-4">
                          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                            <p className="text-xs font-semibold text-orange-700 mb-2">Tu entrega</p>
                            {task.submission.content !== "(Archivo adjunto)" && (
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.submission.content}</p>
                            )}
                            {task.submission.file_url && (
                              <a
                                href={task.submission.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-2 text-xs font-medium text-orange-600 hover:text-orange-700 bg-white border border-orange-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                {fileName(task.submission.file_url)}
                                <Download className="w-3 h-3" />
                              </a>
                            )}
                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Entregado el {new Date(task.submission.submitted_at).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                          </div>
                          {task.submission.feedback && (
                            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                              <p className="text-xs font-semibold text-orange-700 mb-1.5">Retroalimentación del docente</p>
                              <p className="text-sm text-gray-700 leading-relaxed">{task.submission.feedback}</p>
                            </div>
                          )}
                          {task.submission.grade !== null && (
                            <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-700">Calificación</p>
                              <span className="text-xl font-bold text-orange-600">{task.submission.grade} / 20</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Formulario de entrega */
                        <div className="mt-4 space-y-3">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tu entrega</p>

                          <textarea
                            value={contents[task.id] ?? ""}
                            onChange={(e) => setContents((prev) => ({ ...prev, [task.id]: e.target.value }))}
                            placeholder="Escribe tu respuesta aquí... (opcional si adjuntas un archivo)"
                            rows={4}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all resize-none"
                          />

                          {/* Archivo seleccionado */}
                          {selectedFile ? (
                            <div className="flex items-center gap-2 px-3 py-2.5 bg-orange-50 border border-orange-100 rounded-xl">
                              <FileText className="w-4 h-4 text-orange-500 shrink-0" />
                              <span className="text-xs font-medium text-orange-700 truncate flex-1">{selectedFile.name}</span>
                              <span className="text-xs text-orange-400 shrink-0">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</span>
                              <button onClick={() => removeFile(task.id)} className="text-orange-400 hover:text-red-500 transition-colors">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => triggerFileInput(task.id)}
                              className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-200 hover:border-orange-300 rounded-xl text-sm text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all w-full justify-center"
                            >
                              <Paperclip className="w-4 h-4" />
                              Adjuntar archivo (PDF, Word, imagen… máx 20 MB)
                            </button>
                          )}

                          {submitMsg[task.id] && (
                            <div className={`text-xs px-3 py-2.5 rounded-xl border ${submitMsg[task.id].type === "ok" ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-600"}`}>
                              {submitMsg[task.id].text}
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSubmit(task.id)}
                              disabled={submitting === task.id || (!contents[task.id]?.trim() && !selectedFiles[task.id])}
                              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-all"
                            >
                              {submitting === task.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              Entregar tarea
                            </button>
                            <button
                              onClick={() => { setExpandedId(null); removeFile(task.id); }}
                              className="flex items-center gap-1.5 px-4 py-2.5 text-gray-400 hover:text-gray-600 text-sm rounded-xl hover:bg-gray-100 transition-colors"
                            >
                              <X className="w-4 h-4" />
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
