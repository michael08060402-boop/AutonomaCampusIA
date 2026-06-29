import { createClient } from "@/lib/supabase/server";
import { Users, BookOpen, ClipboardList, CheckSquare, GraduationCap, ShieldCheck, TrendingUp, BarChart3 } from "lucide-react";

export default async function AdminEstadisticasPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase.from("profiles").select("role, created_at").order("created_at", { ascending: false });
  const { data: courses } = await supabase.from("courses").select("id, is_published, teacher_id");
  const { data: tasks } = await supabase.from("tasks").select("id, course_id");
  const { data: submissions } = await supabase.from("submissions").select("id, grade, submitted_at").order("submitted_at", { ascending: false });
  const { data: enrollments } = await supabase.from("enrollments").select("id, course_id");

  const totalUsers = profiles?.length ?? 0;
  const estudiantes = profiles?.filter((p) => p.role === "estudiante").length ?? 0;
  const docentes = profiles?.filter((p) => p.role === "docente").length ?? 0;
  const admins = profiles?.filter((p) => p.role === "admin").length ?? 0;
  const totalCursos = courses?.length ?? 0;
  const cursosPublicados = courses?.filter((c) => c.is_published).length ?? 0;
  const totalTareas = tasks?.length ?? 0;
  const totalEntregas = submissions?.length ?? 0;
  const calificadas = submissions?.filter((s) => s.grade !== null).length ?? 0;
  const totalEnrollments = enrollments?.length ?? 0;
  const promedioNota = calificadas > 0
    ? (submissions!.filter((s) => s.grade !== null).reduce((sum, s) => sum + (s.grade ?? 0), 0) / calificadas).toFixed(1)
    : null;

  const stats = [
    { label: "Usuarios totales",    value: totalUsers,       icon: Users,        suffix: `${docentes} docentes · ${estudiantes} estudiantes` },
    { label: "Cursos publicados",   value: cursosPublicados, icon: BookOpen,     suffix: `de ${totalCursos} totales` },
    { label: "Tareas creadas",      value: totalTareas,      icon: ClipboardList, suffix: "en la plataforma" },
    { label: "Entregas realizadas", value: totalEntregas,    icon: CheckSquare,  suffix: `${calificadas} calificadas` },
  ];

  const roleStats = [
    { label: "Estudiantes", value: estudiantes, icon: GraduationCap, pct: totalUsers > 0 ? Math.round((estudiantes / totalUsers) * 100) : 0 },
    { label: "Docentes",    value: docentes,    icon: BookOpen,      pct: totalUsers > 0 ? Math.round((docentes / totalUsers) * 100) : 0 },
    { label: "Admins",      value: admins,      icon: ShieldCheck,   pct: totalUsers > 0 ? Math.round((admins / totalUsers) * 100) : 0 },
  ];

  return (
    <div className="w-full">

      {/* Banner */}
      <div className="relative bg-gradient-to-br from-orange-500 to-orange-700 px-8 py-8 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Estadísticas globales</h1>
          <p className="text-white/70 text-sm mt-1">Métricas generales de AutonomaCampus AI.</p>
        </div>
      </div>

      <div className="px-8 pb-8 pt-6 space-y-6">

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-orange-50 text-orange-500">
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
            <div className="w-12 h-12 bg-orange-200/50 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-orange-700 font-semibold uppercase tracking-wide">Promedio general de notas</p>
              <p className="text-3xl font-bold text-orange-700 mt-0.5">{promedioNota} <span className="text-lg text-orange-400">/ 20</span></p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Distribución por rol */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-4 h-4 text-orange-500" />
              <h2 className="font-semibold text-gray-900 text-sm">Distribución de usuarios</h2>
            </div>
            <div className="space-y-4">
              {roleStats.map((r) => (
                <div key={r.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5 text-sm text-gray-700">
                      <r.icon className="w-3.5 h-3.5 text-orange-400" />
                      {r.label}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{r.value} <span className="text-xs text-gray-400 font-normal">({r.pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all"
                      style={{ width: `${r.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actividad de la plataforma */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <h2 className="font-semibold text-gray-900 text-sm">Actividad general</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: "Inscripciones totales", value: totalEnrollments, icon: Users },
                { label: "Cursos en borrador",    value: totalCursos - cursosPublicados, icon: BookOpen },
                { label: "Entregas sin calificar", value: totalEntregas - calificadas, icon: ClipboardList },
                { label: "Tasa de entrega",        value: totalTareas > 0 && totalEnrollments > 0 ? `${Math.round((totalEntregas / (totalTareas * totalEnrollments)) * 100)}%` : "—", icon: CheckSquare },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <item.icon className="w-3.5 h-3.5 text-orange-400" />
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
