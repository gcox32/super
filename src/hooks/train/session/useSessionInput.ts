import { useState, useEffect } from 'react';
import type { SessionStep, WorkoutBlockExerciseInstance } from '@/types/train';

export function useSessionInput({
  currentStep,
  currentStepIndex,
  steps,
  exerciseInstances,
}: {
  currentStep: SessionStep | undefined;
  currentStepIndex: number;
  steps: SessionStep[];
  exerciseInstances: Record<string, WorkoutBlockExerciseInstance[]>;
}) {
  const [reps, setReps] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('lbs');
  const [distance, setDistance] = useState<string>('');
  const [distanceUnit, setDistanceUnit] = useState<'cm' | 'm' | 'in' | 'ft' | 'yd' | 'mi' | 'km'>('m');
  const [time, setTime] = useState<string>('');
  const [timeUnit, setTimeUnit] = useState<'s' | 'min' | 'hr'>('s');
  const [calories, setCalories] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'm' | 'in' | 'ft'>('in');
  const [pace, setPace] = useState<string>('');
  const [paceUnit, setPaceUnit] = useState<'mph' | 'kph' | 'min/km' | 'min/mile'>('min/mile');

  useEffect(() => {
    if (!currentStep) return;
    
    // 1. Determine defaults from Target or Previous Set
    const hasCalories = currentStep.exercise.measures.calories !== undefined;
    
    let defaultReps = currentStep.exercise.measures.reps?.toString() || '';
    let defaultWeight = currentStep.exercise.measures.externalLoad?.value?.toString() || '';
    let defaultUnit = currentStep.exercise.measures.externalLoad?.unit || 'lbs';
    let defaultDistance = currentStep.exercise.measures.distance?.value?.toString() || '';
    let defaultDistanceUnit: 'cm' | 'm' | 'in' | 'ft' | 'yd' | 'mi' | 'km' = 'm';
    let defaultTime = currentStep.exercise.measures.time?.value?.toString() || '';
    let defaultTimeUnit: 's' | 'min' | 'hr' = 's';
    let defaultCalories = hasCalories ? (currentStep.exercise.measures.calories?.value?.toString() || '') : '';
    let defaultHeight = currentStep.exercise.measures.height?.value?.toString() || '';
    let defaultHeightUnit: 'cm' | 'm' | 'in' | 'ft' = currentStep.exercise.measures.height?.unit || 'in';
    let defaultPace = currentStep.exercise.measures.pace?.value?.toString() || '';
    let defaultPaceUnit: 'mph' | 'kph' | 'min/km' | 'min/mile' = currentStep.exercise.measures.pace?.unit || 'min/mile';

    // Check previous step for "carry forward" logic
    if (currentStepIndex > 0) {
      const prevStep = steps[currentStepIndex - 1];
      if (
        prevStep &&
        prevStep.block.id === currentStep.block.id &&
        prevStep.exercise.id === currentStep.exercise.id
      ) {
        // Previous step was same exercise. Check if we have data for it.
        const prevBlockInsts = exerciseInstances[prevStep.block.id] || [];
        const prevMatch = prevBlockInsts.find(inst => 
          inst.workoutBlockExerciseId === prevStep.exercise.id && 
          inst.notes?.startsWith(`set:${prevStep.setIndex}:`)
        );

        if (prevMatch?.measures.externalLoad?.value) {
          defaultWeight = prevMatch.measures.externalLoad.value.toString();
          if (prevMatch.measures.externalLoad.unit) {
            defaultUnit = prevMatch.measures.externalLoad.unit;
          }
        }
        if (prevMatch?.measures.distance?.value) {
          defaultDistance = prevMatch.measures.distance.value.toString();
          if (prevMatch.measures.distance.unit) {
            defaultDistanceUnit = prevMatch.measures.distance.unit;
          }
        }
        if (prevMatch?.measures.time?.value) {
          defaultTime = prevMatch.measures.time.value.toString();
          if (prevMatch.measures.time.unit) {
            defaultTimeUnit = prevMatch.measures.time.unit;
          }
        }
        if (prevMatch?.measures.calories?.value) {
          defaultCalories = prevMatch.measures.calories.value.toString();
        }
        if (prevMatch?.measures.height?.value) {
          defaultHeight = prevMatch.measures.height.value.toString();
          if (prevMatch.measures.height.unit) defaultHeightUnit = prevMatch.measures.height.unit;
        }
        if (prevMatch?.measures.pace?.value) {
          defaultPace = prevMatch.measures.pace.value.toString();
          if (prevMatch.measures.pace.unit) defaultPaceUnit = prevMatch.measures.pace.unit;
        }
      }
    }

    setReps(defaultReps);
    setWeight(defaultWeight);
    setWeightUnit(defaultUnit);
    setDistance(defaultDistance);
    setDistanceUnit(defaultDistanceUnit);
    setTime(defaultTime);
    setTimeUnit(defaultTimeUnit);
    setCalories(defaultCalories);
    setHeight(defaultHeight);
    setHeightUnit(defaultHeightUnit);
    setPace(defaultPace);
    setPaceUnit(defaultPaceUnit);
    
    // 2. Override with existing saved data for THIS step
    const blockInsts = exerciseInstances[currentStep.block.id] || [];
    const match = blockInsts.find(inst => 
      inst.workoutBlockExerciseId === currentStep.exercise.id && 
      inst.notes?.startsWith(`set:${currentStep.setIndex}:`)
    );
    
    if (match) {
      // If calories is defined, prioritize calories over reps
      const hasCaloriesDefined = currentStep.exercise.measures.calories !== undefined;
      if (hasCaloriesDefined && match.measures.calories?.value) {
        setCalories(match.measures.calories.value.toString());
      } else if (match.measures.reps) {
        setReps(match.measures.reps.toString());
      }
      
      if (match.measures.externalLoad?.value) {
        setWeight(match.measures.externalLoad.value.toString());
      }
      if (match.measures.externalLoad?.unit) {
        setWeightUnit(match.measures.externalLoad.unit);
      }
      if (match.measures.distance?.value) {
        setDistance(match.measures.distance.value.toString());
      }
      if (match.measures.distance?.unit) {
        setDistanceUnit(match.measures.distance.unit);
      }
      if (match.measures.time?.value) {
        setTime(match.measures.time.value.toString());
      }
      if (match.measures.time?.unit) {
        setTimeUnit(match.measures.time.unit);
      }
      if (match.measures.height?.value) {
        setHeight(match.measures.height.value.toString());
      }
      if (match.measures.height?.unit) {
        setHeightUnit(match.measures.height.unit);
      }
      if (match.measures.pace?.value) {
        setPace(match.measures.pace.value.toString());
      }
      if (match.measures.pace?.unit) {
        setPaceUnit(match.measures.pace.unit);
      }
    }
    
  }, [currentStepIndex, exerciseInstances, currentStep, steps]);

  return {
    reps, setReps,
    weight, setWeight,
    weightUnit, setWeightUnit,
    distance, setDistance,
    distanceUnit, setDistanceUnit,
    time, setTime,
    timeUnit, setTimeUnit,
    calories, setCalories,
    height, setHeight,
    heightUnit, setHeightUnit,
    pace, setPace,
    paceUnit, setPaceUnit,
  };
}

