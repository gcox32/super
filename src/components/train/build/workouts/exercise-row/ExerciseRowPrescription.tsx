import { FormLabel, FormInput, FormSelect } from '@/components/ui/Form';
import { CreateWorkoutBlockExerciseInput } from '@/lib/db/crud/train';
import { ExerciseFormData } from '../types';
import { NumberInput } from '@/components/ui/NumberInput';

interface ExerciseRowPrescriptionProps {
  exercise: ExerciseFormData;
  blockIndex: number;
  exerciseIndex: number;
  updateExercise: (blockIndex: number, exerciseIndex: number, updates: Partial<CreateWorkoutBlockExerciseInput>) => void;
}

export function ExerciseRowPrescription({
  exercise,
  blockIndex,
  exerciseIndex,
  updateExercise,
}: ExerciseRowPrescriptionProps) {

  const hasMeasure = (measure: 'reps' | 'load' | 'dist' | 'time' | 'cals') => {
      if (measure === 'reps') return exercise.measures.reps !== undefined;
      if (measure === 'load') return !!exercise.measures.externalLoad;
      if (measure === 'dist') return !!exercise.measures.distance;
      if (measure === 'time') return !!exercise.measures.time;
      if (measure === 'cals') return !!exercise.measures.calories;
      return false;
  };

  // Helper to toggle a measure visibility in prescription area (mutually exclusive)
  const toggleMeasure = (measure: 'reps' | 'load' | 'dist' | 'time' | 'cals') => {
    // If the clicked measure is already active, do nothing
    if (hasMeasure(measure)) return;

    const newMeasures: CreateWorkoutBlockExerciseInput['measures'] = { 
        ...exercise.measures,
        reps: undefined,
        externalLoad: undefined,
        distance: undefined,
        time: undefined,
        calories: undefined
    };
    
    if (measure === 'load') {
        newMeasures.externalLoad = { value: 0, unit: 'kg' };
    } else if (measure === 'dist') {
        newMeasures.distance = { value: 0, unit: 'm' };
    } else if (measure === 'cals') {
        newMeasures.calories = { value: 0, unit: 'cal' };
    } else if (measure === 'time') {
        newMeasures.time = { value: 0, unit: 's' };
    } else if (measure === 'reps') {
        newMeasures.reps = 0;
    }
    
    updateExercise(blockIndex, exerciseIndex, { measures: newMeasures });
  };

  return (
    <div className="md:col-span-8 space-y-2">
      <FormLabel className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Prescription</FormLabel>
      <div className="flex flex-col gap-2">
        {/* Toggle Buttons / Pills */}
        <div className="flex flex-wrap gap-2 mt-1 justify-evenly">
          {(['reps', 'load', 'dist', 'time', 'cals'] as const).map((m) => {
            const isActive = hasMeasure(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => toggleMeasure(m)}
                className={`
                    px-2 py-1 text-[10px] uppercase font-semibold tracking-wider rounded border transition-colors
                    ${isActive 
                        ? 'bg-brand-primary text-white border-brand-primary' 
                        : 'bg-transparent text-muted-foreground border-border hover:border-brand-primary hover:text-foreground'
                    }
                `}
              >
                {m === 'load' ? 'Weight' : m}
              </button>
            );
          })}
        </div>

        <div className="flex w-full gap-2 m-2 ml-1">
            
            {/* Sets - Always visible */}
            <div className="w-16 shrink-0">
               <div className="relative">
                 <FormInput 
                   type="number" 
                   value={exercise.sets || ''} 
                   onChange={e => {
                     const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                     updateExercise(blockIndex, exerciseIndex, { 
                       sets: (val === '' || isNaN(val as number)) ? 0 : (val as number)
                     });
                   }}
                   onBlur={e => {
                     if (e.target.value === '') updateExercise(blockIndex, exerciseIndex, { sets: 0 });
                   }}
                   className="text-center h-9"
                   placeholder="0"
                 />
               </div>
               <span className="text-[10px] text-muted-foreground text-center block mt-1">Sets</span>
            </div>

            {/* Reps */}
            {hasMeasure('reps') && (
                <div className="w-full mr-1">
                   <FormInput 
                     type="number" 
                     value={exercise.measures.reps ?? ''} 
                     onChange={e => {
                       const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                       updateExercise(blockIndex, exerciseIndex, { 
                         measures: { ...exercise.measures, reps: (val === '' || isNaN(val as number)) ? 0 : (val as number) } 
                       });
                     }}
                     className="text-center h-9"
                     placeholder="0"
                   />
                   <span className="text-[10px] text-muted-foreground text-center block mt-1">Reps</span>
                </div>
            )}

            {/* Load */}
            {hasMeasure('load') && (
                <div className="flex gap-1 w-full">
                  <div className="flex-1">
                    <FormInput 
                      type="number" 
                      value={exercise.measures.externalLoad?.value ?? ''} 
                      onChange={e => {
                        const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                        const currentUnit = exercise.measures.externalLoad?.unit || 'kg';
                        updateExercise(blockIndex, exerciseIndex, { 
                          measures: { ...exercise.measures, externalLoad: { value: (val === '' || isNaN(val as number)) ? 0 : (val as number), unit: currentUnit } } 
                        });
                      }}
                      className="text-center h-9"
                      placeholder="0"
                    />
                    <span className="text-[10px] text-muted-foreground text-center block mt-1">Load</span>
                  </div>
                  <div className="w-16">
                    <FormSelect
                      value={exercise.measures.externalLoad?.unit || 'kg'}
                      onChange={e => {
                        const unit = e.target.value as 'kg' | 'lbs';
                        const currentValue = exercise.measures.externalLoad?.value || 0;
                        updateExercise(blockIndex, exerciseIndex, { 
                          measures: { ...exercise.measures, externalLoad: { value: currentValue, unit } } 
                        });
                      }}
                      className="h-9 px-1 text-xs"
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </FormSelect>
                  </div>
                </div>
            )}

            {/* Distance */}
            {hasMeasure('dist') && (
                <div className="flex gap-1 w-full">
                  <div className="flex-1">
                    <FormInput 
                      type="number" 
                      value={exercise.measures.distance?.value ?? ''} 
                      onChange={e => {
                        const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                        const currentUnit = exercise.measures.distance?.unit || 'm';
                        updateExercise(blockIndex, exerciseIndex, { 
                          measures: { ...exercise.measures, distance: { value: (val === '' || isNaN(val as number)) ? 0 : (val as number), unit: currentUnit } } 
                        });
                      }}
                      className="text-center h-9"
                      placeholder="0"
                    />
                    <span className="text-[10px] text-muted-foreground text-center block mt-1">Distance</span>
                  </div>
                  <div className="w-18">
                    <FormSelect
                      value={exercise.measures.distance?.unit || 'm'}
                      onChange={e => {
                        const unit = e.target.value as any;
                        const currentValue = exercise.measures.distance?.value || 0;
                        updateExercise(blockIndex, exerciseIndex, { 
                          measures: { ...exercise.measures, distance: { value: currentValue, unit } } 
                        });
                      }}
                      className="h-9 px-1 text-xs"
                    >
                      <option value="m">m</option>
                      <option value="km">km</option>
                      <option value="ft">ft</option>
                      <option value="mi">mi</option>
                      <option value="yd">yd</option>
                    </FormSelect>
                  </div>
                </div>
            )}

            {/* Time */}
            {hasMeasure('time') && (
                <div className="flex gap-1 w-full">
                  <div className="flex-1">
                    <FormInput 
                      type="number" 
                      value={exercise.measures.time?.value ?? ''} 
                      onChange={e => {
                        const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                        const currentUnit = exercise.measures.time?.unit || 's';
                        updateExercise(blockIndex, exerciseIndex, { 
                          measures: { ...exercise.measures, time: { value: (val === '' || isNaN(val as number)) ? 0 : (val as number), unit: currentUnit } } 
                        });
                      }}
                      className="text-center h-9"
                      placeholder="0"
                    />
                    <span className="text-[10px] text-muted-foreground text-center block mt-1">Time</span>
                  </div>
                  <div className="w-16">
                    <FormSelect
                      value={exercise.measures.time?.unit || 's'}
                      onChange={e => {
                        const unit = e.target.value as any;
                        const currentValue = exercise.measures.time?.value || 0;
                        updateExercise(blockIndex, exerciseIndex, { 
                          measures: { ...exercise.measures, time: { value: currentValue, unit } } 
                        });
                      }}
                      className="h-9 px-1 text-xs"
                    >
                      <option value="s">s</option>
                      <option value="min">min</option>
                      <option value="hr">hr</option>
                    </FormSelect>
                  </div>
                </div>
            )}

            {/* Calories */}
            {hasMeasure('cals') && (
                 <div className="w-full mr-1">
                  <FormInput 
                    type="number" 
                    value={exercise.measures.calories?.value ?? ''} 
                    onChange={e => {
                      const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                      updateExercise(blockIndex, exerciseIndex, { 
                        measures: { ...exercise.measures, calories: { value: (val === '' || isNaN(val as number)) ? 0 : (val as number), unit: 'cal' } } 
                      });
                    }}
                    className="text-center h-9"
                    placeholder="0"
                  />
                  <span className="text-[10px] text-muted-foreground text-center block mt-1">Calories</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
