import { createClient } from "@/lib/supabase/server";
import { BookOpen, ClipboardList, MessageSquare, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import AnnouncementModal from "@/components/announcement-modal";

export default async function EstudiantePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user!.id)
    .single();

  const fullName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || profile?.full_name
    || "";
  const rawFirst = fullName.split(" ")[0] || "Estudiante";
  const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase();
  const avatar = user?.user_metadata?.avatar_url || profile?.avatar_url;

  const { data: announcement } = await supabase
    .from("announcements")
    .select("id, title, body, image_url")
    .eq("is_active", true)
    .single();

  const stats = [
    { label: "Cursos activos",    value: "0", icon: BookOpen,      color: "text-primary bg-primary/10",    href: "/estudiante/cursos" },
    { label: "Tareas pendientes", value: "0", icon: ClipboardList,  color: "text-orange-500 bg-orange-50", href: "/estudiante/tareas" },
    { label: "Tareas entregadas", value: "0", icon: TrendingUp,     color: "text-orange-500 bg-orange-50", href: "/estudiante/tareas" },
    { label: "Chats con IA",      value: "0", icon: MessageSquare,  color: "text-orange-500 bg-orange-50", href: "/estudiante/chat" },
  ];

  return (
    <div className="w-full">
      <AnnouncementModal announcement={announcement ?? null} />

      {/* ── Banner con saludo integrado ──────────────────── */}
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
                <span className="text-white text-xl font-bold">{firstName.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Hola, {firstName} 👋</h1>
            <p className="text-white/70 text-sm mt-0.5">Aquí tienes un resumen de tu actividad.</p>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 pt-6">

        {/* ── Stats ───────────────────────────────────────── */}
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

        {/* ── Accesos rápidos ─────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          {/* Chat IA - destacado */}
          <Link href="/estudiante/chat"
            className="md:col-span-1 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-6 flex flex-col justify-between group hover:shadow-lg hover:shadow-orange-200 transition-all duration-200">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base mb-1">Chat con IA</p>
              <p className="text-white/70 text-xs leading-relaxed">Pregunta lo que necesites, disponible 24/7.</p>
            </div>
            <div className="flex items-center gap-1 mt-4 text-white/80 text-xs font-semibold">
              Abrir chat <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Tareas próximas */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 text-sm">Tareas próximas</h2>
              <Link href="/estudiante/tareas" className="text-xs text-primary font-medium hover:underline">
                Ver todas →
              </Link>
            </div>
            <div className="text-center py-6 text-gray-300">
              <ClipboardList className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No tienes tareas pendientes</p>
            </div>
          </div>
        </div>

        {/* ── Mis cursos ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 text-sm">Mis cursos</h2>
            <Link href="/estudiante/cursos" className="text-xs text-primary font-medium hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="text-center py-6 text-gray-300">
            <BookOpen className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Aún no estás inscrito en ningún curso</p>
          </div>
        </div>
      </div>
    </div>
  );
}
