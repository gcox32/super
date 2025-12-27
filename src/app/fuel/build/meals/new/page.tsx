import MealForm from '@/components/fuel/build/meals/MealForm';
import PageLayout from '@/components/layout/PageLayout';

export default function NewMealPage() {
  return (
    <PageLayout
      breadcrumbHref="/fuel/build/meals"
      breadcrumbText="Meals"
      title="New Meal"
    >
      <MealForm />
    </PageLayout>
  );
}

