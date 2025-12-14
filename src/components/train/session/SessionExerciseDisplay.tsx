import { MoreHorizontal } from 'lucide-react';
import type { SessionStep } from '@/types/train';

interface SessionExerciseDisplayProps {
  step: SessionStep;
  onMenuOpen: () => void;
}

export function SessionExerciseDisplay({
  step,
  onMenuOpen,
}: SessionExerciseDisplayProps) {
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2 text-brand-primary font-medium tracking-wide text-sm uppercase">
        <span>
          Round {step.setIndex + 1} / {step.totalSets}
        </span>
      </div>

      <h1 className="text-4xl font-bold leading-tight max-w-[90%]">
        {step.exercise.exercise.name}
      </h1>

      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-2">
          {!step.exercise.exercise.bilateral && (
            <span className="px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 text-xs font-medium text-zinc-300 backdrop-blur-sm">
              Single Sided
            </span>
          )}
          {step.block.workoutBlockType === 'warm-up' && (
            <span className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-xs font-medium text-orange-200 backdrop-blur-sm">
              Warm Up
            </span>
          )}
        </div>

        <button
          onClick={onMenuOpen}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors"
        >
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

