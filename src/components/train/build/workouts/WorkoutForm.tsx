'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { 
  FormCard, FormTitle, FormGroup, FormLabel, 
  FormInput, FormTextarea, FormSelect
} from '@/components/ui/Form';
import { CreateEditForm } from '@/components/ui/CreateEditForm';
import { TogglePill } from '@/components/ui/TogglePill';
import { ExerciseAutocomplete } from '@/components/train/build/exercises/ExerciseAutocomplete';
import { Exercise, Workout, WorkoutBlockType, WorkoutType } from '@/types/train';
import { CreateWorkoutInput, CreateWorkoutBlockInput, CreateWorkoutBlockExerciseInput } from '@/lib/db/crud/train';
import { Plus, Trash, ChevronUp, Copy } from 'lucide-react';
import { WORKOUT_TYPES, BLOCK_TYPES } from './options';

interface WorkoutFormProps {
    workoutId?: string;
    isEditing?: boolean;
}

export default function WorkoutForm({ workoutId, isEditing = false }: WorkoutFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [availableWorkouts, setAvailableWorkouts] = useState<Workout[]>([]);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [workoutType, setWorkoutType] = useState<WorkoutType>('strength');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(60);
  const [objectives, setObjectives] = useState<string[]>([]);
  
  const [blocks, setBlocks] = useState<CreateWorkoutBlockInput[]>([
    {
      workoutBlockType: 'main',
      name: 'Main Block',
      order: 1,
      circuit: false,
      exercises: [],
    }
  ]);

  // Track which measure type is active for each exercise (null = none, 'load' | 'distance' | 'calories' | 'time')
  const [activeMeasures, setActiveMeasures] = useState<Map<string, 'load' | 'distance' | 'calories' | 'time' | null>>(new Map());
  
  const toggleMeasure = (blockIndex: number, exerciseIndex: number, measureType: 'load' | 'distance' | 'calories' | 'time') => {
    const key = `${blockIndex}-${exerciseIndex}`;
    const current = activeMeasures.get(key);
    
    // If clicking the same measure type, collapse it
    if (current === measureType) {
      setActiveMeasures(prev => {
        const next = new Map(prev);
        next.set(key, null);
        return next;
      });
    } else {
      // Switch to the new measure type and clear other measures
      setActiveMeasures(prev => {
        const next = new Map(prev);
        next.set(key, measureType);
        return next;
      });
      
      // Clear other measure values when switching
      const exercise = blocks[blockIndex].exercises[exerciseIndex];
      const clearedMeasures: any = { ...exercise.measures };
      
      if (measureType !== 'load') clearedMeasures.externalLoad = undefined;
      if (measureType !== 'distance') clearedMeasures.distance = undefined;
      if (measureType !== 'calories') clearedMeasures.calories = undefined;
      if (measureType !== 'time') clearedMeasures.time = undefined;
      
      updateExercise(blockIndex, exerciseIndex, { measures: clearedMeasures });
    }
  };

  const getActiveMeasure = (blockIndex: number, exerciseIndex: number): 'load' | 'distance' | 'calories' | 'time' | null => {
    return activeMeasures.get(`${blockIndex}-${exerciseIndex}`) ?? null;
  };

  const populateForm = (w: Workout) => {
    setName(w.name ?? '');
    setDescription(w.description ?? '');
    setWorkoutType(w.workoutType);
    setEstimatedDuration(w.estimatedDuration ?? 60);
    setObjectives(w.objectives ?? []);

    const mappedBlocks: CreateWorkoutBlockInput[] =
      (w.blocks ?? []).map((b, blockIndex) => ({
        workoutBlockType: b.workoutBlockType,
        name: b.name ?? '',
        order: blockIndex + 1,
        circuit: b.circuit ?? false,
        estimatedDuration: b.estimatedDuration,
        description: b.description,
        exercises: (b.exercises ?? []).map((ex, exIndex) => ({
          exerciseId: ex.exercise.id,
          order: exIndex + 1,
          sets: ex.sets,
          measures: ex.measures ?? {},
          tempo: ex.tempo,
          restTime: ex.restTime,
          rpe: ex.rpe,
          notes: ex.notes,
        })),
      }));

    if (mappedBlocks.length > 0) {
      setBlocks(mappedBlocks);
      // Auto-expand measure fields for exercises that already have measure values
      const measuresToExpand = new Map<string, 'load' | 'distance' | 'calories' | 'time'>();
      mappedBlocks.forEach((block, blockIndex) => {
        block.exercises.forEach((ex, exIndex) => {
          const key = `${blockIndex}-${exIndex}`;
          if (ex.measures?.externalLoad?.value !== undefined) {
            measuresToExpand.set(key, 'load');
          } else if (ex.measures?.distance?.value !== undefined) {
            measuresToExpand.set(key, 'distance');
          } else if (ex.measures?.calories?.value !== undefined) {
            measuresToExpand.set(key, 'calories');
          } else if (ex.measures?.time?.value !== undefined) {
            measuresToExpand.set(key, 'time');
          }
        });
      });
      setActiveMeasures(measuresToExpand);
    }
  };

  useEffect(() => {
    // If editing, fetch existing workout details and populate the form
    if (!isEditing) {
        // Fetch available workouts for copy feature
        fetch('/api/train/workouts')
            .then(res => res.json())
            .then(data => setAvailableWorkouts(data.workouts || []))
            .catch(err => console.error('Failed to load workouts for copy', err));
        return;
    }
    
    if (!workoutId) return;

    let cancelled = false;

    async function loadWorkout() {
      try {
        const res = await fetch(`/api/train/workouts/${workoutId}?details=true`, {
          method: 'GET',
          cache: 'no-store',
        });
        if (!res.ok) {
          throw new Error('Failed to load workout');
        }
        const data = await res.json() as { workout: Workout };
        if (cancelled || !data.workout) return;

        populateForm(data.workout);
      } catch (err) {
        console.error(err);
      }
    }

    loadWorkout();
    return () => {
      cancelled = true;
    };
  }, [isEditing, workoutId]);

  const handleCopyFrom = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) return;
    
    setLoading(true);
    try {
        const res = await fetch(`/api/train/workouts/${id}?details=true`);
        if (!res.ok) throw new Error('Failed to load workout details');
        const data = await res.json();
        if (data.workout) {
            populateForm(data.workout);
            // Append (Copy) to name
            setName(`${data.workout.name} (Copy)`);
        }
    } catch (err) {
        console.error(err);
        alert('Failed to copy workout details');
    } finally {
        setLoading(false);
    }
  };

  const addBlock = () => {
    setBlocks([
      ...blocks,
      {
        workoutBlockType: 'main',
        name: `Block ${blocks.length + 1}`,
        order: blocks.length + 1,
        circuit: false,
        exercises: [],
      }
    ]);
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const updateBlock = (index: number, updates: Partial<CreateWorkoutBlockInput>) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    setBlocks(newBlocks);
  };

  const addExercise = (blockIndex: number) => {
    const newBlocks = [...blocks];
    newBlocks[blockIndex].exercises.push({
      exerciseId: '',
      order: newBlocks[blockIndex].exercises.length + 1,
      sets: 3,
      measures: { reps: 10 },
      restTime: 60,
    } as any);
    setBlocks(newBlocks);
  };

  const removeExercise = (blockIndex: number, exerciseIndex: number) => {
    const newBlocks = [...blocks];
    newBlocks[blockIndex].exercises = newBlocks[blockIndex].exercises.filter((_, i) => i !== exerciseIndex);
    setBlocks(newBlocks);
  };

  const updateExercise = (blockIndex: number, exerciseIndex: number, updates: Partial<CreateWorkoutBlockExerciseInput>) => {
    const newBlocks = [...blocks];
    newBlocks[blockIndex].exercises[exerciseIndex] = { ...newBlocks[blockIndex].exercises[exerciseIndex], ...updates };
    setBlocks(newBlocks);
  };

  const handleDelete = async () => {
    if (!workoutId) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/train/workouts/${workoutId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete workout');
      router.push('/train/build/workouts');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete workout');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const workoutData: CreateWorkoutInput = {
      name,
      description,
      workoutType,
      estimatedDuration: estimatedDuration || 0,
      objectives,
      blocks: blocks.map((b, i) => ({
        ...b,
        order: i + 1,
        exercises: b.exercises.map((e, j) => ({
          ...e,
          order: j + 1,
          sets: e.sets || 0,
          measures: {
            ...e.measures,
            reps: e.measures.reps || 0,
          },
        }))
      }))
    };

    try {
      const url = isEditing ? `/api/train/workouts/${workoutId}` : '/api/train/workouts';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workoutData),
      });

      if (!res.ok) throw new Error('Failed to save workout');

      router.push('/train/build/workouts');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to save workout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CreateEditForm
      isEditing={isEditing}
      loading={loading}
      entityName="Workout"
      handleSubmit={handleSubmit}
      onDelete={handleDelete}
    >
      <FormCard>
        <FormTitle>{isEditing ? 'Edit Workout' : 'Create Workout'}</FormTitle>
        
        {!isEditing && availableWorkouts.length > 0 && (
          <div className="bg-brand-primary/5 mb-6 p-4 border border-brand-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2 font-medium text-brand-primary text-sm">
                  <Copy className="w-4 h-4" />
                  <span>Copy from existing workout</span>
              </div>
              <FormSelect 
                  value="" 
                  onChange={handleCopyFrom}
              >
                  <option value="">Select a workout to copy...</option>
                  {availableWorkouts.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
              </FormSelect>
              <p className="mt-1 text-muted-foreground text-xs">
                  This will replace current form contents with the selected workout's structure.
              </p>
          </div>
        )}

        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
          <FormGroup>
            <FormLabel>Name</FormLabel>
            <FormInput 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Type</FormLabel>
            <FormSelect 
              value={workoutType} 
              onChange={e => setWorkoutType(e.target.value as WorkoutType)}
            >
              {WORKOUT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </FormSelect>
          </FormGroup>
          <div className="md:col-span-2">
            <FormGroup>
              <FormLabel>Description</FormLabel>
              <FormTextarea 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                rows={2}
              />
            </FormGroup>
          </div>
          <FormGroup>
            <FormLabel>Est. Duration (min)</FormLabel>
            <FormInput 
              type="number" 
              value={estimatedDuration || ''} 
              onChange={e => {
                const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                setEstimatedDuration(isNaN(val as number) ? 0 : (val as number));
              }}
              onBlur={e => {
                if (e.target.value === '') {
                  setEstimatedDuration(0);
                }
              }}
            />
          </FormGroup>
        </div>
      </FormCard>

      <div className="space-y-4">
        {blocks.map((block, blockIndex) => (
          <FormCard key={blockIndex}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 gap-4 grid grid-cols-1 sm:grid-cols-2 mr-4">
                <FormInput 
                  value={block.name || ''} 
                  onChange={e => updateBlock(blockIndex, { name: e.target.value })}
                  placeholder="Block Name"
                  className="border-transparent focus:border-brand-primary font-bold text-lg"
                />
                <FormSelect
                  value={block.workoutBlockType}
                  onChange={e => updateBlock(blockIndex, { workoutBlockType: e.target.value as WorkoutBlockType })}
                >
                  {BLOCK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </FormSelect>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeBlock(blockIndex)} className="hover:bg-red-500/10 text-red-500 hover:text-red-700">
                <Trash className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-col items-start space-y-1 mb-3 px-1 text-muted-foreground text-xs">
              <FormLabel>Block Style</FormLabel>
              <TogglePill
                leftLabel="Circuit"
                rightLabel="Straight Sets"
                value={block.circuit ?? false}
                onChange={(val) =>
                  updateBlock(blockIndex, { circuit: val })
                }
              />
            </div>

            <div className="space-y-3 pl-4 border-border border-l-2">
              {block.exercises.map((exercise, exerciseIndex) => {
                const activeMeasure = getActiveMeasure(blockIndex, exerciseIndex);
                return (
                <div key={exerciseIndex} className="space-y-2 bg-background/50 p-3 border border-border rounded">
                  {/* First row: Exercise, Sets, Reps, Rest */}
                  <div className="items-end gap-2 grid grid-cols-12">
                    <div className="col-span-12 sm:col-span-6">
                      <ExerciseAutocomplete
                        initialExerciseId={exercise.exerciseId || undefined}
                        onChange={(selected: Exercise | null) =>
                          updateExercise(blockIndex, exerciseIndex, { exerciseId: selected?.id || '' })
                        }
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                       <FormLabel className="text-xs">Sets</FormLabel>
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
                           if (e.target.value === '') {
                             updateExercise(blockIndex, exerciseIndex, { sets: 0 });
                           }
                         }}
                       />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                       <FormLabel className="text-xs">Reps</FormLabel>
                       <FormInput 
                         type="number" 
                         value={exercise.measures.reps || ''} 
                         onChange={e => {
                           const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                           updateExercise(blockIndex, exerciseIndex, { 
                             measures: { 
                               ...exercise.measures, 
                               reps: (val === '' || isNaN(val as number)) ? 0 : (val as number),
                             } 
                           });
                         }}
                         onBlur={e => {
                           if (e.target.value === '') {
                             updateExercise(blockIndex, exerciseIndex, { 
                               measures: { 
                                 ...exercise.measures, 
                                 reps: 0,
                               } 
                             });
                           }
                         }}
                       />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                       <FormLabel className="text-xs">Rest (s)</FormLabel>
                       <FormSelect
                         value={exercise.restTime || 0}
                         onChange={e => {
                           const val = parseInt(e.target.value, 10);
                           updateExercise(blockIndex, exerciseIndex, { restTime: (isNaN(val) ? 0 : val) as any });
                         }}
                       >
                         <option value={0}>0</option>
                         <option value={15}>15</option>
                         <option value={30}>30</option>
                         <option value={45}>45</option>
                         <option value={60}>60</option>
                         <option value={90}>90</option>
                         <option value={120}>120</option>
                         <option value={180}>180</option>
                         <option value={240}>240</option>
                         <option value={300}>300</option>
                       </FormSelect>
                    </div>
                  </div>
                  
                  {/* Second row: Measure selection (left) and Delete (right) */}
                  <div className="flex justify-between items-center">
                    {activeMeasure ? (
                      <div className="flex-1 max-w-xs">
                        <div className="flex justify-start items-center gap-2 mb-1">
                          <FormLabel className="text-xs capitalize">{activeMeasure}</FormLabel>
                          <button
                            type="button"
                            onClick={() => toggleMeasure(blockIndex, exerciseIndex, activeMeasure)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title={`Hide ${activeMeasure}`}
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          {activeMeasure === 'load' && (
                            <>
                              <FormInput 
                                type="number" 
                                value={exercise.measures.externalLoad?.value ?? ''} 
                                onChange={e => {
                                  const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                                  const currentUnit = exercise.measures.externalLoad?.unit || 'kg';
                                  updateExercise(blockIndex, exerciseIndex, { 
                                    measures: { 
                                      ...exercise.measures, 
                                      externalLoad: (val === '' || isNaN(val as number))
                                        ? undefined
                                        : { value: val as number, unit: currentUnit },
                                      // Clear other measures when setting load
                                      distance: undefined,
                                      calories: undefined,
                                      time: undefined,
                                    } 
                                  });
                                }}
                                onBlur={e => {
                                  if (e.target.value === '') {
                                    updateExercise(blockIndex, exerciseIndex, { 
                                      measures: { 
                                        ...exercise.measures, 
                                        externalLoad: undefined,
                                      } 
                                    });
                                  }
                                }}
                                className="flex-1"
                              />
                              <FormSelect
                                value={exercise.measures.externalLoad?.unit || 'kg'}
                                onChange={e => {
                                  const unit = e.target.value as 'kg' | 'lbs';
                                  const currentValue = exercise.measures.externalLoad?.value;
                                  updateExercise(blockIndex, exerciseIndex, { 
                                    measures: { 
                                      ...exercise.measures, 
                                      externalLoad: currentValue !== undefined
                                        ? { value: currentValue, unit }
                                        : { value: 0, unit },
                                    } 
                                  });
                                }}
                                className="w-20"
                              >
                                <option value="kg">kg</option>
                                <option value="lbs">lbs</option>
                              </FormSelect>
                            </>
                          )}
                          {activeMeasure === 'distance' && (
                            <>
                              <FormInput 
                                type="number" 
                                value={exercise.measures.distance?.value ?? ''} 
                                onChange={e => {
                                  const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                                  const currentUnit = exercise.measures.distance?.unit || 'm';
                                  updateExercise(blockIndex, exerciseIndex, { 
                                    measures: { 
                                      ...exercise.measures, 
                                      distance: (val === '' || isNaN(val as number))
                                        ? undefined
                                        : { value: val as number, unit: currentUnit },
                                      // Clear other measures when setting distance
                                      externalLoad: undefined,
                                      calories: undefined,
                                      time: undefined,
                                    } 
                                  });
                                }}
                                onBlur={e => {
                                  if (e.target.value === '') {
                                    updateExercise(blockIndex, exerciseIndex, { 
                                      measures: { 
                                        ...exercise.measures, 
                                        distance: undefined,
                                      } 
                                    });
                                  }
                                }}
                                className="flex-1"
                              />
                              <FormSelect
                                value={exercise.measures.distance?.unit || 'm'}
                                onChange={e => {
                                  const unit = e.target.value as 'cm' | 'm' | 'in' | 'ft' | 'yd' | 'mi' | 'km';
                                  const currentValue = exercise.measures.distance?.value;
                                  updateExercise(blockIndex, exerciseIndex, { 
                                    measures: { 
                                      ...exercise.measures, 
                                      distance: currentValue !== undefined
                                        ? { value: currentValue, unit }
                                        : { value: 0, unit },
                                    } 
                                  });
                                }}
                                className="w-24"
                              >
                                <option value="cm">cm</option>
                                <option value="m">m</option>
                                <option value="km">km</option>
                                <option value="in">in</option>
                                <option value="ft">ft</option>
                                <option value="yd">yd</option>
                                <option value="mi">mi</option>
                              </FormSelect>
                            </>
                          )}
                          {activeMeasure === 'calories' && (
                            <>
                              <FormInput 
                                type="number" 
                                value={exercise.measures.calories?.value ?? ''} 
                                onChange={e => {
                                  const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                                  updateExercise(blockIndex, exerciseIndex, { 
                                    measures: { 
                                      ...exercise.measures, 
                                      calories: (val === '' || isNaN(val as number))
                                        ? undefined
                                        : { value: val as number, unit: 'cal' },
                                      // Clear other measures when setting calories
                                      externalLoad: undefined,
                                      distance: undefined,
                                      time: undefined,
                                    } 
                                  });
                                }}
                                onBlur={e => {
                                  if (e.target.value === '') {
                                    updateExercise(blockIndex, exerciseIndex, { 
                                      measures: { 
                                        ...exercise.measures, 
                                        calories: undefined,
                                      } 
                                    });
                                  }
                                }}
                                className="flex-1"
                              />
                              <span className="self-center px-2 text-muted-foreground text-xs">cal</span>
                            </>
                          )}
                          {activeMeasure === 'time' && (
                            <>
                              <FormInput 
                                type="number" 
                                value={exercise.measures.time?.value ?? ''} 
                                onChange={e => {
                                  const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                                  const currentUnit = exercise.measures.time?.unit || 's';
                                  updateExercise(blockIndex, exerciseIndex, { 
                                    measures: { 
                                      ...exercise.measures, 
                                      time: (val === '' || isNaN(val as number))
                                        ? undefined
                                        : { value: val as number, unit: currentUnit },
                                      // Clear other measures when setting time
                                      externalLoad: undefined,
                                      distance: undefined,
                                      calories: undefined,
                                    } 
                                  });
                                }}
                                onBlur={e => {
                                  if (e.target.value === '') {
                                    updateExercise(blockIndex, exerciseIndex, { 
                                      measures: { 
                                        ...exercise.measures, 
                                        time: undefined,
                                      } 
                                    });
                                  }
                                }}
                                className="flex-1"
                              />
                              <FormSelect
                                value={exercise.measures.time?.unit || 's'}
                                onChange={e => {
                                  const unit = e.target.value as 's' | 'min' | 'hr';
                                  const currentValue = exercise.measures.time?.value;
                                  updateExercise(blockIndex, exerciseIndex, { 
                                    measures: { 
                                      ...exercise.measures, 
                                      time: currentValue !== undefined
                                        ? { value: currentValue, unit }
                                        : { value: 0, unit },
                                    } 
                                  });
                                }}
                                className="w-20"
                              >
                                <option value="s">s</option>
                                <option value="min">min</option>
                                <option value="hr">hr</option>
                              </FormSelect>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleMeasure(blockIndex, exerciseIndex, 'load')}
                          className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs transition-colors"
                          title="Add Load"
                        >
                          <Plus className="w-3 h-3" />
                          <span className="text-[10px]">Load</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleMeasure(blockIndex, exerciseIndex, 'distance')}
                          className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs transition-colors"
                          title="Add Distance"
                        >
                          <Plus className="w-3 h-3" />
                          <span className="text-[10px]">Distance</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleMeasure(blockIndex, exerciseIndex, 'calories')}
                          className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs transition-colors"
                          title="Add Calories"
                        >
                          <Plus className="w-3 h-3" />
                          <span className="text-[10px]">Calories</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleMeasure(blockIndex, exerciseIndex, 'time')}
                          className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs transition-colors"
                          title="Add Time"
                        >
                          <Plus className="w-3 h-3" />
                          <span className="text-[10px]">Time</span>
                        </button>
                      </div>
                    )}
                    <button 
                      type="button" 
                      onClick={() => removeExercise(blockIndex, exerciseIndex)} 
                      className="mr-2 ml-4 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                );
              })}
              <Button type="button" variant="secondary" size="sm" onClick={() => addExercise(blockIndex)} fullWidth>
                <Plus className="mr-2 w-4 h-4" /> Add Exercise
              </Button>
            </div>
          </FormCard>
        ))}
        
        <Button type="button" variant="outline" onClick={addBlock} fullWidth className="py-4 border-2 border-dashed">
          <Plus className="mr-2 w-5 h-5" /> Add Workout Block
        </Button>
      </div>
    </CreateEditForm>
  );
}
