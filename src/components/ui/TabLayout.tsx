'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabLayoutProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export default function TabLayout({ tabs, defaultTab, className = '' }: TabLayoutProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get tab from URL parameter, or fall back to defaultTab or first tab
  const getInitialTab = (): string => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabs.some(tab => tab.id === tabParam)) {
      return tabParam;
    }
    return defaultTab || tabs[0]?.id || '';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);

  // Update active tab when URL parameter changes (e.g., browser back/forward)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabs.some(tab => tab.id === tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam && defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [searchParams, tabs, defaultTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Update URL with tab parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (tabs.length === 0) return null;

  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

  return (
    <div className={`space-y-6 pb-6 ${className}`}>
      {/* Tabs */}
      <div className="relative flex bg-card/50 mx-4 md:mx-6 p-1 border border-white/5 rounded-full">
        {/* Sliding pill indicator */}
        <div
          className="top-1 bottom-1 absolute bg-brand-primary shadow-brand-primary/25 shadow-lg rounded-full transition-all duration-300 ease-out"
          style={{
            width: `calc((100% - 8px) / ${tabs.length})`,
            left: `calc(4px + (100% - 8px) / ${tabs.length} * ${activeIndex})`,
          }}
        />

        {/* Tab buttons */}
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`relative z-10 flex-1 px-4 py-2 font-medium text-sm transition-colors duration-200 rounded-full ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-muted-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tabs.find(tab => tab.id === activeTab)?.content}
    </div>
  );
}

