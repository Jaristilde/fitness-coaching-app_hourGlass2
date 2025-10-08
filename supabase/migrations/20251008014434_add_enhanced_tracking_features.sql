/*
  # Enhanced Workout Tracking Features

  1. New Tables
    - `exercise_videos`
      - `id` (uuid, primary key)
      - `exercise_name` (text) - Name of the exercise
      - `level` (text) - Level 1 or Level 2
      - `day` (text) - Day of the week
      - `video_url` (text) - URL to video tutorial
      - `created_at` (timestamptz)
    
    - `daily_tracking`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `date` (date)
      - `water_intake_oz` (integer) - Water intake in ounces
      - `took_supplements` (boolean)
      - `took_preworkout` (boolean)
      - `notes` (text)
      - `created_at` (timestamptz)
    
    - `smartwatch_data`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `date` (date)
      - `steps` (integer)
      - `calories_burned` (integer)
      - `active_minutes` (integer)
      - `heart_rate_avg` (integer)
      - `synced_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their own data
*/

-- Exercise Videos Table
CREATE TABLE IF NOT EXISTS exercise_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_name text NOT NULL,
  level text NOT NULL,
  day text NOT NULL,
  video_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exercise_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exercise videos"
  ON exercise_videos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert exercise videos"
  ON exercise_videos
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "Only admins can update exercise videos"
  ON exercise_videos
  FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Daily Tracking Table
CREATE TABLE IF NOT EXISTS daily_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  water_intake_oz integer DEFAULT 0,
  took_supplements boolean DEFAULT false,
  took_preworkout boolean DEFAULT false,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE daily_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily tracking"
  ON daily_tracking
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily tracking"
  ON daily_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily tracking"
  ON daily_tracking
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily tracking"
  ON daily_tracking
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Smartwatch Data Table
CREATE TABLE IF NOT EXISTS smartwatch_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  steps integer DEFAULT 0,
  calories_burned integer DEFAULT 0,
  active_minutes integer DEFAULT 0,
  heart_rate_avg integer DEFAULT 0,
  synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE smartwatch_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own smartwatch data"
  ON smartwatch_data
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own smartwatch data"
  ON smartwatch_data
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own smartwatch data"
  ON smartwatch_data
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own smartwatch data"
  ON smartwatch_data
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);