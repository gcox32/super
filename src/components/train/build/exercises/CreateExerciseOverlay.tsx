'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ExerciseFormData } from './types';
import { defaultWorkPowerConstants } from './options';
import { MUSCLE_GROUPS } from '@/components/anatomy/MuscleGroupSelect';
import { ExerciseFormFields } from './ExerciseFormFields';
import { Exercise } from '@/types/train';

interface CreateExerciseOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newExercise: Exercise) => void;
}

export function CreateExerciseOverlay({ isOpen, onClose, onSuccess }: CreateExerciseOverlayProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const [formData, setFormData] = useState<ExerciseFormData>({
    name: '',
    description: '',
    movementPattern: 'other',
    muscleGroups: { primary: '' },
    planeOfMotion: 'sagittal',
    bilateral: true,
    equipment: [],
    imageUrl: '',
    videoUrl: '',
    workPowerConstants: defaultWorkPowerConstants,
    difficulty: 'beginner',
    parentExerciseId: undefined,
  });

  // Initialize defaults when opening
  useEffect(() => {
    if (isOpen) {
        // Reset form when opening
        setFormData({
            name: '',
            description: '',
            movementPattern: 'other',
            muscleGroups: { primary: MUSCLE_GROUPS.length > 0 ? MUSCLE_GROUPS[0] : '' },
            planeOfMotion: 'sagittal',
            bilateral: true,
            equipment: [],
            imageUrl: '',
            videoUrl: '',
            workPowerConstants: defaultWorkPowerConstants,
            difficulty: 'beginner',
            parentExerciseId: undefined,
        });
        setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event bubbling to parent forms (WorkoutForm)
    setLoading(true);
    setError(null);

    try {
      const submissionData = {
        ...formData,
        parentExerciseId: formData.parentExerciseId || undefined
      };

      const res = await fetch('/api/train/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create exercise');
      }

      const { exercise } = await res.json();
      onSuccess(exercise);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-lg w-full max-w-3xl shadow-xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-xl font-bold">Create New Exercise</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-hover rounded-lg transition-colors"
            type="button"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
            {error && (
            <div className="bg-red-500/10 mb-4 p-3 border border-red-500/20 rounded-md text-red-500 text-sm">
                {error}
            </div>
            )}

            <form id="create-exercise-form" onSubmit={handleSubmit}>
                <ExerciseFormFields
                    formData={formData}
                    setFormData={setFormData}
                />
            </form>
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-3 bg-card/95 backdrop-blur rounded-b-lg">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-exercise-form"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Exercise'}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
