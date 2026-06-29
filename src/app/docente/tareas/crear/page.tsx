"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { ClipboardList, FileText, BookOpen, Calendar, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

function CrearTareaForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const cursoParam = searchParams.get("curso") ?? "";

  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [courseId, setCourseId] = useState(cursoParam);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadCourses() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("courses")
        .select("id, title")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false });
      setCourses(data ?? []);
      if (!cursoParam && data && data.length > 0) setCourseId(data[0].id);
    }
    loadCourses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId || !title.trim()) { setError("Selecciona un curso y escribe el título."); return; }
    setError("");
    setLoading(true);

    const { error: insertError } = await supabase.from("tasks").insert({
      course_id: courseId,
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate || null,
    });

    setLoading(false);
    if (insertError) {
      setError("Error al crear la tarea. Intenta de nuevo.");
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/docente/tareas"), 1500);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">¡Tarea creada!</h2>
        <p className="text-sm text-gray-500">Redirigiendo a tareas...</p>
      </div>
    );
  }

  return (
    <div className="p-8">

      <div className="mb-8 flex items-center gap-4">
        <Link href="/docente/tareas" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva tarea</h1>
          <p className="text-gray-500 mt-1 text-sm">Asigna una tarea a uno de tus cursos.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-5">

          {/* Curso */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <BookOpen className="w-4 h-4 text-orange-500" />
              Curso
            </label>
            {courses.length === 0 ? (
              <p className="text-sm text-gray-400">No tienes cursos. <Link href="/docente/crear-curso" className="text-orange-500 hover:underline">Crea uno primero.</Link></p>
            ) : (
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all bg-white"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            )}
          </div>

          {/* Título */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <ClipboardList className="w-4 h-4 text-orange-500" />
              Título de la tarea
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Examen parcial — Capítulo 3"
              maxLength={150}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
            />
            <p className="text-xs text-gray-400 mt-2 text-right">{title.length}/150</p>
          </div>

          {/* Descripción */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <FileText className="w-4 h-4 text-orange-500" />
              Instrucciones <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe qué deben hacer los estudiantes, criterios de evaluación, formato de entrega..."
              rows={5}
              maxLength={1000}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all resize-none"
            />
            <p className="text-xs text-gray-400 mt-2 text-right">{description.length}/1000</p>
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-5">

          {/* Fecha de entrega */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Calendar className="w-4 h-4 text-orange-500" />
              Fecha de entrega <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
            />
            {!dueDate && (
              <p className="text-xs text-gray-400 mt-2">Sin fecha límite, la tarea queda abierta.</p>
            )}
          </div>

          {/* Resumen */}
          <div className="bg-orange-50 rounded-2xl border border-orange-100 p-5">
            <h3 className="text-sm font-semibold text-orange-800 mb-3">Resumen</h3>
            <div className="space-y-2 text-xs text-orange-700">
              <div className="flex justify-between">
                <span>Curso</span>
                <span className="font-medium">{courses.find((c) => c.id === courseId)?.title ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Título</span>
                <span className="font-medium">{title ? "✓" : "Pendiente"}</span>
              </div>
              <div className="flex justify-between">
                <span>Instrucciones</span>
                <span className="font-medium">{description ? "✓" : "Opcional"}</span>
              </div>
              <div className="flex justify-between">
                <span>Vencimiento</span>
                <span className="font-medium">{dueDate ? new Date(dueDate).toLocaleDateString("es-PE", { day: "numeric", month: "short" }) : "Sin límite"}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-600">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading || !courseId || !title.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm shadow-orange-200"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Publicar tarea
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CrearTareaPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>}>
      <CrearTareaForm />
    </Suspense>
  );
}
