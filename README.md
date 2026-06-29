# AutonomaCampus AI

Plataforma de gestión académica universitaria con inteligencia artificial integrada, construida con Next.js 16, Supabase y Gemini AI.

## Demo

🔗 [autonoma-campus-ia.vercel.app](https://autonoma-campus-ia.vercel.app)

## Características

### Panel Estudiante
- Inscripción a cursos disponibles
- Entrega de tareas (texto y archivos)
- Visualización de calificaciones y retroalimentación
- Chat con IA (AcademIA) con historial de sesiones
- Perfil con foto de perfil editable

### Panel Docente
- Creación y gestión de cursos
- Asignación y revisión de tareas
- Calificación con retroalimentación por estudiante
- Estadísticas de cursos e inscripciones
- Generador de contenido con IA (DocenIA)

### Panel Administrador
- Gestión de usuarios y roles (estudiante / docente / admin)
- Publicación y despublicación de cursos
- Anuncios globales con popup a todos los usuarios
- Estadísticas globales de la plataforma

### General
- Autenticación con correo y Google OAuth (Supabase Auth)
- Notificaciones en tiempo real (campana y megáfono)
- Diseño responsive con Tailwind CSS

## Stack Tecnológico

- **Framework:** Next.js 16 (App Router)
- **Base de datos y auth:** Supabase (PostgreSQL + RLS + Storage)
- **IA:** Google Gemini API (gemini-2.5-flash)
- **Estilos:** Tailwind CSS v4
- **Lenguaje:** TypeScript

