'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { WorkoutInstance } from '@/types/train';
import { FormTextarea, FormLabel } from '@/components/ui/Form';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import BackToLink from '@/components/layout/navigation/BackToLink';
import Button from '@/components/ui/Button';

export default function WorkoutNotesPage() {
  const { instanceId } = useParams();
  const [instance, setInstance] = useState<WorkoutInstance | null>(null);
  const [notes, setNotes] = useState('');
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
          setNotes(data.workoutInstance.notes ?? '');
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

  const handleSave = async () => {
    if (!instance) return;
    setSaving(true);
    
    try {
      const res = await fetch(`/api/train/workout-instances/${instanceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (!res.ok) {
        throw new Error('Failed to update');
      }
      
      showToast({ title: 'Notes updated', variant: 'success' });
      setInstance(prev => prev ? { ...prev, notes } : null);
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
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl mb-20">
      <div className="mb-6">
        <BackToLink href={`/log/workouts/${instanceId}`} pageName="Workout" />
        <div className="flex justify-between items-start mt-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-100 my-2">{instance.workout?.name ?? 'Workout'}</h1>
                <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto my-2">
                    {saving ? <Loader2 className="animate-spin" /> : 'Update'}
                </Button>
                <div className="text-sm text-gray-400 mt-2">
                    {new Date(instance.date).toLocaleDateString()}
                </div>
            </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
            <FormLabel className="mb-2">General Notes</FormLabel>
            <FormTextarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did the workout feel overall? Energy levels, nutrition, sleep, etc."
                className="min-h-[200px]"
            />
        </div>
      </div>
    </div>
  );
}
