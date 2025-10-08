import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, Droplet } from 'lucide-react';
import { workoutData, daysOfWeek } from '../data/workoutData';
import ExerciseCard from '../components/ExerciseCard';
import DailyTracking from '../components/DailyTracking';

interface WorkoutsPageProps {
  supabase: any;
  userId: string;
}

interface ExerciseDetail {
  exercise_id: string;
  completed_sets: { reps: string; weight?: string }[];
}

export default function WorkoutsPage({ supabase, userId }: WorkoutsPageProps) {
  const [selectedLevel, setSelectedLevel] = useState<'Level 1' | 'Level 2'>('Level 1');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [exerciseDetails, setExerciseDetails] = useState<Record<string, { reps: string; weight?: string }[]>>({});
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (selectedDay) {
      loadProgress();
    }
  }, [selectedDay, selectedLevel]);

  const loadProgress = async () => {
    if (!selectedDay) return;

    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('workout_progress')
      .select('completed_exercises, exercise_details')
      .eq('user_id', userId)
      .eq('workout_date', today)
      .eq('level', selectedLevel)
      .eq('day', selectedDay)
      .maybeSingle();

    if (data && !error) {
      setCompletedExercises(new Set(data.completed_exercises || []));

      const detailsMap: Record<string, { reps: string; weight?: string }[]> = {};
      if (data.exercise_details && Array.isArray(data.exercise_details)) {
        data.exercise_details.forEach((detail: ExerciseDetail) => {
          detailsMap[detail.exercise_id] = detail.completed_sets;
        });
      }
      setExerciseDetails(detailsMap);
    } else {
      setCompletedExercises(new Set());
      setExerciseDetails({});
    }
  };

  const saveProgress = async (
    completed: Set<string>,
    details: Record<string, { reps: string; weight?: string }[]>
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const completedArray = Array.from(completed);

    const exerciseDetailsArray: ExerciseDetail[] = Object.entries(details).map(
      ([exercise_id, completed_sets]) => ({
        exercise_id,
        completed_sets,
      })
    );

    await supabase.from('workout_progress').upsert(
      {
        user_id: userId,
        workout_date: today,
        level: selectedLevel,
        day: selectedDay,
        completed_exercises: completedArray,
        exercise_details: exerciseDetailsArray,
        is_complete: completedArray.length === currentExercises.length,
      },
      {
        onConflict: 'user_id,workout_date,level,day',
      }
    );

    if (completedArray.length === currentExercises.length && currentExercises.length > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const toggleExercise = async (exerciseId: string) => {
    const newCompleted = new Set(completedExercises);
    if (newCompleted.has(exerciseId)) {
      newCompleted.delete(exerciseId);
    } else {
      newCompleted.add(exerciseId);
    }
    setCompletedExercises(newCompleted);
    await saveProgress(newCompleted, exerciseDetails);
  };

  const handleSetsUpdate = async (
    exerciseId: string,
    sets: { reps: string; weight?: string }[]
  ) => {
    const newDetails = { ...exerciseDetails, [exerciseId]: sets };
    setExerciseDetails(newDetails);
    await saveProgress(completedExercises, newDetails);
  };

  const markAllComplete = async () => {
    if (!selectedDay) return;
    const allExerciseIds = currentExercises.map((ex) => ex.id);
    const newCompleted = new Set(allExerciseIds);
    setCompletedExercises(newCompleted);
    await saveProgress(newCompleted, exerciseDetails);
  };

  const currentExercises = selectedDay ? workoutData[selectedLevel][selectedDay].exercises : [];
  const currentTitle = selectedDay ? workoutData[selectedLevel][selectedDay].title : '';
  const progress =
    currentExercises.length > 0
      ? Math.round((completedExercises.size / currentExercises.length) * 100)
      : 0;

  if (!selectedDay) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-teal-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Workouts</h1>
            <p className="text-gray-600">Track your fitness journey comprehensively</p>
          </div>

          <div className="mb-8">
            <DailyTracking supabase={supabase} userId={userId} />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Your Level</h2>
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedLevel('Level 1')}
                className={`flex-1 px-8 py-6 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 ${
                  selectedLevel === 'Level 1'
                    ? 'bg-gradient-to-br from-pink-500 to-pink-400 text-white shadow-xl scale-105'
                    : 'bg-gradient-to-br from-gray-100 to-gray-50 text-gray-700 hover:shadow-md border-2 border-gray-200'
                }`}
              >
                <div className="text-center">
                  <p className="text-2xl mb-2">🌱</p>
                  <p className="font-bold">Level 1</p>
                  <p className="text-sm mt-1 opacity-90">Beginner Friendly</p>
                </div>
              </button>
              <button
                onClick={() => setSelectedLevel('Level 2')}
                className={`flex-1 px-8 py-6 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 ${
                  selectedLevel === 'Level 2'
                    ? 'bg-gradient-to-br from-teal-500 to-teal-400 text-white shadow-xl scale-105'
                    : 'bg-gradient-to-br from-gray-100 to-gray-50 text-gray-700 hover:shadow-md border-2 border-gray-200'
                }`}
              >
                <div className="text-center">
                  <p className="text-2xl mb-2">🔥</p>
                  <p className="font-bold">Level 2</p>
                  <p className="text-sm mt-1 opacity-90">Advanced Training</p>
                </div>
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Choose Your Day</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {daysOfWeek.map((day) => {
                const workout = workoutData[selectedLevel][day];
                const isRestDay = workout.title.includes('REST');
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all text-left hover:scale-105 border-2 ${
                      isRestDay ? 'border-gray-300' : 'border-transparent hover:border-pink-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isRestDay ? 'bg-gray-100' : 'bg-gradient-to-br from-pink-500 to-teal-400'
                      }`}>
                        <Calendar className={`w-5 h-5 ${isRestDay ? 'text-gray-600' : 'text-white'}`} />
                      </div>
                      <h3 className="font-bold text-gray-800">{day}</h3>
                    </div>
                    <p className={`text-sm font-semibold mb-2 ${
                      isRestDay ? 'text-gray-600' : 'text-pink-600'
                    }`}>
                      {workout.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded-full">
                        {workout.exercises.length} exercises
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-teal-50 p-8">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-12 shadow-2xl animate-bounce">
            <p className="text-6xl text-center mb-4">🎉</p>
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-teal-400">
              Workout Complete!
            </p>
            <p className="text-gray-600 mt-2 text-center">Amazing work!</p>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => setSelectedDay(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors font-medium hover:gap-3"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Workouts
        </button>

        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-xl mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-4xl font-bold text-gray-800">{selectedDay}</h2>
                <span className="bg-gradient-to-r from-pink-500 to-teal-400 text-white px-4 py-1 rounded-full text-sm font-bold">
                  {selectedLevel}
                </span>
              </div>
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-teal-400">
                {currentTitle}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {currentExercises.length} exercises • Track your sets and reps below
              </p>
            </div>
            <div className="text-center bg-gradient-to-br from-pink-50 to-teal-50 rounded-2xl p-6 min-w-[120px]">
              <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-teal-400">
                {progress}%
              </p>
              <p className="text-sm text-gray-600 font-semibold mt-2">Complete</p>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-pink-500 via-pink-400 to-teal-400 h-full transition-all duration-500 shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {currentExercises.map((exercise, index) => (
            <div key={exercise.id} className="relative">
              <div className="absolute -left-4 top-4 w-8 h-8 bg-gradient-to-br from-pink-500 to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {index + 1}
              </div>
              <ExerciseCard
                exercise={exercise}
                completed={completedExercises.has(exercise.id)}
                onToggle={() => toggleExercise(exercise.id)}
                completedSets={exerciseDetails[exercise.id] || []}
                onSetsUpdate={(sets) => handleSetsUpdate(exercise.id, sets)}
              />
            </div>
          ))}
        </div>

        {progress < 100 && (
          <button
            onClick={markAllComplete}
            className="w-full bg-gradient-to-r from-pink-500 via-pink-400 to-teal-400 text-white py-5 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            ✓ Mark All Complete
          </button>
        )}

        {progress === 100 && (
          <div className="bg-gradient-to-r from-teal-500 to-teal-400 text-white py-8 rounded-3xl text-center shadow-xl">
            <p className="text-3xl font-bold mb-2">🏆 Workout Complete!</p>
            <p className="text-teal-50 text-lg">Great job! Keep up the consistency!</p>
          </div>
        )}
      </div>
    </div>
  );
}
