import { CheckCircle } from 'lucide-react';
import { useMemo } from 'react';
import Button from '@/components/ui/Button';
import type { WorkoutInstance, WorkoutBlockExercise, WorkoutBlockExerciseInstance } from '@/types/train';
import { calculateMuscleWorkDistribution } from '@/lib/anatomy/muscle-work';
import { MuscleHeatmap } from '@/components/anatomy/MuscleHeatmap';

interface WorkoutCompleteViewProps {
  onContinue: () => void;
  workoutInstance?: WorkoutInstance | null;
  exercisesMap?: Record<string, WorkoutBlockExercise[]>;
  completedExerciseInstances?: WorkoutBlockExerciseInstance[];
}

export function WorkoutCompleteView({ onContinue, workoutInstance, exercisesMap, completedExerciseInstances }: WorkoutCompleteViewProps) {
  
  return (
    <div className="flex flex-col justify-center items-center p-6 w-full h-dvh text-white">
      <div className="flex flex-col items-center gap-6 mb-12 animate-in duration-500 fade-in zoom-in">
        <CheckCircle className="w-24 h-24 text-brand-primary" />
        <h1 className="font-bold text-3xl text-center">Workout Complete!</h1>
        <p className="max-w-xs text-zinc-400 text-center">
          Great job! Your workout has been saved to your history.
        </p>
      </div>

      {/* Muscle Heatmap */}
      {workoutInstance && (
        <div className="mb-8 w-full max-w-md">
          <h2 className="mb-4 font-semibold text-zinc-400 text-sm text-center uppercase tracking-wide">Muscle Work</h2>
          <MuscleHeatmap 
            workoutInstance={workoutInstance}
            exercisesMap={exercisesMap}
            completedExerciseInstances={completedExerciseInstances}
          />
        </div>
      )}

      <div className="bottom-8 safe-area-inset-bottom fixed px-4 w-full max-w-sm">
        <Button 
          onClick={onContinue}
          className="py-6 w-full text-lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

