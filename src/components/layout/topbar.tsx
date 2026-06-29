"use client";

import { Bell, Megaphone, Search, MessageSquare, LogOut, X, ClipboardList, CheckCircle, Loader2, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Role } from "@/lib/types";

interface TopBarProps {
  userName: string;
  userAvatar?: string;
  role: Role;
  onMenuToggle?: () => void;
}

type Notif = {
  id: string;
  label: string;
  sub: string;
  href: string;
  time: string;
};

type Announcement = {
  id: string;
  title: string;
  body: string | null;
  image_url: string | null;
};

const profileHref: Record<Role, string> = {
  estudiante: "/estudiante/perfil",
  docente: "/docente/perfil",
  admin: "/admin/perfil",
};

const chatHref: Record<Role, string> = {
  estudiante: "/estudiante/chat",
  docente: "/docente/chat",
  admin: "/admin/chat",
};

export function TopBar({ userName, userAvatar, role, onMenuToggle }: TopBarProps) {
  const firstName = userName.split(" ")[0] || userName;
  const router = useRouter();
  const supabase = createClient();
  const [confirming, setConfirming] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [megaOpen, setMegaOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<Announcement | null | undefined>(undefined);
  const [loadingMega, setLoadingMega] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);

  // Cerrar al click fuera
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function loadNotifications() {
    if (notifications.length > 0) { setNotifOpen((v) => !v); return; }
    setNotifOpen(true);
    setLoadingNotifs(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoadingNotifs(false); return; }

    const items: Notif[] = [];

    if (role === "docente") {
      // Entregas sin calificar en cursos del docente
      const { data: courses } = await supabase
        .from("courses")
        .select("id")
        .eq("teacher_id", user.id);

      const courseIds = courses?.map((c) => c.id) ?? [];
      if (courseIds.length > 0) {
        const { data: tasks } = await supabase
          .from("tasks")
          .select("id, title")
          .in("course_id", courseIds);

        const taskIds = tasks?.map((t) => t.id) ?? [];
        const taskMap = Object.fromEntries((tasks ?? []).map((t) => [t.id, t.title]));

        if (taskIds.length > 0) {
          const { data: subs } = await supabase
            .from("submissions")
            .select("id, task_id, submitted_at, student:student_id(full_name)")
            .in("task_id", taskIds)
            .is("grade", null)
            .order("submitted_at", { ascending: false })
            .limit(8);

          for (const s of subs ?? []) {
            const profile = s.student as unknown as { full_name: string } | null;
            const taskTitle = taskMap[s.task_id] ?? "Tarea";
            items.push({
              id: s.id,
              label: profile?.full_name ?? "Estudiante",
              sub: `entregó "${taskTitle}"`,
              href: `/docente/tareas/${s.task_id}`,
              time: new Date(s.submitted_at).toLocaleDateString("es-PE", { day: "numeric", month: "short" }),
            });
          }
        }
      }
    } else if (role === "estudiante") {
      // Tareas calificadas del estudiante
      const { data: subs } = await supabase
        .from("submissions")
        .select("id, task_id, grade, submitted_at, task:task_id(title)")
        .eq("student_id", user.id)
        .not("grade", "is", null)
        .order("submitted_at", { ascending: false })
        .limit(8);

      for (const s of subs ?? []) {
        const task = s.task as unknown as { title: string } | null;
        items.push({
          id: s.id,
          label: task?.title ?? "Tarea calificada",
          sub: `Nota: ${s.grade}/20`,
          href: "/estudiante/tareas",
          time: new Date(s.submitted_at).toLocaleDateString("es-PE", { day: "numeric", month: "short" }),
        });
      }
    }

    setNotifications(items);
    setLoadingNotifs(false);
  }

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header className="h-14 bg-gradient-to-r from-orange-100 to-white border-b border-orange-200 flex items-center px-3 md:px-5 gap-1.5 md:gap-2 shrink-0">

        {/* Hamburguesa móvil */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-orange-100 text-gray-500 transition-colors shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Barra de búsqueda — oculta en móvil */}
        <div className="hidden md:flex flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar cursos, tareas..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
          />
        </div>

        {/* Espaciador móvil */}
        <div className="flex-1 md:hidden" />

        {/* Chat IA — oculto en móvil */}
        <Link
          href={chatHref[role]}
          title="Chat con IA"
          className="hidden md:flex w-9 h-9 items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-orange-500"
        >
          <MessageSquare className="w-4 h-4" />
        </Link>

        {/* Anuncios / Megáfono */}
        <div className="relative" ref={megaRef}>
          <button
            title="Anuncios"
            onClick={async () => {
              setMegaOpen((v) => !v);
              if (announcement === undefined) {
                setLoadingMega(true);
                const { data } = await supabase
                  .from("announcements")
                  .select("id, title, body, image_url")
                  .eq("is_active", true)
                  .single();
                setAnnouncement(data ?? null);
                setLoadingMega(false);
              }
            }}
            className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
              megaOpen ? "bg-orange-50 text-orange-500" : "hover:bg-gray-100 text-gray-400 hover:text-gray-700"
            }`}
          >
            <Megaphone className="w-4 h-4" />
            {announcement && !megaOpen && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {megaOpen && (
            <div className="fixed md:absolute top-14 md:top-11 right-2 left-2 md:right-0 md:left-auto md:w-72 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
              {/* Barra naranja */}
              <div className="h-1 w-full bg-gradient-to-r from-orange-400 to-orange-600" />

              <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5 text-orange-500" />
                  <p className="text-sm font-semibold text-gray-900">Anuncio</p>
                </div>
                <button onClick={() => setMegaOpen(false)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {loadingMega ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                </div>
              ) : !announcement ? (
                <div className="flex flex-col items-center py-8 text-center px-4">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-3">
                    <Megaphone className="w-5 h-5 text-orange-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Sin anuncios activos</p>
                  <p className="text-xs text-gray-400 mt-1">El administrador publicará avisos aquí.</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {announcement.image_url && (
                    <div className="rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                      <img
                        src={announcement.image_url}
                        alt={announcement.title}
                        className="w-full object-contain max-h-40"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-gray-900">{announcement.title}</p>
                    {announcement.body && (
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed whitespace-pre-wrap">{announcement.body}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notificaciones */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={loadNotifications}
            title="Notificaciones"
            className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
              notifOpen ? "bg-orange-50 text-orange-500" : "hover:bg-gray-100 text-gray-400 hover:text-gray-700"
            }`}
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && !notifOpen && (
              <span className="absolute top-1.5 right-1 min-w-[16px] h-4 bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1 ring-2 ring-white">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {notifOpen && (
            <div className="fixed md:absolute top-14 md:top-11 right-2 left-2 md:right-0 md:left-auto md:w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Notificaciones</p>
                <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {loadingNotifs ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center px-4">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5 text-orange-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Sin notificaciones</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {role === "docente"
                      ? "Las entregas pendientes de calificar aparecerán aquí."
                      : "Tus calificaciones aparecerán aquí cuando el docente las registre."}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <Link
                        href={n.href}
                        onClick={() => setNotifOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-orange-50 transition-colors"
                      >
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                          {role === "docente"
                            ? <ClipboardList className="w-4 h-4 text-orange-500" />
                            : <CheckCircle className="w-4 h-4 text-orange-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">{n.label}</p>
                          <p className="text-xs text-gray-500 truncate">{n.sub}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">{n.time}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Divisor — solo desktop */}
        <div className="hidden md:block w-px h-5 bg-gray-200 mx-1" />

        {/* Avatar + nombre → perfil */}
        <Link
          href={profileHref[role]}
          className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-2 py-1 transition-colors shrink-0"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-gray-100">
            {userAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600">
                <span className="text-white text-xs font-bold">{firstName.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          {/* Nombre solo en desktop */}
          <span className="hidden md:block text-sm font-semibold text-gray-700">{userName}</span>
        </Link>

        {/* Cerrar sesión */}
        <button
          onClick={() => setConfirming(true)}
          title="Cerrar sesión"
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500 shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Confirmación de cierre de sesión */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            onClick={() => setConfirming(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-6 w-80 animate-fade-up">
            <button
              onClick={() => setConfirming(false)}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center mb-4">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">¿Cerrar sesión?</h3>
            <p className="text-sm text-gray-500 mb-5">Se cerrará tu sesión en AutonomaCampus AI.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-semibold text-white transition-colors disabled:opacity-60"
              >
                {signingOut ? "Saliendo..." : "Cerrar sesión"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
