import { Dumbbell, ForkKnife, Home, User, CalendarDays } from "lucide-react";

export const navItems = [
    { name: 'Today', href: '/', icon: Home, className: 'rounded-l-4xl' },
    { name: 'Train', href: '/train', icon: Dumbbell, className: '' },
    { name: 'Fuel', href: '/fuel', icon: ForkKnife, className: '' },
    { name: 'Log', href: '/log', icon: CalendarDays, className: '' },
    { name: 'Me', href: '/me', icon: User, className: 'rounded-r-4xl' },
  ];