"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Loader2, Trash2, ToggleLeft, ToggleRight, ImageIcon, X } from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
};

export default function AnnouncementsManager({ initial }: { initial: Announcement[] }) {
  const supabase = createClient();
  const [items, setItems] = useState<Announcement[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleCreate() {
    if (!title.trim()) return;
    setCreating(true);

    // Desactivar todos los activos primero
    await supabase.from("announcements").update({ is_active: false }).eq("is_active", true);

    const { data, error } = await supabase
      .from("announcements")
      .insert({ title: title.trim(), body: body.trim() || null, image_url: imageUrl.trim() || null, is_active: true })
      .select()
      .single();

    setCreating(false);
    if (!error && data) {
      setItems((prev) => [data, ...prev.map((i) => ({ ...i, is_active: false }))]);
      setTitle(""); setBody(""); setImageUrl(""); setShowForm(false);
    }
  }

  async function toggleActive(id: string, current: boolean) {
    setLoadingId(id);
    if (!current) {
      // Desactivar todos primero, luego activar este
      await supabase.from("announcements").update({ is_active: false }).eq("is_active", true);
      await supabase.from("announcements").update({ is_active: true }).eq("id", id);
      setItems((prev) => prev.map((i) => ({ ...i, is_active: i.id === id })));
    } else {
      await supabase.from("announcements").update({ is_active: false }).eq("id", id);
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, is_active: false } : i));
    }
    setLoadingId(null);
  }

  async function handleDelete(id: string) {
    setLoadingId(id);
    await supabase.from("announcements").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setLoadingId(null);
  }

  return (
    <div className="space-y-5">

      {/* Botón nuevo anuncio */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-orange-100 transition-all"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancelar" : "Nuevo anuncio"}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-orange-100 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Crear anuncio</h3>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Título *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: ¡Descuento por pronto pago!"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Mensaje (opcional)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Texto del anuncio para los usuarios..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">URL de imagen (opcional)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full pl-9 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                />
              </div>
            </div>
            {imageUrl && (
              <img src={imageUrl} alt="preview" className="mt-2 rounded-xl max-h-40 object-contain border border-gray-100" />
            )}
          </div>

          <p className="text-xs text-gray-400">Al crear este anuncio se desactivará cualquier otro anuncio activo.</p>

          <button
            onClick={handleCreate}
            disabled={creating || !title.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-all"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Publicar anuncio
          </button>
        </div>
      )}

      {/* Lista */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">Anuncios creados</span>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">{items.length}</span>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-gray-300">
            <Plus className="w-8 h-8 mb-2" />
            <p className="text-sm">No hay anuncios creados aún.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {items.map((item) => (
              <div key={item.id} className="px-6 py-4 flex items-start gap-4">
                {item.image_url && (
                  <img src={item.image_url} alt={item.title} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-100" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${item.is_active ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"}`}>
                      {item.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  {item.body && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.body}</p>}
                  <p className="text-xs text-gray-300 mt-1">
                    {new Date(item.created_at).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(item.id, item.is_active)}
                    disabled={loadingId === item.id}
                    title={item.is_active ? "Desactivar" : "Activar"}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors disabled:opacity-50"
                  >
                    {loadingId === item.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : item.is_active
                        ? <ToggleRight className="w-5 h-5 text-orange-500" />
                        : <ToggleLeft className="w-5 h-5" />
                    }
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={loadingId === item.id}
                    title="Eliminar"
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
