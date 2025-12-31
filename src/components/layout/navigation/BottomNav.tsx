'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from './config';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="right-2 bottom-2 left-2 z-20 fixed bg-card/80 shadow-black/30 shadow-lg backdrop-blur-xl border border-white/10 rounded-4xl">
      <div className="flex justify-around items-center rounded-4xl h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`cursor-pointer hover:bg-hover focus:bg-hover flex flex-col items-center justify-center flex-1 h-full transition-colors 
                ${ item.className } 
                ${ isActive
                  ? 'text-brand-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <span className="mb-1 text-2xl"><item.icon className="w-6 h-6" /></span>
              <span className="hidden md:block font-medium text-xs">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

