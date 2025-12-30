'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserGoal } from '@/types/user';
import { GoalList } from '@/components/goals/GoalList';
import { GoalForm } from '@/components/goals/GoalForm';
import Button from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { useToast } from '@/components/ui/Toast';
import { Plus, Dumbbell } from 'lucide-react';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';

export default function GoalsPage() {
    const router = useRouter();
    const [goals, setGoals] = useState<UserGoal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [deletingGoal, setDeletingGoal] = useState<UserGoal | null>(null);
    
    const { showToast } = useToast();

    const fetchGoals = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/me/goals');
            if (!res.ok) throw new Error('Failed to fetch goals');
            const data = await res.json();
            setGoals(data.goals);
        } catch (error) {
            console.error(error);
            showToast({
                title: 'Error',
                description: 'Failed to load goals',
                variant: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleCreate = async (data: Partial<UserGoal>) => {
        try {
            const res = await fetch('/api/me/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            
            if (!res.ok) throw new Error('Failed to create goal');
            
            const result = await res.json();
            await fetchGoals();
            setIsCreating(false);
            showToast({ title: 'Success', description: 'Goal created successfully', variant: 'success' });
            // Navigate to the new goal
            router.push(`/me/goals/${result.goal.id}`);
        } catch (error) {
            console.error(error);
            showToast({ title: 'Error', description: 'Failed to create goal', variant: 'error' });
        }
    };

    const handleDelete = async () => {
        if (!deletingGoal) return;
        try {
            const res = await fetch(`/api/me/goals/${deletingGoal.id}`, {
                method: 'DELETE',
            });
            
            if (!res.ok) throw new Error('Failed to delete goal');
            
            await fetchGoals();
            setDeletingGoal(null);
            showToast({ title: 'Success', description: 'Goal deleted successfully', variant: 'success' });
        } catch (error) {
            console.error(error);
            showToast({ title: 'Error', description: 'Failed to delete goal', variant: 'error' });
        }
    };

    if (isCreating) {
        return (
            <PageLayout
                breadcrumbHref="/me/goals"
                breadcrumbText="Goals"
                title="New Goal"
                subtitle="Create a new goal"
            >
                <GoalForm 
                    onSubmit={handleCreate} 
                    onCancel={() => setIsCreating(false)}
                />
            </PageLayout>
        );
    }

    return (
        <PageLayout
            breadcrumbHref="/me"
            breadcrumbText="Me"
            title="Goals"
            subtitle="Manage your goals"
        >
            <div className="space-y-2 mb-6">
                <Button className="mb-6 w-full" onClick={() => setIsCreating(true)}>
                    <Plus className="mr-2 w-4 h-4" />
                    New Goal
                </Button>
                <Link href="/me/goals/keys" className="flex justify-between items-center bg-card hover:bg-hover p-4 border border-border rounded-(--radius) w-full transition-colors">
                    <div className="flex items-center gap-3">
                        <Dumbbell className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">Key Exercises</span>
                    </div>
                </Link>
            </div>
            {isLoading ? (
                <div className="py-12 text-muted-foreground text-center">Loading goals...</div>
            ) : (
                <GoalList 
                    goals={goals} 
                    onEdit={() => {}} 
                    onDelete={setDeletingGoal} 
                />
            )}

            <ConfirmationModal
                isOpen={!!deletingGoal}
                onClose={() => setDeletingGoal(null)}
                onConfirm={handleDelete}
                title="Delete Goal"
                message="Are you sure you want to delete this goal? This action cannot be undone."
                confirmVariant="danger"
                confirmText="Delete"
            />
        </PageLayout>
    );
}
