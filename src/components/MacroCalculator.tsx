import { useState, useEffect } from 'react';
import { Calculator, TrendingDown, Minus, Plus } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';

interface MacroCalculatorProps {
  supabase: SupabaseClient;
  userId: string;
}

interface NutritionProfile {
  weight_lbs: number;
  height_inches: number;
  age: number;
  activity_level: string;
  goal: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export default function MacroCalculator({ supabase, userId }: MacroCalculatorProps) {
  const [profile, setProfile] = useState<NutritionProfile>({
    weight_lbs: 150,
    height_inches: 67,
    age: 25,
    activity_level: 'Sedentary',
    goal: 'Lose Fat',
    calories: 1500,
    protein_g: 120,
    carbs_g: 145,
    fat_g: 39,
  });
  const [loading, setLoading] = useState(true);
  
  // Separate state for feet and inches display
  const [heightFeet, setHeightFeet] = useState(Math.floor(profile.height_inches / 12));
  const [heightInches, setHeightInches] = useState(profile.height_inches % 12);

  const activityLevels = [
    { value: 'Sedentary', multiplier: 1.2, label: 'Sedentary (little/no exercise)' },
    { value: 'Light', multiplier: 1.375, label: 'Light (1-3 days/week)' },
    { value: 'Moderate', multiplier: 1.55, label: 'Moderate (3-5 days/week)' },
    { value: 'Very Active', multiplier: 1.725, label: 'Very Active (6-7 days/week)' },
    { value: 'Extra Active', multiplier: 1.9, label: 'Extra Active (athlete)' },
  ];

  const goals = [
    { value: 'Lose Fat', calorieAdjust: -500 },
    { value: 'Maintain', calorieAdjust: 0 },
    { value: 'Gain Muscle', calorieAdjust: 300 },
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  // Update feet/inches when profile changes
  useEffect(() => {
    setHeightFeet(Math.floor(profile.height_inches / 12));
    setHeightInches(profile.height_inches % 12);
  }, [profile.height_inches]);

  const loadProfile = async () => {
    try {
      const { data } = await supabase
        .from('user_nutrition_profile')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateHeight = (feet: number, inches: number) => {
    const totalInches = feet * 12 + inches;
    setProfile({ ...profile, height_inches: totalInches });
  };

  const handleFeetChange = (feet: number) => {
    const newFeet = Math.max(0, Math.min(8, feet)); // Limit 0-8 feet
    setHeightFeet(newFeet);
    updateHeight(newFeet, heightInches);
  };

  const handleInchesChange = (inches: number) => {
    const newInches = Math.max(0, Math.min(11, inches)); // Limit 0-11 inches
    setHeightInches(newInches);
    updateHeight(heightFeet, newInches);
  };

  const calculateMacros = () => {
    const activityLevel = activityLevels.find((a) => a.value === profile.activity_level);
    const goal = goals.find((g) => g.value === profile.goal);

    const bmr = 10 * (profile.weight_lbs * 0.453592) + 6.25 * (profile.height_inches * 2.54) - 5 * profile.age + 5;
    const tdee = bmr * (activityLevel?.multiplier || 1.2);
    const targetCalories = Math.round(tdee + (goal?.calorieAdjust || 0));

    const proteinG = Math.round(profile.weight_lbs * 1);
    const fatG = Math.round((targetCalories * 0.25) / 9);
    const carbsG = Math.round((targetCalories - proteinG * 4 - fatG * 9) / 4);

    return {
      calories: targetCalories,
      protein_g: proteinG,
      carbs_g: carbsG,
      fat_g: fatG,
    };
  };

  const handleCalculate = async () => {
    const macros = calculateMacros();
    const updatedProfile = { ...profile, ...macros };
    setProfile(updatedProfile);

    try {
      await supabase.from('user_nutrition_profile').upsert({
        user_id: userId,
        ...updatedProfile,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const adjustValue = (field: keyof NutritionProfile, delta: number) => {
    setProfile({ ...profile, [field]: Math.max(0, (profile[field] as number) + delta) });
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 rounded-2xl h-96"></div>;
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-teal-400 rounded-xl flex items-center justify-center">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Macro Calculator</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Your Stats</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Weight (lbs)
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustValue('weight_lbs', -1)}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
                <input
                  type="number"
                  value={profile.weight_lbs}
                  onChange={(e) => setProfile({ ...profile, weight_lbs: parseInt(e.target.value) || 0 })}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-center text-lg font-bold focus:outline-none focus:border-pink-400"
                />
                <button
                  onClick={() => adjustValue('weight_lbs', 1)}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Height
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="number"
                    value={heightFeet}
                    onChange={(e) => handleFeetChange(parseInt(e.target.value) || 0)}
                    min="0"
                    max="8"
                    className="w-20 px-3 py-3 border-2 border-gray-300 rounded-xl text-center text-lg font-bold focus:outline-none focus:border-pink-400"
                    placeholder="5"
                  />
                  <span className="text-lg font-semibold text-gray-600">ft</span>
                  <input
                    type="number"
                    value={heightInches}
                    onChange={(e) => handleInchesChange(parseInt(e.target.value) || 0)}
                    min="0"
                    max="11"
                    className="w-20 px-3 py-3 border-2 border-gray-300 rounded-xl text-center text-lg font-bold focus:outline-none focus:border-pink-400"
                    placeholder="7"
                  />
                  <span className="text-lg font-semibold text-gray-600">in</span>
                </div>
                <span className="text-sm text-gray-500">
                  ({profile.height_inches}")
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustValue('age', -1)}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-center text-lg font-bold focus:outline-none focus:border-pink-400"
                />
                <button
                  onClick={() => adjustValue('age', 1)}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Activity Level
              </label>
              <select
                value={profile.activity_level}
                onChange={(e) => setProfile({ ...profile, activity_level: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-pink-400 font-medium"
              >
                {activityLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full mt-6 bg-gradient-to-r from-pink-500 to-teal-400 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Calculate My Macros
          </button>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Your Goals</h3>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Goal</label>
            <select
              value={profile.goal}
              onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-pink-400 font-medium"
            >
              {goals.map((goal) => (
                <option key={goal.value} value={goal.value}>
                  {goal.value}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-teal-50 rounded-2xl p-6 border-2 border-pink-200">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-pink-500" />
              Your Daily Targets
            </h4>
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1 font-semibold">Calories</p>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-teal-400">
                  {profile.calories} kcal
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1 font-semibold">Protein</p>
                  <p className="text-xl font-bold text-pink-600">{profile.protein_g}g</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1 font-semibold">Carbs</p>
                  <p className="text-xl font-bold text-teal-600">{profile.carbs_g}g</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1 font-semibold">Fat</p>
                  <p className="text-xl font-bold text-yellow-600">{profile.fat_g}g</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
