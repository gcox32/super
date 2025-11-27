'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Dumbbell, ForkKnife, ChartBar, User } from 'lucide-react';

const navItems = [
  { name: 'Today', href: '/', icon: Home },
  { name: 'Train', href: '/train', icon: Dumbbell },
  { name: 'Eat', href: '/eat', icon: ForkKnife },
  { name: 'Insights', href: '/insights', icon: ChartBar },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`focus:bg-hover flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-brand-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <span className="text-2xl mb-1"><item.icon className="w-6 h-6" /></span>
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

