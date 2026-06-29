"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle, UserPlus } from "lucide-react";

export default function EnrollButton({ courseId, studentId }: { courseId: string; studentId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function enroll() {
    setLoading(true);
    setError("");

    const { error: insertError } = await supabase
      .from("enrollments")
      .insert({ student_id: studentId, course_id: courseId });

    setLoading(false);

    if (insertError) {
      setError("No se pudo inscribir. Intenta de nuevo.");
    } else {
      setDone(true);
      setTimeout(() => router.refresh(), 800);
    }
  }

  if (done) {
    return (
      <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-orange-50 text-orange-600 text-sm font-semibold">
        <CheckCircle className="w-4 h-4" />
        ¡Inscrito!
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={enroll}
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold transition-all disabled:opacity-60 shadow-sm shadow-orange-100"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
        {loading ? "Inscribiendo..." : "Inscribirme"}
      </button>
      {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}
    </div>
  );
}
