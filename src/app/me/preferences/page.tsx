'use client';

import { useEffect, useState } from 'react';
import { Globe, BarChart3, Save } from 'lucide-react';
import { usePreferences, type UserPreferences } from '@/lib/preferences';
import type { CompositeStrategy } from '@/types/stats';
import { useToast } from '@/components/ui/Toast';
import { TogglePill } from '@/components/ui/TogglePill';
import PageLayout from '@/components/layout/PageLayout';
import Button from '@/components/ui/Button';

export default function PreferencesPage() {
  const { preferences, updatePreferences, loading } = usePreferences();
  const { showToast } = useToast();
  
  // Local state for form fields
  const [formState, setFormState] = useState<UserPreferences>(preferences);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync local state with loaded preferences
  useEffect(() => {
    if (!loading) {
      setFormState(preferences);
    }
  }, [loading, preferences]);

  // Check for changes
  useEffect(() => {
    if (loading) return;
    
    const isDifferent = 
      formState.bodyFatStrategy !== preferences.bodyFatStrategy ||
      formState.preferredWeightUnit !== preferences.preferredWeightUnit ||
      formState.preferredLengthUnit !== preferences.preferredLengthUnit ||
      formState.bodyFatMaxDaysOld !== preferences.bodyFatMaxDaysOld;
      
    setHasChanges(isDifferent);
  }, [formState, preferences, loading]);

  const handleChange = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePreferences(formState);
      showToast({
        variant: 'success',
        title: 'Preferences saved',
        description: 'Your preferences have been updated successfully.',
      });
      setHasChanges(false);
    } catch (error) {
      showToast({
        variant: 'error',
        title: 'Error saving',
        description: 'Failed to save preferences. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout
        breadcrumbHref="/me"
        breadcrumbText="Me"
        title="Preferences"
        subtitle="Customize your app experience"
      >
        <div className="flex justify-center p-12">
           <div className="border-2 border-brand-primary border-t-transparent rounded-full w-6 h-6 animate-spin"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      breadcrumbHref="/me"
      breadcrumbText="Me"
      title="Preferences"
      subtitle="Customize how data is displayed and calculated"
    >
      <div className="md:mx-auto pb-24 md:max-w-4xl">

        {/* Body Fat Calculation */}
        <section className="px-4 md:px-6 py-6 border-border border-t">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-brand-primary" />
            <h2 className="font-semibold text-lg">Body Fat Calculation</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-card p-4 border border-border rounded-lg">
              <span className="block mb-3 font-medium">Composite Strategy</span>
              <p className="mb-3 text-muted-foreground text-sm">
                How body fat estimation methods are combined
              </p>
              <div className="flex flex-col gap-2">
                {(['median', 'trimmed_mean', 'mean', 'weighted_mean'] as CompositeStrategy[]).map((strategy) => (
                  <button
                    key={strategy}
                    onClick={() => handleChange('bodyFatStrategy', strategy)}
                    className={`py-2 px-4 border rounded-lg font-semibold text-left transition-colors ${formState.bodyFatStrategy === strategy
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'border-border hover:bg-hover'
                      }`}
                  >
                    <div className="font-medium capitalize">
                      {strategy === 'trimmed_mean' ? 'Trimmed Mean' : strategy === 'weighted_mean' ? 'Weighted Mean' : strategy}
                    </div>
                    <div className="opacity-80 mt-0.5 text-xs">
                      {strategy === 'median' && 'Use the middle value (most robust to outliers)'}
                      {strategy === 'trimmed_mean' && 'Average after removing outliers'}
                      {strategy === 'mean' && 'Simple average of all methods'}
                      {strategy === 'weighted_mean' && 'Weighted average (customizable)'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-card p-4 border border-border rounded-lg">
              <label className="block mb-3 font-medium">Maximum Age for Stats Lookup</label>
              <p className="mb-3 text-muted-foreground text-sm">
                When calculating body fat, how many days back should we look for missing measurements?
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formState.bodyFatMaxDaysOld}
                  onChange={(e) => {
                    const value = Math.max(1, Math.min(365, parseInt(e.target.value) || 30));
                    handleChange('bodyFatMaxDaysOld', value);
                  }}
                  className="bg-input px-3 py-2 border border-input focus:border-brand-primary rounded-lg outline-none ring-0 w-24 text-foreground text-sm transition-colors"
                />
                <span className="text-muted-foreground text-sm">days</span>
              </div>
            </div>
          </div>
        </section>

        {/* Units */}
        <section className="px-4 md:px-6 py-6 border-border border-t">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-brand-primary" />
            <h2 className="font-semibold text-lg">Preferred Units</h2>
          </div>
          <div className="space-y-2">
            <div className="bg-card p-4 border border-border rounded-lg">
              <span className="block mb-3 font-medium">Weight</span>
              <div className="flex gap-2">
                <TogglePill
                  leftLabel="lbs"
                  rightLabel="kg"
                  value={formState.preferredWeightUnit === 'lb'}
                  onChange={(value) => handleChange('preferredWeightUnit', value ? 'lb' : 'kg')}
                >
                </TogglePill>
              </div>
            </div>
            <div className="bg-card p-4 border border-border rounded-lg">
              <span className="block mb-3 font-medium">Length / Distance</span>
              <div className="flex gap-2">
                <TogglePill
                  leftLabel="inches"
                  rightLabel="cm"
                  value={formState.preferredLengthUnit === 'in'}
                  onChange={(value) => handleChange('preferredLengthUnit', value ? 'in' : 'cm')}
                >
                </TogglePill>
              </div>
            </div>
          </div>
        </section>

        {/* Floating Save Button */}
        {hasChanges && (
          <div className="right-0 bottom-20 slide-in-from-bottom-4 left-0 z-50 fixed flex justify-center px-4 animate-in duration-300 fade-in">
             <div className="flex items-center gap-4 bg-zinc-900/50 shadow-2xl backdrop-blur-sm p-2 pr-2 pl-6 border border-zinc-800 rounded-full">
                <span className="font-medium text-zinc-100 text-sm">You have unsaved changes</span>
                <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="shadow-none px-6 rounded-full"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
             </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
