'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { SleepStats } from '@/components/log/sleep/SleepStats';
import { SleepList } from '@/components/log/sleep/SleepList';
import Button from '@/components/ui/Button';
import { Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { SleepInstance } from '@/types/fuel';
import { useToast } from '@/components/ui/Toast';

export default function SleepDashboardPage() {
    const { showToast } = useToast();
    const [instances, setInstances] = useState<SleepInstance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSleepData() {
            try {
                // Fetch last 60 days to ensure we have enough for 30-day stats + buffer
                const now = new Date();
                const past = new Date();
                past.setDate(now.getDate() - 60);

                const params = new URLSearchParams({
                    dateFrom: past.toISOString(),
                });

                const res = await fetch(`/api/fuel/sleep?${params}`);
                if (!res.ok) throw new Error('Failed to fetch sleep data');

                const data = await res.json();
                setInstances(data.sleepInstances || []);
            } catch (error) {
                console.error(error);
                showToast({ title: 'Error', description: 'Failed to load sleep history', variant: 'error' });
            } finally {
                setLoading(false);
            }
        }

        fetchSleepData();
    }, [showToast]);

    return (
        <PageLayout
            title="Sleep"
            subtitle="Track your rest and recovery"
            breadcrumbHref="/log"
            breadcrumbText="Logs"
        >
            <div className="px-4 pb-8 max-w-4xl mx-auto">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        <SleepStats instances={instances} />
                        <section className="px-2 md:px-6 py-6 border-border border-t">
                        <Link href="/log/sleep/new" className="w-full">
                            <Button size="lg" variant="primary" className="w-full">
                                <Plus className="w-4 h-4" />
                                Log Sleep
                            </Button>
                        </Link>
                        </section>
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold mb-4">Recent History</h3>
                            <SleepList instances={instances} />
                        </div>
                    </>
                )}
            </div>
        </PageLayout>
    );
}
