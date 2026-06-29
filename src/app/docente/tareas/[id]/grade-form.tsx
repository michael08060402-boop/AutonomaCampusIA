"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Check, Loader2, FileText, Download } from "lucide-react";

interface Props {
  submissionId: string;
  initialGrade: number | null;
  initialFeedback: string | null;
}

export default function GradeForm({ submissionId, initialGrade, initialFeedback }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [grade, setGrade] = useState(initialGrade?.toString() ?? "");
  const [feedback, setFeedback] = useState(initialFeedback ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    const gradeNum = parseFloat(grade);
    if (grade !== "" && (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 20)) {
      setError("La nota debe estar entre 0 y 20.");
      return;
    }
    setSaving(true);
    setError("");

    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        grade: grade !== "" ? gradeNum : null,
        feedback: feedback.trim() || null,
      })
      .eq("id", submissionId);

    setSaving(false);
    if (updateError) {
      setError("No se pudo guardar. Intenta de nuevo.");
    } else {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    }
  }

  return (
    <div className="space-y-3 pt-3 border-t border-gray-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Nota (0 – 20)</label>
          <input
            type="number"
            min={0}
            max={20}
            step={0.5}
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="—"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Retroalimentación</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Comentario para el estudiante..."
            rows={1}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all resize-none"
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
          saved
            ? "bg-orange-50 text-orange-600 border border-orange-100"
            : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-sm shadow-orange-100"
        } disabled:opacity-50`}
      >
        {saving
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <Check className="w-3.5 h-3.5" />
        }
        {saved ? "¡Guardado!" : "Guardar calificación"}
      </button>
    </div>
  );
}

export function FileLink({ url }: { url: string }) {
  const name = (() => {
    try { return decodeURIComponent(url.split("/").pop()?.split("?")[0] ?? "Archivo"); }
    catch { return "Archivo"; }
  })();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-xs font-medium text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-100 px-3 py-1.5 rounded-lg transition-colors"
    >
      <FileText className="w-3.5 h-3.5" />
      {name}
      <Download className="w-3 h-3" />
    </a>
  );
}
