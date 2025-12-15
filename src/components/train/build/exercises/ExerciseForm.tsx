'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import {
  FormWrapper, FormCard, FormTitle, FormGroup, FormLabel,
  FormInput, FormTextarea, FormSelect, FormActions
} from '@/components/ui/Form';
import { Exercise, WorkPowerConstants } from '@/types/train';
import { MuscleGroupSelect, MUSCLE_GROUPS } from '@/components/anatomy/MuscleGroupSelect';
import { ParentExerciseAutocomplete } from './ParentExerciseAutocomplete';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { defaultWorkPowerConstants, MOVEMENT_PATTERNS, PLANES_OF_MOTION, EQUIPMENT_TYPES, DIFFICULTY_LEVELS } from './options';

type ExerciseFormData = Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>;

interface ExerciseFormProps {
  initialData?: Exercise;
  isEditing?: boolean;
}

export default function ExerciseForm({ initialData, isEditing = false }: ExerciseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ExerciseFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    movementPattern: initialData?.movementPattern || 'other',
    muscleGroups: initialData?.muscleGroups || { primary: '' },
    planeOfMotion: initialData?.planeOfMotion || 'sagittal',
    bilateral: initialData?.bilateral ?? true,
    equipment: initialData?.equipment || [],
    imageUrl: initialData?.imageUrl || '',
    videoUrl: initialData?.videoUrl || '',
    workPowerConstants: initialData?.workPowerConstants || defaultWorkPowerConstants,
    difficulty: initialData?.difficulty || 'beginner',
    parentExerciseId: initialData?.parentExerciseId || undefined,
  });

  // Initialize defaults
  useEffect(() => {
    // Set default primary muscle group if none selected
    if (!formData.muscleGroups.primary && MUSCLE_GROUPS.length > 0) {
      setFormData(prev => ({
        ...prev,
        muscleGroups: { ...prev.muscleGroups, primary: MUSCLE_GROUPS[0] }
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEquipmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValues = Array.from(e.target.selectedOptions).map(
      (option) => option.value as NonNullable<Exercise['equipment']>[number],
    );

    setFormData(prev => ({
      ...prev,
      equipment: selectedValues,
    }));
  };

  const applyParentExercise = (parentExercise: Exercise | null, parentId: string | undefined) => {
    setFormData(prev => {
      const updates: Partial<ExerciseFormData> = {
        parentExerciseId: parentId,
      };

      if (parentExercise) {
        updates.muscleGroups = { ...parentExercise.muscleGroups };
        updates.workPowerConstants = {
          ...parentExercise.workPowerConstants,
          defaultDistance: { ...parentExercise.workPowerConstants.defaultDistance },
        };
        if (parentExercise.movementPattern) {
          updates.movementPattern = parentExercise.movementPattern;
        }
        if (parentExercise.planeOfMotion) {
          updates.planeOfMotion = parentExercise.planeOfMotion;
        }
        if (parentExercise.equipment) {
          updates.equipment = [...parentExercise.equipment];
        }
        if (parentExercise.difficulty) {
          updates.difficulty = parentExercise.difficulty;
        }
        if (typeof parentExercise.bilateral === 'boolean') {
          updates.bilateral = parentExercise.bilateral;
        }
      }

      return {
        ...prev,
        ...updates,
      };
    });
  };

  const handleMuscleGroupChange = (level: 'primary' | 'secondary' | 'tertiary', value: string) => {
    setFormData(prev => ({
      ...prev,
      muscleGroups: {
        ...prev.muscleGroups,
        [level]: value || undefined,
      },
    }));
  };

  const handleConstantChange = (field: keyof WorkPowerConstants, value: any) => {
    setFormData(prev => ({
      ...prev,
      workPowerConstants: {
        ...prev.workPowerConstants,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEditing && initialData
        ? `/api/train/exercises/${initialData.id}`
        : '/api/train/exercises';

      const method = isEditing ? 'PATCH' : 'POST';

      const submissionData = {
        ...formData,
        parentExerciseId: formData.parentExerciseId || undefined
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save exercise');
      }

      router.push('/train/build/exercises');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Link
        href="/train/build/exercises"
        className="inline-flex items-center gap-1 mb-4 text-muted-foreground hover:text-foreground text-xs"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Exercises
      </Link>
      <FormWrapper>
        <FormCard>
          <FormTitle>{isEditing ? 'Edit Exercise' : 'New Exercise'}</FormTitle>

          {error && (
            <div className="bg-red-500/10 p-3 border border-red-500/20 rounded-md text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="gap-4 grid grid-cols-1">
            <FormGroup>
              <FormLabel>Name</FormLabel>
              <FormInput
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Parent Exercise (Optional)</FormLabel>
              <ParentExerciseAutocomplete
                initialParentId={initialData?.parentExerciseId}
                currentExerciseId={isEditing ? initialData?.id : undefined}
                onChange={(exercise) => {
                  if (!exercise) {
                    applyParentExercise(null, undefined);
                  } else {
                    applyParentExercise(exercise, exercise.id);
                  }
                }}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Description</FormLabel>
              <FormTextarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </FormGroup>
          </div>

          {/* Classification */}
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <FormGroup>
              <FormLabel>Movement Pattern</FormLabel>
              <FormSelect
                name="movementPattern"
                value={formData.movementPattern}
                onChange={handleChange}
              >
                {MOVEMENT_PATTERNS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </FormSelect>
            </FormGroup>

            <FormGroup>
              <FormLabel>Plane of Motion</FormLabel>
              <FormSelect
                name="planeOfMotion"
                value={formData.planeOfMotion}
                onChange={handleChange}
              >
                {PLANES_OF_MOTION.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </FormSelect>
            </FormGroup>

            <FormGroup>
              <FormLabel>Equipment (select one or more)</FormLabel>
              <FormSelect
                name="equipment"
                multiple
                value={formData.equipment || []}
                onChange={handleEquipmentChange}
                className="min-h-[140px]"
              >
                {EQUIPMENT_TYPES.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </FormSelect>
            </FormGroup>

            <FormGroup>
              <FormLabel>Difficulty</FormLabel>
              <FormSelect
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
              >
                {DIFFICULTY_LEVELS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </FormSelect>
            </FormGroup>
          </div>

          {/* Bilateral / Unilateral toggle */}
          <div className="flex flex-col items-center space-y-2 w-full">
            <FormLabel>Bilateral / Unilateral</FormLabel>
            <div className="inline-flex relative bg-muted p-1 rounded-full w-full max-w-xs cursor-pointer">
              {/* Sliding pill */}
              <div
                className="top-1 bottom-1 left-1 absolute bg-brand-primary shadow-sm rounded-full w-1/2 transition-transform duration-200 ease-out cursor-pointer"
                style={{
                  transform: formData.bilateral ? 'translateX(0%)' : 'translateX(95%)',
                }}
              />
              {/* Labels */}
              <button
                type="button"
                onClick={() =>
                  setFormData(prev => ({ ...prev, bilateral: true }))
                }
                className={`relative z-10 flex-1 px-4 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer ${formData.bilateral
                    ? 'text-white'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Bilateral
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData(prev => ({ ...prev, bilateral: false }))
                }
                className={`relative z-10 flex-1 px-4 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer ${!formData.bilateral
                    ? 'text-white'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Unilateral
              </button>
            </div>
          </div>

          {/* Muscle Groups */}
          <div className="space-y-3 bg-background/50 p-4 border border-border rounded-md">
            <h3 className="font-semibold text-foreground text-sm">Muscle Groups</h3>

            <FormGroup>
              <FormLabel>Primary</FormLabel>
              <MuscleGroupSelect
                value={formData.muscleGroups.primary}
                onChange={(e) => handleMuscleGroupChange('primary', e.target.value)}
                required
              />
            </FormGroup>

            <div className="gap-4 grid grid-cols-2">
              <FormGroup>
                <FormLabel>Secondary </FormLabel>
                <MuscleGroupSelect
                  value={formData.muscleGroups.secondary || ''}
                  onChange={(e) => handleMuscleGroupChange('secondary', e.target.value)}
                  placeholder="None"
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Tertiary</FormLabel>
                <MuscleGroupSelect
                  value={formData.muscleGroups.tertiary || ''}
                  onChange={(e) => handleMuscleGroupChange('tertiary', e.target.value)}
                  placeholder="None"
                />
              </FormGroup>
            </div>
          </div>

          {/* Media */}
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <FormGroup>
              <FormLabel>Image URL</FormLabel>
              <FormInput
                type="url"
                name="imageUrl"
                value={formData.imageUrl || ''}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>Video URL</FormLabel>
              <FormInput
                type="url"
                name="videoUrl"
                value={formData.videoUrl || ''}
                onChange={handleChange}
              />
            </FormGroup>
          </div>

          {/* Work / Power Constants */}
          <div className="space-y-3 bg-background/50 p-4 border border-border rounded-md">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-foreground text-sm">Work/Power Factors</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useCalories"
                  checked={formData.workPowerConstants.useCalories}
                  onChange={(e) => handleConstantChange('useCalories', e.target.checked)}
                  className="bg-input border-input rounded focus:ring-brand-primary w-4 h-4 text-brand-primary"
                />
                <label htmlFor="useCalories" className="text-muted-foreground text-xs">Use Calories</label>
              </div>
            </div>

            <div className="gap-4 grid grid-cols-3">
              <FormGroup>
                <FormLabel className="text-xs">Bodyweight (0-1)</FormLabel>
                <FormInput
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={formData.workPowerConstants.bodyweightFactor}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleConstantChange('bodyweightFactor', isNaN(val) ? 0 : val);
                  }}
                  className="px-2 py-1"
                />
              </FormGroup>
              <FormGroup>
                <FormLabel className="text-xs">Arm Length (-1 to 1)</FormLabel>
                <FormInput
                  type="number"
                  step="0.1"
                  min="-1"
                  max="1"
                  value={formData.workPowerConstants.armLengthFactor}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleConstantChange('armLengthFactor', isNaN(val) ? 0 : val);
                  }}
                  className="px-2 py-1"
                />
              </FormGroup>
              <FormGroup>
                <FormLabel className="text-xs">Leg Length (-1 to 1)</FormLabel>
                <FormInput
                  type="number"
                  step="0.1"
                  min="-1"
                  max="1"
                  value={formData.workPowerConstants.legLengthFactor}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleConstantChange('legLengthFactor', isNaN(val) ? 0 : val);
                  }}
                  className="px-2 py-1"
                />
              </FormGroup>
            </div>

            <FormGroup>
              <FormLabel className="text-xs">Default Distance</FormLabel>
              <div className="flex gap-2">
                <FormInput
                  type="number"
                  className="px-2 py-1 w-full"
                  value={formData.workPowerConstants.defaultDistance.value}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleConstantChange('defaultDistance', {
                      ...formData.workPowerConstants.defaultDistance,
                      value: isNaN(val) ? 0 : val,
                    });
                  }}
                />
                <FormSelect
                  value={formData.workPowerConstants.defaultDistance.unit}
                  onChange={(e) =>
                    handleConstantChange('defaultDistance', {
                      ...formData.workPowerConstants.defaultDistance,
                      unit: e.target.value,
                    })
                  }
                  className="w-24"
                >
                  <option value="m">m</option>
                  <option value="km">km</option>
                  <option value="ft">ft</option>
                  <option value="mi">mi</option>
                </FormSelect>
              </div>
            </FormGroup>

          </div>

          <FormActions>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-[188px]!">
              {loading ? 'Saving...' : isEditing ? 'Update Exercise' : 'Create Exercise'}
            </Button>
          </FormActions>
        </FormCard>
      </FormWrapper>
    </form>
  );
}
