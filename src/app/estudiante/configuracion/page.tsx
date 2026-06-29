"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Lock, Loader2, Check, X, Eye, EyeOff, Bell, Shield } from "lucide-react";

const passwordRules = (p: string) => [
  { label: "Mínimo 8 caracteres", valid: p.length >= 8 },
  { label: "Una mayúscula", valid: /[A-Z]/.test(p) },
  { label: "Un número", valid: /[0-9]/.test(p) },
  { label: "Un carácter especial", valid: /[^A-Za-z0-9]/.test(p) },
];

export default function ConfiguracionPage() {
  const supabase = createClient();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const rules = passwordRules(newPassword);
  const passwordValid = rules.every((r) => r.valid);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);
    if (!passwordValid) { setPasswordMsg({ type: "error", text: "La contraseña no cumple los requisitos." }); return; }
    if (newPassword !== confirmPassword) { setPasswordMsg({ type: "error", text: "Las contraseñas no coinciden." }); return; }

    setLoadingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoadingPassword(false);

    if (error) {
      setPasswordMsg({ type: "error", text: "No se pudo cambiar la contraseña. Intenta de nuevo." });
    } else {
      setPasswordMsg({ type: "ok", text: "Contraseña actualizada correctamente." });
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 mt-1 text-sm">Administra tu seguridad y preferencias.</p>
      </div>

      {/* ── Cambiar contraseña ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-5">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
            <Lock className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Cambiar contraseña</h2>
            <p className="text-xs text-gray-400">Solo para cuentas con correo y contraseña</p>
          </div>
        </div>
        <form onSubmit={handleChangePassword} className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">Nueva contraseña</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Crea una contraseña segura"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-11 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPassword.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {rules.map((r) => (
                  <div key={r.label} className="flex items-center gap-1.5">
                    {r.valid ? <Check className="w-3 h-3 text-green-500 shrink-0" /> : <X className="w-3 h-3 text-gray-300 shrink-0" />}
                    <span className={`text-xs ${r.valid ? "text-green-600" : "text-gray-400"}`}>{r.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">Confirmar contraseña</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-11 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {passwordMsg && (
            <div className={`text-xs px-3 py-2.5 rounded-xl border ${passwordMsg.type === "ok" ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-600"}`}>
              {passwordMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loadingPassword || !newPassword || !confirmPassword}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-all"
          >
            {loadingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
            Actualizar contraseña
          </button>
        </form>
      </div>

      {/* ── Notificaciones ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-5">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
            <Bell className="w-4 h-4 text-orange-500" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900">Notificaciones</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          {[
            { label: "Nuevas tareas", desc: "Cuando un docente publique una tarea" },
            { label: "Recordatorios de entrega", desc: "24 horas antes del vencimiento" },
            { label: "Calificaciones", desc: "Cuando el docente califique tu tarea" },
            { label: "Novedades de la plataforma", desc: "Actualizaciones y anuncios" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-orange-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:shadow after:transition-all peer-checked:after:translate-x-4" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* ── Seguridad ──────────────────────────────────────── */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-orange-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-orange-800 mb-0.5">Tu cuenta está protegida</p>
          <p className="text-xs text-orange-600 leading-relaxed">
            Tus datos se almacenan de forma segura con Row Level Security. Nadie más puede ver tu información.
          </p>
        </div>
      </div>
    </div>
  );
}
