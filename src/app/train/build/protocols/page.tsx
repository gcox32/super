import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ProtocolList from '@/components/train/build/protocols/ProtocolList';

export default function ProtocolsPage() {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      <Link
        href="/train/build"
        className="inline-flex items-center gap-1 mb-4 text-muted-foreground hover:text-foreground text-xs"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Build
      </Link>
      <ProtocolList />
    </div>
  );
}
