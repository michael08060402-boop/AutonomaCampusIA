import { createClient } from "@/lib/supabase/server";
import { BookOpen, Plus, Users, Eye, EyeOff, Calendar, ClipboardList } from "lucide-react";
import Link from "next/link";

export default async function CursosDocentePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, description, cover_url, is_published, created_at")
    .eq("teacher_id", user!.id)
    .order("created_at", { ascending: false });

  // Contar inscritos por curso
  const courseIds = courses?.map((c) => c.id) ?? [];
  const { data: enrollmentCounts } = courseIds.length > 0
    ? await supabase
        .from("enrollments")
        .select("course_id")
        .in("course_id", courseIds)
    : { data: [] };

  const countMap: Record<string, number> = {};
  for (const e of enrollmentCounts ?? []) {
    countMap[e.course_id] = (countMap[e.course_id] ?? 0) + 1;
  }

  const totalCursos = courses?.length ?? 0;
  const publicados = courses?.filter((c) => c.is_published).length ?? 0;
  const borradores = totalCursos - publicados;

  return (
    <div className="w-full">

      {/* Banner */}
      <div className="relative bg-gradient-to-br from-orange-500 to-orange-700 px-8 py-8 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Mis cursos</h1>
            <p className="text-white/70 text-sm mt-1">Gestiona y publica tus cursos para estudiantes.</p>
          </div>
          <Link
            href="/docente/crear-curso"
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-orange-600 text-sm font-semibold rounded-xl hover:bg-orange-50 transition-colors shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nuevo curso
          </Link>
        </div>
      </div>

      <div className="px-8 pb-8 pt-6">

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-2xl font-bold text-gray-900">{totalCursos}</p>
            <p className="text-sm text-gray-500 mt-0.5">Total de cursos</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-2xl font-bold text-orange-500">{publicados}</p>
            <p className="text-sm text-gray-500 mt-0.5">Publicados</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-2xl font-bold text-gray-400">{borradores}</p>
            <p className="text-sm text-gray-500 mt-0.5">Borradores</p>
          </div>
        </div>

        {/* Listado */}
        {!courses || courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7 text-orange-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Aún no tienes cursos</h2>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">
              Crea tu primer curso y comparte tu conocimiento con los estudiantes.
            </p>
            <Link
              href="/docente/crear-curso"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm shadow-orange-200"
            >
              <Plus className="w-4 h-4" />
              Crear mi primer curso
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {courses.map((course) => {
              const inscritoCount = countMap[course.id] ?? 0;
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-orange-200 hover:shadow-sm transition-all group flex flex-col"
                >
                  {/* Portada */}
                  <div className="h-36 bg-gradient-to-br from-orange-100 to-orange-50 relative overflow-hidden">
                    {course.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={course.cover_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-orange-300" />
                      </div>
                    )}
                    {/* Badge estado */}
                    <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      course.is_published
                        ? "bg-orange-500 text-white"
                        : "bg-white text-gray-500 border border-gray-200"
                    }`}>
                      {course.is_published
                        ? <><Eye className="w-3 h-3" /> Publicado</>
                        : <><EyeOff className="w-3 h-3" /> Borrador</>
                      }
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 line-clamp-2">{course.title}</h3>
                    {course.description && (
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-4">{course.description}</p>
                    )}

                    <div className="mt-auto pt-4 border-t border-gray-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(course.created_at).toLocaleDateString("es-PE", { day: "numeric", month: "short" })}
                        </span>
                        <Link
                          href={`/docente/cursos/${course.id}/estudiantes`}
                          className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Users className="w-3.5 h-3.5" />
                          {inscritoCount} {inscritoCount === 1 ? "estudiante" : "estudiantes"}
                        </Link>
                      </div>
                      <Link
                        href={`/docente/tareas/crear?curso=${course.id}`}
                        className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-orange-600 bg-gray-50 hover:bg-orange-50 border border-gray-100 hover:border-orange-200 px-3 py-2 rounded-lg transition-colors"
                      >
                        <ClipboardList className="w-3.5 h-3.5" />
                        Asignar tarea
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Card nueva */}
            <Link
              href="/docente/crear-curso"
              className="bg-orange-50 border-2 border-dashed border-orange-200 rounded-2xl min-h-[200px] flex flex-col items-center justify-center gap-3 hover:bg-orange-100/60 hover:border-orange-300 transition-all group"
            >
              <div className="w-12 h-12 bg-white rounded-2xl border border-orange-200 flex items-center justify-center group-hover:shadow-sm transition-all">
                <Plus className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-sm font-semibold text-orange-600">Nuevo curso</p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
