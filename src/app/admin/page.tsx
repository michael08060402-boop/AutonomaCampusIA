import { createClient } from "@/lib/supabase/server";
import { Users, BookOpen, ClipboardList, GraduationCap, CheckSquare, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || profile?.full_name || "";
  const rawFirst = fullName.split(" ")[0] || "Admin";
  const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase();
  const avatar = user?.user_metadata?.avatar_url;

  // Stats globales
  const { data: profiles } = await supabase.from("profiles").select("role, created_at").order("created_at", { ascending: false });
  const { data: courses } = await supabase.from("courses").select("id, is_published, created_at").order("created_at", { ascending: false });
  const { count: tasksCount } = await supabase.from("tasks").select("*", { count: "exact", head: true });
  const { count: subsCount } = await supabase.from("submissions").select("*", { count: "exact", head: true });

  const totalUsers = profiles?.length ?? 0;
  const estudiantes = profiles?.filter((p) => p.role === "estudiante").length ?? 0;
  const docentes = profiles?.filter((p) => p.role === "docente").length ?? 0;
  const cursosPublicados = courses?.filter((c) => c.is_published).length ?? 0;
  const totalCursos = courses?.length ?? 0;

  const stats = [
    { label: "Usuarios",          value: totalUsers,        suffix: `${docentes} docentes · ${estudiantes} estudiantes`, icon: Users,         href: "/admin/usuarios" },
    { label: "Cursos publicados", value: cursosPublicados,  suffix: `de ${totalCursos} totales`,                         icon: BookOpen,      href: "/admin/cursos" },
    { label: "Tareas totales",    value: tasksCount ?? 0,   suffix: "en la plataforma",                                  icon: ClipboardList, href: "/admin/estadisticas" },
    { label: "Entregas totales",  value: subsCount ?? 0,    suffix: "realizadas",                                        icon: CheckSquare,   href: "/admin/estadisticas" },
  ];

  // Usuarios recientes (últimos 5)
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // Cursos recientes (últimos 5)
  const { data: recentCourses } = await supabase
    .from("courses")
    .select("id, title, is_published, created_at, teacher:teacher_id(full_name)")
    .order("created_at", { ascending: false })
    .limit(5);

  const roleLabel: Record<string, string> = { admin: "Admin", docente: "Docente", estudiante: "Estudiante" };
  const roleColor: Record<string, string> = {
    admin: "bg-orange-100 text-orange-700",
    docente: "bg-orange-50 text-orange-600",
    estudiante: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="w-full">

      {/* Banner */}
      <div className="relative bg-gradient-to-br from-orange-500 to-orange-700 px-8 py-8 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl border-2 border-white/30 overflow-hidden shrink-0">
            {avatar
              ? <img src={avatar} alt={fullName} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center bg-white/20"><span className="text-white text-xl font-bold">{firstName.charAt(0)}</span></div>
            }
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Hola, {firstName} 👋</h1>
            <p className="text-white/70 text-sm mt-0.5">Panel de administración · AutonomaCampus AI</p>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 pt-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Link key={s.label} href={s.href}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-orange-200 hover:shadow-sm transition-all group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-orange-50 text-orange-500">
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm font-medium text-gray-700 mt-0.5">{s.label}</p>
              <p className="text-xs text-gray-400 mt-1">{s.suffix}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Usuarios recientes */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-500" />
                <h2 className="font-semibold text-gray-900 text-sm">Usuarios recientes</h2>
              </div>
              <Link href="/admin/usuarios" className="text-xs text-orange-500 font-medium hover:underline flex items-center gap-1">
                Ver todos <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {recentUsers && recentUsers.length > 0 ? (
              <ul className="divide-y divide-gray-50">
                {recentUsers.map((u) => {
                  const name = u.full_name || "Sin nombre";
                  return (
                    <li key={u.id} className="flex items-center gap-3 px-6 py-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                        {u.avatar_url
                          ? <img src={u.avatar_url} alt={name} className="w-full h-full object-cover rounded-lg" />
                          : <span className="text-orange-600 text-xs font-bold">{name.charAt(0).toUpperCase()}</span>
                        }
                      </div>
                      <p className="text-sm text-gray-800 flex-1 truncate">{name}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColor[u.role] ?? "bg-gray-100 text-gray-500"}`}>
                        {roleLabel[u.role] ?? u.role}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center py-10 text-gray-300">
                <Users className="w-7 h-7 mb-2" />
                <p className="text-sm">Sin usuarios aún</p>
              </div>
            )}
          </div>

          {/* Cursos recientes */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-orange-500" />
                <h2 className="font-semibold text-gray-900 text-sm">Cursos recientes</h2>
              </div>
              <Link href="/admin/cursos" className="text-xs text-orange-500 font-medium hover:underline flex items-center gap-1">
                Ver todos <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {recentCourses && recentCourses.length > 0 ? (
              <ul className="divide-y divide-gray-50">
                {recentCourses.map((c) => {
                  const teacher = c.teacher as unknown as { full_name: string } | null;
                  return (
                    <li key={c.id} className="flex items-center gap-3 px-6 py-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{c.title}</p>
                        {teacher && <p className="text-xs text-gray-400 truncate">{teacher.full_name}</p>}
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${c.is_published ? "bg-orange-50 text-orange-600 border border-orange-100" : "bg-gray-100 text-gray-500"}`}>
                        {c.is_published ? "Publicado" : "Borrador"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center py-10 text-gray-300">
                <BookOpen className="w-7 h-7 mb-2" />
                <p className="text-sm">Sin cursos aún</p>
              </div>
            )}
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { href: "/admin/usuarios", icon: Users, title: "Gestionar usuarios", desc: "Cambia roles y administra cuentas." },
            { href: "/admin/cursos", icon: BookOpen, title: "Gestionar cursos", desc: "Publica, edita o elimina cursos." },
            { href: "/admin/estadisticas", icon: TrendingUp, title: "Ver estadísticas", desc: "Métricas globales de la plataforma." },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-orange-200 hover:shadow-sm transition-all group flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
