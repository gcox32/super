'use client';

import type { ExerciseMeasures, WorkoutBlockExercise, WorkoutBlockExerciseInstance, WorkoutBlockInstance } from "@/types/train";
import Link from "next/link";
import { FileText, Plus, X } from "lucide-react";
import { NumberInput } from "@/components/ui/NumberInput";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";

interface WorkoutInstanceBlockProps {
    blockInstance: WorkoutBlockInstance;
    handleUpdateSetLocal: (setId: string, updates: Partial<WorkoutBlockExerciseInstance>) => void;
    handleAddSet: (blockInstanceId: string, exerciseId: string) => Promise<void>;
    handleDeleteSet: (setId: string, blockInstanceId: string) => Promise<void>;
}

const getGroupedExercises = (blockInstance: any) => {
    if (!blockInstance.exerciseInstances) return [];

    const groups: Record<string, { definition: WorkoutBlockExercise, sets: WorkoutBlockExerciseInstance[] }> = {};

    blockInstance.exerciseInstances.forEach((inst: WorkoutBlockExerciseInstance) => {
        const defId = inst.workoutBlockExerciseId;
        if (inst.workoutBlockExercise) {
            if (!groups[defId]) {
                groups[defId] = {
                    definition: inst.workoutBlockExercise,
                    sets: []
                };
            }
            groups[defId].sets.push(inst);
        }
    });

    return Object.values(groups).sort((a, b) => a.definition.order - b.definition.order);
};

export default function WorkoutInstanceBlock({ blockInstance, handleUpdateSetLocal, handleAddSet, handleDeleteSet }: WorkoutInstanceBlockProps) {
    const { instanceId } = useParams();
    
    const updateMeasure = (setId: string, currentMeasures: ExerciseMeasures, key: keyof ExerciseMeasures, value: any) => {
        const newMeasures = { ...currentMeasures, [key]: value };
        handleUpdateSetLocal(setId, { measures: newMeasures });
    };

    const updateLoad = (setId: string, currentMeasures: ExerciseMeasures, value: number | undefined) => {
        const currentLoad = currentMeasures.externalLoad || { value: 0, unit: 'lbs' };
        const newLoad = { ...currentLoad, value: value ?? 0 };
        const newMeasures = { ...currentMeasures, externalLoad: newLoad };
        handleUpdateSetLocal(setId, { measures: newMeasures });
    };

    return (
            <div key={blockInstance.id} className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="px-4 py-3 bg-zinc-800/50 border-b border-border flex justify-between items-center">
                    <h3 className="font-semibold text-lg">
                        {blockInstance.workoutBlock?.name || 'Block'}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                        {blockInstance.workoutBlock?.circuit ? 'Circuit' : ''}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider px-2 py-1 rounded bg-zinc-800 border border-zinc-700">
                        {blockInstance.workoutBlock?.workoutBlockType}
                    </span>
                </div>
                <div className="p-4 space-y-6">
                    {getGroupedExercises(blockInstance).map((group) => (
                        <div key={group.definition.id} className="space-y-3">
                            <div className="flex items-center justify-between flex-col gap-2">
                                <h4 className="font-medium text-brand-primary text-lg">
                                    {group.definition.exercise.name}
                                </h4>
                                <div className="flex items-center justify-between w-full gap-3">
                                    <span className="text-xs text-muted-foreground">
                                        {group.definition.restTime ? `Rest: ${group.definition.restTime}s` : ''}
                                    </span>
                                    <Link href={`/log/workouts/${instanceId}/notes/${group.definition.id}`} className="text-muted-foreground hover:text-brand-primary transition-colors">
                                        <FileText className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase bg-zinc-900/50">
                                        <tr>
                                            <th className="px-3 py-2 rounded-l-md w-12 text-center">Set</th>
                                            <th className="px-3 py-2 w-24">Reps</th>
                                            <th className="px-3 py-2 w-32">Load</th>
                                            <th className="px-3 py-2 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800/50">
                                        {group.sets.map((set, index) => (
                                            <tr key={set.id} className="hover:bg-zinc-800/30 group/row">
                                                <td className="px-3 py-2 text-center font-medium text-muted-foreground">
                                                    {index + 1}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <NumberInput
                                                        className="w-16 bg-transparent border border-zinc-700 rounded px-2 py-1 text-center focus:border-brand-primary outline-none focus:ring-1 focus:ring-brand-primary"
                                                        value={set.measures.reps}
                                                        onValueChange={(val) => updateMeasure(set.id, set.measures, 'reps', val)}
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center gap-1">
                                                        <NumberInput
                                                            className="w-20 bg-transparent border border-zinc-700 rounded px-2 py-1 text-center focus:border-brand-primary outline-none focus:ring-1 focus:ring-brand-primary"
                                                            value={set.measures.externalLoad?.value}
                                                            onValueChange={(val) => updateLoad(set.id, set.measures, val)}
                                                            allowFloat
                                                            treatZeroAsEmpty
                                                        />
                                                        <span className="text-muted-foreground text-xs">
                                                            {set.measures.externalLoad?.unit || ''}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 pr-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteSet(set.id, blockInstance.id)}
                                                        className="text-xs h-7 text-muted-foreground hover:text-brand-primary px-2"
                                                        title="Delete Set"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="mt-2 px-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleAddSet(blockInstance.id, group.definition.id)}
                                        className="text-xs h-7 text-muted-foreground hover:text-brand-primary px-2"
                                    >
                                        <Plus className="w-3 h-3 mr-1" /> Add Set
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
    )
}