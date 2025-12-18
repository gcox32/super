import React from 'react';
import { notFound } from 'next/navigation';
import { getProtocolById, getPhases } from '@/lib/db/crud/train';
import ProtocolForm from '@/components/train/build/protocols/ProtocolForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProtocolPage({ params }: PageProps) {
  const { id } = await params;
  const protocol = await getProtocolById(id);

  if (!protocol) {
    notFound();
  }

  // Fetch phases for this protocol
  const phases = await getPhases(id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-300">Edit Protocol</h1>
        <p className="mt-2 text-gray-600">Update training protocol and phases.</p>
      </div>
      <ProtocolForm 
        initialData={protocol} 
        initialPhases={phases}
        isEditing 
      />
    </div>
  );
}

