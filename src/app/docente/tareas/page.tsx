import { createClient } from "@/lib/supabase/server";
import { ClipboardList, Plus, BookOpen, Calendar, Users, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function TareasDocentePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Tareas de todos los cursos del docente, con nombre del curso y conteo de entregas
  const { data: tasks } = await supabase
    .from("tasks")
    .select(`
      id, title, description, due_date, created_at,
      course:course_id ( id, title ),
      submissions ( id )
    `)
    .in(
      "course_id",
      (await supabase.from("courses").select("id").eq("teacher_id", user!.id)).data?.map((c) => c.id) ?? []
    )
    .order("created_at", { ascending: false });

  // Conteo de inscritos por curso para calcular pendientes
  const courseIds = [...new Set((tasks ?? []).map((t) => (t.course as unknown as { id: string }).id))];
  const { data: enrollmentRows } = courseIds.length > 0
    ? await supabase.from("enrollments").select("course_id").in("course_id", courseIds)
    : { data: [] };

  const enrolledMap: Record<string, number> = {};
  for (const e of enrollmentRows ?? []) {
    enrolledMap[e.course_id] = (enrolledMap[e.course_id] ?? 0) + 1;
  }

  const now = new Date();
  const pending = (tasks ?? []).filter((t) => !t.due_date || new Date(t.due_date) >= now).length;
  const overdue = (tasks ?? []).filter((t) => t.due_date && new Date(t.due_date) < now).length;

  return (
    <div className="w-full">

      {/* Banner */}
      <div className="relative bg-gradient-to-br from-orange-500 to-orange-700 px-8 py-8 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Tareas</h1>
            <p className="text-white/70 text-sm mt-1">Asigna y revisa las entregas de tus estudiantes.</p>
          </div>
          <Link
            href="/docente/tareas/crear"
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-orange-600 text-sm font-semibold rounded-xl hover:bg-orange-50 transition-colors shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nueva tarea
          </Link>
        </div>
      </div>

      <div className="px-8 pb-8 pt-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-2xl font-bold text-gray-900">{tasks?.length ?? 0}</p>
            <p className="text-sm text-gray-500 mt-0.5">Total de tareas</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-2xl font-bold text-orange-500">{pending}</p>
            <p className="text-sm text-gray-500 mt-0.5">Activas</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-2xl font-bold text-red-400">{overdue}</p>
            <p className="text-sm text-gray-500 mt-0.5">Vencidas</p>
          </div>
        </div>

        {/* Lista */}
        {!tasks || tasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
              <ClipboardList className="w-7 h-7 text-orange-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Aún no has asignado tareas</h2>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">
              Crea una tarea y asígnala a uno de tus cursos.
            </p>
            <Link
              href="/docente/tareas/crear"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm shadow-orange-200"
            >
              <Plus className="w-4 h-4" />
              Crear primera tarea
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 text-sm">Todas las tareas</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">{tasks.length}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {tasks.map((task) => {
                const course = task.course as unknown as { id: string; title: string } | null;
                const submissionCount = Array.isArray(task.submissions) ? task.submissions.length : 0;
                const enrolled = course ? (enrolledMap[course.id] ?? 0) : 0;
                const isOverdue = task.due_date && new Date(task.due_date) < now;
                const dueDateStr = task.due_date
                  ? new Date(task.due_date).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })
                  : null;

                return (
                  <Link
                    key={task.id}
                    href={`/docente/tareas/${task.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                      <ClipboardList className="w-5 h-5 text-orange-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{task.title}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {course && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <BookOpen className="w-3 h-3" />
                            {course.title}
                          </span>
                        )}
                        {dueDateStr && (
                          <span className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-400" : "text-gray-400"}`}>
                            <Calendar className="w-3 h-3" />
                            {isOverdue ? "Venció" : "Vence"} {dueDateStr}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Users className="w-3 h-3" />
                          {submissionCount}/{enrolled} entregas
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isOverdue ? (
                        <span className="text-xs font-medium text-red-500 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">Vencida</span>
                      ) : (
                        <span className="text-xs font-medium text-orange-700 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full">Activa</span>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
