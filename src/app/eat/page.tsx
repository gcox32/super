import { UtensilsCrossed, Target, Plus } from 'lucide-react';

export default function EatPage() {
  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="md:max-w-4xl md:mx-auto">
        {/* Header */}
        <section className="px-4 md:px-6 pt-6 pb-4 border-b border-border">
          <h1 className="text-2xl font-bold mb-1">Eat</h1>
          <p className="text-sm text-muted-foreground">
            Plan and track your nutrition
          </p>
        </section>

        {/* Today's Macros */}
        <section className="px-4 md:px-6 py-6">
          <h2 className="text-lg font-semibold mb-4">Today's Macros</h2>
          <div className="bg-card rounded-lg p-4 border border-border md:max-w-2xl">
            <div className="mb-4">
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Protein</span>
                <p className="font-semibold">0g / 200g</p>
                <div className="w-full bg-input rounded-full h-1 mt-2">
                  <div className="bg-success h-1 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Carbs</span>
                <p className="font-semibold">0g / 500g</p>
                <div className="w-full bg-input rounded-full h-1 mt-2">
                  <div className="bg-success h-1 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Fat</span>
                <p className="font-semibold">0g / 140g</p>
                <div className="w-full bg-input rounded-full h-1 mt-2">
                  <div className="bg-success h-1 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Meals */}
        <section className="px-4 md:px-6 py-6 border-t border-border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Meals</h2>
            <button className="text-sm text-brand-primary hover:underline">
              Plan Day
            </button>
          </div>
          <div className="space-y-2 md:max-w-2xl">
            {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((meal) => (
              <div
                key={meal}
                className="bg-card rounded-lg p-4 border border-border"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <UtensilsCrossed className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <span className="font-medium block">{meal}</span>
                      <span className="text-sm text-muted-foreground">
                        Not planned
                      </span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-hover rounded-lg transition-colors">
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="px-4 md:px-6 py-6 border-t border-border">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-2 md:max-w-2xl">
            <button className="flex-1 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary-dark transition-colors">
              Log Meal
            </button>
            <button className="flex-1 py-3 border border-border rounded-lg font-semibold hover:bg-hover transition-colors">
              Plan Meals
            </button>
          </div>
        </section>

        {/* Weekly Target */}
        <section className="px-4 md:px-6 py-6 border-t border-border">
          <div className="bg-card rounded-lg p-4 border border-border md:max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-5 h-5 text-brand-primary" />
              <h3 className="font-semibold">Weekly Target</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Average daily calories: 4,200
            </p>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 bg-success/20 text-success rounded">
                On track
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
