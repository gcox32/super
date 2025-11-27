'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Dumbbell, ForkKnife, ChartBar, User } from 'lucide-react';

const navItems = [
  { name: 'Today', href: '/', icon: Home, className: 'rounded-l-4xl' },
  { name: 'Train', href: '/train', icon: Dumbbell, className: '' },
  { name: 'Eat', href: '/eat', icon: ForkKnife, className: '' },
  { name: 'Insights', href: '/insights', icon: ChartBar, className: '' },
  { name: 'Profile', href: '/profile', icon: User, className: 'rounded-r-4xl' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-1 left-1 right-1 z-20 bg-card border-t border-border rounded-4xl">
      <div className="flex justify-around items-center h-16 rounded-4xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`focus:bg-hover flex flex-col items-center justify-center flex-1 h-full transition-colors 
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

