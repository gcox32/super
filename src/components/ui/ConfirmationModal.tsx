'use client';

import { X } from 'lucide-react';
import Button from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'default' | 'danger';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'default',
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="z-50 fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-card/95 shadow-2xl shadow-black/50 backdrop-blur-xl mx-4 p-6 border border-white/10 rounded-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="font-bold text-xl">{title}</h2>
          <button
            onClick={onClose}
            className="hover:bg-hover p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <p className="mb-6 text-muted-foreground">{message}</p>
        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="outline"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            variant={confirmVariant === 'danger' ? 'danger' : 'primary'}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
