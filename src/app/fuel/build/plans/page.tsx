import PageLayout from '@/components/layout/PageLayout';

export default function PlanPage() {
  return (
    <PageLayout
      breadcrumbHref="/fuel/build"
      breadcrumbText="Build"
      title="Build Meal Plans"
      subtitle="Manage your meal plans"
    >
      <div className="md:mx-auto md:max-w-4xl pb-24"></div>
    </PageLayout>
  );
}