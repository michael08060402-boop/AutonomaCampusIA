import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, BookOpen, Users, CheckCircle, Clock, ClipboardList } from "lucide-react";
import Link from "next/link";
import GradeForm, { FileLink } from "./grade-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TareaDetallePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Verificar que la tarea es del docente
  const { data: task } = await supabase
    .from("tasks")
    .select(`
      id, title, description, due_date, created_at,
      course:course_id ( id, title )
    `)
    .eq("id", id)
    .single();

  if (!task) notFound();

  const course = task.course as unknown as { id: string; title: string } | null;

  // Verificar que el curso pertenece al docente
  if (course) {
    const { data: owned } = await supabase
      .from("courses")
      .select("id")
      .eq("id", course.id)
      .eq("teacher_id", user!.id)
      .single();
    if (!owned) notFound();
  }

  // Estudiantes inscritos en el curso
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("student_id, student:student_id ( id, full_name, avatar_url )")
    .eq("course_id", course?.id ?? "");

  // Entregas de esta tarea
  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, student_id, content, file_url, submitted_at, grade, feedback")
    .eq("task_id", id);

  const subMap: Record<string, {
    id: string; content: string; file_url: string | null;
    submitted_at: string; grade: number | null; feedback: string | null;
  }> = {};
  for (const s of submissions ?? []) subMap[s.student_id] = s;

  const students = (enrollments ?? []).map((e) => ({
    profile: e.student as unknown as { id: string; full_name: string; avatar_url: string | null } | null,
    submission: subMap[e.student_id] ?? null,
  }));

  const now = new Date();
  const isOverdue = task.due_date && new Date(task.due_date) < now;
  const dueDateStr = task.due_date
    ? new Date(task.due_date).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

  const submitted = students.filter((s) => s.submission).length;
  const total = students.length;
  const graded = students.filter((s) => s.submission?.grade !== null && s.submission?.grade !== undefined).length;

  return (
    <div className="w-full">

      {/* Banner */}
      <div className="relative bg-gradient-to-br from-orange-500 to-orange-700 px-8 py-8 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative">
          <Link
            href="/docente/tareas"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a tareas
          </Link>
          <h1 className="text-2xl font-bold text-white">{task.title}</h1>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            {course && (
              <span className="flex items-center gap-1.5 text-white/70 text-sm">
                <BookOpen className="w-4 h-4" />
                {course.title}
              </span>
            )}
            {dueDateStr && (
              <span className={`flex items-center gap-1.5 text-sm ${isOverdue ? "text-red-200" : "text-white/70"}`}>
                <Calendar className="w-4 h-4" />
                {isOverdue ? "Venció" : "Vence"} {dueDateStr}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 pt-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <p className="text-3xl font-bold text-gray-900">{total}</p>
            <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5" /> Inscritos
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <p className="text-3xl font-bold text-orange-500">{submitted}</p>
            <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Entregaron
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <p className="text-3xl font-bold text-orange-500">{graded}</p>
            <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
              <ClipboardList className="w-3.5 h-3.5" /> Calificados
            </p>
          </div>
        </div>

        {/* Instrucciones */}
        {task.description && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Instrucciones</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        {/* Lista de estudiantes */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">Entregas de estudiantes</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
              {submitted} de {total}
            </span>
          </div>

          {students.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No hay estudiantes inscritos en este curso.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {students.map(({ profile, submission }) => {
                if (!profile) return null;
                const name = profile.full_name || "Sin nombre";
                const initial = name.charAt(0).toUpperCase();

                return (
                  <div key={profile.id} className="px-6 py-5">
                    {/* Cabecera del estudiante */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-orange-100 flex items-center justify-center shrink-0">
                        {profile.avatar_url
                          ? <img src={profile.avatar_url} alt={name} className="w-full h-full object-cover" />
                          : <span className="text-orange-600 font-bold text-sm">{initial}</span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{name}</p>
                        {submission && (
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Entregado el {new Date(submission.submitted_at).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        )}
                      </div>
                      {submission ? (
                        submission.grade !== null
                          ? <span className="text-sm font-bold text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full shrink-0">{submission.grade}/20</span>
                          : <span className="text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full shrink-0">Sin calificar</span>
                      ) : (
                        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full shrink-0">Sin entrega</span>
                      )}
                    </div>

                    {/* Contenido de la entrega */}
                    {submission ? (
                      <div className="ml-12 space-y-3">
                        {submission.content && submission.content !== "(Archivo adjunto)" && (
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 mb-2">Respuesta</p>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{submission.content}</p>
                          </div>
                        )}
                        {submission.file_url && <FileLink url={submission.file_url} />}

                        {/* Formulario de calificación */}
                        <GradeForm
                          submissionId={submission.id}
                          initialGrade={submission.grade}
                          initialFeedback={submission.feedback}
                        />
                      </div>
                    ) : (
                      <div className="ml-12">
                        <p className="text-xs text-gray-400 italic">Este estudiante aún no ha entregado la tarea.</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
