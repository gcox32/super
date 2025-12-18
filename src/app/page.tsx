import TodaySessions from "@/components/today/TodaySessions";

export default function Today() {
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="bg-background pb-20 min-h-screen">
      <div className="md:mx-auto md:max-w-4xl">
        {/* Header Section */}
        <section className="px-4 md:px-6 pt-6 pb-4 border-border border-b">
          <div className="mb-4">
            <h1 className="mb-1 font-bold text-2xl">Today</h1>
            <p className="text-muted-foreground text-sm">
              {dateString}
            </p>
          </div>
        </section>

        {/* Today's Sessions */}
        <section className="px-4 md:px-6 py-6">
          <TodaySessions />
        </section>
      </div>
    </div>
  );
}
