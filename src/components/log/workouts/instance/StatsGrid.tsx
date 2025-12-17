import type { WorkoutInstance } from "@/types/train";

export default function StatsGrid({ instance }: { instance: WorkoutInstance }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card p-4 rounded-lg border border-border">
                <div className="text-sm text-muted-foreground">Duration</div>
                <div className="text-xl font-bold">{instance.duration ? `${instance.duration.value} ${instance.duration.unit}` : '-'}</div>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
                <div className="text-sm text-muted-foreground">Volume</div>
                <div className="text-xl font-bold">{instance.volume ? `${instance.volume.value} ${instance.volume.unit}` : '-'}</div>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
                <div className="text-sm text-muted-foreground">Avg Power</div>
                <div className="text-xl font-bold">{instance.averagePower ? `${instance.averagePower.value} ${instance.averagePower.unit}` : '-'}</div>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
                <div className="text-sm text-muted-foreground">Work</div>
                <div className="text-xl font-bold">{instance.work ? `${instance.work.value} ${instance.work.unit}` : '-'}</div>
            </div>
        </div>
    );
}