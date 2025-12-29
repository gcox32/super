'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import PageLayout from '@/components/layout/PageLayout';
import TabLayout, { Tab } from '@/components/ui/TabLayout';
import TargetsTab from '@/components/fuel/TargetsTab';
import HistoryTab from '@/components/fuel/HistoryTab';
import RecordTab from '@/components/fuel/RecordTab';

export default function FuelPage() {
  const tabs: Tab[] = [
    {
      id: 'targets',
      label: 'Targets',
      content: (
        <div className="md:mx-auto px-4 md:px-6 md:max-w-4xl">
          <TargetsTab />
        </div>
      ),
    },
    {
      id: 'record',
      label: 'Record',
      content: (
        <div className="md:mx-auto px-4 md:px-6 md:max-w-4xl">
          <RecordTab />
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
      title="Fuel"
      subtitle="Plan and track your nutrition"
    >
      <div className="space-y-6">
        {/* Build Button */}
        <div className="px-4 md:px-6">
          <Link href="/fuel/build">
            <Button variant="primary" size="lg" className="w-full md:w-auto">
              Build
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <TabLayout tabs={tabs} defaultTab="targets" />
      </div>
    </PageLayout>
  );
}
