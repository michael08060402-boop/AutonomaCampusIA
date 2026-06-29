"use client";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Check, X, GraduationCap, Brain, Users } from "lucide-react";

export default function LoginPage() {
  const supabase = createClient();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordRules = [
    { label: "Mínimo 8 caracteres", valid: password.length >= 8 },
    { label: "Una mayúscula", valid: /[A-Z]/.test(password) },
    { label: "Un número", valid: /[0-9]/.test(password) },
    { label: "Un carácter especial (!@#$...)", valid: /[^A-Za-z0-9]/.test(password) },
  ];
  const passwordValid = passwordRules.every((r) => r.valid);

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError("Correo o contraseña incorrectos.");
      else window.location.href = "/dashboard";
    } else {
      if (!passwordValid) {
        setError("La contraseña no cumple los requisitos de seguridad.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) {
        setError(error.message.includes("already registered")
          ? "Este correo ya está registrado."
          : "Error al crear la cuenta.");
      } else if (data.user) {
        window.location.href = "/dashboard";
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex">

      {/* ── IZQUIERDA: imagen oscura + info ──────────────────── */}
      <div className="hidden md:flex w-[55%] relative flex-col justify-between p-12 overflow-hidden after:absolute after:right-0 after:top-0 after:h-full after:w-8 after:bg-gradient-to-r after:from-transparent after:to-gray-50/40 after:z-10">
        <Image
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=85"
          alt="Campus"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay oscuro con toque naranja abajo */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/70 to-primary/80" />

        {/* Logo arriba */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl flex items-center justify-center p-1.5">
            <Image src="/autonomalogo.png" alt="logo" width={32} height={32} className="rounded-lg" />
          </div>
          <span className="text-white font-bold text-xl drop-shadow-md">AutonomaCampus AI</span>
        </div>

        {/* Contenido central */}
        <div className="relative z-10">
          <h2 className="text-5xl font-bold text-white leading-tight mb-6">
            El campus virtual que aprende contigo
          </h2>
          <p className="text-white/75 text-lg leading-relaxed mb-12">
            Gestiona cursos, tareas y exámenes con el poder de la inteligencia artificial integrada.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {[
              { icon: GraduationCap, text: "Cursos y materiales en un solo lugar" },
              { icon: Brain, text: "Chat con IA disponible 24/7" },
              { icon: Users, text: "Roles para estudiantes, docentes y admins" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-orange-300" />
                </div>
                <span className="text-white/85 text-base">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quote abajo */}
        <div className="relative z-10 border-t border-white/20 pt-6">
          <p className="text-white/60 text-sm italic">
            "Diseñado para transformar la educación con tecnología de última generación."
          </p>
        </div>
      </div>

      {/* ── DERECHA: formulario ───────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 md:px-12 py-10 md:py-0 bg-gray-50 relative overflow-hidden"
        style={{
          backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      >


        <div className="relative w-full max-w-md animate-fade-up">

          {/* Logo mobile */}
          <div className="flex md:hidden items-center justify-center gap-2 mb-8">
            <Image src="/autonomalogo.png" alt="logo" width={36} height={36} className="rounded-lg" />
            <span className="font-bold text-gray-900">AutonomaCampus AI</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-orange-200 shadow-[0_0_80px_0px_rgba(249,115,22,0.6)] p-6 md:p-10">

            <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
              {mode === "login" ? "Bienvenido de nuevo 👋" : "Crea tu cuenta"}
            </h1>
            <p className="text-gray-400 text-base mb-7">
              {mode === "login" ? "Ingresa tus credenciales para continuar" : "Completa los datos para registrarte"}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1.5">Nombre completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1.5">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1.5">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "register" ? "Crea una contraseña segura" : "Tu contraseña"}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-11 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {mode === "register" && password.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    {passwordRules.map((rule) => (
                      <div key={rule.label} className="flex items-center gap-1.5">
                        {rule.valid
                          ? <Check className="w-3 h-3 text-green-500 shrink-0" />
                          : <X className="w-3 h-3 text-gray-300 shrink-0" />}
                        <span className={`text-xs ${rule.valid ? "text-green-600" : "text-gray-400"}`}>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3.5 rounded-xl text-base font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs font-medium text-gray-400 px-1">o continúa con</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google */}
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3.5 text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 active:scale-[0.97] transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continuar con Google
            </button>

            {/* Toggle */}
            <p className="text-center text-sm text-gray-400 mt-5">
              {mode === "login" ? (
                <>¿No tienes cuenta?{" "}
                  <button onClick={() => { setMode("register"); setError(""); }} className="text-primary font-semibold hover:underline">
                    Crear una cuenta nueva
                  </button>
                </>
              ) : (
                <>¿Ya tienes cuenta?{" "}
                  <button onClick={() => { setMode("login"); setError(""); }} className="text-primary font-semibold hover:underline">
                    Iniciar sesión
                  </button>
                </>
              )}
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary transition-colors">
              ← Volver al inicio
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
