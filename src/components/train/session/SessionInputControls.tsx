import type { SessionStep } from '@/types/train';

interface SessionInputControlsProps {
  step: SessionStep;
  reps: string;
  onRepsChange: (value: string) => void;
  weight: string;
  onWeightChange: (value: string) => void;
}

export function SessionInputControls({
  step,
  reps,
  onRepsChange,
  weight,
  onWeightChange,
}: SessionInputControlsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      {/* Reps */}
      <div className="flex flex-col gap-2">
        <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider pl-1">
          Reps
        </label>
        <div className="relative group">
          <input
            type="number"
            inputMode="numeric"
            value={reps}
            onChange={(e) => onRepsChange(e.target.value)}
            className="w-full bg-zinc-900/80 border border-zinc-700/50 rounded-2xl px-4 py-5 text-4xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all placeholder:text-zinc-700"
            placeholder={step.exercise.measures.reps?.toString() || '0'}
          />
          {step.exercise.measures.reps && (
            <div className="absolute top-2 right-2 text-[10px] text-zinc-500 font-mono">
              Target: {step.exercise.measures.reps}
            </div>
          )}
        </div>
      </div>

      {/* Weight */}
      <div className="flex flex-col gap-2">
        <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider pl-1">
          Weight
        </label>
        <div className="relative group">
          <input
            type="number"
            inputMode="numeric"
            value={weight}
            onChange={(e) => onWeightChange(e.target.value)}
            className="w-full bg-zinc-900/80 border border-zinc-700/50 rounded-2xl px-4 py-5 text-4xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all placeholder:text-zinc-700"
            placeholder={
              step.exercise.measures.externalLoad?.value?.toString() || '0'
            }
          />
          <span className="absolute bottom-6 right-4 text-zinc-500 font-medium text-sm">
            {step.exercise.measures.externalLoad?.unit || 'kg'}
          </span>
        </div>
      </div>
    </div>
  );
}

