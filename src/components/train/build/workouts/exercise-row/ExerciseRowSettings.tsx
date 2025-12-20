import React from 'react';
import { FormLabel, FormSelect } from '@/components/ui/Form';
import { CreateWorkoutBlockExerciseInput } from '@/lib/db/crud/train';
import { ScoringType, ExerciseFormData } from '../types';

interface ExerciseRowSettingsProps {
  exercise: ExerciseFormData;
  blockIndex: number;
  exerciseIndex: number;
  updateExercise: (blockIndex: number, exerciseIndex: number, updates: Partial<CreateWorkoutBlockExerciseInput>) => void;
  activeMeasure: ScoringType;
  handleScoringTypeChange: (blockIndex: number, exerciseIndex: number, measureType: ScoringType) => void;
}

export function ExerciseRowSettings({
  exercise,
  blockIndex,
  exerciseIndex,
  updateExercise,
  activeMeasure,
  handleScoringTypeChange,
}: ExerciseRowSettingsProps) {
  return (
    <div className="md:col-span-4 space-y-2 ml-1">
      <div className="flex gap-2 justify-between">
        <div className="w-full">
          <FormLabel className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-1">Score By</FormLabel>
          <FormSelect
            value={activeMeasure}
            onChange={(e) => handleScoringTypeChange(blockIndex, exerciseIndex, e.target.value as ScoringType)}
            className="text-xs h-9 py-1 w-full"
          >
            <option value="load">Load</option>
            <option value="reps">Reps</option>
            <option value="time">Time</option>
            <option value="dist">Distance</option>
            <option value="cals">Calories</option>
          </FormSelect>
        </div>
        <div className="w-[40%]">
          <FormLabel className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-1">Rest</FormLabel>
          <FormSelect
            value={exercise.restTime || 0}
            onChange={e => {
              const val = parseInt(e.target.value, 10);
              updateExercise(blockIndex, exerciseIndex, { restTime: (isNaN(val) ? 0 : val) as any });
            }}
            className="text-xs h-9 py-1"
          >
            <option value={0}>None</option>
            <option value={15}>15s</option>
            <option value={30}>30s</option>
            <option value={45}>45s</option>
            <option value={60}>1m</option>
            <option value={90}>1m 30s</option>
            <option value={120}>2m</option>
            <option value={180}>3m</option>
            <option value={240}>4m</option>
            <option value={300}>5m</option>
          </FormSelect>
        </div>
      </div>
    </div>
  );
}
