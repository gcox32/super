'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { WorkoutInstance, WorkoutBlockExerciseInstance } from '@/types/train';
import { NumberInput } from "@/components/ui/NumberInput";
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import BackToLink from '@/components/layout/navigation/BackToLink';
import Button from '@/components/ui/Button';
import { FormLabel } from '@/components/ui/Form';
import { FormTextarea } from '@/components/ui/Form';

export default function ExerciseNotesPage() {
  const { instanceId, exerciseId } = useParams();
  const [instance, setInstance] = useState<WorkoutInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  
  // Local state for modified sets
  const [sets, setSets] = useState<WorkoutBlockExerciseInstance[]>([]);
  const [targetGroup, setTargetGroup] = useState<any>(null);
  const [targetBlock, setTargetBlock] = useState<any>(null);

  useEffect(() => {
    async function fetchInstance() {
      try {
        const res = await fetch(`/api/train/workout-instances/${instanceId}`);
        if (res.ok) {
          const data = await res.json();
          setInstance(data.workoutInstance);
          
          // Initialize local state
          const inst = data.workoutInstance as WorkoutInstance;
          for (const blockInstance of inst.blockInstances || []) {
            if (blockInstance.exerciseInstances) {
                const matchingInstances = blockInstance.exerciseInstances.filter(
                    ex => ex.workoutBlockExerciseId === exerciseId
                );
                
                if (matchingInstances.length > 0 && matchingInstances[0].workoutBlockExercise) {
                    const sortedSets = matchingInstances.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    setSets(sortedSets);
                    setTargetGroup({
                        definition: matchingInstances[0].workoutBlockExercise,
                        sets: sortedSets
                    });
                    setTargetBlock(blockInstance.workoutBlock);
                    break;
                }
            }
          }
        }
      } catch (err) {
        console.error(err);
        showToast({ title: 'Failed to load workout', variant: 'error' });
      } finally {
        setLoading(false);
      }
    }
    if (instanceId) fetchInstance();
  }, [instanceId, exerciseId, showToast]);

  const handleUpdateLocal = (setId: string, updates: Partial<WorkoutBlockExerciseInstance>) => {
    setSets(prev => prev.map(s => s.id === setId ? { ...s, ...updates } : s));
  };

  const handleSave = async () => {
    if (!instance) return;
    setSaving(true);
    
    try {        
        await Promise.all(sets.map(async (set) => {
            const res = await fetch(`/api/train/workout-block-exercise-instances/${set.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rpe: set.rpe,
                    notes: set.notes
                }),
            });
            if (!res.ok) throw new Error(`Failed to update set ${set.id}`);
        }));

        showToast({ title: 'Exercise notes updated', variant: 'success' });
    } catch (err) {
      console.error(err);
      showToast({ title: 'Update failed', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  if (!instance) return <div className="p-8">Workout not found</div>;
  if (!targetGroup) return <div className="p-8">Exercise not found in this workout</div>;

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl mb-20">
      <div className="mb-6">
        <BackToLink href={`/log/workouts/${instanceId}`} pageName="Workout" />
        <div className="flex justify-between items-start mt-4">
            <div className="flex flex-col gap-2 w-full">
                <h1 className="text-3xl font-bold text-gray-100 my-2">{targetGroup.definition.exercise.name}</h1>
                <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto my-2">
                    {saving ? <Loader2 className="animate-spin" /> : 'Update'}
                </Button>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
                        {targetBlock?.workoutBlockType}
                    </span>
                    <span className="text-sm text-gray-400">
                        {sets.length} sets
                    </span>
                </div>
            </div>
        </div>
      </div>

      <div className="space-y-6">
         {sets.map((set, index) => (
            <div key={set.id} className="p-4 bg-zinc-900/30 rounded-lg border border-zinc-800/50 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Set {index + 1}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">RPE</span>
                        <NumberInput 
                            className="w-16 h-8 text-sm text-center bg-zinc-800/50 border-zinc-700"
                            min={1}
                            max={10}
                            value={set.rpe}
                            onValueChange={(val) => {
                                handleUpdateLocal(set.id, { rpe: val as any });
                            }}
                            placeholder="-"
                        />
                    </div>
                </div>
                
                <FormTextarea 
                    value={set.notes ?? ''}
                    onChange={(e) => handleUpdateLocal(set.id, { notes: e.target.value })}
                    placeholder="How did this set feel? Technique cues, pain points, etc."
                    className="min-h-[80px] text-sm bg-zinc-800/20 border-zinc-800 focus:border-brand-primary/50"
                />
            </div>
         ))}
      </div>
    </div>
  );
}
