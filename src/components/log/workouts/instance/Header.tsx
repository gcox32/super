'use client';

import { TimeMeasurement } from "@/types/measures";
import type { WorkoutInstance } from "@/types/train";
import Link from "next/link";
import { FileText, Calendar, Timer } from "lucide-react";
import { NumberInput } from "@/components/ui/NumberInput";
import { Dispatch, SetStateAction } from "react";
import { useParams } from "next/navigation";

interface WorkoutInstanceHeaderProps {
    instance: WorkoutInstance;
    setInstance: Dispatch<SetStateAction<WorkoutInstance | null>>;
}

export default function WorkoutInstanceHeader({ instance, setInstance }: WorkoutInstanceHeaderProps) {
    const { instanceId } = useParams();
    const handleUpdateDate = (date: Date) => {
        setInstance(prev => prev ? { ...prev, date } : null);
    };

    const handleUpdateDuration = (duration: TimeMeasurement) => {
        setInstance(prev => prev ? { ...prev, duration } : null);
    };

    // Helper to format date for input (YYYY-MM-DD)
    const getDateInputValue = (date: Date | string) => {
        const d = new Date(date);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-2">
            {/* Date & Time Input */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
                <Calendar className="w-4 h-4 text-brand-primary shrink-0" />
                <div className="flex items-center gap-3 flex-1 justify-end">
                    <input
                        type="date"
                        className="bg-transparent text-sm text-gray-100 focus:outline-none scheme-dark text-right"
                        value={getDateInputValue(instance.date)}
                        onChange={(e) => {
                            const dateStr = e.target.value; // YYYY-MM-DD
                            if (!dateStr) return;
                            const current = new Date(instance.date);
                            const [year, month, day] = dateStr.split('-').map(Number);
                            current.setFullYear(year);
                            current.setMonth(month - 1);
                            current.setDate(day);
                            handleUpdateDate(current);
                        }}
                    />
                    <div className="w-px h-4 bg-zinc-800"></div>
                    <input
                        type="time"
                        className="bg-transparent text-sm text-gray-100 focus:outline-none scheme-dark text-right min-w-[96px]"
                        value={new Date(instance.date).toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit' })}
                        onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':').map(Number);
                            const newDate = new Date(instance.date);
                            newDate.setHours(hours);
                            newDate.setMinutes(minutes);
                            handleUpdateDate(newDate);
                        }}
                    />
                </div>
            </div>

            {/* Duration Input */}
            <div className="flex items-center gap-3 p-3 ">
                <div className="flex items-center gap-2 flex-1 rounded-lg bg-zinc-900/30 border border-zinc-800/50 p-3">
                    <Timer className="w-4 h-4 text-brand-primary shrink-0" />
                    <div className="flex items-center gap-2 flex-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Duration</span>
                        <div className="flex items-center gap-1 ml-auto">
                            <NumberInput
                                className="w-12 bg-transparent text-sm text-right text-gray-100 focus:outline-none border-b border-transparent focus:border-brand-primary px-0 py-0 h-auto"
                                value={instance.duration?.value}
                                onValueChange={(val) => {
                                    const newDuration = { value: val ?? 0, unit: instance.duration?.unit || 'min' };
                                    handleUpdateDuration(newDuration as TimeMeasurement);
                                }}
                                treatZeroAsEmpty
                                placeholder="-"
                            />
                            <span className="text-xs text-muted-foreground">{instance.duration?.unit || 'min'}</span>
                        </div>
                    </div>
                </div>
                <Link
                    href={`/log/workouts/${instanceId}/notes`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-brand-primary/50 hover:bg-zinc-800/50 transition-all group"
                >
                    <FileText className="w-4 h-4 text-brand-primary shrink-0 group-hover:text-brand-accent transition-colors" />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Notes</span>
                </Link>
            </div>


        </div>
    );
}
