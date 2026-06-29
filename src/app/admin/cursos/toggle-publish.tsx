"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function TogglePublish({ courseId, published }: { courseId: string; published: boolean }) {
  const supabase = createClient();
  const [isPublished, setIsPublished] = useState(published);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await supabase.from("courses").update({ is_published: !isPublished }).eq("id", courseId);
    setIsPublished((v) => !v);
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
        isPublished
          ? "bg-orange-50 text-orange-600 border-orange-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100"
          : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-100"
      }`}
    >
      {loading
        ? <Loader2 className="w-3 h-3 animate-spin" />
        : <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? "bg-orange-500" : "bg-gray-400"}`} />
      }
      {isPublished ? "Publicado" : "Borrador"}
    </button>
  );
}
