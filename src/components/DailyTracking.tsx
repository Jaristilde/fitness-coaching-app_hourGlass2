import { useEffect, useState } from 'react';
import { Droplet, Pill, Activity, Watch } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';

interface DailyTrackingProps {
  supabase: SupabaseClient;
  userId: string;
}

interface TrackingData {
  water_intake_oz: number;
  took_supplements: boolean;
  took_preworkout: boolean;
  notes: string;
}

interface SmartwatchData {
  steps: number;
  calories_burned: number;
  active_minutes: number;
  heart_rate_avg: number;
}

export default function DailyTracking({ supabase, userId }: DailyTrackingProps) {
  const [tracking, setTracking] = useState<TrackingData>({
    water_intake_oz: 0,
    took_supplements: false,
    took_preworkout: false,
    notes: '',
  });
  const [smartwatch, setSmartwatch] = useState<SmartwatchData>({
    steps: 0,
    calories_burned: 0,
    active_minutes: 0,
    heart_rate_avg: 0,
  });
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadDailyData();
  }, []);

  const loadDailyData = async () => {
    try {
      const { data: trackingData } = await supabase
        .from('daily_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();

      if (trackingData) {
        setTracking({
          water_intake_oz: trackingData.water_intake_oz,
          took_supplements: trackingData.took_supplements,
          took_preworkout: trackingData.took_preworkout,
          notes: trackingData.notes || '',
        });
      }

      const { data: smartwatchData } = await supabase
        .from('smartwatch_data')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();

      if (smartwatchData) {
        setSmartwatch({
          steps: smartwatchData.steps,
          calories_burned: smartwatchData.calories_burned,
          active_minutes: smartwatchData.active_minutes,
          heart_rate_avg: smartwatchData.heart_rate_avg,
        });
      }
    } catch (error) {
      console.error('Error loading daily data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTracking = async (updates: Partial<TrackingData>) => {
    const newTracking = { ...tracking, ...updates };
    setTracking(newTracking);

    try {
      await supabase
        .from('daily_tracking')
        .upsert({
          user_id: userId,
          date: today,
          ...newTracking,
        });
    } catch (error) {
      console.error('Error updating tracking:', error);
    }
  };

  const updateSmartwatch = async (updates: Partial<SmartwatchData>) => {
    const newSmartwatch = { ...smartwatch, ...updates };
    setSmartwatch(newSmartwatch);

    try {
      await supabase
        .from('smartwatch_data')
        .upsert({
          user_id: userId,
          date: today,
          ...newSmartwatch,
          synced_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error updating smartwatch data:', error);
    }
  };

  const addWater = (amount: number) => {
    updateTracking({ water_intake_oz: tracking.water_intake_oz + amount });
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 rounded-2xl h-64"></div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Water Intake</h3>
            <p className="text-blue-100 text-sm">Goal: 64 oz per day</p>
          </div>
        </div>
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="text-center mb-3">
            <span className="text-4xl font-bold">{tracking.water_intake_oz}</span>
            <span className="text-xl ml-2 text-blue-100">oz</span>
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => addWater(8)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition-all"
            >
              +8 oz
            </button>
            <button
              onClick={() => addWater(16)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition-all"
            >
              +16 oz
            </button>
            <button
              onClick={() => updateTracking({ water_intake_oz: 0 })}
              className="bg-red-500/50 hover:bg-red-500/70 px-4 py-2 rounded-lg font-semibold transition-all"
            >
              Reset
            </button>
          </div>
          <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-500"
              style={{ width: `${Math.min((tracking.water_intake_oz / 64) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-400 rounded-xl flex items-center justify-center">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Supplements</h3>
          </div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={tracking.took_supplements}
              onChange={(e) => updateTracking({ took_supplements: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
            />
            <span className="text-gray-700 group-hover:text-green-600 transition-colors">
              Took daily supplements
            </span>
          </label>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-400 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Pre-Workout</h3>
          </div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={tracking.took_preworkout}
              onChange={(e) => updateTracking({ took_preworkout: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-gray-700 group-hover:text-orange-600 transition-colors">
              Took pre-workout
            </span>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl flex items-center justify-center">
            <Watch className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Smartwatch Data</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Steps</p>
            <input
              type="number"
              value={smartwatch.steps}
              onChange={(e) => updateSmartwatch({ steps: parseInt(e.target.value) || 0 })}
              className="w-full text-2xl font-bold text-purple-600 bg-transparent border-none outline-none"
              placeholder="0"
            />
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Calories</p>
            <input
              type="number"
              value={smartwatch.calories_burned}
              onChange={(e) => updateSmartwatch({ calories_burned: parseInt(e.target.value) || 0 })}
              className="w-full text-2xl font-bold text-orange-600 bg-transparent border-none outline-none"
              placeholder="0"
            />
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Active Min</p>
            <input
              type="number"
              value={smartwatch.active_minutes}
              onChange={(e) => updateSmartwatch({ active_minutes: parseInt(e.target.value) || 0 })}
              className="w-full text-2xl font-bold text-green-600 bg-transparent border-none outline-none"
              placeholder="0"
            />
          </div>
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Avg HR</p>
            <input
              type="number"
              value={smartwatch.heart_rate_avg}
              onChange={(e) => updateSmartwatch({ heart_rate_avg: parseInt(e.target.value) || 0 })}
              className="w-full text-2xl font-bold text-red-600 bg-transparent border-none outline-none"
              placeholder="0"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          Sync your smartwatch data manually or connect via app integration
        </p>
      </div>
    </div>
  );
}
