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
        <div className="gap-4 grid grid-cols-1 md:grid-cols-3 mt-4 mb-2">
            {/* Date & Time Input */}
            <div className="flex items-center gap-3 bg-zinc-900/30 p-3 border border-zinc-800/50 rounded-lg">
                <Calendar className="w-4 h-4 text-brand-primary shrink-0" />
                <div className="flex flex-1 justify-end items-center gap-3">
                    <input
                        type="date"
                        className="bg-transparent focus:outline-none text-gray-100 text-sm text-right scheme-dark"
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
                    <div className="bg-zinc-800 w-px h-4"></div>
                    <input
                        type="time"
                        className="bg-transparent focus:outline-none min-w-[96px] text-gray-100 text-sm text-right scheme-dark"
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
            <div className="flex items-center gap-3 py-3">
                <div className="flex flex-1 items-center gap-2 bg-zinc-900/30 p-3 border border-zinc-800/50 rounded-lg">
                    <Timer className="w-4 h-4 text-brand-primary shrink-0" />
                    <div className="flex flex-1 items-center gap-2">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider">Duration</span>
                        <div className="flex items-center gap-1 ml-auto">
                            <NumberInput
                                className="bg-transparent px-0 py-0 border-transparent focus:border-brand-primary border-b focus:outline-none w-12 h-auto text-gray-100 text-sm text-right"
                                value={instance.duration?.value}
                                onValueChange={(val) => {
                                    const newDuration = { value: val ?? 0, unit: instance.duration?.unit || 'min' };
                                    handleUpdateDuration(newDuration as TimeMeasurement);
                                }}
                                treatZeroAsEmpty
                                placeholder="-"
                            />
                            <span className="text-muted-foreground text-xs">{instance.duration?.unit || 'min'}</span>
                        </div>
                    </div>
                </div>
                <Link
                    href={`/log/workouts/${instanceId}/notes`}
                    className="group flex items-center gap-3 bg-zinc-900/30 hover:bg-zinc-800/50 p-3 border border-zinc-800/50 hover:border-brand-primary/50 rounded-lg h-12 transition-all"
                >
                    <FileText className="w-4 h-4 text-brand-primary group-hover:text-brand-accent transition-colors shrink-0" />
                    <span className="text-gray-300 group-hover:text-white text-sm transition-colors">Notes</span>
                </Link>
            </div>


        </div>
    );
}
