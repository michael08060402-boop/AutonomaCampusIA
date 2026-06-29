import { MessageCircle, Mail, ChevronDown, BookOpen, GraduationCap, Brain, Settings } from "lucide-react";

const FAQS = [
  {
    q: "¿Cómo me inscribo en un curso?",
    a: "Ve a la sección 'Mis cursos', busca el curso que te interesa y haz clic en 'Inscribirme'. El docente debe haberlo publicado previamente.",
  },
  {
    q: "¿Cómo entrego una tarea?",
    a: "En la sección 'Tareas' encontrarás tus tareas pendientes. Haz clic en la tarea, escribe tu respuesta o adjunta el archivo y presiona 'Entregar'.",
  },
  {
    q: "¿Para qué sirve el Chat con IA?",
    a: "AcademIA es tu asistente educativo disponible 24/7. Puedes preguntarle sobre conceptos académicos, pedir explicaciones, o consultar dudas sobre la plataforma.",
  },
  {
    q: "¿Cómo cambio mi nombre o foto de perfil?",
    a: "Ve a 'Mi perfil' en el menú lateral. Ahí encontrarás un formulario para actualizar tu nombre. Para la foto, si iniciaste sesión con Google se sincroniza automáticamente.",
  },
  {
    q: "¿Qué hago si olvidé mi contraseña?",
    a: "En la pantalla de inicio de sesión, haz clic en '¿Olvidaste tu contraseña?' y recibirás un correo de recuperación. Si usas Google, inicia sesión directamente con tu cuenta.",
  },
  {
    q: "¿Puedo usar la plataforma desde el celular?",
    a: "Sí, AutonomaCampus AI es completamente responsiva y funciona en cualquier dispositivo: PC, tablet o celular desde el navegador.",
  },
];

const TOPICS = [
  { icon: BookOpen, label: "Cursos y materiales" },
  { icon: GraduationCap, label: "Tareas y entregas" },
  { icon: Brain, label: "Chat con IA" },
  { icon: Settings, label: "Cuenta y perfil" },
];

export default function SoportePage() {
  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Centro de soporte</h1>
        <p className="text-gray-500 mt-1 text-sm">Encuentra respuestas rápidas o contáctanos directamente.</p>
      </div>

      {/* Temas rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {TOPICS.map((t) => (
          <div key={t.label} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:border-orange-200 hover:bg-orange-50 transition-all cursor-default">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <t.icon className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-xs font-medium text-gray-700">{t.label}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Preguntas frecuentes</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {FAQS.map((faq, i) => (
            <details key={i} className="group px-6 py-4 cursor-pointer">
              <summary className="flex items-center justify-between gap-3 text-sm font-medium text-gray-800 list-none select-none">
                {faq.q}
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-3 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Contacto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="https://wa.me/51958173765?text=Hola%2C%20necesito%20ayuda%20con%20AutonomaCampus%20AI"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-5 hover:border-orange-200 hover:bg-orange-50 transition-all group"
        >
          <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
            <MessageCircle className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">WhatsApp</p>
            <p className="text-xs text-gray-500">Respuesta en minutos</p>
          </div>
        </a>

        <a
          href="mailto:soporte@autonomacampus.ai"
          className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-5 hover:border-orange-200 hover:bg-orange-50 transition-all group"
        >
          <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
            <Mail className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Correo electrónico</p>
            <p className="text-xs text-gray-500">soporte@autonomacampus.ai</p>
          </div>
        </a>
      </div>
    </div>
  );
}
