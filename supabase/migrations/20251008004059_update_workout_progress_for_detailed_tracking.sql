/*
  # Update workout progress table for detailed tracking

  1. Changes
    - Add `exercise_details` column to store completed sets and reps for each exercise
    - This column will store a JSONB array with objects containing:
      - exercise_id: string
      - completed_sets: array of objects with {reps: number, weight?: number}
      - notes: optional string for user notes per exercise

  2. Migration Notes
    - Uses IF NOT EXISTS to safely add the column
    - Sets a default empty array for existing records
    - This allows tracking detailed performance data per exercise
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workout_progress' AND column_name = 'exercise_details'
  ) THEN
    ALTER TABLE workout_progress ADD COLUMN exercise_details jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

COMMENT ON COLUMN workout_progress.exercise_details IS 'Stores detailed completion data for each exercise including sets, reps, and weight used';
