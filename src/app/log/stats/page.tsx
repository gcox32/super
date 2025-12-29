'use client';

import PageLayout from '@/components/layout/PageLayout';
import TabLayout, { Tab } from '@/components/ui/TabLayout';
import StatsForm from '@/components/log/StatsForm';
import OverviewTab from '@/components/log/stats/OverviewTab';
import HistoryTab from '@/components/log/stats/HistoryTab';

export default function StatsLogPage() {
  const tabs: Tab[] = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="md:mx-auto px-4 md:px-6 md:max-w-4xl">
          <OverviewTab />
        </div>
      ),
    },
    {
      id: 'record',
      label: 'Record',
      content: (
        <div className="md:mx-auto px-4 md:px-6 md:max-w-4xl">
          <StatsForm />
        </div>
      ),
    },
    {
      id: 'history',
      label: 'History',
      content: (
        <div className="md:mx-auto px-4 md:px-6 md:max-w-4xl">
          <HistoryTab />
        </div>
      ),
    },
  ];

  return (
    <PageLayout
      breadcrumbHref="/log"
      breadcrumbText="Log"
      title="Body Stats"
      subtitle="Log your weight and composition"
    >
      <TabLayout tabs={tabs} defaultTab="overview" />
    </PageLayout>
  );
}


