import { notFound } from 'next/navigation';
import { getFoodById } from '@/lib/db/crud/fuel';
import FoodForm from '@/components/fuel/build/foods/FoodForm';
import PageLayout from '@/components/layout/PageLayout';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFoodPage({ params }: PageProps) {
  const { id } = await params;
  const food = await getFoodById(id);

  if (!food) {
    notFound();
  }

  return (
    <PageLayout
      breadcrumbHref="/fuel/build/foods"
      breadcrumbText="Foods"
      title="Edit Food"
    >
      <FoodForm initialData={food} isEditing />
    </PageLayout>
  );
}
