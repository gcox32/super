import type { SessionStep } from '@/types/train';

interface SessionInputControlsProps {
  step: SessionStep;
  reps: string;
  onRepsChange: (value: string) => void;
  weight: string;
  onWeightChange: (value: string) => void;
  weightUnit: 'kg' | 'lbs';
  onWeightUnitChange: (unit: 'kg' | 'lbs') => void;
  // Complementary measures
  distance?: string;
  onDistanceChange?: (value: string) => void;
  distanceUnit?: 'cm' | 'm' | 'in' | 'ft' | 'yd' | 'mi' | 'km';
  onDistanceUnitChange?: (unit: 'cm' | 'm' | 'in' | 'ft' | 'yd' | 'mi' | 'km') => void;
  time?: string;
  onTimeChange?: (value: string) => void;
  timeUnit?: 's' | 'min' | 'hr';
  onTimeUnitChange?: (unit: 's' | 'min' | 'hr') => void;
  calories?: string;
  onCaloriesChange?: (value: string) => void;
}

export function SessionInputControls({
  step,
  reps,
  onRepsChange,
  weight,
  onWeightChange,
  weightUnit,
  onWeightUnitChange,
  distance,
  onDistanceChange,
  distanceUnit = 'm',
  onDistanceUnitChange,
  time,
  onTimeChange,
  timeUnit = 's',
  onTimeUnitChange,
  calories,
  onCaloriesChange,
}: SessionInputControlsProps) {
  // Determine what to show based on exercise definition
  const hasDistance = step.exercise.measures.distance !== undefined;
  const hasTime = step.exercise.measures.time !== undefined;
  const hasCalories = step.exercise.measures.calories !== undefined;
  const hasLoad = step.exercise.measures.externalLoad !== undefined;
  const hasReps = step.exercise.measures.reps !== undefined;

  const scoringType = step.exercise.scoringType;
  const isTimeScore = scoringType === 'time';
  const isDistScore = scoringType === 'dist';
  const isCalsScore = scoringType === 'cals';
  const isCardioOrDuration = isTimeScore || isDistScore || isCalsScore;

  // Show complementary measures:
  // - If distance is defined, show time (to record how long it took)
  // - If time is defined, show distance (to record how far they went)
  // - If calories is defined, show calories (replaces reps) and time (to record duration)
  // - If load is defined, show reps (existing behavior)
  // - If reps is defined, show load (existing behavior)

  const showTimeInput     = isTimeScore || hasDistance || hasCalories;
  const showDistanceInput = isDistScore || hasTime || isTimeScore;
  const showCaloriesInput = isCalsScore || hasCalories; // Calories replaces reps when defined
  
  // Don't show reps/load if we are primarily scoring by time/dist/cals
  const showRepsInput = (hasLoad || hasReps) && !showCaloriesInput && !isCardioOrDuration; 
  const showLoadInput = (hasReps || hasLoad) && !showCaloriesInput && !isCardioOrDuration;

  return (
    <div className="gap-4 grid grid-cols-2 mb-8">
      {/* Reps - show if load or reps is defined (but not if calories is defined) */}
      {showRepsInput && (
        <div className="flex flex-col gap-2">
          <label className="pl-1 font-medium text-zinc-400 text-xs uppercase tracking-wider">
            Reps
          </label>
          <div className="group relative">
            <input
              type="number"
              inputMode="numeric"
              value={reps}
              onChange={(e) => onRepsChange(e.target.value)}
              className="bg-zinc-900/80 px-4 py-5 border border-zinc-700/50 focus:border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary w-full font-bold placeholder:text-zinc-700 text-4xl text-center transition-all"
              placeholder={step.exercise.measures.reps?.toString() || '0'}
            />
            {step.exercise.measures.reps && (
              <div className="top-2 right-2 absolute font-mono text-[10px] text-zinc-500">
                Target: {step.exercise.measures.reps}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calories - replaces reps when calories is defined */}
      {showCaloriesInput && onCaloriesChange && (
        <div className="flex flex-col gap-2">
          <label className="pl-1 font-medium text-zinc-400 text-xs uppercase tracking-wider">
            Calories
          </label>
          <div className="group relative">
            <input
              type="number"
              inputMode="numeric"
              value={calories || ''}
              onChange={(e) => onCaloriesChange(e.target.value)}
              className="bg-zinc-900/80 px-4 py-5 border border-zinc-700/50 focus:border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary w-full font-bold placeholder:text-zinc-700 text-4xl text-center transition-all"
              placeholder={step.exercise.measures.calories?.value?.toString() || '0'}
            />
            {step.exercise.measures.calories && (
              <div className="top-2 right-2 absolute font-mono text-[10px] text-zinc-500">
                Target: {step.exercise.measures.calories.value} cal
              </div>
            )}
            <div className="top-2 left-2 absolute font-mono text-[10px] text-zinc-500">
              cal
            </div>
          </div>
        </div>
      )}

      {/* Load - show if reps or load is defined (but not if calories is defined) */}
      {showLoadInput && (
        <div className="flex flex-col gap-2">
          <label className="pl-1 font-medium text-zinc-400 text-xs uppercase tracking-wider">
            Weight
          </label>
          <div className="group relative flex flex-col items-end gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={weight}
              onChange={(e) => onWeightChange(e.target.value)}
              className="bg-zinc-900/80 px-4 py-5 border border-zinc-700/50 focus:border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary w-full font-bold placeholder:text-zinc-700 text-4xl text-center transition-all"
              placeholder={
                step.exercise.measures.externalLoad?.value?.toString() || '0'
              }
            />
            <div className="float-right flex items-center gap-1 font-medium text-xs">
              <button
                type="button"
                onClick={() => onWeightUnitChange('kg')}
                className={`px-2 py-0.5 rounded-full border ${
                  weightUnit === 'kg'
                    ? 'bg-brand-primary text-black border-brand-primary'
                    : 'bg-zinc-900/80 text-zinc-400 border-zinc-700'
                }`}
              >
                kg
              </button>
              <button
                type="button"
                onClick={() => onWeightUnitChange('lbs')}
                className={`px-2 py-0.5 rounded-full border ${
                  weightUnit === 'lbs'
                    ? 'bg-brand-primary text-black border-brand-primary'
                    : 'bg-zinc-900/80 text-zinc-400 border-zinc-700'
                }`}
              >
                lbs
              </button>
            </div>
          </div>
        </div>
      )}

            {/* Distance - show if time is defined */}
            {showDistanceInput && onDistanceChange && (
        <div className="flex flex-col gap-2">
          <label className="pl-1 font-medium text-zinc-400 text-xs uppercase tracking-wider">
            Distance
          </label>
          <div className="group relative flex flex-col items-end gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={distance || ''}
              onChange={(e) => onDistanceChange(e.target.value)}
              className="bg-zinc-900/80 px-4 py-5 border border-zinc-700/50 focus:border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary w-full font-bold placeholder:text-zinc-700 text-4xl text-center transition-all"
              placeholder="0"
            />
            {onDistanceUnitChange && (
              <div className="float-right flex items-center gap-1 font-medium text-xs">
                <button
                  type="button"
                  onClick={() => onDistanceUnitChange('m')}
                  className={`px-2 py-0.5 rounded-full border ${
                    distanceUnit === 'm'
                      ? 'bg-brand-primary text-black border-brand-primary'
                      : 'bg-zinc-900/80 text-zinc-400 border-zinc-700'
                  }`}
                >
                  m
                </button>
                <button
                  type="button"
                  onClick={() => onDistanceUnitChange('km')}
                  className={`px-2 py-0.5 rounded-full border ${
                    distanceUnit === 'km'
                      ? 'bg-brand-primary text-black border-brand-primary'
                      : 'bg-zinc-900/80 text-zinc-400 border-zinc-700'
                  }`}
                >
                  km
                </button>
                <button
                  type="button"
                  onClick={() => onDistanceUnitChange('mi')}
                  className={`px-2 py-0.5 rounded-full border ${
                    distanceUnit === 'mi'
                      ? 'bg-brand-primary text-black border-brand-primary'
                      : 'bg-zinc-900/80 text-zinc-400 border-zinc-700'
                  }`}
                >
                  mi
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Time - show if distance or calories is defined */}
      {showTimeInput && onTimeChange && (
        <div className="flex flex-col gap-2">
          <label className="pl-1 font-medium text-zinc-400 text-xs uppercase tracking-wider">
            Time
          </label>
          <div className="group relative flex flex-col items-end gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={time || ''}
              onChange={(e) => onTimeChange(e.target.value)}
              className="bg-zinc-900/80 px-4 py-5 border border-zinc-700/50 focus:border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary w-full font-bold placeholder:text-zinc-700 text-4xl text-center transition-all"
              placeholder="0"
            />
            {onTimeUnitChange && (
              <div className="float-right flex items-center gap-1 font-medium text-xs">
                <button
                  type="button"
                  onClick={() => onTimeUnitChange('s')}
                  className={`px-2 py-0.5 rounded-full border ${
                    timeUnit === 's'
                      ? 'bg-brand-primary text-black border-brand-primary'
                      : 'bg-zinc-900/80 text-zinc-400 border-zinc-700'
                  }`}
                >
                  s
                </button>
                <button
                  type="button"
                  onClick={() => onTimeUnitChange('min')}
                  className={`px-2 py-0.5 rounded-full border ${
                    timeUnit === 'min'
                      ? 'bg-brand-primary text-black border-brand-primary'
                      : 'bg-zinc-900/80 text-zinc-400 border-zinc-700'
                  }`}
                >
                  min
                </button>
                <button
                  type="button"
                  onClick={() => onTimeUnitChange('hr')}
                  className={`px-2 py-0.5 rounded-full border ${
                    timeUnit === 'hr'
                      ? 'bg-brand-primary text-black border-brand-primary'
                      : 'bg-zinc-900/80 text-zinc-400 border-zinc-700'
                  }`}
                >
                  hr
                </button>
              </div>
            )}
          </div>
        </div>
      )}


    </div>
  );
}

