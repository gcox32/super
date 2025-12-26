import PageLayout from '@/components/layout/PageLayout';

export default function FoodPage() {
  return (
    <PageLayout
      breadcrumbHref="/fuel/build"
      breadcrumbText="Build"
      title="Build Foods"
      subtitle="Manage your library of foods"
    >
      <div className="md:mx-auto md:max-w-4xl pb-24"></div>
    </PageLayout>
  );
}