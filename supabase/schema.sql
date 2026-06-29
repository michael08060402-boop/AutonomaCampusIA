-- ============================================================
-- EduCampus AI — Schema completo
-- Pegar en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ─── EXTENSIONES ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── ENUM ────────────────────────────────────────────────────
create type user_role as enum ('estudiante', 'docente', 'admin');

-- ─── TABLA: profiles ─────────────────────────────────────────
-- Se sincroniza con auth.users automáticamente vía trigger
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  avatar_url  text,
  role        user_role not null default 'estudiante',
  created_at  timestamptz not null default now()
);

-- ─── TABLA: courses ──────────────────────────────────────────
create table public.courses (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  description  text not null default '',
  cover_url    text,
  teacher_id   uuid not null references public.profiles(id) on delete cascade,
  is_published boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ─── TABLA: enrollments ──────────────────────────────────────
create table public.enrollments (
  id          uuid primary key default uuid_generate_v4(),
  student_id  uuid not null references public.profiles(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (student_id, course_id)
);

-- ─── TABLA: course_materials ─────────────────────────────────
create table public.course_materials (
  id          uuid primary key default uuid_generate_v4(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  name        text not null,
  file_url    text not null,
  file_type   text not null default 'pdf',
  uploaded_at timestamptz not null default now()
);

-- ─── TABLA: assignments ──────────────────────────────────────
create table public.assignments (
  id          uuid primary key default uuid_generate_v4(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  title       text not null,
  description text not null default '',
  due_date    timestamptz not null,
  created_at  timestamptz not null default now()
);

-- ─── TABLA: submissions ──────────────────────────────────────
create table public.submissions (
  id            uuid primary key default uuid_generate_v4(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id    uuid not null references public.profiles(id) on delete cascade,
  content       text not null default '',
  file_url      text,
  grade         numeric(5, 2),
  feedback      text,
  submitted_at  timestamptz not null default now(),
  unique (assignment_id, student_id)
);

-- ─── ÍNDICES ─────────────────────────────────────────────────
create index idx_courses_teacher    on public.courses(teacher_id);
create index idx_enrollments_student on public.enrollments(student_id);
create index idx_enrollments_course  on public.enrollments(course_id);
create index idx_materials_course    on public.course_materials(course_id);
create index idx_assignments_course  on public.assignments(course_id);
create index idx_submissions_assign  on public.submissions(assignment_id);
create index idx_submissions_student on public.submissions(student_id);

-- ============================================================
-- TRIGGER: crea perfil automáticamente al hacer login con Google
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles         enable row level security;
alter table public.courses          enable row level security;
alter table public.enrollments      enable row level security;
alter table public.course_materials enable row level security;
alter table public.assignments      enable row level security;
alter table public.submissions      enable row level security;

-- ─── POLICIES: profiles ──────────────────────────────────────
-- Cualquier usuario autenticado puede ver perfiles
create policy "profiles: ver todos"
  on public.profiles for select
  to authenticated
  using (true);

-- Solo puedes actualizar tu propio perfil
create policy "profiles: editar propio"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- ─── POLICIES: courses ───────────────────────────────────────
-- Estudiantes ven cursos publicados; docentes ven los suyos; admin ve todos
create policy "courses: ver publicados o propios"
  on public.courses for select
  to authenticated
  using (
    is_published = true
    or teacher_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Solo docentes y admins pueden crear cursos
create policy "courses: crear"
  on public.courses for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('docente', 'admin')
    )
  );

-- Solo el docente dueño o admin puede actualizar
create policy "courses: editar propios"
  on public.courses for update
  to authenticated
  using (
    teacher_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Solo el docente dueño o admin puede borrar
create policy "courses: borrar propios"
  on public.courses for delete
  to authenticated
  using (
    teacher_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ─── POLICIES: enrollments ───────────────────────────────────
create policy "enrollments: ver los propios o ser docente/admin"
  on public.enrollments for select
  to authenticated
  using (
    student_id = auth.uid()
    or exists (
      select 1 from public.courses c
      where c.id = course_id and c.teacher_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "enrollments: inscribirse"
  on public.enrollments for insert
  to authenticated
  with check (student_id = auth.uid());

create policy "enrollments: desinscribirse"
  on public.enrollments for delete
  to authenticated
  using (student_id = auth.uid());

-- ─── POLICIES: course_materials ──────────────────────────────
create policy "materials: ver si inscrito o docente/admin"
  on public.course_materials for select
  to authenticated
  using (
    exists (
      select 1 from public.enrollments e
      where e.course_id = course_id and e.student_id = auth.uid()
    )
    or exists (
      select 1 from public.courses c
      where c.id = course_id and c.teacher_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "materials: subir si docente del curso"
  on public.course_materials for insert
  to authenticated
  with check (
    exists (
      select 1 from public.courses c
      where c.id = course_id and c.teacher_id = auth.uid()
    )
  );

create policy "materials: borrar si docente del curso"
  on public.course_materials for delete
  to authenticated
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_id and c.teacher_id = auth.uid()
    )
  );

-- ─── POLICIES: assignments ───────────────────────────────────
create policy "assignments: ver si inscrito o docente/admin"
  on public.assignments for select
  to authenticated
  using (
    exists (
      select 1 from public.enrollments e
      where e.course_id = course_id and e.student_id = auth.uid()
    )
    or exists (
      select 1 from public.courses c
      where c.id = course_id and c.teacher_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "assignments: crear si docente del curso"
  on public.assignments for insert
  to authenticated
  with check (
    exists (
      select 1 from public.courses c
      where c.id = course_id and c.teacher_id = auth.uid()
    )
  );

create policy "assignments: editar si docente del curso"
  on public.assignments for update
  to authenticated
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_id and c.teacher_id = auth.uid()
    )
  );

create policy "assignments: borrar si docente del curso"
  on public.assignments for delete
  to authenticated
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_id and c.teacher_id = auth.uid()
    )
  );

-- ─── POLICIES: submissions ───────────────────────────────────
create policy "submissions: ver propias o docente/admin"
  on public.submissions for select
  to authenticated
  using (
    student_id = auth.uid()
    or exists (
      select 1 from public.assignments a
      join public.courses c on c.id = a.course_id
      where a.id = assignment_id and c.teacher_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "submissions: entregar"
  on public.submissions for insert
  to authenticated
  with check (student_id = auth.uid());

create policy "submissions: editar propia"
  on public.submissions for update
  to authenticated
  using (student_id = auth.uid());

-- Docente puede actualizar para poner nota y feedback
create policy "submissions: calificar si docente"
  on public.submissions for update
  to authenticated
  using (
    exists (
      select 1 from public.assignments a
      join public.courses c on c.id = a.course_id
      where a.id = assignment_id and c.teacher_id = auth.uid()
    )
  );

-- ─── TABLA: chat_sessions ────────────────────────────────────
create table public.chat_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  title      text not null default 'Nueva conversación',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── TABLA: chat_messages ────────────────────────────────────
create table public.chat_messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);

alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

create policy "chat_sessions: own" on public.chat_sessions
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "chat_messages: own" on public.chat_messages
  using (exists (select 1 from public.chat_sessions where id = session_id and user_id = auth.uid()))
  with check (exists (select 1 from public.chat_sessions where id = session_id and user_id = auth.uid()));

-- ============================================================
-- STORAGE: bucket para materiales del curso
-- ============================================================
insert into storage.buckets (id, name, public)
values ('course-materials', 'course-materials', false)
on conflict do nothing;

create policy "storage: subir materiales si docente"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'course-materials'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('docente', 'admin')
    )
  );

create policy "storage: ver materiales si inscrito"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'course-materials');
