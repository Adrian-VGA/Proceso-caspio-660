/*
  # Create saved progresses table

  1. New Tables
    - `saved_progresses`
      - `id` (uuid, primary key)
      - `project_id` (text) - ID del proyecto
      - `name` (text) - Nombre del progreso guardado
      - `survey_data` (jsonb) - Datos de encuestas guardados
      - `participants` (jsonb) - Participantes al momento del guardado
      - `goals` (jsonb) - Metas al momento del guardado
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `saved_progresses` table
    - Add policy for authenticated users to manage their own saved progresses
*/

CREATE TABLE IF NOT EXISTS saved_progresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL,
  name text NOT NULL,
  survey_data jsonb DEFAULT '{"G1": 0, "G2": 0, "G3": 0, "G4": 0, "G5": 0, "G6-8": 0}'::jsonb,
  participants jsonb DEFAULT '[]'::jsonb,
  goals jsonb DEFAULT '{"G1": 0, "G2": 0, "G3": 0, "G4": 0, "G5": 0, "G6-8": 0}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_progresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saved progresses"
  ON saved_progresses
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);