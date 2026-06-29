"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Megaphone } from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  body: string | null;
  image_url: string | null;
};

export default function AnnouncementModal({ announcement }: { announcement: Announcement | null }) {
  const supabase = createClient();
  const [visible, setVisible] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!announcement) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      const key = `announcement_seen_${user.id}_${announcement.id}`;
      if (!localStorage.getItem(key)) setVisible(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcement]);

  function close() {
    if (!announcement || !userId) return;
    localStorage.setItem(`announcement_seen_${userId}_${announcement.id}`, "1");
    setVisible(false);
  }

  if (!visible || !announcement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-up">

        {/* Barra naranja superior */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 to-orange-600" />

        {/* Botón cerrar */}
        <button
          onClick={close}
          className="absolute top-4 right-4 z-10 w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Imagen */}
        {announcement.image_url && (
          <div className="mx-5 mt-5 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
            <img
              src={announcement.image_url}
              alt={announcement.title}
              className="w-full object-contain max-h-56"
            />
          </div>
        )}

        {/* Contenido */}
        <div className="px-6 pt-4 pb-6">
          {/* Badge */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-5 h-5 bg-orange-100 rounded-md flex items-center justify-center">
              <Megaphone className="w-3 h-3 text-orange-500" />
            </div>
            <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide">Anuncio</span>
          </div>

          <h2 className="text-base font-bold text-gray-900 leading-snug">{announcement.title}</h2>

          {announcement.body && (
            <p className="text-sm text-gray-500 mt-2 leading-relaxed whitespace-pre-wrap">{announcement.body}</p>
          )}

          <button
            onClick={close}
            className="mt-5 w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-orange-100"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
