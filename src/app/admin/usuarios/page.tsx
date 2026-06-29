import { createClient } from "@/lib/supabase/server";
import { Users, GraduationCap, BookOpen, ShieldCheck } from "lucide-react";
import RoleSelector from "./role-selector";

export default async function AdminUsuariosPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, created_at")
    .order("created_at", { ascending: false });

  const users = profiles ?? [];
  const total = users.length;
  const estudiantes = users.filter((u) => u.role === "estudiante").length;
  const docentes = users.filter((u) => u.role === "docente").length;
  const admins = users.filter((u) => u.role === "admin").length;

  const roleIcon: Record<string, React.ReactNode> = {
    admin:      <ShieldCheck className="w-3.5 h-3.5" />,
    docente:    <BookOpen className="w-3.5 h-3.5" />,
    estudiante: <GraduationCap className="w-3.5 h-3.5" />,
  };

  return (
    <div className="w-full">

      {/* Banner */}
      <div className="relative bg-gradient-to-br from-orange-500 to-orange-700 px-8 py-8 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Usuarios</h1>
          <p className="text-white/70 text-sm mt-1">Gestiona roles y cuentas de la plataforma.</p>
          <div className="flex items-center gap-5 mt-4 flex-wrap">
            {[
              { label: "Total", value: total },
              { label: "Estudiantes", value: estudiantes },
              { label: "Docentes", value: docentes },
              { label: "Admins", value: admins },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-3">
                {i > 0 && <div className="w-px h-6 bg-white/20" />}
                <div>
                  <p className="text-xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-white/60">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 pb-8 pt-6">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" />
            <h2 className="font-semibold text-gray-900 text-sm">Todos los usuarios</h2>
            <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">{total}</span>
          </div>

          {users.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-300">
              <Users className="w-8 h-8 mb-2" />
              <p className="text-sm">No hay usuarios registrados.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {users.map((u) => {
                const name = u.full_name || "Sin nombre";
                const role = (u.role ?? "estudiante") as "estudiante" | "docente" | "admin";
                return (
                  <div key={u.id} className="flex items-start gap-3 px-4 md:px-6 py-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 overflow-hidden mt-0.5">
                      {u.avatar_url
                        ? <img src={u.avatar_url} alt={name} className="w-full h-full object-cover" />
                        : <span className="text-orange-600 font-bold text-sm">{name.charAt(0).toUpperCase()}</span>
                      }
                    </div>

                    {/* Info + selector apilados en móvil, fila en desktop */}
                    <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-2">
                      <div className="flex-1 min-w-0 flex items-center gap-2 md:block">
                        <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                        <p className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(u.created_at).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>

                      {/* Rol actual (badge) — solo sm+ */}
                      <div className={`hidden sm:flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                        role === "admin"      ? "bg-orange-100 text-orange-700" :
                        role === "docente"    ? "bg-orange-50 text-orange-600 border border-orange-100" :
                                               "bg-gray-100 text-gray-500"
                      }`}>
                        {roleIcon[role]}
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </div>

                      {/* Selector de rol */}
                      <RoleSelector userId={u.id} currentRole={role} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
