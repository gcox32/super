'use client';

import PageLayout from '@/components/layout/PageLayout';
import { SleepForm } from '@/components/log/sleep/SleepForm';

export default function NewSleepLogPage() {
    return (
        <PageLayout
            title="Log Sleep"
            subtitle="Add a new sleep entry"
            breadcrumbHref="/log/sleep"
            breadcrumbText="Sleep"
        >
            <div className="px-4 pb-8 max-w-2xl mx-auto">
                <SleepForm />
            </div>
        </PageLayout>
    );
}

