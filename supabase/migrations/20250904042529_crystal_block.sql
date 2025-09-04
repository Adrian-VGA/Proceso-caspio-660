/*
  # Create saved progresses table

  1. New Tables
    - `saved_progresses`
      - `id` (uuid, primary key)
      - `user_id` (text) - Referencia al username del usuario
      - `name` (text) - Nombre del progreso guardado
      - `survey_data` (jsonb) - Estado de encuestas al momento del guardado
      - `participant_data` (jsonb) - Participantes registrados al momento del guardado
      - `goals` (jsonb) - Metas configuradas al momento del guardado
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `saved_progresses` table
    - Add policy for users to manage their own saved progresses
*/

CREATE TABLE IF NOT EXISTS saved_progresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  name text NOT NULL,
  survey_data jsonb NOT NULL,
  participant_data jsonb NOT NULL,
  goals jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_progresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saved progresses"
  ON saved_progresses
  FOR ALL
  TO authenticated
  USING (user_id = current_setting('app.current_user', true));

CREATE POLICY "Allow anonymous access for demo"
  ON saved_progresses
  FOR ALL
  TO anon
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_saved_progresses_user_id ON saved_progresses(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_progresses_created_at ON saved_progresses(created_at DESC);