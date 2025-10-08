import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import WorkoutsPage from './pages/WorkoutsPage';
import MealPlansPage from './pages/MealPlansPage';
import ChatBot from './components/ChatBot';
import { Calendar, Dumbbell, UtensilsCrossed } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const DEMO_USER_ID = 'demo-user-123';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'workouts' | 'meals'>('home');

  if (false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-teal-400 rounded-2xl mb-4">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Weekly Workout Tracker
            </h1>
            <p className="text-gray-600">Track your fitness journey</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className={`text-sm p-3 rounded-lg ${error.includes('email') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-teal-400 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-pink-500 hover:text-pink-600 font-medium transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderSidebar = () => (
    <aside className="w-64 bg-white shadow-xl border-r border-gray-200">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-teal-400 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Fitness Tracker</h1>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => setCurrentPage('home')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentPage === 'home'
                ? 'bg-gradient-to-r from-pink-500 to-teal-400 text-white shadow-md'
                : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Home</span>
          </button>
          <button
            onClick={() => setCurrentPage('workouts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentPage === 'workouts'
                ? 'bg-gradient-to-r from-pink-500 to-teal-400 text-white shadow-md'
                : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
            }`}
          >
            <Dumbbell className="w-5 h-5" />
            <span className="font-medium">Workouts</span>
          </button>
          <button
            onClick={() => setCurrentPage('meals')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentPage === 'meals'
                ? 'bg-gradient-to-r from-pink-500 to-teal-400 text-white shadow-md'
                : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
            }`}
          >
            <UtensilsCrossed className="w-5 h-5" />
            <span className="font-medium">Meal Plans</span>
          </button>
        </nav>
      </div>
    </aside>
  );

  if (currentPage === 'workouts') {
    return (
      <div className="flex h-screen bg-gradient-to-br from-pink-50 to-teal-50">
        {renderSidebar()}
        <main className="flex-1 overflow-auto">
          <WorkoutsPage supabase={supabase} userId={DEMO_USER_ID} />
        </main>
        <ChatBot supabase={supabase} userId={DEMO_USER_ID} />
      </div>
    );
  }

  if (currentPage === 'meals') {
    return (
      <div className="flex h-screen bg-gradient-to-br from-pink-50 to-teal-50">
        {renderSidebar()}
        <main className="flex-1 overflow-auto">
          <MealPlansPage supabase={supabase} userId={DEMO_USER_ID} />
        </main>
        <ChatBot supabase={supabase} userId={DEMO_USER_ID} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-pink-50 to-teal-50">
      {renderSidebar()}

      <main className="flex-1 overflow-auto">
        <div className="relative h-[650px] w-full bg-gradient-to-r from-pink-100 via-pink-50 to-white">
          <div className="max-w-7xl mx-auto h-full px-8 flex items-center">
            <div className="flex-1 max-w-xl">
              <h1 className="text-6xl font-bold text-gray-800 mb-4 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Strong. Confident.
                <br />
                Built Naturally.
              </h1>
              <p className="text-2xl text-gray-700 mb-8 font-light">
                Hourglass Fitness
              </p>
              <button
                onClick={() => setCurrentPage('workouts')}
                className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-10 py-5 rounded-full font-semibold text-lg shadow-2xl hover:shadow-teal-400/50 transition-all hover:scale-105 hover:from-pink-600 hover:to-teal-500"
              >
                Start My Transformation
              </button>
            </div>
            <div className="flex-1 h-full flex items-end justify-end">
              <img
                src="/CoachJ_inPink.png"
                alt="Coach Jo - Hourglass Fitness"
                className="h-full object-contain object-bottom"
              />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Science-Based Training
            </h2>
            <p className="text-xl text-gray-600">Transform your body with proven methods</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-20">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all hover:scale-105">
              <div className="h-80 overflow-hidden">
                <img
                  src="/JoaneBarbellSquat.png"
                  alt="Strength Building"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 bg-gradient-to-br from-pink-50 to-white">
                <h3 className="font-bold text-2xl text-gray-800 mb-3">Strength Building</h3>
                <p className="text-gray-600 leading-relaxed">
                  Train smart with science-based glute workouts.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all hover:scale-105">
              <div className="h-80 overflow-hidden">
                <img
                  src="/JoaneSquatting.png"
                  alt="Glute Activation"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 bg-gradient-to-br from-teal-50 to-white">
                <h3 className="font-bold text-2xl text-gray-800 mb-3">Glute Activation</h3>
                <p className="text-gray-600 leading-relaxed">
                  Tone, lift, and shape with targeted movement.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all hover:scale-105">
              <div className="h-80 overflow-hidden">
                <img
                  src="/Sumo Squats.png"
                  alt="Core & Cardio"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 bg-gradient-to-br from-pink-50 to-white">
                <h3 className="font-bold text-2xl text-gray-800 mb-3">Core & Cardio</h3>
                <p className="text-gray-600 leading-relaxed">
                  Balance strength and endurance the natural way.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-20">
            <div className="grid md:grid-cols-2">
              <div className="h-[500px]">
                <img
                  src="/redbathingsuit.png"
                  alt="Nutrition - Coach Jo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-12 flex flex-col justify-center bg-gradient-to-br from-pink-50 to-teal-50">
                <h2 className="text-4xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Nourish Your Curves
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Simple, balanced meal plans to fuel your transformation.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentPage('meals')}
                    className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    View Meal Plan
                  </button>
                  <button
                    onClick={() => setCurrentPage('meals')}
                    className="bg-white text-gray-800 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 border-gray-200"
                  >
                    Track My Nutrition
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-teal-400 rounded-3xl shadow-2xl overflow-hidden mb-20">
            <div className="grid md:grid-cols-2">
              <div className="p-12 flex flex-col justify-center text-white">
                <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Track Your Progress
                </h2>
                <div className="space-y-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/30 transition-all">
                    <Calendar className="w-8 h-8 mb-2" />
                    <h3 className="text-2xl font-bold mb-1">12 Weeks</h3>
                    <p className="text-white/90">Completed</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/30 transition-all">
                    <Dumbbell className="w-8 h-8 mb-2" />
                    <h3 className="text-2xl font-bold mb-1">48 Workouts</h3>
                    <p className="text-white/90">Logged</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/30 transition-all">
                    <UtensilsCrossed className="w-8 h-8 mb-2" />
                    <h3 className="text-2xl font-bold mb-1">2,400 Calories</h3>
                    <p className="text-white/90">Daily Target</p>
                  </div>
                </div>
              </div>
              <div className="h-[600px] bg-black">
                <video
                  src="/Joane_Doing_Squat_Video.mp4"
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="h-[500px]">
                <img
                  src="/Bandglueworkout_Joane.png"
                  alt="Coach Jo"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: '50% 30%' }}
                />
              </div>
              <div className="p-12 flex flex-col justify-center">
                <h2 className="text-4xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Meet Coach Jo
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  I built Hourglass Fitness to help women transform naturally — no shortcuts, just results.
                </p>
                <button
                  className="bg-gradient-to-r from-pink-500 to-teal-400 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 w-fit"
                >
                  Chat with Coach Jo
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <ChatBot supabase={supabase} userId={DEMO_USER_ID} />
    </div>
  );
}

export default App;
