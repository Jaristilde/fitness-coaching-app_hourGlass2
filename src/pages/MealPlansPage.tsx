import { useState, useEffect } from 'react';
import { Calendar, UtensilsCrossed, ChevronRight } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';
import MacroCalculator from '../components/MacroCalculator';
import NutritionTips from '../components/NutritionTips';

interface MealPlansPageProps {
  supabase: SupabaseClient;
  userId: string;
}

interface MealPlan {
  id: string;
  diet_type: string;
  day_of_week: number;
  breakfast: string;
  lunch: string;
  dinner: string;
}

export default function MealPlansPage({ supabase, userId }: MealPlansPageProps) {
  const [activeTab, setActiveTab] = useState<'plans' | 'calculator' | 'tips'>('plans');
  const [selectedDiet, setSelectedDiet] = useState<string>('Omnivore');
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const dietTypes = [
    { value: 'Omnivore', label: 'Option A: Omnivore', icon: '🍖' },
    { value: 'Pescatarian', label: 'Option B: Pescatarian', icon: '🐟' },
    { value: 'Vegan', label: 'Option C: Vegan', icon: '🌱' },
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    loadMealPlans();
  }, [selectedDiet]);

  const loadMealPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('diet_type', selectedDiet)
        .order('day_of_week');

      if (!error && data) {
        setMealPlans(data);
      }
    } catch (error) {
      console.error('Error loading meal plans:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-teal-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-teal-400 rounded-xl flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">Meal Plans</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Personalized nutrition to fuel your fitness journey
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 inline-flex gap-2">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'plans'
                ? 'bg-gradient-to-r from-pink-500 to-teal-400 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Weekly Plans
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'calculator'
                ? 'bg-gradient-to-r from-pink-500 to-teal-400 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Macro Calculator
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'tips'
                ? 'bg-gradient-to-r from-pink-500 to-teal-400 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Nutrition Tips
          </button>
        </div>

        {activeTab === 'plans' && (
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-pink-500" />
                Weekly Meal Plans
              </h2>
              <p className="text-gray-600 mb-6">Select your diet type:</p>
              <div className="flex gap-4">
                {dietTypes.map((diet) => (
                  <button
                    key={diet.value}
                    onClick={() => setSelectedDiet(diet.value)}
                    className={`flex-1 p-6 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 ${
                      selectedDiet === diet.value
                        ? 'bg-gradient-to-br from-pink-500 to-teal-400 text-white shadow-xl scale-105'
                        : 'bg-gradient-to-br from-gray-100 to-gray-50 text-gray-700 hover:shadow-md border-2 border-gray-200'
                    }`}
                  >
                    <div className="text-center">
                      <p className="text-4xl mb-2">{diet.icon}</p>
                      <p className="font-bold">{diet.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="animate-pulse bg-white rounded-2xl h-96"></div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-pink-500 to-teal-400 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left font-bold text-lg">Day</th>
                        <th className="px-6 py-4 text-left font-bold text-lg">Breakfast</th>
                        <th className="px-6 py-4 text-left font-bold text-lg">Lunch</th>
                        <th className="px-6 py-4 text-left font-bold text-lg">Dinner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mealPlans.map((plan, index) => (
                        <tr
                          key={plan.id}
                          className={`border-b border-gray-200 hover:bg-pink-50 transition-colors ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-teal-400 rounded-xl flex items-center justify-center text-white font-bold">
                                {plan.day_of_week}
                              </div>
                              <span className="font-bold text-gray-800">
                                {daysOfWeek[plan.day_of_week]}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-gray-700">{plan.breakfast}</td>
                          <td className="px-6 py-5 text-gray-700">{plan.lunch}</td>
                          <td className="px-6 py-5 text-gray-700">{plan.dinner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 border-t-2 border-blue-200">
                  <button
                    onClick={() => setActiveTab('tips')}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    <span>View Nutrition Tips</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'calculator' && <MacroCalculator supabase={supabase} userId={userId} />}

        {activeTab === 'tips' && <NutritionTips />}
      </div>
    </div>
  );
}
