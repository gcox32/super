'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FormCard, FormTitle, FormGroup, FormLabel, 
  FormInput, FormTextarea, FormSelect
} from '@/components/ui/Form';
import { CreateEditForm } from '@/components/ui/CreateEditForm';
import { Workout, WorkoutType } from '@/types/train';
import { CreateWorkoutInput, CreateWorkoutBlockInput, CreateWorkoutBlockExerciseInput } from '@/lib/db/crud/train';
import { Plus, Copy } from 'lucide-react';
import { WORKOUT_TYPES } from './options';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  CollisionDetection
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { SortableWorkoutBlock } from './SortableWorkoutBlock';
import { BlockFormData, ScoringType } from './types';
import Button from '@/components/ui/Button';

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
  
  const [blocks, setBlocks] = useState<BlockFormData[]>([
    {
      clientId: `block-${Math.random().toString(36).substr(2, 9)}`,
      workoutBlockType: 'main',
      name: 'Main Block',
      order: 1,
      circuit: false,
      exercises: [],
    }
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5,
        },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const customCollisionDetection: CollisionDetection = useCallback((args) => {
    const { active, droppableContainers } = args;
    
    // Filter droppables based on active item type
    const filteredContainers = droppableContainers.filter(container => {
        if (active.id.toString().startsWith('block-')) {
            return container.id.toString().startsWith('block-');
        }
        if (active.id.toString().startsWith('exercise-')) {
             return container.id.toString().startsWith('exercise-');
        }
        return false;
    });

    // Use closestCorners with filtered containers for better bounding box detection
    return closestCorners({
        ...args,
        droppableContainers: filteredContainers
    });
  }, []);

  const handleScoringTypeChange = (blockIndex: number, exerciseIndex: number, measureType: ScoringType) => {
    updateExercise(blockIndex, exerciseIndex, { scoringType: measureType });
  };

  const getActiveMeasure = (blockIndex: number, exerciseIndex: number): ScoringType => {
    return blocks[blockIndex].exercises[exerciseIndex].scoringType || 'reps';
  };

  const populateForm = (w: Workout) => {
    setName(w.name ?? '');
    setDescription(w.description ?? '');
    setWorkoutType(w.workoutType);
    setEstimatedDuration(w.estimatedDuration ?? 60);
    setObjectives(w.objectives ?? []);

    const mappedBlocks: BlockFormData[] =
      (w.blocks ?? []).map((b, blockIndex) => ({
        clientId: `block-${Math.random().toString(36).substr(2, 9)}`,
        workoutBlockType: b.workoutBlockType,
        name: b.name ?? '',
        order: blockIndex + 1,
        circuit: b.circuit ?? false,
        estimatedDuration: b.estimatedDuration,
        description: b.description,
        exercises: (b.exercises ?? []).map((ex, exIndex) => ({
          exerciseId: ex.exercise.id,
          clientId: `exercise-${Math.random().toString(36).substr(2, 9)}`,
          order: exIndex + 1,
          sets: ex.sets,
          measures: ex.measures ?? {},
          scoringType: ex.scoringType || 'reps',
          tempo: ex.tempo,
          restTime: ex.restTime,
          rpe: ex.rpe,
          notes: ex.notes,
        })),
      }));

    if (mappedBlocks.length > 0) {
      setBlocks(mappedBlocks);
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
        clientId: `block-${Math.random().toString(36).substr(2, 9)}`,
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
    newBlocks[index] = { ...newBlocks[index], ...updates } as BlockFormData;
    setBlocks(newBlocks);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Check if we're sorting blocks (IDs start with "block-")
    if (activeId.startsWith('block-') && overId.startsWith('block-')) {
      if (activeId !== overId) {
        setBlocks((items) => {
          const oldIndex = items.findIndex((item) => item.clientId === activeId);
          const newIndex = items.findIndex((item) => item.clientId === overId);
          
          const newItems = arrayMove(items, oldIndex, newIndex);
          return newItems.map((item, index) => ({ ...item, order: index + 1 }));
        });
      }
      return;
    }

    // Check if we're sorting exercises (IDs start with "exercise-")
    if (activeId.startsWith('exercise-') && overId.startsWith('exercise-')) {
      setBlocks((currentBlocks) => {
        // Find source and destination blocks
        let sourceBlockIndex = -1;
        let destBlockIndex = -1;
        let sourceExerciseIndex = -1;
        let destExerciseIndex = -1;

        for (let i = 0; i < currentBlocks.length; i++) {
          const exerciseIndex = currentBlocks[i].exercises.findIndex(e => e.clientId === activeId);
          if (exerciseIndex !== -1) {
            sourceBlockIndex = i;
            sourceExerciseIndex = exerciseIndex;
            break;
          }
        }

        for (let i = 0; i < currentBlocks.length; i++) {
          const exerciseIndex = currentBlocks[i].exercises.findIndex(e => e.clientId === overId);
          if (exerciseIndex !== -1) {
            destBlockIndex = i;
            destExerciseIndex = exerciseIndex;
            break;
          }
        }

        // Only allow reordering within the same block for now as per requirements
        if (sourceBlockIndex !== -1 && destBlockIndex !== -1 && sourceBlockIndex === destBlockIndex) {
          const newBlocks = [...currentBlocks];
          const block = newBlocks[sourceBlockIndex];
          
          const newExercises = arrayMove(block.exercises, sourceExerciseIndex, destExerciseIndex);
          newBlocks[sourceBlockIndex] = {
            ...block,
            exercises: newExercises.map((e, i) => ({ ...e, order: i + 1 }))
          };
          
          return newBlocks;
        }

        return currentBlocks;
      });
    }
  };

  const addExercise = (blockIndex: number) => {
    const newBlocks = [...blocks];
    newBlocks[blockIndex].exercises.push({
      clientId: `exercise-${Math.random().toString(36).substr(2, 9)}`,
      exerciseId: '',
      order: newBlocks[blockIndex].exercises.length + 1,
      sets: 3,
      measures: { reps: 10 },
      scoringType: 'reps',
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
          measures: e.measures,
          scoringType: e.scoringType || 'reps',
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
        <DndContext 
          sensors={sensors}
          collisionDetection={customCollisionDetection}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={blocks.map(b => b.clientId)}
            strategy={verticalListSortingStrategy}
          >
            {blocks.map((block, blockIndex) => (
              <SortableWorkoutBlock
                key={block.clientId}
                block={block}
                blockIndex={blockIndex}
                removeBlock={removeBlock}
                updateBlock={updateBlock}
                addExercise={addExercise}
                removeExercise={removeExercise}
                updateExercise={updateExercise}
                handleScoringTypeChange={handleScoringTypeChange}
                getActiveMeasure={getActiveMeasure}
              />
            ))}
          </SortableContext>
        </DndContext>
        
        <Button type="button" variant="outline" onClick={addBlock} fullWidth className="py-4 border-2 border-dashed">
          <Plus className="mr-2 w-5 h-5" /> Add Workout Block
        </Button>
      </div>
    </CreateEditForm>
  );
}
