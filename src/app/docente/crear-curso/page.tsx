"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { BookOpen, FileText, Image, ToggleLeft, ToggleRight, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function CrearCursoPage() {
  const supabase = createClient();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("El título y la descripción son obligatorios.");
      return;
    }
    setError("");
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("No autenticado."); setLoading(false); return; }

    const { error: insertError } = await supabase.from("courses").insert({
      title: title.trim(),
      description: description.trim(),
      cover_url: coverUrl.trim() || null,
      teacher_id: user.id,
      is_published: isPublished,
    });

    setLoading(false);
    if (insertError) {
      setError("Error al crear el curso. Intenta de nuevo.");
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/docente/cursos"), 1500);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">¡Curso creado!</h2>
        <p className="text-sm text-gray-500">Redirigiendo a tus cursos...</p>
      </div>
    );
  }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link href="/docente/cursos" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crear nuevo curso</h1>
          <p className="text-gray-500 mt-1 text-sm">Completa la información para publicar tu curso.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-5">

          {/* Título */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <BookOpen className="w-4 h-4 text-orange-500" />
              Título del curso
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Introducción a la Programación"
              maxLength={100}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
            />
            <p className="text-xs text-gray-400 mt-2 text-right">{title.length}/100</p>
          </div>

          {/* Descripción */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <FileText className="w-4 h-4 text-orange-500" />
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe de qué trata el curso, qué aprenderán los estudiantes..."
              rows={5}
              maxLength={500}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all resize-none"
            />
            <p className="text-xs text-gray-400 mt-2 text-right">{description.length}/500</p>
          </div>

          {/* Portada */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Image className="w-4 h-4 text-orange-500" />
              URL de portada <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
            />
            {coverUrl && (
              <div className="mt-3 h-32 rounded-xl overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverUrl} alt="Portada" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
              </div>
            )}
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-5">

          {/* Publicar */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Estado del curso</h3>
            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              className="w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all"
              style={{ borderColor: isPublished ? "#f97316" : "#e5e7eb", backgroundColor: isPublished ? "#fff7ed" : "#f9fafb" }}
            >
              <div className="text-left">
                <p className="text-sm font-semibold" style={{ color: isPublished ? "#ea580c" : "#6b7280" }}>
                  {isPublished ? "Publicado" : "Borrador"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isPublished ? "Visible para estudiantes" : "Solo tú puedes verlo"}
                </p>
              </div>
              {isPublished
                ? <ToggleRight className="w-7 h-7 text-orange-500" />
                : <ToggleLeft className="w-7 h-7 text-gray-300" />
              }
            </button>
          </div>

          {/* Resumen */}
          <div className="bg-orange-50 rounded-2xl border border-orange-100 p-5">
            <h3 className="text-sm font-semibold text-orange-800 mb-3">Resumen</h3>
            <div className="space-y-2 text-xs text-orange-700">
              <div className="flex justify-between">
                <span>Título</span>
                <span className="font-medium">{title ? "✓" : "Pendiente"}</span>
              </div>
              <div className="flex justify-between">
                <span>Descripción</span>
                <span className="font-medium">{description ? "✓" : "Pendiente"}</span>
              </div>
              <div className="flex justify-between">
                <span>Portada</span>
                <span className="font-medium">{coverUrl ? "✓" : "Opcional"}</span>
              </div>
              <div className="flex justify-between">
                <span>Estado</span>
                <span className="font-medium">{isPublished ? "Publicado" : "Borrador"}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-600">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading || !title.trim() || !description.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm shadow-orange-200"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPublished ? "Publicar curso" : "Guardar borrador"}
          </button>
        </div>
      </form>
    </div>
  );
}
