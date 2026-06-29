"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BookOpen, Home, ClipboardList, Calendar, MessageSquare,
  BarChart3, Users, Settings, UserCircle, HelpCircle, Megaphone, X,
} from "lucide-react";
import { clsx } from "clsx";
import type { Role } from "@/lib/types";

const navItems: Record<Role, { href: string; label: string; icon: React.ElementType }[]> = {
  estudiante: [
    { href: "/estudiante", label: "Inicio", icon: Home },
    { href: "/estudiante/cursos", label: "Mis cursos", icon: BookOpen },
    { href: "/estudiante/tareas", label: "Tareas", icon: ClipboardList },
    { href: "/estudiante/calendario", label: "Calendario", icon: Calendar },
    { href: "/estudiante/chat", label: "Chat con IA", icon: MessageSquare },
    { href: "/estudiante/perfil", label: "Mi perfil", icon: UserCircle },
    { href: "/estudiante/configuracion", label: "Configuración", icon: Settings },
    { href: "/estudiante/soporte", label: "Soporte", icon: HelpCircle },
  ],
  docente: [
    { href: "/docente", label: "Inicio", icon: Home },
    { href: "/docente/cursos", label: "Mis cursos", icon: BookOpen },
    { href: "/docente/tareas", label: "Tareas", icon: ClipboardList },
    { href: "/docente/estadisticas", label: "Estadísticas", icon: BarChart3 },
    { href: "/docente/chat", label: "Generador IA", icon: MessageSquare },
    { href: "/docente/perfil", label: "Mi perfil", icon: UserCircle },
    { href: "/docente/configuracion", label: "Configuración", icon: Settings },
    { href: "/docente/soporte", label: "Soporte", icon: HelpCircle },
  ],
  admin: [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/usuarios", label: "Usuarios", icon: Users },
    { href: "/admin/cursos", label: "Cursos", icon: BookOpen },
    { href: "/admin/anuncios", label: "Anuncios", icon: Megaphone },
    { href: "/admin/estadisticas", label: "Estadísticas", icon: BarChart3 },
    { href: "/admin/perfil", label: "Mi perfil", icon: UserCircle },
  ],
};

const roleLabel: Record<Role, string> = {
  estudiante: "Estudiante",
  docente: "Docente",
  admin: "Administrador",
};

interface SidebarProps {
  role: Role;
  userName: string;
  userAvatar?: string;
  onClose?: () => void;
}

export function Sidebar({ role, userName, userAvatar, onClose }: SidebarProps) {
  const pathname = usePathname();
  const items = navItems[role];

  return (
    <aside className="w-60 shrink-0 h-screen bg-gradient-to-b from-orange-100 to-orange-50 border-r-2 border-orange-300 flex flex-col">
      {/* Logo */}
      <div className="px-5 h-14 flex items-center justify-between border-b-2 border-orange-300">
        <div className="flex items-center gap-2.5">
          <Image
            src="/autonomalogo.png"
            alt="AutonomaCampus AI"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-none">AutonomaCampus AI</p>
            <p className="text-xs text-orange-500 mt-0.5">{roleLabel[role]}</p>
          </div>
        </div>
        {/* Cerrar en móvil */}
        {onClose && (
          <button onClick={onClose} className="md:hidden w-7 h-7 flex items-center justify-center rounded-lg hover:bg-orange-200 text-gray-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const isRoot = item.href === "/estudiante" || item.href === "/docente" || item.href === "/admin";
            const isActive = pathname === item.href || (!isRoot && pathname.startsWith(item.href + "/"));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
                      : "text-gray-600 hover:bg-orange-100/60 hover:text-orange-700"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

    </aside>
  );
}
