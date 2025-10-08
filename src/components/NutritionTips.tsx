import { Apple, Coffee, Pill, Droplets } from 'lucide-react';

export default function NutritionTips() {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-400 rounded-xl flex items-center justify-center">
          <Apple className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Nutrition Tips for Success</h2>
      </div>

      <div className="space-y-8">
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Pre-Workout (30-60 min before)</h3>
          </div>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold mt-1">•</span>
              <span>Banana + peanut butter</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold mt-1">•</span>
              <span>Rice cakes + honey</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold mt-1">•</span>
              <span>Oatmeal + berries</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold mt-1">•</span>
              <span>Coffee or green tea</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <Apple className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Post-Workout (within 2 hours)</h3>
          </div>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold mt-1">•</span>
              <span>Protein shake + fruit</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold mt-1">•</span>
              <span>Greek yogurt + granola</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold mt-1">•</span>
              <span>Chicken + rice</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold mt-1">•</span>
              <span>Tuna sandwich</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Supplements to Consider</h3>
          </div>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold mt-1">•</span>
              <div>
                <span className="font-bold">Creatine:</span> 5g daily for strength and muscle
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold mt-1">•</span>
              <div>
                <span className="font-bold">Protein Powder:</span> Convenient protein source
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold mt-1">•</span>
              <div>
                <span className="font-bold">Multivitamin:</span> Cover nutritional gaps
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold mt-1">•</span>
              <div>
                <span className="font-bold">Omega-3:</span> Anti-inflammatory benefits
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold mt-1">•</span>
              <div>
                <span className="font-bold">Vitamin D:</span> Especially if limited sun exposure
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Hydration Goals</h3>
          </div>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold mt-1">•</span>
              <span>
                <span className="font-bold">Minimum:</span> 2-3 liters per day
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold mt-1">•</span>
              <span>
                <span className="font-bold">During workout:</span> 500-750ml
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold mt-1">•</span>
              <span>
                <span className="font-bold">Tip:</span> Drink water upon waking and before meals
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
