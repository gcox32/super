import React, { useState } from 'react';
import { UserGoalComponent, GoalComponentType, GoalComponentConditional, GoalComponentValue, TapeMeasurement, UserGoalCriteria } from '@/types/user';
import { FormGroup, FormLabel, FormInput, FormTextarea, FormSelect } from '@/components/ui/Form';
import Button from '@/components/ui/Button';
import { TogglePill } from '@/components/ui/TogglePill';
import { NumberInput } from '@/components/ui/NumberInput';
import { Plus, X, GripVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WeightMeasurement, HeightMeasurement, PercentageMeasurement, DistanceMeasurement, TimeMeasurement, RepetitionsMeasurement } from '@/types/measures';
import { ExerciseAutocomplete } from '@/components/train/build/exercises/ExerciseAutocomplete';
import { Exercise } from '@/types/train';

interface GoalComponentsSectionProps {
    components: UserGoalComponent[];
    onChange: (components: UserGoalComponent[]) => void;
}

const TAPE_SITES: Array<{ label: string; value: keyof Omit<TapeMeasurement, 'id'> }> = [
    { label: 'Neck', value: 'neck' },
    { label: 'Shoulders', value: 'shoulders' },
    { label: 'Chest', value: 'chest' },
    { label: 'Waist', value: 'waist' },
    { label: 'Hips', value: 'hips' },
    { label: 'Left Arm', value: 'leftArm' },
    { label: 'Right Arm', value: 'rightArm' },
    { label: 'Left Forearm', value: 'leftForearm' },
    { label: 'Right Forearm', value: 'rightForearm' },
    { label: 'Left Leg', value: 'leftLeg' },
    { label: 'Right Leg', value: 'rightLeg' },
    { label: 'Left Calf', value: 'leftCalf' },
    { label: 'Right Calf', value: 'rightCalf' },
];

export function GoalComponentsSection({ components, onChange }: GoalComponentsSectionProps) {
    const [expandedComponents, setExpandedComponents] = useState<Set<string>>(
        new Set(components.map(c => c.id))
    );

    const addComponent = () => {
        const newComponent: UserGoalComponent = {
            id: `temp-${Date.now()}-${Math.random()}`,
            name: '',
            description: '',
            priority: components.length + 1,
            complete: false,
            notes: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            criteria: [], // Initialize with empty criteria
        };
        onChange([...components, newComponent]);
        setExpandedComponents(prev => new Set([...prev, newComponent.id]));
    };

    const removeComponent = (id: string) => {
        onChange(components.filter(c => c.id !== id));
        setExpandedComponents(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    const updateComponent = (id: string, updates: Partial<UserGoalComponent>) => {
        onChange(
            components.map(c =>
                c.id === id
                    ? { ...c, ...updates, updatedAt: new Date() }
                    : c
            )
        );
    };

    const addCriteria = (componentId: string) => {
        const component = components.find(c => c.id === componentId);
        if (!component) return;

        const newCriteria: UserGoalCriteria = {
            id: `crit-${Date.now()}-${Math.random()}`,
            conditional: 'greater than',
            value: '',
            type: component.type, // Default to component type, but can be changed
        };
        // Auto-set initial site if available in parent type for new criteria
        if (component.type === 'tape' && newCriteria.type === 'tape') {
             // We don't have a default site logic here yet, user must select
        }

        const updatedCriteria = [...(component.criteria || []), newCriteria];
        updateComponent(componentId, { criteria: updatedCriteria });
    };

    const updateCriteria = (componentId: string, criteriaId: string, updates: Partial<UserGoalCriteria>) => {
        const component = components.find(c => c.id === componentId);
        if (!component) return;

        const updatedCriteria = (component.criteria || []).map(c =>
            c.id === criteriaId ? { ...c, ...updates } : c
        );
        updateComponent(componentId, { criteria: updatedCriteria });
    };

    const removeCriteria = (componentId: string, criteriaId: string) => {
        const component = components.find(c => c.id === componentId);
        if (!component) return;

        const updatedCriteria = (component.criteria || []).filter(c => c.id !== criteriaId);
        updateComponent(componentId, { criteria: updatedCriteria });
    };

    const toggleExpanded = (id: string) => {
        setExpandedComponents(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    // Sort components by priority
    const sortedComponents = [...components].sort((a, b) => a.priority - b.priority);

    const completedCount = components.filter(c => c.complete).length;
    const totalCount = components.length;
    const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <FormGroup>
            <div className="flex justify-between items-center mb-2">
                <FormLabel>Goal Components</FormLabel>
                {totalCount > 0 && (
                    <span className="text-muted-foreground text-xs">
                        {completedCount}/{totalCount} complete ({progressPercentage}%)
                    </span>
                )}
            </div>

            {components.length === 0 ? (
                <div className="p-4 border border-border border-dashed rounded-lg text-center">
                    <p className="mb-3 text-muted-foreground text-sm">
                        Add components to break down your goal into trackable elements
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addComponent}
                        className="w-full"
                    >
                        <Plus className="mr-2 w-4 h-4" />
                        Add Component
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {sortedComponents.map((component, index) => {
                        const isExpanded = expandedComponents.has(component.id);
                        return (
                            <div
                                key={component.id}
                                className={cn(
                                    "border border-border rounded-lg overflow-hidden transition-all",
                                    component.complete && "bg-muted/30"
                                )}
                            >
                                {!isExpanded ? (
                                    <button
                                        type="button"
                                        onClick={() => toggleExpanded(component.id)}
                                        className="flex justify-between items-center hover:bg-hover p-3 w-full transition-colors"
                                    >
                                        <div className="flex flex-1 items-center gap-3">
                                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium text-sm">
                                                {component.name || `Component ${index + 1}`}
                                            </span>
                                            {component.complete && (
                                                <span className="bg-brand-primary/20 px-2 py-0.5 rounded text-brand-primary text-xs">
                                                    Complete
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-muted-foreground text-xs">
                                            Prio: {component.priority}
                                        </span>
                                    </button>
                                ) : (
                                    <div className="space-y-4 bg-card p-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <GripVertical className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium text-muted-foreground text-sm">
                                                    Component {index + 1}
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeComponent(component.id)}
                                                className="hover:bg-red-50 text-red-600 hover:text-red-700"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <FormGroup>
                                            <FormLabel htmlFor={`component-name-${component.id}`}>
                                                Component Name *
                                            </FormLabel>
                                            <FormInput
                                                id={`component-name-${component.id}`}
                                                value={component.name}
                                                onChange={(e) =>
                                                    updateComponent(component.id, { name: e.target.value })
                                                }
                                                placeholder="e.g. Lose 2kg per month"
                                                required
                                            />
                                        </FormGroup>

                                        <FormGroup>
                                            <FormLabel htmlFor={`component-description-${component.id}`}>
                                                Description
                                            </FormLabel>
                                            <FormTextarea
                                                id={`component-description-${component.id}`}
                                                value={component.description || ''}
                                                onChange={(e) =>
                                                    updateComponent(component.id, {
                                                        description: e.target.value,
                                                    })
                                                }
                                                placeholder="Describe this component..."
                                                rows={2}
                                            />
                                        </FormGroup>

                                        <FormGroup>
                                            <FormLabel htmlFor={`component-type-${component.id}`}>
                                                Main Type
                                            </FormLabel>
                                            <FormSelect
                                                id={`component-type-${component.id}`}
                                                value={component.type || ''}
                                                onChange={(e) => {
                                                    const newType = e.target.value as GoalComponentType | '';
                                                    updateComponent(component.id, { 
                                                        type: newType || undefined,
                                                        // Clear value when type changes to avoid type mismatches
                                                        exerciseId: undefined,
                                                        // Ensure legacy fields are cleared or ignored
                                                        criteria: [] // Reset criteria on type change? Maybe safer.
                                                    });
                                                }}
                                            >
                                                <option value="">Select type...</option>
                                                <option value="bodyweight">Body Weight</option>
                                                <option value="bodycomposition">Body Composition</option>
                                                <option value="tape">Tape Measurement</option>
                                                <option value="strength">Strength</option>
                                                <option value="time">Time</option>
                                                <option value="repetitions">Repetitions</option>
                                                <option value="skill">Skill</option>
                                                <option value="other">Other</option>
                                            </FormSelect>
                                        </FormGroup>

                                        {(component.type === 'strength' || component.type === 'time' || component.type === 'repetitions') && (
                                            <FormGroup>
                                                <FormLabel>Exercise</FormLabel>
                                                <ExerciseAutocomplete
                                                    initialExerciseId={component.exerciseId}
                                                    onChange={(exercise) => updateComponent(component.id, { exerciseId: exercise?.id })}
                                                />
                                            </FormGroup>
                                        )}

                                        {/* Criteria Section - Now the only place for conditions */}
                                        {component.type && component.type !== 'skill' && component.type !== 'other' && (
                                            <div className="space-y-4 border-t border-border pt-4 mt-2">
                                                <div className="flex justify-between items-center">
                                                    <FormLabel className="mb-0">Success Criteria</FormLabel>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => addCriteria(component.id)}
                                                        className="h-8 text-xs"
                                                    >
                                                        <Plus className="mr-1 w-3 h-3" />
                                                        Add Condition
                                                    </Button>
                                                </div>

                                                {(component.criteria?.length === 0) && (
                                                    <p className="text-muted-foreground text-sm italic">
                                                        Add at least one condition for success (e.g. Weight {'>'} 80kg)
                                                    </p>
                                                )}

                                                {/* Multiple Criteria List */}
                                                {component.criteria?.map((criteria, idx) => (
                                                    <div key={criteria.id} className="p-3 bg-muted/20 rounded-md border border-border/50 relative group">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeCriteria(component.id, criteria.id)}
                                                            className="absolute top-2 right-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        
                                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                                            <div className="col-span-12 md:col-span-3">
                                                                 <FormLabel className="text-xs mb-1">Type</FormLabel>
                                                                 <FormSelect
                                                                    value={criteria.type || component.type || ''}
                                                                    onChange={(e) => updateCriteria(component.id, criteria.id, { type: e.target.value as GoalComponentType })}
                                                                 >
                                                                    <option value="bodyweight">Body Weight</option>
                                                                    <option value="bodycomposition">Body Comp</option>
                                                                    <option value="tape">Tape</option>
                                                                    <option value="strength">Strength</option>
                                                                    <option value="time">Time</option>
                                                                    <option value="repetitions">Repetitions</option>
                                                                 </FormSelect>
                                                            </div>

                                                            {/* Tape Site Selector if Type is Tape */}
                                                            {(criteria.type === 'tape' || (!criteria.type && component.type === 'tape')) && (
                                                                <div className="col-span-12 md:col-span-3">
                                                                    <FormLabel className="text-xs mb-1">Site</FormLabel>
                                                                    <FormSelect
                                                                        value={criteria.measurementSite || ''}
                                                                        onChange={(e) => updateCriteria(component.id, criteria.id, { 
                                                                            measurementSite: e.target.value as keyof Omit<TapeMeasurement, 'id'> 
                                                                        })}
                                                                    >
                                                                        <option value="">Select...</option>
                                                                        {TAPE_SITES.map(site => (
                                                                            <option key={site.value} value={site.value}>
                                                                                {site.label}
                                                                            </option>
                                                                        ))}
                                                                    </FormSelect>
                                                                </div>
                                                            )}

                                                            <div className={cn("col-span-12", (criteria.type === 'tape' || (!criteria.type && component.type === 'tape')) ? "md:col-span-3" : "md:col-span-4")}>
                                                                <FormLabel className="text-xs mb-1">Condition</FormLabel>
                                                                <FormSelect
                                                                    value={criteria.conditional}
                                                                    onChange={(e) => updateCriteria(component.id, criteria.id, { conditional: e.target.value as GoalComponentConditional })}
                                                                >
                                                                    <option value="equals">Equals</option>
                                                                    <option value="greater than">{'>'}</option>
                                                                    <option value="less than">{'<'}</option>
                                                                    <option value="greater than or equal to">{'>='}</option>
                                                                    <option value="less than or equal to">{'<='}</option>
                                                                </FormSelect>
                                                            </div>
                                                            <div className={cn("col-span-12", (criteria.type === 'tape' || (!criteria.type && component.type === 'tape')) ? "md:col-span-3" : "md:col-span-5")}>
                                                                <div className="flex flex-col gap-2">
                                                                    <div>
                                                                        <FormLabel className="text-xs mb-1">Target</FormLabel>
                                                                        {renderValueInput(criteria.type || component.type || 'other', criteria.value, (value) => 
                                                                            updateCriteria(component.id, criteria.id, { value })
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <FormLabel className="text-xs mb-1 text-muted-foreground">Start (Optional)</FormLabel>
                                                                        {renderValueInput(criteria.type || component.type || 'other', criteria.initialValue, (value) => 
                                                                            updateCriteria(component.id, criteria.id, { initialValue: value })
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-border">
                                            <FormGroup className="flex flex-row justify-end items-center gap-4 w-full">
                                                <FormLabel htmlFor={`component-priority-${component.id}`}>
                                                    Priority
                                                </FormLabel>
                                                <NumberInput
                                                    id={`component-priority-${component.id}`}
                                                    value={component.priority}
                                                    className="w-16"
                                                    onValueChange={(value) =>
                                                        updateComponent(component.id, { priority: value ?? 1 })
                                                    }
                                                />
                                            </FormGroup>

                                            <FormGroup>
                                                <FormLabel>Status</FormLabel>
                                                <TogglePill
                                                    leftLabel="In Progress"
                                                    rightLabel="Complete"
                                                    value={!component.complete}
                                                    onChange={(active) =>
                                                        updateComponent(component.id, { complete: !active })
                                                    }
                                                />
                                            </FormGroup>
                                        </div>

                                        <FormGroup>
                                            <FormLabel htmlFor={`component-notes-${component.id}`}>
                                                Notes
                                            </FormLabel>
                                            <FormTextarea
                                                id={`component-notes-${component.id}`}
                                                value={component.notes || ''}
                                                onChange={(e) =>
                                                    updateComponent(component.id, { notes: e.target.value })
                                                }
                                                placeholder="Any additional notes..."
                                                rows={2}
                                            />
                                        </FormGroup>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleExpanded(component.id)}
                                            className="w-full"
                                        >
                                            Collapse
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addComponent}
                        className="w-full"
                    >
                        <Plus className="mr-2 w-4 h-4" />
                        Add Component
                    </Button>
                </div>
            )}
        </FormGroup>
    );
}

function renderValueInput(
    type: GoalComponentType | undefined,
    currentValue: GoalComponentValue | undefined,
    onChange: (value: GoalComponentValue) => void
) {
    if (!type || type === 'skill' || type === 'other') {
        return (
            <FormInput
                type="text"
                value={typeof currentValue === 'string' ? currentValue : ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Enter value..."
            />
        );
    }

    // For measurement types, render value and unit inputs
    if (type === 'bodyweight') {
        const weight = currentValue as WeightMeasurement | undefined;
        return (
            <div className="flex gap-2">
                <NumberInput
                    value={weight?.value}
                    onValueChange={(value) => onChange({ value: value ?? 0, unit: weight?.unit || 'kg' } as WeightMeasurement)}
                    className="flex-1"
                    placeholder="Value"
                />
                <FormSelect
                    value={weight?.unit || 'kg'}
                    onChange={(e) => onChange({ value: weight?.value ?? 0, unit: e.target.value as 'kg' | 'lbs' } as WeightMeasurement)}
                    className="w-24"
                >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                </FormSelect>
            </div>
        );
    }

    if (type === 'bodycomposition') {
        const percentage = currentValue as PercentageMeasurement | undefined;
        return (
            <div className="flex gap-2">
                <NumberInput
                    value={percentage?.value}
                    onValueChange={(value) => onChange({ value: value ?? 0, unit: '%' } as PercentageMeasurement)}
                    className="flex-1"
                    placeholder="Percentage"
                />
                <span className="flex items-center text-muted-foreground">%</span>
            </div>
        );
    }

    if (type === 'tape') {
        const distance = currentValue as DistanceMeasurement | undefined;
        return (
            <div className="flex gap-2">
                <NumberInput
                    value={distance?.value}
                    onValueChange={(value) => onChange({ value: value ?? 0, unit: distance?.unit || 'cm' } as DistanceMeasurement)}
                    className="flex-1"
                    placeholder="Value"
                />
                <FormSelect
                    value={distance?.unit || 'cm'}
                    onChange={(e) => onChange({ value: distance?.value ?? 0, unit: e.target.value as 'cm' | 'in' } as DistanceMeasurement)}
                    className="w-24"
                >
                    <option value="cm">cm</option>
                    <option value="in">in</option>
                </FormSelect>
            </div>
        );
    }

    if (type === 'time') {
        const time = currentValue as TimeMeasurement | undefined;
        return (
            <div className="flex gap-2">
                <NumberInput
                    value={time?.value}
                    onValueChange={(value) => onChange({ value: value ?? 0, unit: time?.unit || 'min' } as TimeMeasurement)}
                    className="flex-1"
                    placeholder="Time"
                />
                <FormSelect
                    value={time?.unit || 'min'}
                    onChange={(e) => onChange({ value: time?.value ?? 0, unit: e.target.value as 's' | 'min' | 'hr' } as TimeMeasurement)}
                    className="w-24"
                >
                    <option value="s">s</option>
                    <option value="min">min</option>
                    <option value="hr">hr</option>
                </FormSelect>
            </div>
        );
    }

    if (type === 'repetitions') {
        const reps = currentValue as RepetitionsMeasurement | undefined;
        return (
            <NumberInput
                value={reps?.value}
                onValueChange={(value) => onChange({ value: value ?? 0, unit: 'reps' } as RepetitionsMeasurement)}
                placeholder="Repetitions"
            />
        );
    }

    if (type === 'strength') {
         const weight = currentValue as WeightMeasurement | undefined;
        return (
            <div className="flex gap-2">
                <NumberInput
                    value={weight?.value}
                    onValueChange={(value) => onChange({ value: value ?? 0, unit: weight?.unit || 'kg' } as WeightMeasurement)}
                    className="flex-1"
                    placeholder="Weight"
                />
                <FormSelect
                    value={weight?.unit || 'kg'}
                    onChange={(e) => onChange({ value: weight?.value ?? 0, unit: e.target.value as 'kg' | 'lbs' } as WeightMeasurement)}
                    className="w-24"
                >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                </FormSelect>
            </div>
        );
    }

    // Default fallback
    return (
        <FormInput
            type="text"
            value={typeof currentValue === 'string' ? currentValue : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter value..."
        />
    );
}