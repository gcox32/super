import FoodForm from '@/components/fuel/build/foods/FoodForm';
import PageLayout from '@/components/layout/PageLayout';

export default function NewFoodPage() {
  return (
    <PageLayout
      breadcrumbHref="/fuel/build/foods"
      breadcrumbText="Foods"
      title="New Food"
    >
      <FoodForm />
    </PageLayout>
  );
}

