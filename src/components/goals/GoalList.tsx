import React from 'react';
import { useRouter } from 'next/navigation';
import { UserGoal } from '@/types/user';
import Button from '@/components/ui/Button';
import { Edit, Trash2, CheckCircle, Circle, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoalListProps {
    goals: UserGoal[];
    onEdit: (goal: UserGoal) => void;
    onDelete: (goal: UserGoal) => void;
}

export function GoalList({ goals, onEdit, onDelete }: GoalListProps) {
    const router = useRouter();
    const [expandedGoals, setExpandedGoals] = React.useState<Set<string>>(new Set());

    const toggleGoal = (goalId: string) => {
        setExpandedGoals(prev => {
            const next = new Set(prev);
            if (next.has(goalId)) {
                next.delete(goalId);
            } else {
                next.add(goalId);
            }
            return next;
        });
    };

    if (goals.length === 0) {
        return (
            <div className="bg-card py-12 border border-border border-dashed rounded-lg text-center">
                <p className="text-muted-foreground">No goals found. Create one to get started!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {goals.map((goal) => {
                const isExpanded = expandedGoals.has(goal.id);
                const components = goal.components || [];
                const completedComponents = components.filter(c => c.complete).length;
                const totalComponents = components.length;
                const progressPercentage = totalComponents > 0 
                    ? Math.round((completedComponents / totalComponents) * 100) 
                    : 0;
                const hasComponents = totalComponents > 0;

                return (
                    <div 
                        key={goal.id} 
                        className="bg-card hover:bg-hover border border-border rounded-(--radius) p-2 overflow-hidden transition-colors cursor-pointer"
                        onClick={() => router.push(`/me/goals/${goal.id}`)}
                    >
                        <div className="flex justify-between items-start gap-4 p-4">
                            <div className="flex flex-1 items-start gap-3">
                                <div className="flex-1">
                                    <h3 className={cn("font-medium", goal.complete && "line-through text-muted-foreground")}>
                                        {goal.name}
                                    </h3>
                                    {goal.description && (
                                        <p className="mt-1 text-muted-foreground text-sm">{goal.description}</p>
                                    )}
                                    <div className="flex flex-wrap gap-3 mt-2 text-muted-foreground text-xs">
                                        {goal.duration && (
                                            <span>{goal.duration.value} {goal.duration.unit}</span>
                                        )}
                                        {goal.startDate && (
                                            <span>Started: {new Date(goal.startDate).toLocaleDateString()}</span>
                                        )}
                                        {hasComponents && (
                                            <span className="font-medium">
                                                {completedComponents}/{totalComponents} components ({progressPercentage}%)
                                            </span>
                                        )}
                                    </div>
                                    {hasComponents && (
                                        <div className="mt-2">
                                            <div className="bg-muted rounded-full w-full h-2">
                                                <div
                                                    className={cn(
                                                        "rounded-full h-2 transition-all",
                                                        progressPercentage === 100 
                                                            ? "bg-brand-primary" 
                                                            : "bg-brand-primary/60"
                                                    )}
                                                    style={{ width: `${progressPercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isExpanded && hasComponents && (
                            <div className="space-y-2 px-4 pt-4 pb-4 border-border border-t">
                                <h4 className="mb-2 font-medium text-muted-foreground text-sm">
                                    Components
                                </h4>
                                {components
                                    .sort((a, b) => a.priority - b.priority)
                                    .map((component) => (
                                        <div
                                            key={component.id}
                                            className={cn(
                                                "p-3 border border-border rounded-lg",
                                                component.complete && "bg-muted/30"
                                            )}
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex flex-1 items-start gap-2">
                                                    <div className={cn(
                                                        "mt-0.5",
                                                        component.complete ? "text-brand-primary" : "text-muted-foreground"
                                                    )}>
                                                        {component.complete ? (
                                                            <CheckCircle size={16} />
                                                        ) : (
                                                            <Circle size={16} />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={cn(
                                                            "font-medium text-sm",
                                                            component.complete && "line-through text-muted-foreground"
                                                        )}>
                                                            {component.name}
                                                        </p>
                                                        {component.description && (
                                                            <p className="mt-1 text-muted-foreground text-xs">
                                                                {component.description}
                                                            </p>
                                                        )}
                                                        <div className="flex gap-2 mt-1 text-muted-foreground text-xs">
                                                            <span>Priority: {component.priority}</span>
                                                            {component.notes && (
                                                                <span>• {component.notes}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
