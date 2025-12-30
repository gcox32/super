import TodaySessions from "@/components/today/TodaySessions";
import PageLayout from '@/components/layout/PageLayout';
import LatestSleep from "@/components/today/LatestSleep";
import TodayFuel from "@/components/today/TodayFuel";

export default function Today() {
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <PageLayout
      title="Today"
      subtitle={dateString}    >
        {/* Today's Sessions */}
        <section className="p-4">
          <TodaySessions />
        </section>
        <section className="p-4">
          <TodayFuel />
        </section>
        <section className="p-4">
          <LatestSleep />
        </section>
    </PageLayout>
  );
}
