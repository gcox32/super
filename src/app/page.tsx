'use client';

import { Pencil, Ruler, Weight } from "lucide-react";

export default function Today() {
  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="md:max-w-4xl md:mx-auto">
        {/* Hero Section */}
        <section className="px-4 md:px-6 pt-6 pb-4 border-b border-border">
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-1">Today</h1>
            <p className="text-sm text-muted-foreground">
              Phase 1 • Week 2 • Day 3
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 bg-success/20 text-success rounded">
              AM Session
            </span>
            <span className="px-2 py-1 bg-brand-primary/20 text-brand-primary rounded">
              PM Session
            </span>
          </div>
        </section>

        {/* Today's Sessions */}
        <section className="px-4 md:px-6 py-6">
          <h2 className="text-lg font-semibold mb-4">Today's Sessions</h2>
          <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            {/* AM Session Card */}
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold mb-1">Heavy Lower</h3>
                  <p className="text-sm text-muted-foreground">
                    ~75 min
                  </p>
                </div>
                <span className="px-2 py-1 text-xs bg-warning/20 text-warning rounded">
                  Not started
                </span>
              </div>
              <button className="w-full py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary-dark transition-colors">
                Start Session
              </button>
            </div>

            {/* PM Session Card */}
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold mb-1">Upper Accessory</h3>
                  <p className="text-sm text-muted-foreground">
                    ~45 min
                  </p>
                </div>
                <span className="px-2 py-1 text-xs bg-warning/20 text-warning rounded">
                  Not started
                </span>
              </div>
              <button className="w-full py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary-dark transition-colors">
                Start Session
              </button>
            </div>
          </div>
        </section>

        {/* Today's Nutrition */}
        <section className="px-4 md:px-6 py-6 border-t border-border">
          <h2 className="text-lg font-semibold mb-4">Today's Nutrition</h2>
          
          {/* Macro Status */}
          <div className="bg-card rounded-lg p-4 mb-4 border border-border md:max-w-2xl">
            <div className="mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Calories</span>
                <span className="text-sm text-muted-foreground">
                  0 / 4,200
                </span>
              </div>
              <div className="w-full bg-input rounded-full h-2">
                <div className="bg-success h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Protein</span>
                <p className="font-semibold">0g / 200g</p>
              </div>
              <div>
                <span className="text-muted-foreground">Carbs</span>
                <p className="font-semibold">0g / 500g</p>
              </div>
              <div>
                <span className="text-muted-foreground">Fat</span>
                <p className="font-semibold">0g / 140g</p>
              </div>
            </div>
          </div>

          {/* Meal Cards */}
          <div className="space-y-2 md:max-w-2xl">
            {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((meal) => (
              <div
                key={meal}
                className="bg-card rounded-lg p-3 border border-border flex justify-between items-center"
              >
                <span className="font-medium">{meal}</span>
                <span className="text-sm text-muted-foreground">
                  Not planned
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2 md:max-w-2xl">
            <button className="flex-1 py-2.5 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary-dark transition-colors">
              Plan Today's Meals
            </button>
            <button className="flex-1 py-2.5 border border-border rounded-lg font-semibold hover:bg-hover transition-colors">
              Log Meal
            </button>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="px-4 md:px-6 py-6 border-t border-border">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3 md:max-w-2xl md:mx-auto">
            <button className="bg-card rounded-lg p-4 border border-border flex flex-col items-center hover:bg-hover transition-colors">
              <span className="text-2xl mb-2"><Weight className="w-6 h-6" /></span>
              <span className="text-sm font-medium">Log Bodyweight</span>
            </button>
            <button className="bg-card rounded-lg p-4 border border-border flex flex-col items-center hover:bg-hover transition-colors">
              <span className="text-2xl mb-2"><Ruler className="w-6 h-6" /></span>
              <span className="text-sm font-medium">Log Measurement</span>
            </button>
            <button className="bg-card rounded-lg p-4 border border-border flex flex-col items-center hover:bg-hover transition-colors">
              <span className="text-2xl mb-2"><Pencil className="w-6 h-6" /></span>
              <span className="text-sm font-medium">Add Note</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
