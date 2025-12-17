'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { WorkoutInstance, WorkoutBlockExerciseInstance } from '@/types/train';
import BackToLink from '@/components/layout/navigation/BackToLink';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import StatsGrid from '@/components/log/workouts/instance/StatsGrid';
import Button from '@/components/ui/Button';
import WorkoutInstanceHeader from '@/components/log/workouts/instance/Header';
import WorkoutInstanceBlock from '@/components/log/workouts/instance/Block';

export default function WorkoutInstanceDetailPage() {
    const { instanceId } = useParams();
    const [instance, setInstance] = useState<WorkoutInstance | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        async function fetchInstance() {
            try {
                const res = await fetch(`/api/train/workout-instances/${instanceId}`);
                if (res.ok) {
                    const data = await res.json();
                    setInstance(data.workoutInstance);
                }
            } catch (err) {
                console.error(err);
                showToast({ title: 'Failed to load workout', variant: 'error' });
            } finally {
                setLoading(false);
            }
        }
        if (instanceId) fetchInstance();
    }, [instanceId, showToast]);

    const handleUpdateSetLocal = (setId: string, updates: Partial<WorkoutBlockExerciseInstance>) => {
        setInstance(prev => {
            if (!prev) return null;
            return {
                ...prev,
                blockInstances: prev.blockInstances?.map(block => ({
                    ...block,
                    exerciseInstances: block.exerciseInstances?.map(ex =>
                        ex.id === setId ? { ...ex, ...updates } : ex
                    )
                }))
            };
        });
    };

    const handleAddSet = async (blockInstanceId: string, exerciseId: string) => {
        if (!instance) return;
        
        // Find existing sets to copy measures from last set
        const block = instance.blockInstances?.find(b => b.id === blockInstanceId);
        const existingSets = block?.exerciseInstances?.filter(e => e.workoutBlockExerciseId === exerciseId) || [];
        const lastSet = existingSets.length > 0 ? existingSets[existingSets.length - 1] : null;
        
        const newSetData = {
            workoutBlockInstanceId: blockInstanceId,
            workoutBlockExerciseId: exerciseId,
            date: instance.date, // Use workout date
            complete: false,
            measures: lastSet ? { ...lastSet.measures } : {}, // Copy measures or empty
            notes: '',
            rpe: undefined
        };

        try {
            const res = await fetch('/api/train/workout-block-exercise-instances', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSetData)
            });

            if (!res.ok) throw new Error('Failed to create set');
            const { instance: newInstance } = await res.json();

            // Update state
            setInstance(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    blockInstances: prev.blockInstances?.map(block => {
                        if (block.id !== blockInstanceId) return block;
                        return {
                            ...block,
                            exerciseInstances: [...(block.exerciseInstances || []), newInstance]
                        };
                    })
                };
            });
            showToast({ title: 'Set added', variant: 'success' });
        } catch (err) {
            console.error(err);
            showToast({ title: 'Failed to add set', variant: 'error' });
        }
    };

    const handleDeleteSet = async (setId: string, blockInstanceId: string) => {
        try {
            const res = await fetch(`/api/train/workout-block-exercise-instances/${setId}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete set');

            // Update state
            setInstance(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    blockInstances: prev.blockInstances?.map(block => {
                        if (block.id !== blockInstanceId) return block;
                        return {
                            ...block,
                            exerciseInstances: block.exerciseInstances?.filter(ex => ex.id !== setId)
                        };
                    })
                };
            });
            showToast({ title: 'Set deleted', variant: 'success' });
        } catch (err) {
            console.error(err);
            showToast({ title: 'Failed to delete set', variant: 'error' });
        }
    };

    const handleSave = async () => {
        if (!instance) return;
        setSaving(true);

        try {
            // 1. Update WorkoutInstance fields (date, duration)
            const instanceUpdates = {
                date: instance.date,
                duration: instance.duration
            };

            await fetch(`/api/train/workout-instances/${instanceId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(instanceUpdates),
            });

            // 2. Update all Sets (Exercise Instances)
            // Collect all sets from all blocks
            const allSets: WorkoutBlockExerciseInstance[] = [];
            instance.blockInstances?.forEach(block => {
                if (block.exerciseInstances) {
                    allSets.push(...block.exerciseInstances);
                }
            });

            await Promise.all(allSets.map(async (set) => {
                const res = await fetch(`/api/train/workout-block-exercise-instances/${set.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        measures: set.measures
                    }),
                });
                if (!res.ok) throw new Error(`Failed to update set ${set.id}`);
            }));

            showToast({ title: 'Workout updated', variant: 'success' });
        } catch (err) {
            console.error(err);
            showToast({ title: 'Update failed', variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (!instance) return <div className="p-8">Workout not found</div>;

    return (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mb-16">
            <div className="flex items-center justify-between">
                <BackToLink href="/log/workouts" pageName="Workout History" />
            </div>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-100 my-2">{instance.workout?.name || 'Untitled Workout'}</h1>
                <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto my-2">
                    {saving ? <Loader2 className="animate-spin" /> : 'Update'}
                </Button>
                <WorkoutInstanceHeader instance={instance} setInstance={setInstance} />
            </div>

            <StatsGrid instance={instance} />

            {/* Blocks */}
            <div className="space-y-6">
                {instance.blockInstances?.map((blockInstance) => (
                    <WorkoutInstanceBlock 
                        key={blockInstance.id} 
                        blockInstance={blockInstance} 
                        handleUpdateSetLocal={handleUpdateSetLocal} 
                        handleAddSet={handleAddSet}
                        handleDeleteSet={handleDeleteSet}
                    />
                ))}
            </div>
        </div>
    );
}
