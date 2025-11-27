import { Weight, Ruler, Calendar, TrendingUp } from 'lucide-react';

export default function LogPage() {
  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="md:max-w-4xl md:mx-auto">
        {/* Header */}
        <section className="px-4 md:px-6 pt-6 pb-4 border-b border-border">
          <h1 className="text-2xl font-bold mb-1">Log</h1>
          <p className="text-sm text-muted-foreground">
            Track your progress and measurements
          </p>
        </section>

        {/* Quick Log Actions */}
        <section className="px-4 md:px-6 py-6">
          <h2 className="text-lg font-semibold mb-4">Quick Log</h2>
          <div className="grid grid-cols-2 gap-3 md:max-w-2xl">
            <button className="bg-card rounded-lg p-6 border border-border flex flex-col items-center hover:bg-hover transition-colors">
              <Weight className="w-8 h-8 mb-3 text-brand-primary" />
              <span className="font-semibold">Bodyweight</span>
              <span className="text-xs text-muted-foreground mt-1">Log weight</span>
            </button>
            <button className="bg-card rounded-lg p-6 border border-border flex flex-col items-center hover:bg-hover transition-colors">
              <Ruler className="w-8 h-8 mb-3 text-brand-primary" />
              <span className="font-semibold">Measurements</span>
              <span className="text-xs text-muted-foreground mt-1">Log measurements</span>
            </button>
          </div>
        </section>

        {/* Recent Logs */}
        <section className="px-4 md:px-6 py-6 border-t border-border">
          <h2 className="text-lg font-semibold mb-4">Recent Logs</h2>
          <div className="space-y-3">
            {[
              { type: 'Bodyweight', value: '185.2 lbs', date: 'Today', time: '8:00 AM' },
              { type: 'Bodyweight', value: '184.8 lbs', date: 'Yesterday', time: '8:00 AM' },
              { type: 'Chest', value: '42.5"', date: '2 days ago', time: '9:00 AM' },
            ].map((log, index) => (
              <div key={index} className="bg-card rounded-lg p-4 border border-border">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {log.type === 'Bodyweight' ? (
                        <Weight className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Ruler className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="font-semibold">{log.type}</span>
                    </div>
                    <p className="text-2xl font-bold">{log.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {log.date} • {log.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Progress Charts */}
        <section className="px-4 md:px-6 py-6 border-t border-border">
          <h2 className="text-lg font-semibold mb-4">Progress</h2>
          <div className="bg-card rounded-lg p-4 border border-border md:max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-brand-primary" />
              <h3 className="font-semibold">Bodyweight Trend</h3>
            </div>
            <div className="h-32 bg-input rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Chart coming soon</p>
            </div>
          </div>
        </section>

        {/* Stats Summary */}
        <section className="px-4 md:px-6 py-6 border-t border-border">
          <h2 className="text-lg font-semibold mb-4">This Week</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card rounded-lg p-4 border border-border text-center">
              <Calendar className="w-5 h-5 mx-auto mb-2 text-brand-primary" />
              <p className="text-2xl font-bold">5</p>
              <p className="text-xs text-muted-foreground">Logs</p>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border text-center">
              <p className="text-2xl font-bold">185.0</p>
              <p className="text-xs text-muted-foreground">Avg Weight</p>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border text-center">
              <p className="text-2xl font-bold">+0.2</p>
              <p className="text-xs text-muted-foreground">Change</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
