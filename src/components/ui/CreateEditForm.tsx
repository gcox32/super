'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { FormWrapper, FormActions } from '@/components/ui/Form';
import { Trash } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

interface CreateEditFormProps {
  children: React.ReactNode;
  handleSubmit: (e: React.FormEvent) => Promise<void> | void;
  isEditing: boolean;
  loading: boolean;
  entityName: string;
  onDelete?: () => Promise<void> | void;
  onCancel?: () => void;
}

export function CreateEditForm({
  children,
  handleSubmit,
  isEditing,
  loading,
  entityName,
  onDelete,
  onCancel,
}: CreateEditFormProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (onDelete) {
      await onDelete();
    }
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <FormWrapper>
          {children}

          <FormActions className="flex items-center gap-4">
            <Button type="button" variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            
            {isEditing && onDelete && (
              <Button 
                type="button" 
                variant="danger" 
                onClick={handleDeleteClick}
                className="gap-2"
              >
                <Trash className="w-4 h-4" />
                Delete
              </Button>
            )}

            <Button type="submit" disabled={loading} className="min-w-[140px]">
              {loading 
                ? 'Saving...' 
                : isEditing 
                  ? `Update ${entityName}` 
                  : `Create ${entityName}`
              }
            </Button>
          </FormActions>
        </FormWrapper>
      </form>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${entityName}`}
        message={`Are you sure you want to delete this ${entityName.toLowerCase()}? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </>
  );
}
