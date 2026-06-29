import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Users, ArrowLeft, Mail, Calendar, UserCircle } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EstudiantesDelCursoPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Verificar que el curso pertenece al docente
  const { data: course } = await supabase
    .from("courses")
    .select("id, title")
    .eq("id", id)
    .eq("teacher_id", user!.id)
    .single();

  if (!course) notFound();

  // Obtener estudiantes inscritos con sus perfiles
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("enrolled_at, profiles:user_id ( id, full_name, avatar_url, email:id )")
    .eq("course_id", id)
    .order("enrolled_at", { ascending: false });

  // Obtener emails de auth (necesitamos join con profiles que tenga email)
  // Hacemos una query separada para obtener datos completos
  const { data: enrolledProfiles } = await supabase
    .from("enrollments")
    .select(`
      enrolled_at,
      user:student_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq("course_id", id)
    .order("enrolled_at", { ascending: false });

  const students = enrolledProfiles ?? [];

  return (
    <div className="w-full">

      {/* Banner */}
      <div className="relative bg-gradient-to-br from-orange-500 to-orange-700 px-8 py-8 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative">
          <Link
            href="/docente/cursos"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a mis cursos
          </Link>
          <h1 className="text-2xl font-bold text-white">{course.title}</h1>
          <div className="flex items-center gap-2 mt-2 text-white/70 text-sm">
            <Users className="w-4 h-4" />
            {students.length} {students.length === 1 ? "estudiante inscrito" : "estudiantes inscritos"}
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 pt-6">

        {students.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-orange-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Aún no hay estudiantes</h2>
            <p className="text-sm text-gray-400 max-w-xs">
              Cuando los estudiantes se inscriban en este curso aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 text-sm">Lista de estudiantes</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                {students.length} {students.length === 1 ? "inscrito" : "inscritos"}
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {students.map((enrollment, i) => {
                const profile = enrollment.user as unknown as { id: string; full_name: string | null; avatar_url: string | null } | null;
                const name = profile?.full_name || "Sin nombre";
                const initial = name.charAt(0).toUpperCase();
                const enrolledDate = enrollment.enrolled_at
                  ? new Date(enrollment.enrolled_at).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })
                  : "";

                return (
                  <div key={profile?.id ?? i} className="px-6 py-4 flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-orange-100 flex items-center justify-center">
                      {profile?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profile.avatar_url} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-orange-600 font-bold text-sm">{initial}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {enrolledDate && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            Inscrito el {enrolledDate}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Badge */}
                    <span className="shrink-0 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full">
                      Activo
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
