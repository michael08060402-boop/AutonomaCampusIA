-- Sesiones de chat
CREATE TABLE chat_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT 'Nueva conversación',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Mensajes de cada sesión
CREATE TABLE chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Row Level Security
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own sessions" ON chat_sessions
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own messages" ON chat_messages
  USING (EXISTS (SELECT 1 FROM chat_sessions WHERE id = session_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM chat_sessions WHERE id = session_id AND user_id = auth.uid()));
