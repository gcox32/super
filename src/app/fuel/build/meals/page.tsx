import PageLayout from '@/components/layout/PageLayout';

export default function MealPage() {
  return (
    <PageLayout
      breadcrumbHref="/fuel/build"
      breadcrumbText="Build"
      title="Build Meals"
      subtitle="Manage your meals"
    >
      <div className="md:mx-auto md:max-w-4xl pb-24"></div>
    </PageLayout>
  );
}