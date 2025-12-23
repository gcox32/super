'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PageLayout from '@/components/layout/PageLayout';
import { SleepForm } from '@/components/log/sleep/SleepForm';
import { SleepInstance } from '@/types/fuel';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function EditSleepLogPage() {
    const params = useParams();
    const id = params.id as string;
    const { showToast } = useToast();
    
    const [instance, setInstance] = useState<SleepInstance | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchInstance() {
            if (!id) return;
            try {
                // We need an endpoint to fetch by ID directly, but currently we only list.
                // However, the list endpoint filters by date.
                // We don't have a direct GET /api/fuel/sleep/[id] that returns data (only PATCH/DELETE).
                // But wait, standard REST usually implies GET exists too.
                // Let's check api/fuel/sleep/[id]/route.ts
                
                // If GET is missing, we should fetch list and filter or add GET.
                // Adding GET to [id] route is cleaner.
                
                // For now, I'll try to fetch list if GET [id] isn't implemented, but let's assume I'll fix the API.
                const res = await fetch(`/api/fuel/sleep/${id}`);
                
                if (res.ok) {
                    const data = await res.json();
                    if (data.sleepInstance) {
                        setInstance(data.sleepInstance);
                    }
                } else {
                     // Fallback: This might fail if GET isn't implemented.
                     throw new Error('Failed to fetch');
                }
            } catch (error) {
                console.error(error);
                showToast({ title: 'Error', description: 'Failed to load entry', variant: 'error' });
            } finally {
                setLoading(false);
            }
        }
        
        fetchInstance();
    }, [id, showToast]);

    if (loading) {
         return (
            <PageLayout title="Edit Sleep" breadcrumbHref="/log/sleep" breadcrumbText="Sleep">
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </PageLayout>
        );
    }

    if (!instance) {
        return (
             <PageLayout title="Edit Sleep" breadcrumbHref="/log/sleep" breadcrumbText="Sleep">
                <div className="p-8 text-center text-muted-foreground">
                    Sleep log not found.
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="Edit Sleep"
            subtitle="Update your sleep entry"
            breadcrumbHref="/log/sleep"
            breadcrumbText="Sleep"
        >
            <div className="px-4 pb-8 max-w-2xl mx-auto">
                <SleepForm initialData={instance} />
            </div>
        </PageLayout>
    );
}

