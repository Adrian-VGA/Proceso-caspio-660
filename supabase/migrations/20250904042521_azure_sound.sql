/*
  # Create user profiles table

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `username` (text, unique) - Número de proyecto del usuario
      - `project_number` (text) - Número de proyecto para mostrar
      - `survey_data` (jsonb) - Datos de encuestas por grupo etario
      - `goals` (jsonb) - Metas configuradas por grupo etario
      - `participant_data` (jsonb) - Datos de participantes registrados
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policy for users to manage their own data
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  project_number text NOT NULL,
  survey_data jsonb DEFAULT '{"G6-8": 0, "G9-11": 0, "G12-14": 0, "G15-18": 0, "G19+": 0, "STAFF": 0}'::jsonb,
  goals jsonb DEFAULT '{"G6-8": 30, "G9-11": 46, "G12-14": 41, "G15-18": 46, "G19+": 44, "STAFF": 14}'::jsonb,
  participant_data jsonb DEFAULT '{"G6-8": [], "G9-11": [], "G12-14": [], "G15-18": [], "G19+": [], "STAFF": []}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (username = current_setting('app.current_user', true));

CREATE POLICY "Allow anonymous access for demo"
  ON user_profiles
  FOR ALL
  TO anon
  USING (true);