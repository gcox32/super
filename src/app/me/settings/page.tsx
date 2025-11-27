import { Settings, Bell, Shield, Database, Info, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="md:max-w-4xl md:mx-auto">
        {/* Header */}
        <section className="px-4 md:px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/me"
              className="p-2 hover:bg-hover rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex flex-col gap-3">
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Manage your app settings
              </p>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="px-4 md:px-6 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-brand-primary" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          <div className="space-y-2">
            <div className="bg-card rounded-lg p-4 border border-border flex items-center justify-between">
              <div>
                <span className="font-medium block">Session Reminders</span>
                <span className="text-sm text-muted-foreground">
                  Get notified before training sessions
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
              </label>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border flex items-center justify-between">
              <div>
                <span className="font-medium block">Meal Reminders</span>
                <span className="text-sm text-muted-foreground">
                  Reminders for meal times
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
              </label>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border flex items-center justify-between">
              <div>
                <span className="font-medium block">Progress Updates</span>
                <span className="text-sm text-muted-foreground">
                  Weekly progress summaries
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
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
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Build</span>
              <span className="font-medium">2024.01.15</span>
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
      </div>
    </div>
  );
}
