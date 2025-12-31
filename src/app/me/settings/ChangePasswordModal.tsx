'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { FormGroup, FormLabel, FormInput, FormError } from '@/components/ui/Form';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const supabase = createClient();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      showToast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully.',
        variant: 'success',
      });
      
      onClose();
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Error updating password:', err);
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
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
        <div className="flex justify-between items-start mb-6">
          <h2 className="font-bold text-xl">Change Password</h2>
          <button
            onClick={onClose}
            className="hover:bg-hover p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormGroup>
            <FormLabel htmlFor="new-password">New Password</FormLabel>
            <FormInput
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="confirm-password">Confirm Password</FormLabel>
            <FormInput
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </FormGroup>

          {error && <FormError>{error}</FormError>}

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

