import React from 'react';
import MealList from '@/components/fuel/build/meals/MealList';
import PageLayout from '@/components/layout/PageLayout';

export default function MealPage() {
  return (
    <PageLayout
      breadcrumbHref="/fuel/build"
      breadcrumbText="Build"
      title="Meals"
    >
      <MealList />
    </PageLayout>
  );
}