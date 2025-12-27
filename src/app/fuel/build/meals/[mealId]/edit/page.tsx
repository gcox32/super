import { notFound } from 'next/navigation';
import MealForm from '@/components/fuel/build/meals/MealForm';
import PageLayout from '@/components/layout/PageLayout';

interface PageProps {
  params: Promise<{ mealId: string }>;
}

export default async function EditMealPage({ params }: PageProps) {
  const { mealId } = await params;

  return (
    <PageLayout
      breadcrumbHref="/fuel/build/meals"
      breadcrumbText="Meals"
      title="Edit Meal"
    >
      <MealForm mealId={mealId} isEditing />
    </PageLayout>
  );
}

