'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Protocol } from '@/types/train';
import Button from '@/components/ui/Button';
import { Plus, Calendar, Target } from 'lucide-react';

export default function ProtocolList() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/train/protocols')
      .then(res => res.json())
      .then(data => setProtocols(data.protocols))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between">
        <Link href="/train/build/protocols/new">
          <Button className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            New Protocol
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {protocols.map(protocol => (
            <Link key={protocol.id} href={`/train/build/protocols/${protocol.id}/edit`} className="block">
              <div className="p-6 rounded-lg shadow-sm border border-gray-200 hover:border-brand-primary transition-colors h-full bg-card">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-300">{protocol.name || 'Untitled Protocol'}</h3>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 min-h-[2.5em]">
                  {protocol.description || 'No description provided.'}
                </p>

                <div className="flex items-center text-xs text-gray-400 gap-4 mb-3">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(protocol.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {protocol.objectives && protocol.objectives.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {protocol.objectives.slice(0, 2).map((obj, i) => (
                      <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                        <Target className="h-3 w-3 mr-1" />
                        {obj}
                      </span>
                    ))}
                    {protocol.objectives.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                        +{protocol.objectives.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
          {protocols.length === 0 && (
            <div className="shadow overflow-hidden sm:rounded-md rounded-lg bg-card">
              <ul className="divide-y divide-gray-200">

                <li className="px-6 py-4 text-center text-gray-500">
                  No protocols found.
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

