import { createClient } from "@/lib/supabase/server";
import { Megaphone } from "lucide-react";
import AnnouncementsManager from "./announcements-manager";

export default async function AdminAnunciosPage() {
  const supabase = await createClient();

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, body, image_url, is_active, created_at")
    .order("created_at", { ascending: false });

  const active = announcements?.filter((a) => a.is_active).length ?? 0;

  return (
    <div className="w-full">

      {/* Banner */}
      <div className="relative bg-gradient-to-br from-orange-500 to-orange-700 px-8 py-8 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Anuncios</h1>
          <p className="text-white/70 text-sm mt-1">Publica notificaciones que verán todos los usuarios al entrar.</p>
          <div className="flex items-center gap-5 mt-4">
            <div>
              <p className="text-xl font-bold text-white">{announcements?.length ?? 0}</p>
              <p className="text-xs text-white/60">Total</p>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div>
              <p className="text-xl font-bold text-white">{active}</p>
              <p className="text-xs text-white/60">Activo ahora</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 pt-6">
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-start gap-3 mb-6">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
            <Megaphone className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-orange-800">¿Cómo funciona?</p>
            <p className="text-xs text-orange-600 mt-0.5 leading-relaxed">
              El anuncio activo aparece como un popup al entrar al dashboard de estudiantes y docentes. Solo puede haber un anuncio activo a la vez — al activar uno se desactivan los demás.
            </p>
          </div>
        </div>

        <AnnouncementsManager initial={announcements ?? []} />
      </div>
    </div>
  );
}
