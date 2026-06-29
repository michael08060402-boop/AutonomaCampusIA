"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, BookOpen, Sparkles, Quote } from "lucide-react";

/* ── Frases de inspiración ─────────────────────────────── */
const quotes = [
  { text: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.", author: "Robert Collier" },
  { text: "La educación es el arma más poderosa que puedes usar para cambiar el mundo.", author: "Nelson Mandela" },
  { text: "Nunca es tarde para aprender algo nuevo. Cada día es una nueva oportunidad.", author: "Anónimo" },
  { text: "El conocimiento es la única cosa que nadie puede quitarte.", author: "Eleanor Roosevelt" },
  { text: "Estudia no para saber más, sino para ignorar menos.", author: "Juana Inés de la Cruz" },
  { text: "La disciplina es el puente entre metas y logros.", author: "Jim Rohn" },
  { text: "Cada experto fue una vez un principiante. Sigue adelante.", author: "Helen Hayes" },
  { text: "El aprendizaje es un tesoro que seguirá a su dueño a todas partes.", author: "Proverbio chino" },
  { text: "No cuentes los días, haz que los días cuenten.", author: "Muhammad Ali" },
  { text: "El único modo de hacer un gran trabajo es amar lo que haces.", author: "Steve Jobs" },
  { text: "La perseverancia es la madre del éxito.", author: "Voltaire" },
  { text: "Invierte en ti mismo. Tu carrera es el motor de tu riqueza.", author: "Paul Clitheroe" },
];

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

/* Tareas de ejemplo — se reemplazarán con datos reales de Supabase */
const mockEvents: { date: string; title: string; course: string; type: "tarea" | "examen" | "clase" }[] = [];

export default function CalendarioPage() {
  const today = new Date();
  const [current, setCurrent] = useState({ month: today.getMonth(), year: today.getFullYear() });

  const quote = useMemo(() => {
    const idx = Math.floor(Date.now() / 86400000) % quotes.length;
    return quotes[idx];
  }, []);

  /* Genera los días del mes */
  const days = useMemo(() => {
    const firstDay = new Date(current.year, current.month, 1).getDay();
    const totalDays = new Date(current.year, current.month + 1, 0).getDate();
    const prevDays = new Date(current.year, current.month, 0).getDate();

    const cells: { day: number; current: boolean; date: Date }[] = [];

    // Días del mes anterior
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: prevDays - i, current: false, date: new Date(current.year, current.month - 1, prevDays - i) });
    }
    // Días del mes actual
    for (let d = 1; d <= totalDays; d++) {
      cells.push({ day: d, current: true, date: new Date(current.year, current.month, d) });
    }
    // Completar filas con días del mes siguiente
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, current: false, date: new Date(current.year, current.month + 1, d) });
    }
    return cells;
  }, [current]);

  function eventsForDate(date: Date) {
    const key = date.toISOString().split("T")[0];
    return mockEvents.filter(e => e.date === key);
  }

  function isToday(date: Date) {
    return date.toDateString() === today.toDateString();
  }

  function prevMonth() {
    setCurrent(c => c.month === 0
      ? { month: 11, year: c.year - 1 }
      : { month: c.month - 1, year: c.year });
  }
  function nextMonth() {
    setCurrent(c => c.month === 11
      ? { month: 0, year: c.year + 1 }
      : { month: c.month + 1, year: c.year });
  }

  /* Próximos eventos (30 días) */
  const upcoming = mockEvents
    .filter(e => {
      const d = new Date(e.date);
      const diff = (d.getTime() - today.getTime()) / 86400000;
      return diff >= 0 && diff <= 30;
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
        <p className="text-gray-500 mt-1 text-sm">Visualiza tus tareas, exámenes y fechas importantes.</p>
      </div>

      {/* ── Frase del día ────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-6 mb-8 overflow-hidden">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 right-12 w-20 h-20 bg-white/5 rounded-full" />
        <div className="relative flex items-start gap-4">
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">Inspiración del día</p>
            <p className="text-white font-semibold text-base leading-relaxed mb-2">
              &ldquo;{quote.text}&rdquo;
            </p>
            <p className="text-white/60 text-sm">— {quote.author}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Calendario ───────────────────────────────────── */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Navegación de mes */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <button
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <h2 className="font-bold text-gray-900 text-base">
              {MONTHS[current.month]} {current.year}
            </h2>
            <button
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS.map(d => (
              <div key={d} className="py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>

          {/* Grid de días */}
          <div className="grid grid-cols-7">
            {days.map((cell, i) => {
              const events = eventsForDate(cell.date);
              const isCurrentDay = isToday(cell.date);

              return (
                <div
                  key={i}
                  className={`min-h-[64px] p-1.5 border-b border-r border-gray-50 ${
                    !cell.current ? "bg-gray-50/40" : "hover:bg-orange-50/30 transition-colors"
                  }`}
                >
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold mx-auto mb-1 ${
                    isCurrentDay
                      ? "bg-orange-600 text-white shadow-md shadow-orange-300"
                      : cell.current
                      ? "text-gray-700"
                      : "text-gray-300"
                  }`}>
                    {cell.day}
                  </div>
                  {events.slice(0, 2).map((e, ei) => (
                    <div key={ei} className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium truncate mb-0.5 ${
                      e.type === "examen" ? "bg-red-100 text-red-600" :
                      e.type === "tarea"  ? "bg-orange-100 text-orange-600" :
                                            "bg-blue-100 text-blue-600"
                    }`}>
                      {e.title}
                    </div>
                  ))}
                  {events.length > 2 && (
                    <p className="text-[10px] text-gray-400 text-center">+{events.length - 2}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Leyenda */}
          <div className="flex items-center gap-5 px-6 py-3 border-t border-gray-100">
            {[
              { color: "bg-orange-400", label: "Tarea" },
              { color: "bg-red-400",    label: "Examen" },
              { color: "bg-blue-400",   label: "Clase" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                <span className="text-xs text-gray-400">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Panel lateral ────────────────────────────────── */}
        <div className="space-y-5">

          {/* Hoy */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-gray-900 text-sm">Hoy</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{today.getDate()}</p>
            <p className="text-gray-400 text-sm capitalize">
              {today.toLocaleDateString("es-PE", { weekday: "long", month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Próximos eventos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-gray-900 text-sm">Próximas fechas</h3>
            </div>

            {upcoming.length > 0 ? (
              <div className="space-y-3">
                {upcoming.map((e, i) => {
                  const d = new Date(e.date);
                  const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000);
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-orange-50 rounded-xl flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] text-orange-400 font-semibold leading-none">
                          {MONTHS[d.getMonth()].slice(0, 3)}
                        </span>
                        <span className="text-sm font-bold text-orange-600 leading-none">{d.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{e.title}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <BookOpen className="w-3 h-3" />
                          {e.course}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-orange-500 shrink-0">
                        {diff === 0 ? "Hoy" : diff === 1 ? "Mañana" : `${diff}d`}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No hay fechas próximas</p>
                <p className="text-xs text-gray-300 mt-1">Las tareas y exámenes aparecerán aquí</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
