/*
  # Meal Plans and Nutrition Tracking

  1. New Tables
    - `user_nutrition_profile`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `weight_lbs` (integer) - Current weight in pounds
      - `height_inches` (integer) - Height in inches
      - `age` (integer) - Age in years
      - `activity_level` (text) - Sedentary, Light, Moderate, Very Active, Extra Active
      - `goal` (text) - Lose Fat, Maintain, Gain Muscle
      - `calories` (integer) - Daily calorie target
      - `protein_g` (integer) - Daily protein target in grams
      - `carbs_g` (integer) - Daily carbs target in grams
      - `fat_g` (integer) - Daily fat target in grams
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `meal_plans`
      - `id` (uuid, primary key)
      - `diet_type` (text) - Omnivore, Pescatarian, Vegan
      - `day_of_week` (integer) - 0-6 for Monday-Sunday
      - `breakfast` (text)
      - `lunch` (text)
      - `dinner` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their own nutrition profile
    - Allow all authenticated users to view meal plans
*/

-- User Nutrition Profile Table
CREATE TABLE IF NOT EXISTS user_nutrition_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  weight_lbs integer DEFAULT 150,
  height_inches integer DEFAULT 65,
  age integer DEFAULT 25,
  activity_level text DEFAULT 'Sedentary',
  goal text DEFAULT 'Lose Fat',
  calories integer DEFAULT 1500,
  protein_g integer DEFAULT 120,
  carbs_g integer DEFAULT 145,
  fat_g integer DEFAULT 39,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_nutrition_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own nutrition profile"
  ON user_nutrition_profile
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition profile"
  ON user_nutrition_profile
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition profile"
  ON user_nutrition_profile
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Meal Plans Table
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diet_type text NOT NULL,
  day_of_week integer NOT NULL,
  breakfast text NOT NULL,
  lunch text NOT NULL,
  dinner text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(diet_type, day_of_week)
);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view meal plans"
  ON meal_plans
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert Omnivore Meal Plans
INSERT INTO meal_plans (diet_type, day_of_week, breakfast, lunch, dinner) VALUES
  ('Omnivore', 0, 'Greek yogurt + berries + oats', 'Chicken, rice & broccoli', 'Salmon, sweet potato, asparagus'),
  ('Omnivore', 1, 'Omelet + toast + fruit', 'Turkey wrap + mixed greens', 'Beef stir-fry + jasmine rice'),
  ('Omnivore', 2, 'Protein smoothie + banana + PB', 'Chicken fajita bowl', 'Shrimp tacos + slaw'),
  ('Omnivore', 3, 'Overnight oats + chia + berries', 'Sushi bowl (salmon, rice, edamame)', 'Lean beef chili + quinoa'),
  ('Omnivore', 4, 'Eggs + avocado toast', 'Grilled chicken Caesar', 'Baked cod + potatoes + green beans'),
  ('Omnivore', 5, 'Protein pancakes + fruit', 'Turkey burger + salad', 'Steak + rice + vegetables'),
  ('Omnivore', 6, 'Cottage cheese + pineapple + granola', 'Chicken pesto pasta + veggies', 'Roast chicken + couscous + salad')
ON CONFLICT (diet_type, day_of_week) DO NOTHING;

-- Insert Pescatarian Meal Plans
INSERT INTO meal_plans (diet_type, day_of_week, breakfast, lunch, dinner) VALUES
  ('Pescatarian', 0, 'Greek yogurt + berries + oats', 'Tuna salad wrap + greens', 'Salmon, sweet potato, asparagus'),
  ('Pescatarian', 1, 'Tofu scramble + toast', 'Shrimp quinoa bowl', 'Baked cod + potatoes + broccoli'),
  ('Pescatarian', 2, 'Protein smoothie + banana', 'Sushi bowl', 'Garlic shrimp pasta + salad'),
  ('Pescatarian', 3, 'Overnight oats + chia', 'Miso salmon + rice + bok choy', 'Veggie chili + avocado toast'),
  ('Pescatarian', 4, 'Eggs + avocado toast', 'Mediterranean tuna pasta', 'Seared tuna + rice + edamame'),
  ('Pescatarian', 5, 'Protein pancakes + fruit', 'Grilled shrimp tacos + slaw', 'Baked halibut + quinoa + veg'),
  ('Pescatarian', 6, 'Cottage cheese + fruit', 'Smoked salmon bagel', 'Shrimp stir-fry + brown rice')
ON CONFLICT (diet_type, day_of_week) DO NOTHING;

-- Insert Vegan Meal Plans
INSERT INTO meal_plans (diet_type, day_of_week, breakfast, lunch, dinner) VALUES
  ('Vegan', 0, 'Tofu scramble + toast + fruit', 'Lentil quinoa bowl + veggies', 'Tempeh stir-fry + rice'),
  ('Vegan', 1, 'Overnight oats + chia + berries', 'Chickpea wrap + greens', 'Black bean pasta + broccoli'),
  ('Vegan', 2, 'Pea-protein smoothie + banana + PB', 'Buddha bowl', 'Lentil curry + basmati rice'),
  ('Vegan', 3, 'Buckwheat pancakes + fruit', 'Hummus + falafel bowl', 'Tofu poke bowl'),
  ('Vegan', 4, 'Tofu scramble burrito', 'Pea-protein pasta + marinara', 'Tempeh fajitas + tortillas'),
  ('Vegan', 5, 'Oatmeal + seeds + berries', 'Chickpea quinoa bowl', 'Tofu steak + potatoes + veg'),
  ('Vegan', 6, 'Soy yogurt + granola + fruit', 'Vegan sushi + edamame', 'Lentil bolognese + pasta')
ON CONFLICT (diet_type, day_of_week) DO NOTHING;