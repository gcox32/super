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
            <Plus className="mr-2 w-4 h-4" />
            New Protocol
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="border-brand-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
        </div>
      ) : (
        <div className="gap-4 grid sm:grid-cols-2 lg:grid-cols-3">
          {protocols.map(protocol => (
            <Link key={protocol.id} href={`/train/build/protocols/${protocol.id}/edit`} className="block">
              <div className="bg-card shadow-sm p-6 border border-gray-200 hover:border-brand-primary rounded-lg h-full transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-300 text-lg">{protocol.name || 'Untitled Protocol'}</h3>
                </div>
                <p className="mb-4 min-h-[2.5em] text-gray-500 text-sm line-clamp-2">
                  {protocol.description || 'No description provided.'}
                </p>

                <div className="flex items-center gap-4 mb-3 text-gray-400 text-xs">
                  <div className="flex items-center">
                    <Calendar className="mr-1 w-3 h-3" />
                    {new Date(protocol.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {protocol.objectives && protocol.objectives.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {protocol.objectives.slice(0, 2).map((obj, i) => (
                      <span key={i} className="inline-flex items-center bg-gray-100 px-2 py-0.5 rounded-full font-medium text-[10px] text-gray-600">
                        <Target className="mr-1 w-3 h-3" />
                        {obj}
                      </span>
                    ))}
                    {protocol.objectives.length > 3 && (
                      <span className="inline-flex items-center bg-gray-100 px-2 py-0.5 rounded-full font-medium text-[10px] text-gray-600">
                        +{protocol.objectives.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
          {protocols.length === 0 && (
            <div className="bg-card shadow rounded-lg sm:rounded-md overflow-hidden">
              <ul className="divide-y divide-gray-200">

                <li className="px-6 py-4 text-gray-500 text-center">
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

