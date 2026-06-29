import { createClient } from "@/lib/supabase/server";
import { BookOpen, GraduationCap, Calendar, ClipboardList } from "lucide-react";
import Link from "next/link";
import EnrollButton from "./enroll-button";

export default async function CursosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Cursos en los que ya está inscrito
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      id, enrolled_at,
      course:course_id (
        id, title, description, cover_url, created_at,
        teacher:teacher_id ( full_name, avatar_url )
      )
    `)
    .eq("student_id", user!.id)
    .order("enrolled_at", { ascending: false });

  const enrolledIds = enrollments?.map((e) => (e.course as unknown as { id: string }).id) ?? [];

  // Cursos publicados en los que NO está inscrito
  const { data: available } = await supabase
    .from("courses")
    .select(`
      id, title, description, cover_url, created_at,
      teacher:teacher_id ( full_name, avatar_url )
    `)
    .eq("is_published", true)
    .not("id", "in", `(${enrolledIds.length > 0 ? enrolledIds.join(",") : "00000000-0000-0000-0000-000000000000"})`)
    .order("created_at", { ascending: false });

  const enrolled = enrollments ?? [];
  const explore = available ?? [];

  return (
    <div className="w-full">

      {/* Banner */}
      <div className="relative bg-gradient-to-br from-orange-500 to-orange-700 px-8 py-8 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Mis cursos</h1>
          <p className="text-white/70 text-sm mt-1">
            {enrolled.length > 0
              ? `Inscrito en ${enrolled.length} curso${enrolled.length !== 1 ? "s" : ""}`
              : "Explora los cursos disponibles e inscríbete"}
          </p>
        </div>
      </div>

      <div className="px-8 pb-8 pt-6 space-y-8">

        {/* ── Cursos inscritos ── */}
        {enrolled.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Mis cursos ({enrolled.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {enrolled.map((enrollment) => {
                const course = enrollment.course as unknown as {
                  id: string; title: string; description: string | null;
                  cover_url: string | null; created_at: string;
                  teacher: { full_name: string; avatar_url: string | null } | null;
                } | null;
                if (!course) return null;
                const teacher = course.teacher;

                return (
                  <div key={enrollment.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-orange-200 hover:shadow-sm transition-all flex flex-col">
                    {/* Portada */}
                    <div className="h-36 bg-gradient-to-br from-orange-400 to-orange-600 relative overflow-hidden shrink-0">
                      {course.cover_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-500 text-white">
                        Inscrito
                      </span>
                      {teacher && (
                        <p className="absolute bottom-3 left-4 text-white/90 text-xs flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {teacher.full_name}
                        </p>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-2">{course.title}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 flex-1">
                        {course.description ?? "Sin descripción"}
                      </p>
                      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(enrollment.enrolled_at).toLocaleDateString("es-PE", { day: "numeric", month: "short" })}
                        </span>
                        <Link
                          href="/estudiante/tareas"
                          className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          Ver tareas
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Explorar cursos disponibles ── */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            {explore.length > 0 ? `Cursos disponibles (${explore.length})` : "Cursos disponibles"}
          </h2>

          {explore.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
                <BookOpen className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">
                {enrolled.length > 0 ? "Estás en todos los cursos disponibles" : "No hay cursos publicados aún"}
              </h3>
              <p className="text-sm text-gray-400 max-w-xs">
                {enrolled.length > 0
                  ? "Cuando los docentes publiquen nuevos cursos aparecerán aquí."
                  : "Los docentes publicarán cursos pronto. Vuelve más tarde."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {explore.map((course) => {
                const teacher = course.teacher as unknown as { full_name: string; avatar_url: string | null } | null;
                return (
                  <div key={course.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-orange-200 hover:shadow-sm transition-all flex flex-col">
                    {/* Portada */}
                    <div className="h-36 bg-gradient-to-br from-orange-100 to-orange-50 relative overflow-hidden shrink-0">
                      {course.cover_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-orange-300" />
                        </div>
                      )}
                      {teacher && (
                        <p className="absolute bottom-3 left-4 text-white text-xs flex items-center gap-1.5 drop-shadow">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {teacher.full_name}
                        </p>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-2">{course.title}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 flex-1">
                        {course.description ?? "Sin descripción"}
                      </p>
                      <div className="mt-4 pt-3 border-t border-gray-50">
                        <EnrollButton courseId={course.id} studentId={user!.id} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
