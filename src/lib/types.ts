export type Role = "estudiante" | "docente" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: Role;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  cover_url?: string;
  teacher_id: string;
  created_at: string;
  teacher?: Profile;
  enrolled_count?: number;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  course?: Course;
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string;
  grade?: number;
  feedback?: string;
  submitted_at: string;
}

export interface CourseMaterial {
  id: string;
  course_id: string;
  name: string;
  file_url: string;
  file_type: string;
  uploaded_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
