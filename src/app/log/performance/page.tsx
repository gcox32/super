import PageLayout from "@/components/layout/PageLayout";
import { getPerformanceData } from "./actions";
import PerformanceDashboard from "@/components/log/performance/PerformanceDashboard";

export default async function PerformancePage() {
    const data = await getPerformanceData();

    if ('error' in data) {
        return (
            <PageLayout 
                breadcrumbHref="/log"
                breadcrumbText="Logs"
                title="Performance"
                subtitle="Track your performance"
            >
                <div className="text-red-500">{data.error}</div>
            </PageLayout>
        );
    }

    return (
        <PageLayout 
            breadcrumbHref="/log"
            breadcrumbText="Logs"
            title="Performance"
            subtitle="Track your performance"
        >
            <PerformanceDashboard 
                workoutStats={data.workoutStats} 
                keyExerciseStats={data.keyExerciseStats} 
            />
        </PageLayout>
    );
}
