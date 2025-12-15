'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { 
  FormWrapper, FormCard, FormTitle, FormGroup, FormLabel, 
  FormInput, FormTextarea, FormSelect, FormError, FormActions 
} from '@/components/ui/Form';
import { Exercise, WorkPowerConstants } from '@/types/train';
import { MuscleGroupSelect, MUSCLE_GROUPS } from '@/components/anatomy/MuscleGroupSelect';

type ExerciseFormData = Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>;

interface ExerciseFormProps {
  initialData?: Exercise;
  isEditing?: boolean;
}

const defaultWorkPowerConstants: WorkPowerConstants = {
  useCalories: false,
  defaultDistance: { value: 0, unit: 'm' },
  armLengthFactor: 0,
  legLengthFactor: 0,
  bodyweightFactor: 1,
};

const MOVEMENT_PATTERNS = [
  'upper push', 'upper pull', 'squat', 'hinge', 'lunge', 'hip thrust',
  'isometric', 'locomotion', 'hip flexion', 'plyometric', 'other'
] as const;

const PLANES_OF_MOTION = ['sagittal', 'frontal', 'transverse'] as const;

const EQUIPMENT_TYPES = [
  'barbell', 'dumbbell', 'kettlebell', 'machine', 'bodyweight', 'variable', 'other'
] as const;

const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export default function ExerciseForm({ initialData, isEditing = false }: ExerciseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const [formData, setFormData] = useState<ExerciseFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    movementPattern: initialData?.movementPattern || 'other',
    muscleGroups: initialData?.muscleGroups || { primary: '' },
    planeOfMotion: initialData?.planeOfMotion || 'sagittal',
    bilateral: initialData?.bilateral ?? true,
    equipment: initialData?.equipment || 'other',
    imageUrl: initialData?.imageUrl || '',
    videoUrl: initialData?.videoUrl || '',
    workPowerConstants: initialData?.workPowerConstants || defaultWorkPowerConstants,
    difficulty: initialData?.difficulty || 'beginner',
    parentExerciseId: initialData?.parentExerciseId || undefined,
  });

  useEffect(() => {
    // Set default primary muscle group if none selected
    if (!formData.muscleGroups.primary && MUSCLE_GROUPS.length > 0) {
      setFormData(prev => ({
        ...prev,
        muscleGroups: { ...prev.muscleGroups, primary: MUSCLE_GROUPS[0] }
      }));
    }

    async function fetchExercises() {
      try {
        const res = await fetch('/api/train/exercises');
        if (res.ok) {
          const data = await res.json();
          const otherExercises = isEditing && initialData 
            ? data.exercises.filter((ex: Exercise) => ex.id !== initialData.id)
            : data.exercises;
          setExercises(otherExercises);
        }
      } catch (err) {
        console.error('Failed to fetch exercises', err);
      }
    }
    
    fetchExercises();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const parentId = e.target.value;
    const parentExercise = exercises.find(ex => ex.id === parentId);

    setFormData(prev => {
      const updates: Partial<ExerciseFormData> = {
        parentExerciseId: parentId || undefined
      };

      if (parentExercise) {
        updates.muscleGroups = { ...parentExercise.muscleGroups };
        updates.workPowerConstants = {
          ...parentExercise.workPowerConstants,
          defaultDistance: { ...parentExercise.workPowerConstants.defaultDistance }
        };
        if (parentExercise.movementPattern) {
          updates.movementPattern = parentExercise.movementPattern;
        }
      }

      return {
        ...prev,
        ...updates
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
      <FormWrapper>
        <FormCard>
          <FormTitle>{isEditing ? 'Edit Exercise' : 'New Exercise'}</FormTitle>
          
          {error && (
            <div className="bg-red-500/10 text-red-500 p-3 rounded-md text-sm border border-red-500/20">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-4">
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
              <FormSelect
                name="parentExerciseId"
                value={formData.parentExerciseId || ''}
                onChange={handleParentChange}
              >
                <option value="">None</option>
                {exercises.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </FormSelect>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <FormLabel>Equipment</FormLabel>
              <FormSelect
                name="equipment"
                value={formData.equipment}
                onChange={handleChange}
              >
                {EQUIPMENT_TYPES.map(e => (
                  <option key={e} value={e}>{e}</option>
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

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="bilateral"
              name="bilateral"
              checked={formData.bilateral}
              onChange={handleChange}
              className="h-4 w-4 rounded border-input bg-input text-brand-primary focus:ring-brand-primary"
            />
            <label htmlFor="bilateral" className="text-sm font-medium text-muted-foreground">Bilateral Movement</label>
          </div>

          {/* Muscle Groups */}
          <div className="space-y-3 p-4 bg-background/50 rounded-md border border-border">
            <h3 className="text-sm font-semibold text-foreground">Muscle Groups</h3>
            
            <FormGroup>
              <FormLabel>Primary</FormLabel>
              <MuscleGroupSelect
                value={formData.muscleGroups.primary}
                onChange={(e) => handleMuscleGroupChange('primary', e.target.value)}
                required
              />
            </FormGroup>

            <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="space-y-3 p-4 bg-background/50 rounded-md border border-border">
            <div className="flex justify-between items-center">
               <h3 className="text-sm font-semibold text-foreground">Work/Power Factors</h3>
               <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useCalories"
                    checked={formData.workPowerConstants.useCalories}
                    onChange={(e) => handleConstantChange('useCalories', e.target.checked)}
                    className="h-4 w-4 rounded border-input bg-input text-brand-primary focus:ring-brand-primary"
                  />
                  <label htmlFor="useCalories" className="text-xs text-muted-foreground">Use Calories</label>
               </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
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
