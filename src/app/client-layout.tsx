'use client';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import FloatingMenu from '@/components/navigation/FloatingMenu';
import BottomNav from '@/components/navigation/BottomNav';

function ProtectedContent({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Public routes that don't require authentication
    const publicRoutes = ['/signin', '/terms-of-service', '/privacy-policy'];
    const isPublicRoute = publicRoutes.includes(pathname);

    // Routes where navigation should be hidden (SPA mode)
    const isSessionView = pathname.startsWith('/train/session/');

    useEffect(() => {
        if (!isLoading && !isAuthenticated && !isPublicRoute) {
            router.push('/signin');
        }
    }, [isAuthenticated, isLoading, isPublicRoute, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 animate-spin" />
            </div>
        );
    }

    // Allow public routes to render without authentication
    if (isPublicRoute) {
        return <>{children}</>;
    }

    // Protect non-public routes
    if (!isAuthenticated) {
        return null;
    }

    return (
        <>
            {!isSessionView && <FloatingMenu />}
            {children}
            {!isSessionView && <BottomNav />}
        </>
    );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ProtectedContent>
                {children}
            </ProtectedContent>
        </AuthProvider>
    );
}
