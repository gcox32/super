'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateEditForm } from '@/components/ui/CreateEditForm';
import { FormCard, FormTitle, FormGroup, FormLabel, FormInput, FormTextarea } from '@/components/ui/Form';
import type { MealInstance } from '@/types/fuel';

interface MealInstanceFormProps {
  initialData: MealInstance;
}

export default function MealInstanceForm({ initialData }: MealInstanceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [date, setDate] = useState<string>(() => {
    const d = new Date(initialData.date);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState<string>(() => {
    if (initialData.timestamp) {
      const t = new Date(initialData.timestamp);
      return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
    }
    return '';
  });
  const [complete, setComplete] = useState(initialData.complete);
  const [notes, setNotes] = useState(initialData.notes || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create date and timestamp in local timezone
      // Parse date string (YYYY-MM-DD) and create Date in local timezone at midnight
      const [year, month, day] = date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day, 12, 0, 0, 0);
      
      // Create timestamp if time is provided (date + time in local timezone)
      let timestamp: Date | null = null;
      if (time) {
        const [hours, minutes] = time.split(':').map(Number);
        timestamp = new Date(year, month - 1, day, hours, minutes, 0, 0);
      }

      const updateData = {
        date: dateObj,
        timestamp,
        complete,
        notes: notes || undefined,
      };

      const res = await fetch(`/api/fuel/meals/instances/${initialData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update meal instance');
      }

      router.push('/fuel');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update meal instance');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/fuel/meals/instances/${initialData.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete meal instance');
      }

      router.push('/fuel');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete meal instance');
      throw err;
    }
  };

  return (
    <CreateEditForm
      isEditing={true}
      loading={loading}
      entityName="Meal Instance"
      handleSubmit={handleSubmit}
      onDelete={handleDelete}
    >
      <FormCard>
        <FormTitle>Edit Meal Instance</FormTitle>
        
        {error && (
          <div className="bg-red-500/10 p-3 border border-red-500/20 rounded-md text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
          <FormGroup className="max-w-[88%]">
            <FormLabel>Date</FormLabel>
            <FormInput
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup className="max-w-[88%]">
            <FormLabel>Time (optional)</FormLabel>
            <FormInput
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </FormGroup>
        </div>

        <FormGroup>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={complete}
              onChange={(e) => setComplete(e.target.checked)}
              className="text-brand-primary"
            />
            <span className="text-sm">Mark as complete</span>
          </label>
        </FormGroup>

        <FormGroup>
          <FormLabel>Notes (optional)</FormLabel>
          <FormTextarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this meal..."
          />
        </FormGroup>
      </FormCard>
    </CreateEditForm>
  );
}

