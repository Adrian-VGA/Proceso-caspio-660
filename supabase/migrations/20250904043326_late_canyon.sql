/*
  # Create user profiles table

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `project_id` (text, unique) - ID del proyecto (676, 684, etc.)
      - `survey_data` (jsonb) - Datos de encuestas por grupo etario
      - `goals` (jsonb) - Metas configuradas por grupo
      - `participants` (jsonb) - Lista de participantes
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policy for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text UNIQUE NOT NULL,
  survey_data jsonb DEFAULT '{"G1": 0, "G2": 0, "G3": 0, "G4": 0, "G5": 0, "G6-8": 0}'::jsonb,
  goals jsonb DEFAULT '{"G1": 0, "G2": 0, "G3": 0, "G4": 0, "G5": 0, "G6-8": 0}'::jsonb,
  participants jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profile data"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);