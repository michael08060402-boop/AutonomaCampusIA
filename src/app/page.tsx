"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Brain, FileText, BarChart3, ArrowRight, Zap, BookOpen,
  Shield, Clock, Star, ChevronDown, ChevronUp,
  CheckCircle2, GraduationCap, Users, Sparkles, Menu, X,
} from "lucide-react";
import { useState, useEffect } from "react";

const testimonials = [
  {
    name: "María González",
    role: "Estudiante de Ingeniería",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    quote: "El chat con IA me salvó en los exámenes finales. Puedo preguntarle cualquier cosa a las 2am y siempre me responde perfectamente.",
    stars: 5,
  },
  {
    name: "Prof. Carlos Mendoza",
    role: "Docente de Redes",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    quote: "Generar un examen de 20 preguntas me tomaba 2 horas. Con AutonomaCampus AI lo hago en 30 segundos. Increíble herramienta.",
    stars: 5,
  },
  {
    name: "Laura Jiménez",
    role: "Administradora Académica",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    quote: "Tener todo centralizado — usuarios, cursos y estadísticas — en un solo lugar simplificó completamente mi trabajo diario.",
    stars: 5,
  },
];

const faqs = [
  {
    question: "¿AutonomaCampus AI es gratuito?",
    answer: "Sí, puedes acceder a todas las funciones principales de forma completamente gratuita. Solo necesitas una cuenta de Google o tu correo para registrarte.",
  },
  {
    question: "¿Cómo funciona el chat con documentos?",
    answer: "El docente sube un PDF al curso y los estudiantes pueden hacerle preguntas directamente. La IA analiza el contenido y responde basándose en el material subido.",
  },
  {
    question: "¿Quién puede usar la plataforma?",
    answer: "Cualquier institución educativa. Tenemos tres roles: Estudiante, Docente y Administrador. El administrador asigna los roles desde el panel de control.",
  },
  {
    question: "¿La IA puede corregir exámenes automáticamente?",
    answer: "Sí. Para preguntas de opción múltiple y verdadero/falso la corrección es instantánea. Para preguntas de desarrollo, la IA da retroalimentación detallada.",
  },
  {
    question: "¿Mis datos están seguros?",
    answer: "Absolutamente. Usamos Supabase con Row Level Security (RLS), lo que significa que cada usuario solo puede ver sus propios datos. Toda la información está cifrada.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl overflow-hidden transition-all duration-200 border bg-white ${open ? "border-orange-200 shadow-md" : "border-gray-100 shadow-sm"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-orange-50/40 transition-colors"
      >
        <span className={`font-semibold text-sm pr-4 transition-colors ${open ? "text-orange-700" : "text-gray-900"}`}>{question}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${open ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-400"}`}>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      {open && (
        <div className="px-6 pb-6 border-t border-orange-100">
          <p className="text-gray-500 text-sm leading-relaxed pt-4">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* ── NAVBAR ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-gradient-to-b from-orange-500 to-orange-700 shadow-lg shadow-orange-900/40 border-b border-orange-800/30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-[66px] flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center border border-white/15 shrink-0">
              <Image src="/autonomalogo.png" alt="AutonomaCampus AI" width={26} height={26} className="rounded-lg" />
            </div>
            <span className="font-bold text-white text-base md:text-lg tracking-tight whitespace-nowrap">AutonomaCampus AI</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: "#como-funciona", label: "Proceso" },
              { href: "#features", label: "Funciones" },
              { href: "#roles", label: "Roles" },
              { href: "#por-que", label: "¿Cómo funciona?" },
              { href: "#testimonios", label: "Testimonios" },
              { href: "#faq", label: "FAQ" },
            ].map((link) => (
              <a key={link.label} href={link.href}
                className="text-white text-sm font-semibold hover:bg-white/15 px-4 py-2 rounded-lg transition-all drop-shadow-sm">
                {link.label}
              </a>
            ))}
          </nav>

          {/* Derecha: botón login desktop + hamburger mobile */}
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden md:inline-flex bg-white text-orange-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-50 active:scale-[0.97] transition-all shadow-md shadow-orange-900/20">
              Iniciar sesión
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/20"
              aria-label="Menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile menu desplegable */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-orange-700">
            <div className="px-4 py-3 space-y-0.5">
              {[
                { href: "#como-funciona", label: "Proceso" },
                { href: "#features", label: "Funciones" },
                { href: "#roles", label: "Roles" },
                { href: "#por-que", label: "¿Cómo funciona?" },
                { href: "#testimonios", label: "Testimonios" },
                { href: "#faq", label: "FAQ" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center text-white/90 font-semibold py-3 px-4 rounded-xl hover:bg-white/10 transition-colors text-sm"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 pb-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center bg-white text-orange-700 py-3 rounded-xl text-sm font-bold hover:bg-orange-50 transition-all shadow-md"
                >
                  Iniciar sesión
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Barra de progreso de scroll */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-white/90 transition-all duration-75 ease-out rounded-full" style={{ width: `${scrollProgress}%` }} />
      </header>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80"
          alt="Estudiantes colaborando con tecnología"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/95 via-gray-900/85 to-gray-900/50" />

        <div className="relative max-w-6xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-24">

            {/* Left: texto */}
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-1.5 text-white/90 text-xs font-semibold bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full mb-6 border border-white/20 uppercase tracking-widest">
                <GraduationCap className="w-3.5 h-3.5" />
                Campus Virtual Inteligente
              </span>
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
                Aprende más rápido con{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-primary">
                  inteligencia artificial
                </span>
              </h1>
              <p className="text-white/75 text-lg leading-relaxed mb-8 max-w-md">
                Un campus donde la IA te ayuda a estudiar, los docentes crean exámenes en segundos y el aprendizaje se adapta a cada estudiante.
              </p>
              <div className="flex items-center gap-4 mb-10">
                <Link href="/login" className="inline-flex items-center gap-2 bg-orange-600 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-orange-700 active:scale-[0.97] transition-all shadow-lg shadow-orange-900/30">
                  Empezar gratis
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-6 border-t border-white/10">
                {[
                  { value: "3 roles", label: "Estudiante · Docente · Admin" },
                  { value: "Gemini AI", label: "IA integrada" },
                  { value: "100% gratis", label: "Para siempre" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-white font-bold text-sm">{stat.value}</p>
                    <p className="text-white/50 text-xs mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: floating UI mockups */}
            <div className="hidden lg:block relative h-[520px]">

              {/* Chat card */}
              <div className="absolute top-0 right-0 bg-white rounded-2xl shadow-2xl p-5 w-72 rotate-1 border border-gray-100">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
                  <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Brain className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-gray-900">Chat con IA</span>
                  <div className="ml-auto w-2 h-2 bg-green-400 rounded-full" />
                </div>
                <div className="space-y-2.5 mb-4">
                  <div className="bg-gray-100 rounded-xl rounded-tl-sm px-3 py-2 text-xs text-gray-600 max-w-[85%]">
                    ¿Puedes explicarme las capas del modelo OSI?
                  </div>
                  <div className="bg-primary/10 rounded-xl rounded-tr-sm px-3 py-2 text-xs text-primary/80 ml-auto max-w-[90%]">
                    El modelo OSI tiene 7 capas: Física, Enlace de datos, Red, Transporte...
                  </div>
                  <div className="bg-gray-100 rounded-xl rounded-tl-sm px-3 py-2 text-xs text-gray-600 max-w-[70%]">
                    ¿Y TCP/IP tiene lo mismo?
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl px-3 py-2 flex items-center gap-2 border border-gray-100">
                  <span className="text-xs text-gray-300 flex-1">Escribe tu pregunta...</span>
                  <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center shrink-0">
                    <ArrowRight className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
              </div>

              {/* Exam card */}
              <div className="absolute bottom-0 left-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-56 -rotate-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-900">Examen generado</span>
                </div>
                <div className="space-y-1.5">
                  {["Redes y protocolos", "Modelo OSI — 10 pts", "TCP/IP — 10 pts"].map((q) => (
                    <div key={q} className="text-xs text-gray-500 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                      {q}
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xs text-gray-400">20 preguntas</span>
                  <span className="text-xs font-semibold text-green-600">Listo ✓</span>
                </div>
              </div>

              {/* Progress mini card */}
              <div className="absolute top-6 -left-8 bg-white rounded-xl shadow-lg border border-gray-100 p-3 w-36">
                <p className="text-xs text-gray-400 mb-2">Progreso del curso</p>
                <div className="flex items-end gap-0.5 h-10 mb-1">
                  {[40, 65, 55, 80, 70, 90].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary/15 rounded-sm overflow-hidden" style={{ height: "100%" }}>
                      <div className="w-full bg-primary/70 rounded-sm transition-all" style={{ height: `${h}%`, marginTop: `${100 - h}%` }} />
                    </div>
                  ))}
                </div>
                <p className="text-xs font-bold text-primary">+24% este mes</p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────────────────── */}
      <section id="como-funciona" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-orange-50 to-white" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-300/50 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-200/50 rounded-full blur-2xl -translate-x-1/3 translate-y-1/2" />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Proceso</p>
            <h2 className="text-3xl font-bold text-gray-900">Empieza en tres simples pasos</h2>
            <p className="text-gray-500 mt-2">Sin complicaciones, sin configuraciones largas.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Línea conectora */}
            <div className="hidden md:block absolute top-[88px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30" />
            {[
              { title: "Crea tu cuenta", description: "Regístrate con Google o tu correo en menos de 30 segundos. Sin formularios largos.", icon: Users },
              { title: "Elige tu rol", description: "El administrador asigna tu rol: Estudiante, Docente o Admin. Cada uno con su propio espacio.", icon: GraduationCap },
              { title: "Empieza a aprender", description: "Accede a cursos, chatea con la IA, sube materiales y genera exámenes al instante.", icon: Brain },
            ].map((step, i) => (
              <div key={step.title} className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all p-8 flex flex-col items-center text-center group">
                <div className="relative w-24 h-24 mb-5 z-10">
                  <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <span className="absolute -top-3 -right-3 w-9 h-9 bg-primary rounded-full text-white text-base font-black flex items-center justify-center shadow-lg border-2 border-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg z-10">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed z-10">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section id="features" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tl from-orange-100 via-white to-orange-100" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-300/50 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-300/50 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Funcionalidades</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Todo lo que necesitas para enseñar y aprender</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">IA integrada en cada paso del proceso educativo.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Card grande: Chat con IA */}
            <div className="md:col-span-2 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-8 text-white relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/5 rounded-full" />
              <div className="absolute bottom-0 right-8 w-40 h-40 bg-white/5 rounded-full" />
              <div className="relative">
                <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <span className="inline-block text-xs font-semibold bg-white/15 text-white/90 px-3 py-1 rounded-full mb-4">Para todos los roles</span>
                <h3 className="text-2xl font-bold mb-3">Chat con IA</h3>
                <p className="text-white/80 leading-relaxed mb-6 max-w-sm">
                  Pregúntale a la IA sobre cualquier tema académico y obtén respuestas claras al instante. Disponible 24/7.
                </p>
                <div className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/20 transition-colors px-4 py-2 rounded-full text-sm font-medium">
                  <Sparkles className="w-3.5 h-3.5" /> Powered by Gemini AI
                </div>
              </div>
            </div>

            {/* Chat con documentos */}
            <div className="bg-white rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all group overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-primary to-orange-400" />
              <div className="p-7">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">Estudiantes</span>
                <h3 className="font-bold text-gray-900 mt-3 mb-2 text-lg">Chat con documentos</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Sube PDFs y la IA los lee. Haz preguntas directas sobre el material del curso.</p>
              </div>
            </div>

            {/* Generador de exámenes */}
            <div className="bg-white rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all group overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-orange-400 to-primary" />
              <div className="p-7">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">Docentes</span>
                <h3 className="font-bold text-gray-900 mt-3 mb-2 text-lg">Generador de exámenes</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Crea exámenes completos en segundos. La IA genera preguntas y corrige automáticamente.</p>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all group overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-primary via-orange-400 to-primary" />
              <div className="p-8 flex gap-8 items-center">
                <div className="flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">Docentes · Admins</span>
                  <h3 className="font-bold text-gray-900 mt-3 mb-2 text-lg">Estadísticas en tiempo real</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Seguimiento de progreso con dashboards visuales. Ve quién avanza y quién necesita apoyo.</p>
                </div>
                <div className="hidden md:flex items-end gap-1.5 h-16 shrink-0 pr-4">
                  {[45, 70, 55, 85, 65, 90, 75].map((h, i) => (
                    <div key={i} className="w-4 rounded-t-md overflow-hidden flex flex-col justify-end bg-primary/10" style={{ height: "100%" }}>
                      <div className="w-full bg-primary/60 rounded-t-md" style={{ height: `${h}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── ROLES ────────────────────────────────────────────── */}
      <section id="roles" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-orange-100/60 to-orange-100" />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-orange-300/50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 left-1/3 w-56 h-56 bg-orange-200/60 rounded-full blur-2xl -translate-y-1/2" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Roles</p>
            <h2 className="text-3xl font-bold text-gray-900">Diseñado para todos</h2>
            <p className="text-gray-500 mt-2 text-lg">Cada rol con su propio espacio y herramientas.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                role: "Estudiante",
                icon: GraduationCap,
                gradient: "from-orange-500 to-orange-700",
                shadow: "shadow-orange-200",
                border: "border-orange-200",
                dot: "bg-orange-500",
                tag: "Para aprender",
                items: ["Ver cursos y materiales", "Entregar tareas y proyectos", "Chat con IA disponible 24/7", "Seguir tu progreso académico"],
              },
              {
                role: "Docente",
                icon: BookOpen,
                gradient: "from-orange-700 to-orange-900",
                shadow: "shadow-orange-300",
                border: "border-orange-200",
                dot: "bg-orange-700",
                tag: "Para enseñar",
                items: ["Crear y gestionar cursos", "Subir materiales PDF", "Generar exámenes con IA", "Ver estadísticas del grupo"],
              },
              {
                role: "Administrador",
                icon: Shield,
                gradient: "from-orange-900 to-gray-900",
                shadow: "shadow-gray-300",
                border: "border-gray-200",
                dot: "bg-orange-900",
                tag: "Para gestionar",
                items: ["Gestionar todos los usuarios", "Administrar cursos y roles", "Dashboard institucional", "Control total de la plataforma"],
              },
            ].map((r) => (
              <div key={r.role} className={`rounded-2xl border ${r.border} bg-white overflow-hidden hover:shadow-xl hover:-translate-y-1 shadow-lg ${r.shadow} transition-all duration-300 group`}>
                {/* Header */}
                <div className={`bg-gradient-to-br ${r.gradient} p-7 relative overflow-hidden`}>
                  <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
                  <div className="absolute bottom-2 right-6 w-16 h-16 bg-white/5 rounded-full" />
                  <div className="relative">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                      <r.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">{r.tag}</span>
                    <h3 className="text-white font-bold text-2xl mt-1">{r.role}</h3>
                  </div>
                </div>
                {/* Body */}
                <div className="p-6 bg-white">
                  <ul className="space-y-3.5">
                    {r.items.map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${r.dot}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POR QUÉ ELEGIRNOS ────────────────────────────────── */}
      <section id="por-que" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-100 via-white to-orange-100" />
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-300/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-200/50 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Por qué elegirnos</p>
            <h2 className="text-3xl font-bold text-gray-900">La diferencia que nos hace únicos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Zap,      metric: "Gemini", metricSub: "AI",     title: "IA de última generación", description: "Integrado con Gemini AI de Google, el modelo más avanzado para educación." },
              { icon: Shield,   metric: "100%",   metricSub: "seguro",  title: "Seguro y privado",        description: "Row Level Security. Cada usuario solo accede exactamente a lo que le corresponde." },
              { icon: Clock,    metric: "24/7",   metricSub: "activo",  title: "Disponible siempre",      description: "La IA no descansa. Estudia a la hora que quieras y obtén ayuda al instante." },
              { icon: BookOpen, metric: "Todo",   metricSub: "en 1",    title: "En un solo lugar",        description: "Cursos, tareas, calificaciones y chat con IA. Sin saltar entre apps." },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600" />
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-orange-100 transition-colors">
                  <item.icon className="w-6 h-6 text-orange-600" />
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-black text-orange-600">{item.metric}</span>
                  <span className="text-sm font-semibold text-orange-400 ml-1">{item.metricSub}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ──────────────────────────────────────── */}
      <section id="testimonios" className="relative py-24 overflow-hidden">
        {/* Fondo con gradiente suave y decoración */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-orange-50 to-orange-100" />
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-300/60 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-300/50 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-orange-200/40 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Testimonios</p>
            <h2 className="text-3xl font-bold text-gray-900">Lo que dicen nuestros usuarios</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Más de 500 estudiantes y docentes ya usan AutonomaCampus AI en su día a día.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {testimonials.map((t, i) => {
              const isCenter = i === 1;
              return (
              <div key={t.name} className={`rounded-2xl p-8 flex flex-col shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative
                ${isCenter
                  ? "bg-gradient-to-br from-orange-500 to-orange-700 border-0 scale-[1.04] z-10 shadow-orange-300"
                  : "bg-white border border-orange-100"}`}>

                {/* Icono de cita SVG */}
                <svg className={`w-9 h-9 mb-4 ${isCenter ? "text-white/30" : "text-orange-200"}`} fill="currentColor" viewBox="0 0 32 32">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>

                {/* Estrellas */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, si) => (
                    <Star key={si} className={`w-4 h-4 fill-current ${isCenter ? "text-orange-200" : "text-orange-500"}`} />
                  ))}
                </div>

                {/* Quote */}
                <p className={`text-sm leading-relaxed flex-1 mb-6 ${isCenter ? "text-white/90" : "text-gray-600"}`}>
                  "{t.quote}"
                </p>

                {/* Autor */}
                <div className={`flex items-center gap-3 pt-5 border-t ${isCenter ? "border-white/20" : "border-orange-100"}`}>
                  <div className={`w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ${isCenter ? "ring-white/40" : "ring-orange-200"}`}>
                    <Image src={t.image} alt={t.name} width={44} height={44} className="object-cover w-full h-full" />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${isCenter ? "text-white" : "text-gray-900"}`}>{t.name}</p>
                    <p className={`text-xs mt-0.5 ${isCenter ? "text-white/70" : "text-gray-400"}`}>{t.role}</p>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-orange-300/50 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-200/50 rounded-full blur-2xl -translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl font-bold text-gray-900">Preguntas frecuentes</h2>
            <p className="text-gray-500 mt-3">Todo lo que necesitas saber antes de empezar.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>

          {/* Card de contacto simplificada */}
          <div className="mt-10 bg-white rounded-2xl border border-orange-100 shadow-sm p-6 text-center">
            <p className="text-gray-500 text-sm">
              ¿No encontraste lo que buscabas?{" "}
              <a
                href="https://wa.me/51958173765?text=Hola%2C%20me%20interesa%20AutonomaCampus%20AI%20y%20tengo%20una%20consulta%20%F0%9F%99%8C"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline">
                Escríbenos por WhatsApp
              </a>{" "}
              y te respondemos al instante.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            ¿Listo para transformar tu campus?
          </h2>
          <p className="text-white/80 text-lg mb-10">
            Únete y empieza a usar IA en tu proceso educativo hoy mismo. Completamente gratis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-orange-50 active:scale-[0.97] transition-all shadow-xl">
              Comenzar ahora gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="text-white/60 text-sm">Sin tarjeta · Sin compromisos</span>
          </div>
        </div>
      </section>

      {/* ── WHATSAPP FLOTANTE ────────────────────────────────── */}
      <a
        href="https://wa.me/51958173765?text=Hola%2C%20me%20interesa%20AutonomaCampus%20AI%20y%20tengo%20una%20consulta%20%F0%9F%99%8C"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 group flex items-center gap-3"
        aria-label="Contactar por WhatsApp"
      >
        {/* Tooltip */}
        <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
          ¡Escríbenos ahora!
        </span>
        {/* Botón */}
        <div className="relative w-14 h-14 flex items-center justify-center bg-orange-600 hover:bg-orange-700 active:scale-95 transition-all duration-200 rounded-full shadow-lg shadow-orange-500/40">
          {/* Pulso */}
          <span className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-30" />
          <svg className="w-7 h-7 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>
      </a>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-gray-950 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image src="/autonomalogo.png" alt="AutonomaCampus AI" width={28} height={28} className="rounded-lg" />
              <span className="text-white font-semibold">AutonomaCampus AI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#features" className="hover:text-gray-300 transition-colors">Funciones</a>
              <a href="#testimonios" className="hover:text-gray-300 transition-colors">Testimonios</a>
              <a href="#faq" className="hover:text-gray-300 transition-colors">FAQ</a>
              <Link href="/login" className="hover:text-gray-300 transition-colors">Iniciar sesión</Link>
            </div>
            <span className="text-xs text-gray-600">© 2025 AutonomaCampus AI. Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
