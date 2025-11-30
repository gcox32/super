'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Dumbbell, ForkKnife, User, ListChecks } from 'lucide-react';

const navItems = [
  { name: 'Today', href: '/', icon: Home, className: 'rounded-l-4xl' },
  { name: 'Train', href: '/train', icon: Dumbbell, className: '' },
  { name: 'Fuel', href: '/fuel', icon: ForkKnife, className: '' },
  { name: 'Log', href: '/log', icon: ListChecks, className: '' },
  { name: 'Me', href: '/me', icon: User, className: 'rounded-r-4xl' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-2 left-2 right-2 z-20 bg-card border-t border-border rounded-4xl">
      <div className="flex justify-around items-center h-16 rounded-4xl">
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
              <span className="text-2xl mb-1"><item.icon className="w-6 h-6" /></span>
              <span className="text-xs font-medium hidden md:block">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

