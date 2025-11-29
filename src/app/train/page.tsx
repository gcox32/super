import Button from '@/components/ui/Button';
import { Play, Calendar, TrendingUp } from 'lucide-react';

export default function TrainPage() {
  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="md:max-w-4xl md:mx-auto">
        {/* Header */}
        <section className="px-4 md:px-6 pt-6 pb-4 border-b border-border">
          <h1 className="text-2xl font-bold mb-1">Train</h1>
          <p className="text-sm text-muted-foreground">
            Your training program and sessions
          </p>
        </section>

        {/* Upcoming Sessions */}
        <section className="px-4 md:px-6 py-6">
          <h2 className="text-lg font-semibold mb-4">Upcoming Sessions</h2>
          <div className="space-y-3">
            {[
              { name: 'Heavy Lower', duration: '75 min', date: 'Today' },
              { name: 'Upper Accessory', duration: '45 min', date: 'Today' },
              { name: 'Heavy Upper', duration: '90 min', date: 'Tomorrow' },
            ].map((session) => (
              <div key={session.name} className="bg-card rounded-lg p-4 border border-border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold mb-1">{session.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {session.duration} • {session.date}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-warning/20 text-warning rounded">
                    Scheduled
                  </span>
                </div>
                <Button variant="primary" fullWidth>
                  <Play className="w-4 h-4" />
                  Start Session
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Program Overview */}
        <section className="px-4 md:px-6 py-6 border-t border-border">
          <h2 className="text-lg font-semibold mb-4">Program Overview</h2>
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-brand-primary" />
              <div>
                <h3 className="font-semibold">Phase 1 • Week 2</h3>
                <p className="text-sm text-muted-foreground">Day 3 of 28</p>
              </div>
            </div>
            <div className="w-full bg-input rounded-full h-2 mb-2">
              <div className="bg-brand-primary h-2 rounded-full" style={{ width: '10%' }}></div>
            </div>
            <p className="text-xs text-muted-foreground">10% complete</p>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="px-4 md:px-6 py-6 border-t border-border">
          <h2 className="text-lg font-semibold mb-4">This Week</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card rounded-lg p-4 border border-border text-center">
              <TrendingUp className="w-5 h-5 mx-auto mb-2 text-brand-primary" />
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border text-center">
              <p className="text-2xl font-bold">4.5h</p>
              <p className="text-xs text-muted-foreground">Total Time</p>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border text-center">
              <p className="text-2xl font-bold">85%</p>
              <p className="text-xs text-muted-foreground">Completion</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
