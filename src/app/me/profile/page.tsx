'use client';

import { useEffect, useState, FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { UserProfile } from '@/types/user';
import { useToast } from '@/components/ui/Toast';

type ProfileResponse = {
  profile: UserProfile | null;
  error?: string;
};

type FormState = {
  firstName: string;
  lastName: string;
  bio: string;
  gender: '' | 'male' | 'female';
  birthDate: string; // ISO date string for date input
  activityLevel:
    | ''
    | 'sedentary'
    | 'lightly active'
    | 'moderately active'
    | 'very active'
    | 'extra active';
};

const emptyForm: FormState = {
  firstName: '',
  lastName: '',
  bio: '',
  gender: '',
  birthDate: '',
  activityLevel: '',
};

export default function MeProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const { showToast } = useToast();

  // Load current profile
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);

        const res = await fetch('/api/me/profile', { cache: 'no-store' });
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(body?.error || 'Failed to load profile');
        }

        const data = (await res.json()) as ProfileResponse;
        if (cancelled) return;

        if (data.profile) {
          setProfile(data.profile);
          setForm({
            firstName: data.profile.firstName ?? '',
            lastName: data.profile.lastName ?? '',
            bio: data.profile.bio ?? '',
            gender: data.profile.gender ?? '',
            birthDate: data.profile.birthDate
              ? new Date(data.profile.birthDate).toISOString().split('T')[0]
              : '',
            activityLevel: data.profile.activityLevel ?? '',
          });
        } else {
          setProfile(null);
          setForm(emptyForm);
        }
      } catch (e: any) {
        if (!cancelled) {
          showToast({
            variant: 'error',
            title: 'Something went wrong',
            description: e.message || 'Failed to load profile',
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange =
    (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const method = profile ? 'PATCH' : 'POST';

      const body = {
        // email is required on createUserProfile
        email: profile?.email,
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        bio: form.bio || undefined,
        gender: form.gender || undefined,
        birthDate: form.birthDate ? new Date(form.birthDate) : undefined,
        activityLevel: form.activityLevel || undefined,
      };

      const res = await fetch('/api/me/profile', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error || 'Failed to save profile');
      }

      const data = (await res.json()) as ProfileResponse;
      setProfile(data.profile ?? null);
      showToast({
        variant: 'success',
        title: 'Profile updated',
        description: 'Your profile details have been saved.',
      });
    } catch (e: any) {
      const message = e.message || 'Failed to save profile';
      showToast({
        variant: 'error',
        title: 'Something went wrong',
        description: message,
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center bg-black w-full h-screen text-white">
        <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex justify-center bg-black px-5 py-6 w-full min-h-screen text-white">
      <div className="w-full max-w-xl">
        <header className="mb-6">
          <h1 className="font-semibold text-xl tracking-tight">Your Profile</h1>
          <p className="mt-1 text-zinc-400 text-sm">
            Keep your details up to date so we can better contextualize your training.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {profile?.email && (
            <div className="space-y-1.5">
              <label className="block font-medium text-zinc-400 text-xs uppercase tracking-[0.18em]">
                Email
              </label>
              <div className="bg-zinc-950/60 px-3 py-2 border border-zinc-800 rounded-lg text-zinc-300 text-sm">
                {profile.email}
              </div>
            </div>
          )}

          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="firstName"
                className="block font-medium text-zinc-400 text-xs uppercase tracking-[0.18em]"
              >
                First name
              </label>
              <input
                id="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange('firstName')}
                className="bg-zinc-950/60 focus:bg-zinc-900/80 px-3 py-2 border border-zinc-800 focus:border-brand-primary rounded-lg outline-none ring-0 w-full text-white placeholder:text-zinc-500 text-sm transition-colors"
                placeholder="Grant"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="lastName"
                className="block font-medium text-zinc-400 text-xs uppercase tracking-[0.18em]"
              >
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange('lastName')}
                className="bg-zinc-950/60 focus:bg-zinc-900/80 px-3 py-2 border border-zinc-800 focus:border-brand-primary rounded-lg outline-none ring-0 w-full text-white placeholder:text-zinc-500 text-sm transition-colors"
                placeholder="Cox"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="bio"
              className="block font-medium text-zinc-400 text-xs uppercase tracking-[0.18em]"
            >
              Bio
            </label>
            <textarea
              id="bio"
              value={form.bio}
              onChange={handleChange('bio')}
              className="bg-zinc-950/60 focus:bg-zinc-900/80 px-3 py-2 border border-zinc-800 focus:border-brand-primary rounded-lg outline-none ring-0 w-full min-h-[80px] text-white placeholder:text-zinc-500 text-sm transition-colors"
              placeholder="Share a bit about your training background and goals."
            />
          </div>

          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="gender"
                className="block font-medium text-zinc-400 text-xs uppercase tracking-[0.18em]"
              >
                Gender
              </label>
              <select
                id="gender"
                value={form.gender}
                onChange={handleChange('gender')}
                className="bg-zinc-950/60 focus:bg-zinc-900/80 px-3 py-2 border border-zinc-800 focus:border-brand-primary rounded-lg outline-none ring-0 w-full text-white text-sm transition-colors"
              >
                <option value="">Not specified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="birthDate"
                className="block font-medium text-zinc-400 text-xs uppercase tracking-[0.18em]"
              >
                Birth date
              </label>
              <input
                id="birthDate"
                type="date"
                value={form.birthDate}
                onChange={handleChange('birthDate')}
                className="bg-zinc-950/60 focus:bg-zinc-900/80 px-3 py-2 border border-zinc-800 focus:border-brand-primary rounded-lg outline-none ring-0 w-full text-white text-sm transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="activityLevel"
              className="block font-medium text-zinc-400 text-xs uppercase tracking-[0.18em]"
            >
              Activity level
            </label>
            <select
              id="activityLevel"
              value={form.activityLevel}
              onChange={handleChange('activityLevel')}
              className="bg-zinc-950/60 focus:bg-zinc-900/80 px-3 py-2 border border-zinc-800 focus:border-brand-primary rounded-lg outline-none ring-0 w-full text-white text-sm transition-colors"
            >
              <option value="">Select activity</option>
              <option value="sedentary">Sedentary</option>
              <option value="lightly active">Lightly active</option>
              <option value="moderately active">Moderately active</option>
              <option value="very active">Very active</option>
              <option value="extra active">Extra active</option>
            </select>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : profile ? (
                'Save changes'
              ) : (
                'Create profile'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


