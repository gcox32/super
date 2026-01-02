'use client';

import { useState } from 'react';
import { Settings, Sliders, LogOut, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '../../ui/ConfirmationModal';

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/signin');
  };

  const menuItems = [
    {
      icon: Sliders,
      label: 'Preferences',
      onClick: () => {
        setIsOpen(false);
        router.push('/me/preferences');
      },
    },
    {
      icon: Settings,
      label: 'Settings',
      onClick: () => {
        setIsOpen(false);
        router.push('/me/settings');
      },
    },
    {
      icon: LogOut,
      label: 'Logout',
      onClick: () => {
        setIsOpen(false);
        setShowLogoutModal(true);
      },
      variant: 'danger' as const,
    },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="z-30 fixed inset-0 bg-black/60 backdrop-blur-md animate-fade-in"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="top-4 right-4 z-30 fixed flex flex-col items-end">
        {/* FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            cursor-pointer w-11 h-11 rounded-full
            flex items-center justify-center
            transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]
            ${isOpen
              ? 'bg-white/10 text-white rotate-90 scale-110'
              : 'bg-black/40 backdrop-blur-xl text-muted-foreground hover:text-foreground hover:bg-white/10'
            }
            border border-white/10 hover:border-white/20
            shadow-lg shadow-black/20
            ring-1 ring-inset ring-white/5
            active:scale-95
          `}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          <div className="relative w-5 h-5">
            <Settings
              className={`
                w-5 h-5 absolute inset-0
                transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]
                ${isOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}
              `}
            />
            <X
              className={`
                w-5 h-5 absolute inset-0
                transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]
                ${isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}
              `}
            />
          </div>
        </button>

        {/* Menu Items */}
        {isOpen && (
          <div className="space-y-2 mt-3">
            {menuItems.map((item, index) => (
              <div
                key={item.label}
                className="opacity-0 animate-[fadeInUp_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards]"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <button
                  onClick={item.onClick}
                  className={`
                    cursor-pointer flex w-full items-center gap-3
                    px-4 py-3 rounded-2xl
                    bg-black/40 backdrop-blur-xl
                    border border-white/10 hover:border-white/20
                    shadow-lg shadow-black/20
                    ring-1 ring-inset ring-white/5
                    transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]
                    hover:bg-white/10 hover:-translate-x-1
                    active:scale-95
                    ${item.variant === 'danger'
                      ? 'text-red-400 hover:text-red-300 hover:border-red-500/30'
                      : 'text-foreground'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </>
  );
}
