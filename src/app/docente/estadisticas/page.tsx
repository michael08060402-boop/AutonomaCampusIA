import { createClient } from "@/lib/supabase/server";
import { BarChart3, BookOpen, Users, ClipboardList, CheckSquare, TrendingUp } from "lucide-react";

export default async function EstadisticasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Cursos del docente
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, is_published, created_at")
    .eq("teacher_id", user!.id)
    .order("created_at", { ascending: false });

  const courseIds = courses?.map((c) => c.id) ?? [];

  // Inscripciones
  const { data: enrollments } = courseIds.length > 0
    ? await supabase.from("enrollments").select("course_id").in("course_id", courseIds)
    : { data: [] };

  // Tareas
  const { data: tasks } = courseIds.length > 0
    ? await supabase.from("tasks").select("id, course_id, due_date").in("course_id", courseIds)
    : { data: [] };

  const taskIds = tasks?.map((t) => t.id) ?? [];

  // Entregas
  const { data: submissions } = taskIds.length > 0
    ? await supabase.from("submissions").select("task_id, grade").in("task_id", taskIds)
    : { data: [] };

  // Totales globales
  const totalCursos = courses?.length ?? 0;
  const cursosPublicados = courses?.filter((c) => c.is_published).length ?? 0;
  const totalEstudiantes = new Set(enrollments?.map((e) => e.course_id)).size > 0
    ? (enrollments?.length ?? 0)
    : 0;
  const totalTareas = tasks?.length ?? 0;
  const totalEntregas = submissions?.length ?? 0;
  const calificadas = submissions?.filter((s) => s.grade !== null).length ?? 0;
  const promedioNota = calificadas > 0
    ? (submissions!.filter((s) => s.grade !== null).reduce((sum, s) => sum + (s.grade ?? 0), 0) / calificadas).toFixed(1)
    : null;

  // Stats por curso
  const enrollMap: Record<string, number> = {};
  for (const e of enrollments ?? []) enrollMap[e.course_id] = (enrollMap[e.course_id] ?? 0) + 1;

  const taskMap: Record<string, string[]> = {};
  for (const t of tasks ?? []) {
    if (!taskMap[t.course_id]) taskMap[t.course_id] = [];
    taskMap[t.course_id].push(t.id);
  }

  const subMap: Record<string, number> = {};
  for (const s of submissions ?? []) subMap[s.task_id] = (subMap[s.task_id] ?? 0) + 1;

  const maxEnrolled = Math.max(...(courses ?? []).map((c) => enrollMap[c.id] ?? 0), 1);

  const stats = [
    { label: "Cursos activos",     value: cursosPublicados,  total: totalCursos,  icon: BookOpen,      color: "text-orange-500 bg-orange-50",  suffix: `de ${totalCursos} totales` },
    { label: "Estudiantes",        value: totalEstudiantes,  total: null,          icon: Users,         color: "text-orange-500 bg-orange-50",  suffix: "inscritos en total" },
    { label: "Tareas creadas",     value: totalTareas,       total: null,          icon: ClipboardList, color: "text-orange-500 bg-orange-50",  suffix: "en todos los cursos" },
    { label: "Entregas recibidas", value: totalEntregas,     total: null,          icon: CheckSquare,   color: "text-orange-500 bg-orange-50",  suffix: calificadas > 0 ? `${calificadas} calificadas` : "pendientes de calificar" },
  ];

  return (
    <div className="w-full">

      {/* Banner */}
      <div className="relative bg-gradient-to-br from-orange-500 to-orange-700 px-8 py-8 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Estadísticas</h1>
          <p className="text-white/70 text-sm mt-1">Resumen del desempeño de tus cursos y estudiantes.</p>
        </div>
      </div>

      <div className="px-8 pb-8 pt-6 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm font-medium text-gray-700 mt-0.5">{s.label}</p>
              <p className="text-xs text-gray-400 mt-1">{s.suffix}</p>
            </div>
          ))}
        </div>

        {/* Promedio de notas */}
        {promedioNota && (
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-100 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-orange-700 font-medium uppercase tracking-wide">Promedio general de notas</p>
              <p className="text-3xl font-bold text-orange-700 mt-0.5">{promedioNota} <span className="text-lg text-orange-500">/ 20</span></p>
            </div>
          </div>
        )}

        {/* Por curso */}
        {courses && courses.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <BarChart3 className="w-4 h-4 text-orange-500" />
              <h2 className="font-semibold text-gray-900 text-sm">Resumen por curso</h2>
            </div>

            <div className="divide-y divide-gray-50">
              {courses.map((course) => {
                const enrolled = enrollMap[course.id] ?? 0;
                const courseTasks = taskMap[course.id] ?? [];
                const courseSubmissions = courseTasks.reduce((sum, tid) => sum + (subMap[tid] ?? 0), 0);
                const maxPossible = enrolled * courseTasks.length;
                const submissionRate = maxPossible > 0 ? Math.round((courseSubmissions / maxPossible) * 100) : 0;
                const barWidth = maxEnrolled > 0 ? Math.round((enrolled / maxEnrolled) * 100) : 0;

                return (
                  <div key={course.id} className="px-6 py-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{course.title}</p>
                        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                          course.is_published
                            ? "bg-orange-50 text-orange-700 border border-orange-100"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {course.is_published ? "Publicado" : "Borrador"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 text-xs text-gray-500 ml-4">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{enrolled}</span>
                        <span className="flex items-center gap-1"><ClipboardList className="w-3 h-3" />{courseTasks.length} tareas</span>
                        <span className="flex items-center gap-1"><CheckSquare className="w-3 h-3" />{courseSubmissions} entregas</span>
                      </div>
                    </div>

                    {/* Barra inscripciones */}
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Estudiantes inscritos</span>
                          <span>{enrolled}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>

                      {courseTasks.length > 0 && (
                        <div>
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Tasa de entregas</span>
                            <span>{submissionRate}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all"
                              style={{ width: `${submissionRate}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {(!courses || courses.length === 0) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
              <BarChart3 className="w-7 h-7 text-orange-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Sin datos aún</h2>
            <p className="text-sm text-gray-400 max-w-xs">
              Las estadísticas aparecerán cuando crees cursos y tus estudiantes empiecen a inscribirse.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
