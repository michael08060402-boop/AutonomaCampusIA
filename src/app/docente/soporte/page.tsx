import { MessageCircle, Mail, ChevronDown, BookOpen, Users, Brain, Settings } from "lucide-react";

const FAQS = [
  {
    q: "¿Cómo creo y publico un curso?",
    a: "Ve a 'Mis cursos' y haz clic en 'Nuevo curso'. Completa el título, descripción y portada, luego activa el estado 'Publicado' para que los estudiantes puedan verlo.",
  },
  {
    q: "¿Cómo asigno estudiantes a mi curso?",
    a: "Una vez que el curso esté publicado, los estudiantes podrán inscribirse desde su panel. También puedes compartir el enlace del curso directamente con ellos.",
  },
  {
    q: "¿Para qué sirve el Generador IA?",
    a: "El Generador IA te ayuda a crear exámenes, rúbricas, materiales de estudio y actividades de aprendizaje usando inteligencia artificial. Ahorra tiempo en la preparación de contenido.",
  },
  {
    q: "¿Cómo califico las tareas de mis estudiantes?",
    a: "En la sección 'Tareas' encontrarás todas las entregas de tus estudiantes. Haz clic en cada entrega para revisarla y asignarle una calificación y comentario.",
  },
  {
    q: "¿Puedo editar un curso después de publicarlo?",
    a: "Sí, puedes editar el título, descripción y portada en cualquier momento. También puedes cambiar el estado de publicado a borrador si necesitas pausar el curso.",
  },
  {
    q: "¿Cómo veo las estadísticas de mis cursos?",
    a: "Ve a la sección 'Estadísticas' en el menú lateral. Ahí encontrarás datos sobre inscripciones, entregas de tareas y progreso de tus estudiantes.",
  },
];

const TOPICS = [
  { icon: BookOpen, label: "Cursos y materiales" },
  { icon: Users, label: "Gestión de estudiantes" },
  { icon: Brain, label: "Generador IA" },
  { icon: Settings, label: "Cuenta y perfil" },
];

export default function SoporteDocentePage() {
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
