import { createClient } from "@/lib/supabase/server";
import { BookOpen, Users, ClipboardList, BarChart3, Plus, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import AnnouncementModal from "@/components/announcement-modal";

export default async function DocentePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user!.id)
    .single();

  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || profile?.full_name || "";
  const rawFirst = fullName.split(" ")[0] || "Docente";
  const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase();
  const avatar = user?.user_metadata?.avatar_url || profile?.avatar_url;

  const { count: cursosCount } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true })
    .eq("teacher_id", user!.id);

  const { count: estudiantesCount } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .in("course_id",
      (await supabase.from("courses").select("id").eq("teacher_id", user!.id)).data?.map(c => c.id) ?? []
    );

  const { data: announcement } = await supabase
    .from("announcements")
    .select("id, title, body, image_url")
    .eq("is_active", true)
    .single();

  const stats = [
    { label: "Cursos activos",  value: String(cursosCount ?? 0),     icon: BookOpen,    color: "text-primary bg-primary/10",    href: "/docente/cursos" },
    { label: "Estudiantes",     value: String(estudiantesCount ?? 0), icon: Users,       color: "text-orange-500 bg-orange-50", href: "/docente/cursos" },
    { label: "Tareas creadas",  value: "0",                           icon: ClipboardList, color: "text-orange-500 bg-orange-50", href: "/docente/tareas" },
    { label: "Por calificar",   value: "0",                           icon: BarChart3,   color: "text-orange-500 bg-orange-50", href: "/docente/tareas" },
  ];

  return (
    <div className="w-full">
      <AnnouncementModal announcement={announcement ?? null} />

      {/* Banner */}
      <div className="relative bg-gradient-to-br from-orange-500 to-orange-700 px-8 py-8 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl border-2 border-white/30 shadow-md overflow-hidden shrink-0">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/20">
                <span className="text-white text-xl font-bold">{firstName.charAt(0)}</span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Hola, {firstName} 👋</h1>
            <p className="text-white/70 text-sm mt-0.5">Gestiona tus cursos y estudiantes.</p>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 pt-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-primary/20 hover:shadow-sm transition-all group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
            </Link>
          ))}
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/docente/crear-curso"
            className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-6 flex flex-col justify-between group hover:shadow-lg hover:shadow-orange-200 transition-all">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base mb-1">Crear curso</p>
              <p className="text-white/70 text-xs">Publica un nuevo curso para tus estudiantes.</p>
            </div>
            <div className="flex items-center gap-1 mt-4 text-white/80 text-xs font-semibold">
              Empezar <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link href="/docente/chat"
            className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-primary/20 hover:shadow-sm transition-all group">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-orange-500" />
            </div>
            <p className="font-bold text-gray-900 text-sm mb-1">Generador IA</p>
            <p className="text-xs text-gray-400">Crea exámenes y materiales con IA.</p>
            <ArrowRight className="w-3.5 h-3.5 text-primary mt-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <Link href="/docente/tareas"
            className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-primary/20 hover:shadow-sm transition-all group">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
              <ClipboardList className="w-5 h-5 text-orange-500" />
            </div>
            <p className="font-bold text-gray-900 text-sm mb-1">Tareas</p>
            <p className="text-xs text-gray-400">Revisa entregas y califica a tus estudiantes.</p>
            <ArrowRight className="w-3.5 h-3.5 text-primary mt-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>

        {/* Mis cursos recientes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900 text-sm">Mis cursos</h2>
            <Link href="/docente/cursos" className="text-xs text-primary font-medium hover:underline">Ver todos →</Link>
          </div>
          <div className="text-center py-8 text-gray-300">
            <BookOpen className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Aún no has creado ningún curso</p>
            <Link href="/docente/crear-curso" className="mt-3 inline-flex items-center gap-1.5 text-xs text-orange-500 font-medium hover:underline">
              <Plus className="w-3.5 h-3.5" /> Crear mi primer curso
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
