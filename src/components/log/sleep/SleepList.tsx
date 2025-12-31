'use client';

import { SleepInstance } from '@/types/fuel';
import Link from 'next/link';
import { format } from 'date-fns';
import { ChevronRight, Moon, Star } from 'lucide-react';

interface SleepListProps {
    instances: SleepInstance[];
}

export function SleepList({ instances }: SleepListProps) {
    if (instances.length === 0) {
        return (
            <div className="py-12 text-muted-foreground text-center">
                No sleep logs found. Start tracking your sleep!
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {instances.map((instance) => {
                const date = new Date(instance.date);
                const hours = instance.timeAsleep?.value || 0;
                const h = Math.floor(hours);
                const m = Math.round((hours - h) * 60);
                
                return (
                    <Link 
                        key={instance.id} 
                        href={`/log/sleep/${instance.id}`}
                        className="block bg-card hover:bg-muted/50 p-4 border border-border rounded-lg transition-colors"
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="bg-brand-primary/10 p-2 rounded-full">
                                    <Moon className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <div className="font-semibold">{format(date, 'EEEE, MMM d')}</div>
                                    <div className="text-muted-foreground text-sm">
                                        {h}h {m}m • {instance.startTime && format(new Date(instance.startTime), 'h:mm a')} - {instance.endTime && format(new Date(instance.endTime), 'h:mm a')}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {instance.sleepScore !== undefined && (
                                    <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-full">
                                        <Star className="fill-yellow-500 w-3.5 h-3.5 text-yellow-500" />
                                        <span className="font-medium text-sm">{instance.sleepScore}</span>
                                    </div>
                                )}
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}

