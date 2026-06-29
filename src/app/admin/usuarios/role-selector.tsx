"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Check, Loader2 } from "lucide-react";

type Role = "estudiante" | "docente" | "admin";

const roles: { value: Role; label: string }[] = [
  { value: "estudiante", label: "Estudiante" },
  { value: "docente",    label: "Docente" },
  { value: "admin",      label: "Admin" },
];

export default function RoleSelector({ userId, currentRole }: { userId: string; currentRole: Role }) {
  const supabase = createClient();
  const [role, setRole] = useState<Role>(currentRole);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleChange(newRole: Role) {
    if (newRole === role) return;
    setSaving(true);
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    setRole(newRole);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs font-medium">
        {roles.map((r) => (
          <button
            key={r.value}
            onClick={() => handleChange(r.value)}
            disabled={saving}
            className={`px-3 py-1.5 transition-colors ${
              role === r.value
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-500 hover:bg-orange-50 hover:text-orange-600"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      {saving && <Loader2 className="w-3.5 h-3.5 text-orange-400 animate-spin" />}
      {saved && <Check className="w-3.5 h-3.5 text-orange-500" />}
    </div>
  );
}
