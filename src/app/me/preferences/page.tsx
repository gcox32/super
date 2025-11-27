import { Sliders, Moon, Globe, Calendar, Target, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PreferencesPage() {
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary/20 rounded-full flex items-center justify-center">
                <Sliders className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Preferences</h1>
                <p className="text-sm text-muted-foreground">
                  Customize your app experience
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="px-4 md:px-6 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Moon className="w-5 h-5 text-brand-primary" />
            <h2 className="text-lg font-semibold">Appearance</h2>
          </div>
          <div className="space-y-2">
            <div className="bg-card rounded-lg p-4 border border-border">
              <span className="font-medium block mb-3">Theme</span>
              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-brand-primary text-white rounded-lg font-semibold">
                  Dark
                </button>
                <button className="flex-1 py-3 border border-border rounded-lg font-semibold hover:bg-hover transition-colors">
                  Light
                </button>
                <button className="flex-1 py-3 border border-border rounded-lg font-semibold hover:bg-hover transition-colors">
                  System
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Units */}
        <section className="px-4 md:px-6 py-6 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-brand-primary" />
            <h2 className="text-lg font-semibold">Units</h2>
          </div>
          <div className="space-y-2">
            <div className="bg-card rounded-lg p-4 border border-border">
              <span className="font-medium block mb-3">Weight</span>
              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-brand-primary text-white rounded-lg font-semibold">
                  lbs
                </button>
                <button className="flex-1 py-3 border border-border rounded-lg font-semibold hover:bg-hover transition-colors">
                  kg
                </button>
              </div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border">
              <span className="font-medium block mb-3">Distance</span>
              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-brand-primary text-white rounded-lg font-semibold">
                  miles
                </button>
                <button className="flex-1 py-3 border border-border rounded-lg font-semibold hover:bg-hover transition-colors">
                  km
                </button>
              </div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border">
              <span className="font-medium block mb-3">Temperature</span>
              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-brand-primary text-white rounded-lg font-semibold">
                  °F
                </button>
                <button className="flex-1 py-3 border border-border rounded-lg font-semibold hover:bg-hover transition-colors">
                  °C
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Workout Preferences */}
        <section className="px-4 md:px-6 py-6 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-brand-primary" />
            <h2 className="text-lg font-semibold">Workout Preferences</h2>
          </div>
          <div className="space-y-2">
            <div className="bg-card rounded-lg p-4 border border-border">
              <span className="font-medium block mb-3">Default Rest Timer</span>
              <div className="flex gap-2">
                <button className="flex-1 py-3 border border-border rounded-lg font-semibold hover:bg-hover transition-colors">
                  30s
                </button>
                <button className="flex-1 py-3 bg-brand-primary text-white rounded-lg font-semibold">
                  60s
                </button>
                <button className="flex-1 py-3 border border-border rounded-lg font-semibold hover:bg-hover transition-colors">
                  90s
                </button>
                <button className="flex-1 py-3 border border-border rounded-lg font-semibold hover:bg-hover transition-colors">
                  120s
                </button>
              </div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border flex items-center justify-between">
              <div>
                <span className="font-medium block">Auto-Start Rest Timer</span>
                <span className="text-sm text-muted-foreground">
                  Automatically start rest timer after logging a set
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Nutrition Preferences */}
        <section className="px-4 md:px-6 py-6 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-brand-primary" />
            <h2 className="text-lg font-semibold">Nutrition Preferences</h2>
          </div>
          <div className="space-y-2">
            <div className="bg-card rounded-lg p-4 border border-border">
              <span className="font-medium block mb-3">Meal Planning</span>
              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-brand-primary text-white rounded-lg font-semibold">
                  Daily
                </button>
                <button className="flex-1 py-3 border border-border rounded-lg font-semibold hover:bg-hover transition-colors">
                  Weekly
                </button>
              </div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border flex items-center justify-between">
              <div>
                <span className="font-medium block">Show Macros on Cards</span>
                <span className="text-sm text-muted-foreground">
                  Display macro breakdown on meal cards
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
