import { Bell, Shield, Globe, Palette, ChevronRight } from "lucide-react";

const sections = [
  {
    icon: Globe,
    title: "General",
    items: [
      { label: "Nombre de la plataforma", value: "AutonomaCampus AI", editable: false },
      { label: "Idioma por defecto",       value: "Español (Perú)",    editable: false },
      { label: "Zona horaria",             value: "America/Lima (UTC-5)", editable: false },
    ],
  },
  {
    icon: Bell,
    title: "Notificaciones del sistema",
    items: [
      { label: "Notificaciones de nuevos usuarios", value: "Activado",  editable: false },
      { label: "Alertas de entregas",               value: "Activado",  editable: false },
      { label: "Resumen semanal",                   value: "Desactivado", editable: false },
    ],
  },
  {
    icon: Shield,
    title: "Seguridad",
    items: [
      { label: "Registro público de nuevos usuarios", value: "Permitido", editable: false },
      { label: "Verificación de correo",              value: "Requerida", editable: false },
      { label: "Sesiones simultáneas",                value: "Permitidas", editable: false },
    ],
  },
  {
    icon: Palette,
    title: "Apariencia",
    items: [
      { label: "Color principal", value: "Naranja (#F97316)", editable: false },
      { label: "Tema",            value: "Claro",             editable: false },
    ],
  },
];

export default function AdminConfiguracionPage() {
  return (
    <div className="w-full">

      {/* Banner */}
      <div className="relative bg-gradient-to-br from-orange-500 to-orange-700 px-8 py-8 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Configuración</h1>
          <p className="text-white/70 text-sm mt-1">Ajustes globales de la plataforma.</p>
        </div>
      </div>

      <div className="px-8 pb-8 pt-6 space-y-5 max-w-2xl">
        {sections.map((section) => (
          <div key={section.title} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
              <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center">
                <section.icon className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <h2 className="font-semibold text-gray-900 text-sm">{section.title}</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {section.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between px-6 py-3.5">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{item.value}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <p className="text-xs text-gray-400 text-center pt-2">
          La edición avanzada de configuración se gestiona desde el panel de Supabase.
        </p>
      </div>
    </div>
  );
}
