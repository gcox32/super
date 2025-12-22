import { X, Dumbbell, Clock } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import type { WorkoutInstance, WorkoutBlock, WorkoutBlockExercise, WorkoutBlockExerciseInstance } from '@/types/train';
import { calculateMuscleWorkDistribution } from '@/lib/anatomy/muscle-work';
import { MuscleHeatmap } from '@/components/anatomy/MuscleHeatmap';

interface WorkoutSummaryOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  workoutInstance: WorkoutInstance | null;
  totalVolume: number; // calculated in parent for now
  durationSeconds: number;
  totalSets: number; // calculated in parent
  blocks: WorkoutBlock[];
  exercisesMap: Record<string, WorkoutBlockExercise[]>;
  completedExerciseInstances?: WorkoutBlockExerciseInstance[];
}

export function WorkoutSummaryOverlay({
  isOpen,
  onClose,
  workoutInstance,
  totalVolume,
  durationSeconds,
  totalSets,
  blocks,
  exercisesMap,
  completedExerciseInstances
}: WorkoutSummaryOverlayProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  return (
    <div
      className={`absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-200 ease-out p-4 ${isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl transition-all duration-200 flex flex-col ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4">
          <h2 className="pl-6 w-full font-bold text-white text-xl text-center">Summary</h2>
          <button
            onClick={onClose}
            className="-mr-2 p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="flex-1 bg-zinc-900 border-zinc-800 border-t overflow-y-auto">
          <div className="gap-px grid grid-cols-2 bg-zinc-800/50 border-y border-zinc-800">
            <StatBox
              icon={Clock}
              label="Duration"
              value={formatDuration(durationSeconds)}
            />
            <StatBox
              icon={Dumbbell}
              label="Volume"
              value={`${totalVolume}kg`}
            />
            <StatBox
              label="Sets"
              value={totalSets.toString()}
              className="flex flex-col justify-center items-center bg-zinc-900 p-6"
            />
          </div>

          {/* Muscle Heatmap */}
          {workoutInstance && (
            <div className="p-4 border-zinc-800 border-t">
              <MuscleHeatmap 
                workoutInstance={workoutInstance}
                exercisesMap={exercisesMap}
                completedExerciseInstances={completedExerciseInstances}
              />
            </div>
          )}

          {/* Workout Outline */}
          <div className="p-6">
          <h3 className="mb-3 font-semibold text-zinc-400 text-sm text-center uppercase tracking-wide">Outline</h3>
          <div className="space-y-4">
            {blocks.map((block) => {
              const exercises = exercisesMap[block.id] || [];
              if (exercises.length === 0) return null;

              return (
                <div key={block.id} className="space-y-2">
                  {block.name && (
                    <div className="flex items-center gap-2 text-zinc-300 text-sm">
                      <span className="font-medium">{block.name}</span>
                      {block.circuit && (
                        <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 text-xs">Circuit</span>
                      )}
                    </div>
                  )}
                  {!block.name && block.circuit && (
                    <div className="bg-zinc-800 px-2 py-0.5 rounded w-fit text-zinc-500 text-xs">Circuit</div>
                  )}
                  <div className="space-y-1.5 pl-2">
                    {exercises.map((exercise) => (
                      <div key={exercise.id} className="flex items-center gap-2 text-zinc-400 text-sm">
                        <span className="text-zinc-300">{exercise.exercise.name}</span>
                        <span className="text-zinc-500">•</span>
                        <span>{exercise.sets} sets</span>
                        {exercise.measures.reps && (
                          <>
                            <span className="text-zinc-500">•</span>
                            <span>{exercise.measures.reps} reps</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
  sublabel,
  className
}: {
  icon?: any,
  label: string,
  value: string,
  sublabel?: string,
  className?: string
}) {
  if (className) return <div className={className}><span className="mb-1 text-zinc-400 text-sm">{label}</span><span className="font-mono font-bold text-white text-xl">{value}</span></div>;

  return (
    <div className="flex flex-col justify-center items-center bg-zinc-900 hover:bg-zinc-800/50 p-6 transition-colors">
      <div className="flex items-center gap-2 mb-2 text-zinc-400">
        {Icon && <Icon className="w-4 h-4" />}
        <span className="font-medium text-sm">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-mono font-bold text-white text-2xl">{value}</span>
        {sublabel && <span className="text-zinc-500 text-xs">{sublabel}</span>}
      </div>
    </div>
  );
}

