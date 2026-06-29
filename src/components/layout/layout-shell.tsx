"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";
import type { Role } from "@/lib/types";

interface LayoutShellProps {
  role: Role;
  userName: string;
  userAvatar?: string;
  children: React.ReactNode;
}

export function LayoutShell({ role, userName, userAvatar, children }: LayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — drawer en móvil, fijo en desktop */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transition-transform duration-300 md:static md:translate-x-0 md:z-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar
          role={role}
          userName={userName}
          userAvatar={userAvatar}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar
          role={role}
          userName={userName}
          userAvatar={userAvatar}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
