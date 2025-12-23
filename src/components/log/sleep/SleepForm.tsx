'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreateEditForm } from '@/components/ui/CreateEditForm';
import { FormCard, FormGroup, FormLabel, FormInput, FormTextarea } from '@/components/ui/Form';
import { NumberInput } from '@/components/ui/NumberInput';
import { useToast } from '@/components/ui/Toast';
import { format, subDays } from 'date-fns';
import { SleepInstance } from '@/types/fuel';

interface SleepFormProps {
    initialDate?: Date;
    initialData?: SleepInstance | null;
    onSuccess?: () => void;
}

const formatDateInput = (date: Date) => format(date, 'yyyy-MM-dd');
const formatTimeInput = (date: Date) => format(date, 'HH:mm');

export function SleepForm({ initialDate, initialData, onSuccess }: SleepFormProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    
    // State
    const [selectedDate, setSelectedDate] = useState(formatDateInput(initialDate || new Date()));
    
    // Form Fields
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [sleepScore, setSleepScore] = useState<number | undefined>(undefined);
    const [wakeCount, setWakeCount] = useState<number | undefined>(undefined);
    const [timeAwake, setTimeAwake] = useState<number | undefined>(undefined); // in minutes
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (initialData) {
            setSelectedDate(formatDateInput(new Date(initialData.date)));
            if (initialData.startTime) setStartTime(formatTimeInput(new Date(initialData.startTime)));
            if (initialData.endTime) setEndTime(formatTimeInput(new Date(initialData.endTime)));
            setSleepScore(initialData.sleepScore);
            setWakeCount(initialData.wakeCount);
            setTimeAwake(initialData.timeAwake?.value);
            setNotes(initialData.notes || '');
        }
    }, [initialData]);

    // Derived: Duration
    const durationLabel = (() => {
        if (!startTime || !endTime) return null;
        
        const [endH, endM] = endTime.split(':').map(Number);
        const [startH, startM] = startTime.split(':').map(Number);
        
        let endD = new Date(selectedDate);
        endD.setHours(endH, endM, 0, 0);
        
        let startD = new Date(selectedDate);
        startD.setHours(startH, startM, 0, 0);
        
        if (startD >= endD) {
            startD = subDays(startD, 1);
        }
        
        const diffMs = endD.getTime() - startD.getTime();
        const diffHrs = diffMs / (1000 * 60 * 60);
        const hours = Math.floor(diffHrs);
        const mins = Math.round((diffHrs - hours) * 60);
        
        return `${hours}h ${mins}m`;
    })();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Construct timestamps
            let startTimestamp: Date | null = null;
            let endTimestamp: Date | null = null;
            let durationHours: number | null = null;

            if (startTime && endTime) {
                const [endH, endM] = endTime.split(':').map(Number);
                const [startH, startM] = startTime.split(':').map(Number);
                
                const endD = new Date(selectedDate);
                endD.setHours(endH, endM, 0, 0);
                
                let startD = new Date(selectedDate);
                startD.setHours(startH, startM, 0, 0);
                
                if (startD >= endD) {
                    startD = subDays(startD, 1);
                }
                
                startTimestamp = startD;
                endTimestamp = endD;
                
                const diffMs = endD.getTime() - startD.getTime();
                durationHours = diffMs / (1000 * 60 * 60);
            }

            const payload: any = {
                date: new Date(selectedDate),
                startTime: startTimestamp,
                endTime: endTimestamp,
                timeAsleep: durationHours ? { value: durationHours, unit: 'hr' } : null,
                sleepScore,
                wakeCount,
                timeAwake: timeAwake ? { value: timeAwake, unit: 'min' } : null,
                notes,
            };

            if (initialData) {
                // Update
                const res = await fetch(`/api/fuel/sleep/${initialData.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error('Failed to update sleep log');
                showToast({ title: 'Saved', description: 'Sleep log updated successfully', variant: 'success' });
            } else {
                // Create
                const res = await fetch('/api/fuel/sleep', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error('Failed to create sleep log');
                showToast({ title: 'Saved', description: 'Sleep log created successfully', variant: 'success' });
            }
            
            if (onSuccess) {
                onSuccess();
            } else {
                router.push('/log/sleep');
            }
        } catch (error) {
            console.error(error);
            showToast({ title: 'Error', description: 'Failed to save sleep log', variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/fuel/sleep/${initialData.id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete sleep log');
            
            showToast({ title: 'Deleted', description: 'Sleep log deleted', variant: 'info' });
            if (onSuccess) {
                onSuccess();
            } else {
                router.push('/log/sleep');
            }
        } catch (error) {
            console.error(error);
            showToast({ title: 'Error', description: 'Failed to delete sleep log', variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <CreateEditForm
            handleSubmit={handleSubmit}
            isEditing={!!initialData}
            loading={loading}
            entityName="Sleep Log"
            submitText="Log Sleep"
            onDelete={initialData ? handleDelete : undefined}
        >
            <FormCard>
                <div className="mb-4">
                     <FormGroup>
                        <FormLabel>Date</FormLabel>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-card text-foreground border border-input rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                    </FormGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormGroup>
                        <FormLabel>Bed Time</FormLabel>
                        <FormInput
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                    </FormGroup>
                    <FormGroup>
                        <FormLabel>Wake Time</FormLabel>
                        <FormInput
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                        />
                    </FormGroup>
                </div>
                
                {durationLabel && (
                    <div className="text-center text-sm font-medium text-brand-primary my-2">
                        Total Sleep: {durationLabel}
                    </div>
                )}

                <FormGroup>
                    <FormLabel>Sleep Score (0-100)</FormLabel>
                    <NumberInput
                        value={sleepScore}
                        onValueChange={setSleepScore}
                        min={0}
                        max={100}
                        placeholder="Optional"
                    />
                </FormGroup>

                <div className="grid grid-cols-2 gap-4">
                    <FormGroup>
                        <FormLabel>Woke Up (times)</FormLabel>
                        <NumberInput
                            value={wakeCount}
                            onValueChange={setWakeCount}
                            min={0}
                            placeholder="Optional"
                        />
                    </FormGroup>
                    <FormGroup>
                        <FormLabel>Time Awake (mins)</FormLabel>
                        <NumberInput
                            value={timeAwake}
                            onValueChange={setTimeAwake}
                            min={0}
                            placeholder="Optional"
                        />
                    </FormGroup>
                </div>

                <FormGroup>
                    <FormLabel>Notes</FormLabel>
                    <FormTextarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="How did you feel?"
                    />
                </FormGroup>
            </FormCard>
        </CreateEditForm>
    );
}

