'use client';

import { SleepInstance } from '@/types/fuel';

interface SleepStatsProps {
    instances: SleepInstance[];
}

export function SleepStats({ instances }: SleepStatsProps) {
    // Helper to calculate average
    const calculateAverage = (data: number[]) => {
        if (data.length === 0) return 0;
        const sum = data.reduce((a, b) => a + b, 0);
        return sum / data.length;
    };

    // Calculate streaks
    const calculateStreak = () => {
        if (instances.length === 0) return 0;
        
        // Sort descending by date just in case
        const sorted = [...instances].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check if latest is today or yesterday to start streak
        const latestDate = new Date(sorted[0].date);
        latestDate.setHours(0, 0, 0, 0);
        
        const diffTime = Math.abs(today.getTime() - latestDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays > 1) return 0; // Streak broken if latest is older than yesterday

        streak = 1;
        for (let i = 0; i < sorted.length - 1; i++) {
            const current = new Date(sorted[i].date);
            const next = new Date(sorted[i+1].date);
            
            const dayDiff = (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24);
            if (Math.round(dayDiff) === 1) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    };

    // Filter last 7 and 30 days
    // Assuming instances are sorted desc
    const now = new Date();
    const last7Days = instances.filter(i => {
        const d = new Date(i.date);
        const diff = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
        return diff <= 7;
    });

    const last30Days = instances.filter(i => {
        const d = new Date(i.date);
        const diff = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
        return diff <= 30;
    });

    // Stats
    const avgSleep7 = calculateAverage(last7Days.map(i => i.timeAsleep?.value || 0));
    const avgScore7 = calculateAverage(last7Days.map(i => i.sleepScore || 0));
    
    const avgSleep30 = calculateAverage(last30Days.map(i => i.timeAsleep?.value || 0));
    const avgScore30 = calculateAverage(last30Days.map(i => i.sleepScore || 0));
    
    const streak = calculateStreak();

    const formatHours = (hours: number) => {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m}m`;
    };

    return (
        <div className="gap-4 grid grid-cols-2 md:grid-cols-4 mb-8">
            <div className="bg-card p-4 border border-border rounded-lg">
                <div className="mb-1 text-muted-foreground text-sm">7-Day Avg Sleep</div>
                <div className="font-bold text-2xl">{formatHours(avgSleep7)}</div>
            </div>
            <div className="bg-card p-4 border border-border rounded-lg">
                <div className="mb-1 text-muted-foreground text-sm">7-Day Avg Score</div>
                <div className="font-bold text-2xl">{Math.round(avgScore7) || '-'}</div>
            </div>
            <div className="bg-card p-4 border border-border rounded-lg">
                <div className="mb-1 text-muted-foreground text-sm">30-Day Avg Sleep</div>
                <div className="font-bold text-2xl">{formatHours(avgSleep30)}</div>
            </div>
             <div className="bg-card p-4 border border-border rounded-lg">
                <div className="mb-1 text-muted-foreground text-sm">Current Streak</div>
                <div className="flex items-center gap-2 font-bold text-2xl">
                    {streak} <span className="font-normal text-muted-foreground text-sm">days</span>
                </div>
            </div>
        </div>
    );
}

