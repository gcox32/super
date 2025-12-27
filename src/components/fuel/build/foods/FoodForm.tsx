'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FormCard, FormTitle
} from '@/components/ui/Form';
import { CreateEditForm } from '@/components/ui/CreateEditForm';
import { Food } from '@/types/fuel';
import { defaultServingSize } from './options';
import { FoodFormData } from './types';
import { FoodFormFields } from './FoodFormFields';

interface FoodFormProps {
  initialData?: Food;
  isEditing?: boolean;
}

export default function FoodForm({ initialData, isEditing = false }: FoodFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FoodFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    servingSize: initialData?.servingSize || defaultServingSize,
    calories: initialData?.calories || undefined,
    macros: initialData?.macros || undefined,
    micros: initialData?.micros || undefined,
    imageUrl: initialData?.imageUrl || '',
  });

  const handleDelete = async () => {
    if (!initialData?.id) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/fuel/foods/${initialData.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete food');
      router.push('/fuel/build/foods');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEditing && initialData
        ? `/api/fuel/foods/${initialData.id}`
        : '/api/fuel/foods';

      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save food');
      }

      router.push('/fuel/build/foods');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CreateEditForm
      isEditing={isEditing}
      loading={loading}
      entityName="Food"
      handleSubmit={handleSubmit}
      onDelete={handleDelete}
    >
      <FormCard>
        <FormTitle>{isEditing ? 'Edit Food' : 'New Food'}</FormTitle>

        {error && (
          <div className="bg-red-500/10 p-3 border border-red-500/20 rounded-md text-red-500 text-sm">
            {error}
          </div>
        )}

        <FoodFormFields
          formData={formData}
          setFormData={setFormData}
          isEditing={isEditing}
          initialData={initialData}
        />
      </FormCard>
    </CreateEditForm>
  );
}

