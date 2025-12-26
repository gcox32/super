import Link from 'next/link';
import Button from '@/components/ui/Button';
import PageLayout from '@/components/layout/PageLayout';

export default function FuelPage() {
  return (
    <PageLayout
      title="Fuel"
      subtitle="Plan and track your nutrition"
    >
      {/* Current Meal Plan */}
      <div className="md:mx-auto md:max-w-4xl">
        <section className="px-4 md:px-6 py-6">
          <h2 className="mb-3 font-semibold text-lg">Current Meal Plan</h2>
          <div className="bg-card p-4 border border-border rounded-lg">
            <div className="flex justify-between items-center gap-3">
              <div>
                <p className="font-medium text-sm">No active meal plan</p>
                <p className="mt-1 text-muted-foreground text-xs">
                  When you start a meal plan, it will appear here with your
                  weekly structure.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 md:px-6 py-6 border-border border-t">
          <Link href="/fuel/build">
            <Button variant="primary" size="lg" className="w-full">
              Build
            </Button>
          </Link>
        </section>


      </div>
    </PageLayout>
  );
}
