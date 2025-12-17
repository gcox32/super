import { Pencil, Ruler, Weight } from "lucide-react";
import Button from "@/components/ui/Button";
import TodaySessions from "@/components/today/TodaySessions";

export default function Today() {
  return (
    <div className="bg-background pb-20 min-h-screen">
      <div className="md:mx-auto md:max-w-4xl">
        {/* Hero Section */}
        <section className="px-4 md:px-6 pt-6 pb-4 border-border border-b">
          <div className="mb-4">
            <h1 className="mb-1 font-bold text-2xl">Today</h1>
            <p className="text-muted-foreground text-sm">
              Phase 1 • Week 2 • Day 3
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="bg-success/20 px-2 py-1 rounded text-success">
              AM Session
            </span>
            <span className="bg-brand-primary/20 px-2 py-1 rounded text-brand-primary">
              PM Session
            </span>
          </div>
        </section>

        {/* Today's Sessions */}
        <section className="px-4 md:px-6 py-6">
          <h2 className="mb-4 font-semibold text-lg">Today's Sessions</h2>
          <TodaySessions />
        </section>

        {/* Today's Nutrition */}
        <section className="px-4 md:px-6 py-6 border-border border-t">
          <h2 className="mb-4 font-semibold text-lg">Today's Nutrition</h2>
          
          {/* Macro Status */}
          <div className="bg-card mb-4 p-4 border border-border rounded-lg md:max-w-2xl">
            <div className="mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm">Calories</span>
                <span className="text-muted-foreground text-sm">
                  0 / 4,200
                </span>
              </div>
              <div className="bg-input rounded-full w-full h-2">
                <div className="bg-success rounded-full h-2" style={{ width: '0%' }}></div>
              </div>
            </div>
            <div className="gap-2 grid grid-cols-3 text-xs">
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
                className="flex justify-between items-center bg-card p-3 border border-border rounded-lg"
              >
                <span className="font-medium">{meal}</span>
                <span className="text-muted-foreground text-sm">
                  Not planned
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4 md:max-w-2xl">
            <Button variant="primary" className="w-full">
              Plan Meals
            </Button>
            <Button variant="outline" className="w-full">
              Log Meals
            </Button>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="px-4 md:px-6 py-6 border-border border-t">
          <h2 className="mb-4 font-semibold text-lg">Quick Actions</h2>
          <div className="gap-3 grid grid-cols-3 md:mx-auto md:max-w-2xl">
            <button className="flex flex-col items-center bg-card hover:bg-hover p-4 border border-border rounded-lg transition-colors">
              <span className="mb-2 text-2xl"><Weight className="w-6 h-6" /></span>
              <span className="font-medium text-sm">Log Bodyweight</span>
            </button>
            <button className="flex flex-col items-center bg-card hover:bg-hover p-4 border border-border rounded-lg transition-colors">
              <span className="mb-2 text-2xl"><Ruler className="w-6 h-6" /></span>
              <span className="font-medium text-sm">Log Measurement</span>
            </button>
            <button className="flex flex-col items-center bg-card hover:bg-hover p-4 border border-border rounded-lg transition-colors">
              <span className="mb-2 text-2xl"><Pencil className="w-6 h-6" /></span>
              <span className="font-medium text-sm">Add Note</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
