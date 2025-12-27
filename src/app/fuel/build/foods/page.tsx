import React from 'react';
import FoodList from '@/components/fuel/build/foods/FoodList';
import PageLayout from '@/components/layout/PageLayout';

export default function FoodPage() {
  return (
    <PageLayout
      breadcrumbHref="/fuel/build"
      breadcrumbText="Build"
      title="Foods"
    >
      <FoodList />
    </PageLayout>
  );
}