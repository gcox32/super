'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { WorkoutInstance, WorkoutBlockExerciseInstance } from '@/types/train';
import BackToLink from '@/components/layout/navigation/BackToLink';
import { Loader2, Trash } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import StatsGrid from '@/components/log/workouts/instance/StatsGrid';
import Button from '@/components/ui/Button';
import WorkoutInstanceHeader from '@/components/log/workouts/instance/Header';
import WorkoutInstanceBlock from '@/components/log/workouts/instance/Block';
import { fetchJson } from '@/lib/train/helpers';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

export default function WorkoutInstanceDetailPage() {
    const { instanceId } = useParams();
    const [instance, setInstance] = useState<WorkoutInstance | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [workoutInstanceToDelete, setWorkoutInstanceToDelete] = useState<WorkoutInstance | null>(null);

    const handleDeleteClick = (e: React.MouseEvent, workoutInstance: WorkoutInstance) => {
        e.preventDefault();
        e.stopPropagation();
        setWorkoutInstanceToDelete(workoutInstance);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!workoutInstanceToDelete || !workoutInstanceToDelete.workoutId) return;
        try {
            await fetchJson(`/api/train/workouts/${workoutInstanceToDelete.workoutId}/instances/${workoutInstanceToDelete.id}`, {
                method: 'DELETE',
            });
        } catch (err) {
            console.error('Failed to delete workout instance', err);
        }
    };

    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false);
        setWorkoutInstanceToDelete(null);
    };

    useEffect(() => {
        async function fetchInstance() {
            try {
                const res = await fetch(`/api/train/workouts/instances/${instanceId}`);
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

        if (!instance.workoutId) {
            showToast({ title: 'Workout instance missing workoutId', variant: 'error' });
            return;
        }
        
        // Find block and exercise to get their IDs
        const blockInstance = instance.blockInstances?.find(b => b.id === blockInstanceId);
        if (!blockInstance?.workoutBlock?.id) {
            showToast({ title: 'Block not found', variant: 'error' });
            return;
        }
        
        try {
            const res = await fetch(`/api/train/workouts/${instance.workoutId}/blocks/${blockInstance.workoutBlock.id}/exercises/${exerciseId}/instances`, {
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
        if (!instance?.workoutId) {
            showToast({ title: 'Workout instance missing workoutId', variant: 'error' });
            return;
        }
        
        // Find block and exercise to get their IDs
        const blockInstance = instance.blockInstances?.find(b => b.id === blockInstanceId);
        if (!blockInstance?.workoutBlock?.id) {
            showToast({ title: 'Block not found', variant: 'error' });
            return;
        }
        const exercise = blockInstance.exerciseInstances?.find(e => e.id === setId);
        if (!exercise?.workoutBlockExerciseId) {
            showToast({ title: 'Exercise not found', variant: 'error' });
            return;
        }
        
        try {
            const res = await fetch(`/api/train/workouts/${instance.workoutId}/blocks/${blockInstance.workoutBlock.id}/exercises/${exercise.workoutBlockExerciseId}/instances/${setId}`, {
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

            if (!instance.workoutId) throw new Error('Workout instance missing workoutId');
            await fetch(`/api/train/workouts/${instance.workoutId}/instances/${instanceId}`, {
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

            if (!instance.workoutId) throw new Error('Workout instance missing workoutId');
            await Promise.all(allSets.map(async (set) => {
                // Need to find blockId and exerciseId from the set
                const blockInstance = instance.blockInstances?.find(b => 
                    b.exerciseInstances?.some(e => e.id === set.id)
                );
                if (!blockInstance?.workoutBlock?.id) throw new Error(`Block not found for set ${set.id}`);
                const exercise = blockInstance.exerciseInstances?.find(e => e.id === set.id);
                if (!exercise?.workoutBlockExerciseId) throw new Error(`Exercise not found for set ${set.id}`);
                
                const res = await fetch(`/api/train/workouts/${instance.workoutId}/blocks/${blockInstance.workoutBlock.id}/exercises/${exercise.workoutBlockExerciseId}/instances/${set.id}`, {
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
        <div className="mx-auto mb-16 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
            <div className="flex justify-between items-center">
                <BackToLink href="/log/workouts" pageName="Workout History" />
            </div>

            {/* Header */}
            <div className="mb-6">
                <h1 className="my-2 font-bold text-gray-100 text-3xl">{instance.workout?.name || 'Untitled Workout'}</h1>
                <Button onClick={handleSave} disabled={saving} className="my-2 w-full sm:w-auto">
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
            <Button
                onClick={(e) => handleDeleteClick(e, instance)}
                variant="danger"
                disabled={saving}
                className="my-4 w-full sm:w-auto font-weight-light"
            >
                <Trash className="mr-1 w-4 h-4" />
                Delete
            </Button>
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                title="Delete Workout Instance"
                message={`Are you sure you want to delete this workout instance? This action cannot be undone.`}
            />
        </div>
    );
}
