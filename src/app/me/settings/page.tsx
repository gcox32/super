'use client';

import { Bell, Shield, Database, Info } from 'lucide-react';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';
import { useSettings } from '@/lib/settings';
import { useToast } from '@/components/ui/Toast';

export default function SettingsPage() {
  const { showToast } = useToast();
  const { settings, updateSettings, loading } = useSettings();
  
  // Settings like Notifications are operational and should probably take effect immediately (like system settings typically do),
  // whereas Preferences (units, strategies) often benefit from a "batch save" flow if they change view state significantly.
  // For now, we will keep the "toggle immediately saves" pattern for Settings, as is common for notification toggles.
  
  const handleSleepReminderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    
    if (checked) {
      // Request permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          showToast({ title: 'Permission Denied', description: 'Enable notifications in your browser settings to get reminders.', variant: 'error' });
          return;
        }
      } else {
        showToast({ title: 'Not Supported', description: 'Notifications are not supported in this browser.', variant: 'error' });
        return;
      }
    }

    updateSettings({ sleepReminder: checked });
    
    if (checked) {
       showToast({ title: 'Reminder Set', description: 'You will be reminded to log sleep in the morning.', variant: 'success' });
    }
  };

  if (loading) {
    return (
        <PageLayout title="Settings" subtitle="Manage your app settings" breadcrumbHref="/me" breadcrumbText="Me">
             <div className="flex justify-center p-8">Loading...</div>
        </PageLayout>
    );
  }

  return (
    <PageLayout
      breadcrumbHref="/me"
      breadcrumbText="Me"
      title="Settings"
      subtitle="Manage your app settings"
    >
      {/* Notifications */}
      <section className="px-4 md:px-6 py-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-brand-primary" />
          <h2 className="text-lg font-semibold">Notifications</h2>
        </div>
        <div className="space-y-2">
          {/* Sleep Reminder */}
          <div className="bg-card rounded-lg p-4 border border-border flex items-center justify-between">
            <div>
              <span className="font-medium block">Morning Sleep Reminder</span>
              <span className="text-sm text-muted-foreground">
                Get reminded to log your sleep stats (6 AM - 11 AM)
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.sleepReminder}
                onChange={handleSleepReminderChange}
              />
              <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
            </label>
          </div>
          
          {/* Other settings placeholders */}
          <div className="bg-card rounded-lg p-4 border border-border flex items-center justify-between opacity-50 cursor-not-allowed">
            <div>
              <span className="font-medium block">Session Reminders</span>
              <span className="text-sm text-muted-foreground">
                Get notified before training sessions
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
              <input type="checkbox" className="sr-only peer" checked={settings.sessionReminders} disabled />
              <div className="w-11 h-6 bg-input rounded-full peer peer-checked:bg-brand-primary"></div>
            </label>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border flex items-center justify-between opacity-50 cursor-not-allowed">
            <div>
              <span className="font-medium block">Meal Reminders</span>
              <span className="text-sm text-muted-foreground">
                Reminders for meal times
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
              <input type="checkbox" className="sr-only peer" checked={settings.mealReminders} disabled />
              <div className="w-11 h-6 bg-input rounded-full peer peer-checked:bg-brand-primary"></div>
            </label>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border flex items-center justify-between opacity-50 cursor-not-allowed">
             <div>
              <span className="font-medium block">Progress Updates</span>
              <span className="text-sm text-muted-foreground">
                Weekly progress summaries
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
              <input type="checkbox" className="sr-only peer" checked={settings.progressUpdates} disabled />
              <div className="w-11 h-6 bg-input rounded-full peer peer-checked:bg-brand-primary"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Privacy & Security */}
      <section className="px-4 md:px-6 py-6 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-brand-primary" />
          <h2 className="text-lg font-semibold">Privacy & Security</h2>
        </div>
        <div className="space-y-2">
          <button className="w-full bg-card rounded-lg p-4 border border-border flex items-center justify-between hover:bg-hover transition-colors">
            <div>
              <span className="font-medium block">Change Password</span>
              <span className="text-sm text-muted-foreground">
                Update your account password
              </span>
            </div>
            <span className="text-muted-foreground">→</span>
          </button>
          <button className="w-full bg-card rounded-lg p-4 border border-border flex items-center justify-between hover:bg-hover transition-colors">
            <div>
              <span className="font-medium block">Data Export</span>
              <span className="text-sm text-muted-foreground">
                Download your data
              </span>
            </div>
            <span className="text-muted-foreground">→</span>
          </button>
          <button className="w-full bg-card rounded-lg p-4 border border-border flex items-center justify-between hover:bg-hover transition-colors">
            <div>
              <span className="font-medium block">Delete Account</span>
              <span className="text-sm text-red-600">
                Permanently delete your account
              </span>
            </div>
            <span className="text-muted-foreground">→</span>
          </button>
        </div>
      </section>

      {/* Data & Storage */}
      <section className="px-4 md:px-6 py-6 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-5 h-5 text-brand-primary" />
          <h2 className="text-lg font-semibold">Data & Storage</h2>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Storage Used</span>
            <span className="text-sm text-muted-foreground">125 MB / 1 GB</span>
          </div>
          <div className="w-full bg-input rounded-full h-2">
            <div className="bg-brand-primary h-2 rounded-full" style={{ width: '12.5%' }}></div>
          </div>
          <button className="mt-4 w-full py-2 border border-border rounded-lg font-semibold hover:bg-hover transition-colors">
            Clear Cache
          </button>
        </div>
      </section>

      {/* About */}
      <section className="px-4 md:px-6 py-6 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <Info className="w-5 h-5 text-brand-primary" />
          <h2 className="text-lg font-semibold">About</h2>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="font-medium">{process.env.APP_VERSION}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Build</span>
            <span className="font-medium">{process.env.APP_BUILD}</span>
          </div>
          <Link
            href="/terms-of-service"
            className="w-full mt-4 py-2 border border-border rounded-lg font-semibold hover:bg-hover transition-colors flex items-center justify-center"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy-policy"
            className="w-full py-2 border border-border rounded-lg font-semibold hover:bg-hover transition-colors flex items-center justify-center"
          >
            Privacy Policy
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
