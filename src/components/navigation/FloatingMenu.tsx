'use client';

import { useState } from 'react';
import { Settings, Sliders, LogOut, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '../ui/ConfirmationModal';

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
          className="z-30 fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="fixed top-12 right-4 z-30 flex flex-col items-end">
        {/* FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`cursor-pointer hover:opacity-100 w-10 h-10 bg-brand-primary 
            text-white rounded-full shadow-lg hover:bg-brand-primary-dark transition-all 
            duration-150 flex items-center justify-center
            ${isOpen ? 'opacity-100' : 'opacity-50'}`}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Settings className="w-5 h-5" />
          )}
        </button>

        {/* Menu Items */}
        {isOpen && (
          <div className="my-2 space-y-2">
            {menuItems.map((item, index) => (
              <div
                key={item.label}
                className="flex w-full items-center gap-3 opacity-0 animate-[fadeInUp_0.2s_ease-out_forwards]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={item.onClick}
                  className={`cursor-pointer flex w-full items-center gap-3 bg-card border border-border rounded-full px-4 py-3 shadow-lg hover:bg-hover transition-colors ${item.variant === 'danger'
                      ? 'text-red-300 hover:text-red-500'
                      : ''
                    }`}
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
