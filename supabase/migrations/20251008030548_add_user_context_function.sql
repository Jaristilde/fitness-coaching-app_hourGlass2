/*
  # Add User Context Function for AI Chat

  1. New Functions
    - `get_user_context` - Retrieves comprehensive user data for AI chat context
      - Returns nutrition profile (calories, macros, goals, activity level)
      - Returns recent workout progress (last 7 days)
      - Returns current meal plan information
      - Aggregates key metrics and stats
  
  2. Purpose
    - Provides AI chatbot with user-specific context
    - Enables personalized fitness and nutrition advice
    - Returns data in a structured format for AI processing
*/

CREATE OR REPLACE FUNCTION get_user_context(p_user_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_nutrition JSONB;
  v_workouts JSONB;
  v_meal_plan JSONB;
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'weight_lbs', weight_lbs,
    'height_inches', height_inches,
    'age', age,
    'activity_level', activity_level,
    'goal', goal,
    'calories', calories,
    'protein_g', protein_g,
    'carbs_g', carbs_g,
    'fat_g', fat_g
  ) INTO v_nutrition
  FROM nutrition_profiles
  WHERE user_id = p_user_id
  LIMIT 1;

  SELECT jsonb_agg(
    jsonb_build_object(
      'date', date,
      'workout_type', workout_type,
      'exercise_name', exercise_name,
      'sets_completed', sets_completed,
      'weight_lbs', weight_lbs,
      'reps', reps
    )
  ) INTO v_workouts
  FROM workout_progress
  WHERE user_id = p_user_id
    AND date >= CURRENT_DATE - INTERVAL '7 days'
  ORDER BY date DESC
  LIMIT 20;

  SELECT jsonb_build_object(
    'plan_type', plan_type,
    'daily_meals', daily_meals,
    'meal_frequency', meal_frequency
  ) INTO v_meal_plan
  FROM meal_plans
  WHERE user_id = p_user_id
  LIMIT 1;

  v_result := jsonb_build_object(
    'nutrition_profile', COALESCE(v_nutrition, '{}'::jsonb),
    'recent_workouts', COALESCE(v_workouts, '[]'::jsonb),
    'meal_plan', COALESCE(v_meal_plan, '{}'::jsonb)
  );

  RETURN v_result;
END;
$$;