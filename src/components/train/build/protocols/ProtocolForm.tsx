'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { 
  FormWrapper, FormCard, FormTitle, FormGroup, FormLabel, 
  FormInput, FormTextarea, FormSelect, FormActions 
} from '@/components/ui/Form';
import { Protocol, Workout, Phase } from '@/types/train';
import { Trash, Plus, ChevronUp, ChevronDown } from 'lucide-react';

interface ProtocolFormProps {
    initialData?: Protocol;
    initialPhases?: Phase[];
    isEditing?: boolean;
}

interface PhaseFormData {
    id?: string; // existing phase ID if editing
    name: string;
    purpose: string;
    durationValue: number;
    durationUnit: 'weeks' | 'months';
    daysPerWeek: number;
    includes2ADays: boolean;
    workoutIds: string[];
    order: number;
    notes?: string;
}

export default function ProtocolForm({ initialData, initialPhases = [], isEditing = false }: ProtocolFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  
  // Protocol fields
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [objectives, setObjectives] = useState<string>(initialData?.objectives.join(', ') || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  
  // Phases
  const [phases, setPhases] = useState<PhaseFormData[]>(() => {
    if (initialPhases.length > 0) {
      return initialPhases.map((phase, index) => ({
        id: phase.id,
        name: phase.name,
        purpose: phase.purpose || '',
        durationValue: phase.duration.value,
        durationUnit: phase.duration.unit as 'weeks' | 'months',
        daysPerWeek: phase.daysPerWeek,
        includes2ADays: phase.includes2ADays,
        workoutIds: phase.workoutIds || [],
        order: phase.order,
        notes: phase.notes || '',
      }));
    }
    return [{
      name: '',
      purpose: '',
      durationValue: 4,
      durationUnit: 'weeks' as const,
      daysPerWeek: 3,
      includes2ADays: false,
      workoutIds: [],
      order: 0,
    }];
  });

  useEffect(() => {
    fetch('/api/train/workouts')
      .then(res => res.json())
      .then(data => setWorkouts(data.workouts))
      .catch(err => console.error(err));
  }, []);

  const addPhase = () => {
    const newPhase: PhaseFormData = {
      name: '',
      purpose: '',
      durationValue: 4,
      durationUnit: 'weeks',
      daysPerWeek: 3,
      includes2ADays: false,
      workoutIds: [],
      order: phases.length,
    };
    setPhases([...phases, newPhase]);
  };

  const removePhase = (index: number) => {
    setPhases(phases.filter((_, i) => i !== index).map((p, i) => ({ ...p, order: i })));
  };

  const updatePhase = (index: number, updates: Partial<PhaseFormData>) => {
    const newPhases = [...phases];
    newPhases[index] = { ...newPhases[index], ...updates };
    setPhases(newPhases);
  };

  const movePhase = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === phases.length - 1) return;
    
    const newPhases = [...phases];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newPhases[index], newPhases[targetIndex]] = [newPhases[targetIndex], newPhases[index]];
    // Update order values
    newPhases.forEach((p, i) => { p.order = i; });
    setPhases(newPhases);
  };

  const addWorkoutToPhase = (phaseIndex: number) => {
    if (workouts.length > 0) {
      const newPhases = [...phases];
      newPhases[phaseIndex].workoutIds = [...newPhases[phaseIndex].workoutIds, workouts[0].id];
      setPhases(newPhases);
    }
  };

  const removeWorkoutFromPhase = (phaseIndex: number, workoutIndex: number) => {
    const newPhases = [...phases];
    newPhases[phaseIndex].workoutIds = newPhases[phaseIndex].workoutIds.filter((_, i) => i !== workoutIndex);
    setPhases(newPhases);
  };

  const updateWorkoutInPhase = (phaseIndex: number, workoutIndex: number, workoutId: string) => {
    const newPhases = [...phases];
    newPhases[phaseIndex].workoutIds[workoutIndex] = workoutId;
    setPhases(newPhases);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create or update protocol
      const protocolData = {
        name,
        description: description || undefined,
        objectives: objectives.split(',').map(s => s.trim()).filter(Boolean),
        notes: notes || undefined,
      };

      const url = isEditing && initialData 
        ? `/api/train/protocols/${initialData.id}` 
        : '/api/train/protocols';
      
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(protocolData),
      });

      if (!res.ok) throw new Error('Failed to save protocol');
      
      const { protocol } = await res.json();

      // 2. Get existing phases to determine which to update vs create
      let existingPhases: Phase[] = [];
      if (isEditing) {
        const phasesRes = await fetch(`/api/train/protocols/${protocol.id}/phases`);
        if (phasesRes.ok) {
          const data = await phasesRes.json();
          existingPhases = data.phases || [];
        }
      }

      // 3. Create/update phases
      for (let i = 0; i < phases.length; i++) {
        const phaseData = phases[i];
        const phasePayload = {
          name: phaseData.name,
          purpose: phaseData.purpose || undefined,
          duration: { value: phaseData.durationValue, unit: phaseData.durationUnit },
          daysPerWeek: phaseData.daysPerWeek,
          includes2ADays: phaseData.includes2ADays,
          workoutIds: phaseData.workoutIds,
          order: i,
          notes: phaseData.notes || undefined,
        };

        if (phaseData.id && existingPhases.find(p => p.id === phaseData.id)) {
          // Update existing phase
          await fetch(`/api/train/protocols/${protocol.id}/phases/${phaseData.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(phasePayload),
          });
        } else {
          // Create new phase
          const phaseRes = await fetch(`/api/train/protocols/${protocol.id}/phases`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(phasePayload),
          });
          if (!phaseRes.ok) throw new Error(`Failed to create phase ${i + 1}`);
        }
      }

      // 4. Delete phases that were removed
      const currentPhaseIds = phases.map(p => p.id).filter(Boolean) as string[];
      for (const existingPhase of existingPhases) {
        if (!currentPhaseIds.includes(existingPhase.id)) {
          await fetch(`/api/train/protocols/${protocol.id}/phases/${existingPhase.id}`, {
            method: 'DELETE',
          });
        }
      }

      router.push('/train/build/protocols');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to save protocol');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormWrapper>
        <FormCard>
          <FormTitle>Protocol Details</FormTitle>
          
          <FormGroup>
            <FormLabel>Name</FormLabel>
            <FormInput 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Description</FormLabel>
            <FormTextarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Objectives (comma separated)</FormLabel>
            <FormInput 
              type="text" 
              value={objectives} 
              onChange={e => setObjectives(e.target.value)}
              placeholder="Strength, Hypertrophy, etc."
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Notes</FormLabel>
            <FormTextarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              rows={2}
            />
          </FormGroup>
        </FormCard>

        {/* Phases */}
        <div className="space-y-6">
          {phases.map((phase, phaseIndex) => (
            <FormCard key={phaseIndex}>
              <div className="flex justify-between items-center mb-4">
                <FormTitle>Phase {phaseIndex + 1}</FormTitle>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => movePhase(phaseIndex, 'up')}
                    disabled={phaseIndex === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => movePhase(phaseIndex, 'down')}
                    disabled={phaseIndex === phases.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  {phases.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removePhase(phaseIndex)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-500/10"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <FormGroup>
                <FormLabel>Phase Name</FormLabel>
                <FormInput 
                  value={phase.name} 
                  onChange={e => updatePhase(phaseIndex, { name: e.target.value })}
                  placeholder="e.g., Foundation, Strength, Hypertrophy"
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Purpose</FormLabel>
                <FormTextarea 
                  value={phase.purpose} 
                  onChange={e => updatePhase(phaseIndex, { purpose: e.target.value })}
                  rows={2}
                  placeholder="e.g., establish a rhythm, build strength, hypertrophy"
                />
              </FormGroup>

              <div className="grid grid-cols-2 gap-4">
                <FormGroup>
                  <FormLabel>Duration Value</FormLabel>
                  <FormInput 
                    type="number" 
                    value={phase.durationValue} 
                    onChange={e => updatePhase(phaseIndex, { durationValue: parseInt(e.target.value) || 0 })}
                    min="1"
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Duration Unit</FormLabel>
                  <FormSelect
                    value={phase.durationUnit}
                    onChange={e => updatePhase(phaseIndex, { durationUnit: e.target.value as 'weeks' | 'months' })}
                  >
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </FormSelect>
                </FormGroup>
              </div>

              <FormGroup>
                <FormLabel>Days Per Week</FormLabel>
                <FormInput 
                  type="number" 
                  value={phase.daysPerWeek} 
                  onChange={e => updatePhase(phaseIndex, { daysPerWeek: parseInt(e.target.value) || 0 })}
                  min="1"
                  max="7"
                />
              </FormGroup>

              <FormGroup>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={phase.includes2ADays}
                    onChange={e => updatePhase(phaseIndex, { includes2ADays: e.target.checked })}
                  />
                  <span className="text-sm">Includes 2A Days</span>
                </label>
              </FormGroup>

              <FormGroup>
                <FormLabel>Workouts</FormLabel>
                <p className="text-sm text-muted-foreground mb-2">Add workouts in the order they should be performed in this phase.</p>
                
                <div className="space-y-2">
                  {phase.workoutIds.map((workoutId, workoutIndex) => (
                    <div key={workoutIndex} className="flex gap-2">
                      <FormSelect
                        className="flex-1"
                        value={workoutId}
                        onChange={e => updateWorkoutInPhase(phaseIndex, workoutIndex, e.target.value)}
                      >
                        <option value="">Select workout...</option>
                        {workouts.map(w => (
                          <option key={w.id} value={w.id}>
                            {w.name || `${w.workoutType} Workout`}
                          </option>
                        ))}
                      </FormSelect>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => removeWorkoutFromPhase(phaseIndex, workoutIndex)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-500/10"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => addWorkoutToPhase(phaseIndex)}
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Workout
                </Button>
              </FormGroup>

              <FormGroup>
                <FormLabel>Notes</FormLabel>
                <FormTextarea 
                  value={phase.notes || ''} 
                  onChange={e => updatePhase(phaseIndex, { notes: e.target.value })}
                  rows={2}
                />
              </FormGroup>
            </FormCard>
          ))}
        </div>

        <FormCard>
          <Button 
            type="button" 
            variant="outline" 
            onClick={addPhase}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Phase
          </Button>
        </FormCard>

        <FormActions>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Protocol' : 'Create Protocol'}
          </Button>
        </FormActions>
      </FormWrapper>
    </form>
  );
}
