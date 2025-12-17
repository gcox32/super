import { PersonStanding, Ribbon } from "lucide-react";

type HighlightsProps = {
    latestWeight?: { value: number, unit: string };
    latestBodyFat?: { value: number };
    latestStatsDate?: string;
}

export default function Highlights({ latestWeight, latestBodyFat, latestStatsDate }: HighlightsProps) {
    return (
        <div className="gap-3 grid grid-cols-2 md:max-w-xl">
            <div className="bg-card px-4 py-3 border border-border rounded-xl">
                <div className="flex items-center gap-2 mb-1 text-muted-foreground text-xs uppercase tracking-[0.18em]">
                    <PersonStanding className="w-4 h-4 text-brand-primary" />
                    Weight
                </div>
                <div className="font-semibold text-2xl">
                    {latestWeight?.value ?? '--'}
                    {latestWeight?.unit && (
                        <span className="ml-1 font-normal text-muted-foreground text-sm">
                            {latestWeight.unit}
                        </span>
                    )}
                </div>
                <div className="mt-1 text-muted-foreground text-xs">
                    As of {(latestStatsDate ? new Date(latestStatsDate).toLocaleDateString() : '--')}
                </div>
            </div>

            <div className="bg-card px-4 py-3 border border-border rounded-xl">
                <div className="flex items-center gap-2 mb-1 text-muted-foreground text-xs uppercase tracking-[0.18em]">
                    <Ribbon className="w-4 h-4 text-brand-primary" />
                    Body Fat
                </div>
                <div className="font-semibold text-2xl">
                    {latestBodyFat?.value ?? '--'}
                    {typeof latestBodyFat?.value === 'number' && (
                        <span className="ml-1 font-normal text-muted-foreground text-sm">
                            %
                        </span>
                    )}
                </div>
                <div className="mt-1 text-muted-foreground text-xs">
                    From latest estimate
                </div>
            </div>
        </div>
    );
}
