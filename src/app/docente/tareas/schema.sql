-- Tabla de tareas
CREATE TABLE tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Tabla de entregas
CREATE TABLE submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  grade numeric(4,1),
  feedback text,
  UNIQUE(task_id, student_id)
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Docentes ven/crean tareas de sus cursos
CREATE POLICY "docente gestiona sus tareas"
ON tasks
USING (EXISTS (SELECT 1 FROM courses WHERE id = course_id AND teacher_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM courses WHERE id = course_id AND teacher_id = auth.uid()));

-- Estudiantes ven tareas de cursos en los que están inscritos
CREATE POLICY "estudiante ve tareas de sus cursos"
ON tasks FOR SELECT
USING (EXISTS (SELECT 1 FROM enrollments WHERE course_id = tasks.course_id AND user_id = auth.uid()));

-- Estudiantes gestionan sus propias entregas
CREATE POLICY "estudiante gestiona sus entregas"
ON submissions
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- Docentes ven entregas de sus cursos (para calificar)
CREATE POLICY "docente ve entregas de sus cursos"
ON submissions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM tasks t
  JOIN courses c ON c.id = t.course_id
  WHERE t.id = task_id AND c.teacher_id = auth.uid()
));

-- Docentes pueden actualizar calificación y feedback
CREATE POLICY "docente califica entregas"
ON submissions FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM tasks t
  JOIN courses c ON c.id = t.course_id
  WHERE t.id = task_id AND c.teacher_id = auth.uid()
));
