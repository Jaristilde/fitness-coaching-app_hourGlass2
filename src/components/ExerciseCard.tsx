import { Check, Play, Video } from 'lucide-react';
import { Exercise } from '../data/workoutData';
import { useState } from 'react';

interface ExerciseCardProps {
  exercise: Exercise;
  completed: boolean;
  onToggle: () => void;
  completedSets?: { reps: string; weight?: string }[];
  onSetsUpdate?: (sets: { reps: string; weight?: string }[]) => void;
}

export default function ExerciseCard({
  exercise,
  completed,
  onToggle,
  completedSets = [],
  onSetsUpdate
}: ExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [sets, setSets] = useState<{ reps: string; weight?: string }[]>(
    completedSets.length > 0 ? completedSets : [{ reps: '', weight: '' }]
  );
  const [activationChecks, setActivationChecks] = useState<boolean[]>(
    exercise.activationSteps ? new Array(exercise.activationSteps.length).fill(false) : []
  );

  const targetSetsCount = exercise.sets.match(/\d+/)?.[0] || '1';
  const isTimeBasedOrRest = exercise.reps === '-' || exercise.sets.includes('min');

  const handleAddSet = () => {
    const newSets = [...sets, { reps: '', weight: '' }];
    setSets(newSets);
    if (onSetsUpdate) onSetsUpdate(newSets);
  };

  const handleSetChange = (index: number, field: 'reps' | 'weight', value: string) => {
    const newSets = [...sets];
    newSets[index][field] = value;
    setSets(newSets);
    if (onSetsUpdate) onSetsUpdate(newSets);
  };

  const handleRemoveSet = (index: number) => {
    const newSets = sets.filter((_, i) => i !== index);
    setSets(newSets);
    if (onSetsUpdate) onSetsUpdate(newSets);
  };

  const handleActivationToggle = (index: number) => {
    const newChecks = [...activationChecks];
    newChecks[index] = !newChecks[index];
    setActivationChecks(newChecks);
  };

  return (
    <div
      className={`bg-white rounded-lg p-4 shadow-sm border-2 transition-all ${
        completed ? 'border-teal-400 bg-teal-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          onClick={onToggle}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all cursor-pointer ${
            completed
              ? 'bg-teal-400 border-teal-400'
              : 'border-gray-300 hover:border-pink-400'
          }`}
        >
          {completed && <Check className="w-4 h-4 text-white" />}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className={`font-semibold text-gray-800 ${completed ? 'line-through' : ''}`}>
              {exercise.name}
            </h3>
            {exercise.videoUrl && (
              <button
                onClick={() => setShowVideo(!showVideo)}
                className="flex items-center gap-1 text-pink-500 hover:text-pink-600 text-sm font-medium transition-colors bg-pink-50 px-3 py-1 rounded-lg hover:bg-pink-100"
              >
                <Video className="w-4 h-4" />
                {showVideo ? 'Hide' : 'Tutorial'}
              </button>
            )}
          </div>

          {showVideo && exercise.videoUrl && (
            <div className="mb-3 rounded-lg overflow-hidden shadow-lg bg-black">
              <video
                src={exercise.videoUrl}
                className="w-full aspect-video"
                controls
                autoPlay
                loop
                playsInline
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {exercise.activationSteps && exercise.activationSteps.length > 0 ? (
            <div className="bg-gradient-to-br from-pink-50 to-teal-50 rounded-lg p-4 border-2 border-pink-200 mb-3">
              <p className="text-sm font-bold text-gray-800 mb-3">Activation Sequence:</p>
              <div className="space-y-2">
                {exercise.activationSteps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 bg-white rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <div
                      onClick={() => handleActivationToggle(index)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all cursor-pointer ${
                        activationChecks[index]
                          ? 'bg-teal-400 border-teal-400'
                          : 'border-gray-300 hover:border-pink-400'
                      }`}
                    >
                      {activationChecks[index] && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <p className={`text-sm text-gray-700 flex-1 ${activationChecks[index] ? 'line-through text-gray-400' : ''}`}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-3 border border-pink-200">
                  <p className="text-xs text-pink-600 font-semibold mb-1">TARGET SETS</p>
                  <p className="text-lg font-bold text-pink-700">{exercise.sets}</p>
                </div>
                <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
                  <p className="text-xs text-teal-600 font-semibold mb-1">TARGET REPS</p>
                  <p className="text-lg font-bold text-teal-700">{exercise.reps}</p>
                </div>
              </div>

              {exercise.notes && (
                <p className="text-xs text-gray-500 italic mb-3 bg-gray-50 p-2 rounded">
                  {exercise.notes}
                </p>
              )}
            </>
          )}

          {!isTimeBasedOrRest && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm font-medium text-pink-500 hover:text-pink-600 mb-2"
              >
                {isExpanded ? 'Hide' : 'Track'} Your Performance
              </button>

              {isExpanded && (
                <div className="space-y-2 mt-3">
                  {sets.map((set, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-600 w-12">
                        Set {index + 1}
                      </span>
                      <input
                        type="text"
                        placeholder="Reps"
                        value={set.reps}
                        onChange={(e) => handleSetChange(index, 'reps', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-pink-400"
                      />
                      <input
                        type="text"
                        placeholder="Weight (optional)"
                        value={set.weight || ''}
                        onChange={(e) => handleSetChange(index, 'weight', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-pink-400"
                      />
                      {sets.length > 1 && (
                        <button
                          onClick={() => handleRemoveSet(index)}
                          className="text-red-500 hover:text-red-600 text-xs px-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={handleAddSet}
                    className="text-xs font-medium text-teal-500 hover:text-teal-600 mt-2"
                  >
                    + Add Set
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
