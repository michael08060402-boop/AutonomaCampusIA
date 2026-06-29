"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Mail, Calendar, BookOpen, Shield, User, Pencil, Check, X, Loader2, Camera } from "lucide-react";

export default function PerfilDocentePage() {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [provider, setProvider] = useState("email");
  const [createdAt, setCreatedAt] = useState("");
  const [avatar, setAvatar] = useState<string | undefined>();
  const [firstName, setFirstName] = useState("Docente");
  const [userId, setUserId] = useState("");

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();

      const rawName = user.user_metadata?.full_name || user.user_metadata?.name || profile?.full_name || "";
      const capitalized = rawName.split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

      setUserId(user.id);
      setFullName(capitalized);
      setEditName(capitalized);
      setFirstName(capitalized.split(" ")[0] || "Docente");
      setEmail(user.email ?? "");
      setProvider(user.app_metadata?.provider ?? "email");
      setAvatar(profile?.avatar_url || user.user_metadata?.avatar_url);
      setCreatedAt(
        user.created_at
          ? new Date(user.created_at).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })
          : ""
      );
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave() {
    if (!editName.trim()) return;
    setSaving(true);
    setSaveMsg(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: editName.trim() })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      setSaveMsg({ type: "error", text: "No se pudo guardar. Intenta de nuevo." });
    } else {
      const capitalized = editName.trim().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
      setFullName(capitalized);
      setFirstName(capitalized.split(" ")[0] || "Docente");
      setEditing(false);
      setSaveMsg({ type: "ok", text: "Nombre actualizado correctamente." });
      setTimeout(() => setSaveMsg(null), 3000);
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (file.size > 5 * 1024 * 1024) {
      setSaveMsg({ type: "error", text: "La imagen no puede superar los 5 MB." });
      return;
    }

    setUploadingPhoto(true);
    setSaveMsg(null);

    const ext = file.name.split(".").pop();
    const path = `${userId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setSaveMsg({ type: "error", text: "Error al subir la foto. Intenta de nuevo." });
      setUploadingPhoto(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    setUploadingPhoto(false);

    if (updateError) {
      setSaveMsg({ type: "error", text: "Foto subida pero no se pudo guardar. Intenta de nuevo." });
    } else {
      setAvatar(publicUrl + `?t=${Date.now()}`);
      setSaveMsg({ type: "ok", text: "Foto de perfil actualizada." });
      setTimeout(() => setSaveMsg(null), 3000);
    }

    e.target.value = "";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
        <p className="text-gray-500 mt-1 text-sm">Información de tu cuenta en AutonomaCampus AI.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-5">

        {/* Banner */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-700 px-6 py-6 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-white/5 rounded-full" />
          <div className="relative flex items-center gap-4">

            {/* Avatar con subida */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingPhoto}
              className="relative w-16 h-16 rounded-2xl border-2 border-white/30 shadow-md overflow-hidden shrink-0 group cursor-pointer disabled:cursor-wait"
              title="Cambiar foto de perfil"
            >
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/20">
                  <span className="text-white text-2xl font-bold">{firstName.charAt(0)}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingPhoto
                  ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                  : <Camera className="w-5 h-5 text-white" />
                }
              </div>
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={handlePhotoChange}
            />

            <div>
              <h2 className="text-xl font-bold text-white">{fullName || "Sin nombre"}</h2>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 bg-white/15 px-2.5 py-1 rounded-full mt-1.5">
                <BookOpen className="w-3 h-3" />
                Docente
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-5">
          <div className="border-t border-gray-100 mb-5" />

          {saveMsg && (
            <div className={`mb-4 text-xs px-3 py-2.5 rounded-xl border ${saveMsg.type === "ok" ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-600"}`}>
              {saveMsg.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Nombre editable */}
            <div className="sm:col-span-2 flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 border border-gray-100">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-1">Nombre completo</p>
                {editing ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") { setEditing(false); setEditName(fullName); } }}
                    />
                    <button onClick={handleSave} disabled={saving} className="w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50">
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => { setEditing(false); setEditName(fullName); }} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg flex items-center justify-center transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">{fullName || "Sin nombre"}</p>
                    <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors">
                      <Pencil className="w-3 h-3" />
                      Editar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {[
              { icon: Mail, label: "Correo electrónico", value: email },
              { icon: BookOpen, label: "Rol en la plataforma", value: "Docente" },
              { icon: Shield, label: "Método de acceso", value: provider === "google" ? "Google OAuth" : "Correo y contraseña" },
              ...(createdAt ? [{ icon: Calendar, label: "Miembro desde", value: createdAt }] : []),
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 border border-gray-100">
                  <item.icon className="w-4 h-4 text-gray-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-orange-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-orange-800 mb-0.5">Datos seguros</p>
          <p className="text-xs text-orange-600 leading-relaxed">
            Tu información está protegida con Row Level Security. Solo tú puedes ver y editar tus datos.
          </p>
        </div>
      </div>
    </div>
  );
}
