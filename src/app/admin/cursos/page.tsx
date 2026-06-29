import { createClient } from "@/lib/supabase/server";
import { BookOpen, Users, ClipboardList } from "lucide-react";
import TogglePublish from "./toggle-publish";

export default async function AdminCursosPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select(`
      id, title, description, is_published, created_at,
      teacher:teacher_id ( full_name, avatar_url )
    `)
    .order("created_at", { ascending: false });

  const courseIds = (courses ?? []).map((c) => c.id);

  const { data: enrollments } = courseIds.length > 0
    ? await supabase.from("enrollments").select("course_id").in("course_id", courseIds)
    : { data: [] };

  const { data: tasks } = courseIds.length > 0
    ? await supabase.from("tasks").select("course_id").in("course_id", courseIds)
    : { data: [] };

  const enrollMap: Record<string, number> = {};
  for (const e of enrollments ?? []) enrollMap[e.course_id] = (enrollMap[e.course_id] ?? 0) + 1;

  const taskMap: Record<string, number> = {};
  for (const t of tasks ?? []) taskMap[t.course_id] = (taskMap[t.course_id] ?? 0) + 1;

  const total = courses?.length ?? 0;
  const published = courses?.filter((c) => c.is_published).length ?? 0;

  return (
    <div className="w-full">

      {/* Banner */}
      <div className="relative bg-gradient-to-br from-orange-500 to-orange-700 px-8 py-8 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Cursos</h1>
          <p className="text-white/70 text-sm mt-1">Administra todos los cursos de la plataforma.</p>
          <div className="flex items-center gap-5 mt-4">
            <div>
              <p className="text-xl font-bold text-white">{total}</p>
              <p className="text-xs text-white/60">Total</p>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div>
              <p className="text-xl font-bold text-white">{published}</p>
              <p className="text-xs text-white/60">Publicados</p>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div>
              <p className="text-xl font-bold text-white">{total - published}</p>
              <p className="text-xs text-white/60">Borradores</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 pt-6">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-orange-500" />
            <h2 className="font-semibold text-gray-900 text-sm">Todos los cursos</h2>
            <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">{total}</span>
          </div>

          {!courses || courses.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-300">
              <BookOpen className="w-8 h-8 mb-2" />
              <p className="text-sm">No hay cursos creados aún.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {courses.map((course) => {
                const teacher = course.teacher as unknown as { full_name: string; avatar_url: string | null } | null;
                const enrolled = enrollMap[course.id] ?? 0;
                const numTasks = taskMap[course.id] ?? 0;

                return (
                  <div key={course.id} className="flex items-center gap-4 px-6 py-4">
                    {/* Icono */}
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-orange-400" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{course.title}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {teacher && (
                          <span className="text-xs text-gray-400 truncate">{teacher.full_name}</span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Users className="w-3 h-3" />{enrolled}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <ClipboardList className="w-3 h-3" />{numTasks} tareas
                        </span>
                      </div>
                    </div>

                    {/* Toggle publicar */}
                    <TogglePublish courseId={course.id} published={course.is_published ?? false} />
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
