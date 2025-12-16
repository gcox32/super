'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { 
  FormWrapper, FormCard, FormTitle, FormGroup, FormLabel, 
  FormInput, FormTextarea, FormSelect, FormActions 
} from '@/components/ui/Form';
import { TogglePill } from '@/components/ui/TogglePill';
import { ExerciseAutocomplete } from '@/components/train/build/exercises/ExerciseAutocomplete';
import { Exercise, Workout, WorkoutBlockType, WorkoutType } from '@/types/train';
import { CreateWorkoutInput, CreateWorkoutBlockInput, CreateWorkoutBlockExerciseInput } from '@/lib/db/crud/train';
import { Plus, Trash } from 'lucide-react';
import { WORKOUT_TYPES, BLOCK_TYPES } from './options';

interface WorkoutFormProps {
    workoutId?: string;
    isEditing?: boolean;
}

export default function WorkoutForm({ workoutId, isEditing = false }: WorkoutFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
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

  useEffect(() => {
    // If editing, fetch existing workout details and populate the form
    if (!isEditing || !workoutId) return;

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

        const w = data.workout;

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
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadWorkout();
    return () => {
      cancelled = true;
    };
  }, [isEditing, workoutId]);

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
    <form onSubmit={handleSubmit}>
      <FormWrapper>
        <FormCard>
          <FormTitle>Workout Details</FormTitle>
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
                {block.exercises.map((exercise, exerciseIndex) => (
                  <div key={exerciseIndex} className="items-end gap-2 grid grid-cols-12 bg-background/50 p-3 border border-border rounded">
                    <div className="col-span-12 sm:col-span-4">
                      <ExerciseAutocomplete
                        initialExerciseId={exercise.exerciseId || undefined}
                        onChange={(selected: Exercise | null) =>
                          updateExercise(blockIndex, exerciseIndex, { exerciseId: selected?.id || '' })
                        }
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-2">
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
                    <div className="col-span-3 sm:col-span-2">
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
                    <div className="col-span-3 sm:col-span-2">
                       <FormLabel className="text-xs">Load</FormLabel>
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
                             } 
                           });
                         }}
                         onBlur={e => {
                           if (e.target.value === '') {
                             const currentUnit = exercise.measures.externalLoad?.unit || 'kg';
                             updateExercise(blockIndex, exerciseIndex, { 
                               measures: { 
                                 ...exercise.measures, 
                                 externalLoad: undefined,
                               } 
                             });
                           }
                         }}
                       />
                    </div>
                    <div className="col-span-3 sm:col-span-2">
                      <FormLabel className="text-xs">Unit</FormLabel>
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
                      >
                        <option value="kg">kg</option>
                        <option value="lbs">lbs</option>
                      </FormSelect>
                    </div>
                    <div className="col-span-3 sm:col-span-2">
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
                     <div className="flex justify-end col-span-1 pt-4">
                        <button type="button" onClick={() => removeExercise(blockIndex, exerciseIndex)} className="text-muted-foreground hover:text-red-500">
                          <Trash className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                ))}
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

        <FormActions>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
          </Button>
          <Button type="submit" size="lg" disabled={loading} className="w-[188px]!">
            {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </Button>
        </FormActions>
      </FormWrapper>
    </form>
  );
}
