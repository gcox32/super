import { Activity, Camera, BarChart3, Dumbbell } from 'lucide-react';

export const logViews = [
    {
        name: 'Body stats',
        href: '/log/stats',
        icon: Activity,
        description: 'Weight, body fat, and tape measurements.',
        active: true,
    },
    {
        name: 'Workouts',
        href: '/log/workouts',
        icon: Dumbbell,
        description: 'Track your workouts.',
        active: true,
    },
    {
        name: 'Progress photos',
        href: '/log/photos',
        icon: Camera,
        description: 'Coming soon.',
        active: false,
    },
    {
        name: 'Performance',
        href: '/log/performance',
        icon: BarChart3,
        description: 'Coming soon.',
        active: false,
    },
]