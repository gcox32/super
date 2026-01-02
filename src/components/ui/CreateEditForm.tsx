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
  submitText?: string;
  onDelete?: () => Promise<void> | void;
  onCancel?: () => void;
}

export function CreateEditForm({
  children,
  handleSubmit,
  isEditing,
  loading,
  entityName,
  submitText,
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
      <form onSubmit={handleSubmit} className="my-4">
        <FormWrapper>
          {children}

          <FormActions className="flex flex-col items-center gap-4">
          <Button type="submit" disabled={loading} className="w-full min-w-[140px]">
              {loading 
                ? 'Saving...' 
                : isEditing 
                  ? `Update ${entityName}` 
                  : submitText || `Create ${entityName}`
              }
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={handleCancel}
              className="gap-2 w-full"
            >
              Cancel
            </Button>
            {isEditing && onDelete && (
              <Button 
                type="button" 
                variant="danger" 
                onClick={handleDeleteClick}
                className="gap-2 w-full"
              >
                <Trash className="w-4 h-4" />
                Delete
              </Button>
            )}
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
