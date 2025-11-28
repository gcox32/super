import { User, Settings, Target, Calendar } from 'lucide-react';

export default function MePage() {
  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="md:max-w-4xl md:mx-auto">
        {/* Header */}
        <section className="px-4 md:px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Me</h1>
              <p className="text-sm text-muted-foreground">
                Manage your account and settings
              </p>
            </div>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="px-4 md:px-6 py-6">
          <h2 className="text-lg font-semibold mb-4">Overview</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-brand-primary" />
                <span className="text-sm text-muted-foreground">Current Phase</span>
              </div>
              <p className="text-xl font-bold">Phase 1</p>
              <p className="text-xs text-muted-foreground mt-1">Week 2 of 4</p>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-brand-primary" />
                <span className="text-sm text-muted-foreground">Days Active</span>
              </div>
              <p className="text-xl font-bold">14</p>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </div>
          </div>
        </section>

        {/* Settings */}
        <section className="px-4 md:px-6 py-6 border-t border-border">
          <h2 className="text-lg font-semibold mb-4">Settings</h2>
          <div className="space-y-2">
            <button className="w-full bg-card rounded-lg p-4 border border-border flex items-center justify-between hover:bg-hover transition-colors">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Preferences</span>
              </div>
              <span className="text-muted-foreground">→</span>
            </button>
            <button className="w-full bg-card rounded-lg p-4 border border-border flex items-center justify-between hover:bg-hover transition-colors">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Goals</span>
              </div>
              <span className="text-muted-foreground">→</span>
            </button>
            <button className="w-full bg-card rounded-lg p-4 border border-border flex items-center justify-between hover:bg-hover transition-colors">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Profile</span>
              </div>
              <span className="text-muted-foreground">→</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
