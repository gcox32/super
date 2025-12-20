import { useState } from 'react';
import { UserGoal, UserGoalComponent } from '@/types/user';
import { LongTimeMeasurement } from '@/types/measures';
import {
    FormWrapper,
    FormCard,
    FormGroup,
    FormLabel,
    FormInput,
    FormTextarea,
    FormActions,
    FormError
} from '@/components/ui/Form';
import Button from '@/components/ui/Button';
import { TogglePill } from '@/components/ui/TogglePill';
import { GoalComponentsSection } from './GoalComponentsSection';
import { Loader2, Trash2 } from 'lucide-react';

interface GoalFormProps {
    initialData?: Partial<UserGoal>;
    onSubmit: (data: Partial<UserGoal>) => Promise<void>;
    onCancel: () => void;
    onDelete?: () => void;
    isSubmitting?: boolean;
}

export function GoalForm({ initialData, onSubmit, onCancel, onDelete, isSubmitting = false }: GoalFormProps) {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [durationValue, setDurationValue] = useState<number>(initialData?.duration?.value || 1);
    const [durationUnit, setDurationUnit] = useState<LongTimeMeasurement['unit']>(initialData?.duration?.unit || 'weeks');
    const [startDate, setStartDate] = useState(initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '');
    const [complete, setComplete] = useState(initialData?.complete || false);
    const [notes, setNotes] = useState(initialData?.notes || '');
    const [components, setComponents] = useState<UserGoalComponent[]>(initialData?.components || []);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            // Determine completion status based on components if they exist
            let finalComplete = complete;
            if (components.length > 0) {
                finalComplete = components.every(c => c.complete);
            }

            await onSubmit({
                name,
                description,
                components: components.length > 0 ? components : undefined,
                duration: { value: durationValue, unit: durationUnit },
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                complete: finalComplete,
                notes
            });
        } catch (err) {
            setError('Failed to save goal. Please try again.');
            console.error(err);
        }
    };

    return (
        <FormWrapper>
            <FormCard className="mb-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormGroup>
                        <FormLabel htmlFor="name">Goal Name</FormLabel>
                        <FormInput
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Lose 5kg"
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="description">Description</FormLabel>
                        <FormTextarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your goal..."
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="startDate">Start Date</FormLabel>
                        <FormInput
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </FormGroup>

                    <GoalComponentsSection
                        components={components}
                        onChange={setComponents}
                    />

                    <FormGroup>
                        <FormLabel>Status</FormLabel>
                        <TogglePill
                            leftLabel="Active"
                            rightLabel="Complete"
                            value={!complete}
                            onChange={(active) => setComplete(!active)}
                        />
                        {components.length > 0 && (
                            <p className="mt-1 text-muted-foreground text-xs">
                                Status will automatically update based on component completion
                            </p>
                        )}
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="notes">Notes</FormLabel>
                        <FormTextarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any additional notes..."
                        />
                    </FormGroup>

                    {error && <FormError>{error}</FormError>}

                    <FormActions className="flex w-full">
                        <div className="flex flex-col gap-4 w-full">
                            <Button className="flex-1 w-full" type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button className="flex-1 w-full" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 w-4 h-4" /> : 'Save Goal'}
                            </Button>
                            {onDelete && (
                                <Button
                                    className="flex-1 hover:bg-red-50 border-red-200 w-full text-red-600 hover:text-red-700"
                                    type="button"
                                    variant="outline"
                                    onClick={onDelete}
                                    disabled={isSubmitting}
                                >
                                    <Trash2 size={16} className="mr-2" />
                                    Delete
                                </Button>
                            )}
                        </div>
                    </FormActions>
                </form>
            </FormCard>
        </FormWrapper>
    );
}
