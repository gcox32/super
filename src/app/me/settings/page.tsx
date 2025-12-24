'use client';

import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';
import { useSettings } from '@/lib/settings';
import { useToast } from '@/components/ui/Toast';
import { getSettingsConfig, SettingItem } from './settingsConfig';
import React, { useState, useEffect } from 'react';
import ChangePasswordModal from './ChangePasswordModal';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { showToast } = useToast();
  const { settings, updateSettings, loading } = useSettings();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [storageStats, setStorageStats] = useState<{ database: { usedBytes: number }; storage: { usedBytes: number } } | undefined>(undefined);

  useEffect(() => {
    fetch('/api/me/storage')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch storage stats');
      })
      .then(setStorageStats)
      .catch(err => console.error('Error fetching storage stats:', err));
  }, []);

  const handleSleepReminderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    
    if (checked) {
      // Request permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          showToast({ title: 'Permission Denied', description: 'Enable notifications in your browser settings to get reminders.', variant: 'error' });
          return;
        }
      } else {
        showToast({ title: 'Not Supported', description: 'Notifications are not supported in this browser.', variant: 'error' });
        return;
      }
    }

    updateSettings({ sleepReminder: checked });
    
    if (checked) {
       showToast({ title: 'Reminder Set', description: 'You will be reminded to log sleep in the morning.', variant: 'success' });
    }
  };

  const handleTrainingRemindersChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    updateSettings({ trainingReminders: checked });
  };

  if (loading) {
    return (
        <PageLayout title="Settings" subtitle="Manage your app settings" breadcrumbHref="/me" breadcrumbText="Me">
             <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </PageLayout>
    );
  }

  const handleDataExport = () => {
    // Trigger download by navigating to the export API route
    window.location.href = '/api/me/export';
  };

  const config = getSettingsConfig({
    settings,
    storageStats,
    handlers: {
      handleSleepReminderChange,
      handleChangePassword: () => setIsPasswordModalOpen(true),
      handleDataExport,
      handleTrainingRemindersChange,
    },
    env: {
      version: process.env.APP_VERSION || '1.0.0',
      build: process.env.APP_BUILD || '100',
    },
  });

  const renderItem = (item: SettingItem) => {
    switch (item.type) {
      case 'toggle':
        return (
          <div key={item.id} className={`bg-card gap-4 rounded-lg p-4 border border-border flex items-center justify-between ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div>
              <span className="font-medium block">{item.label}</span>
              {item.description && (
                <span className="text-sm text-muted-foreground">
                  {item.description}
                </span>
              )}
            </div>
            <label className={`relative inline-flex items-center ${item.disabled ? 'cursor-not-allowed pointer-events-none' : 'cursor-pointer'}`}>
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings[item.settingKey]}
                onChange={item.onChange || (() => {})}
                disabled={item.disabled}
              />
              <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
            </label>
          </div>
        );

      case 'button':
        return (
          <button 
            key={item.id}
            onClick={item.action}
            className={`w-full bg-card rounded-lg p-4 border border-border flex items-center hover:bg-hover transition-colors ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={item.disabled}
          >
            <div>
              <span className="font-medium flex  items-center">{item.label}</span>
              {item.description && (
                <span className={`text-sm w-full flex items-center ${item.variant === 'danger' ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {item.description}
                </span>
              )}
            </div>
          </button>
        );

      case 'link':
         return (
            <Link
                key={item.id}
                href={item.href}
                className="w-full py-2 border border-border rounded-lg font-semibold hover:bg-hover transition-colors flex items-center justify-center bg-card"
            >
                {item.label}
            </Link>
         );

      case 'info':
        return (
            <div key={item.id} className="bg-card rounded-lg p-4 border border-border flex justify-between items-center">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium">{item.value}</span>
            </div>
        );

      case 'component':
          return (
              <div key={item.id} className="bg-card rounded-lg p-4 border border-border">
                  {item.component}
              </div>
          );
      
      default:
        return null;
    }
  };

  return (
    <PageLayout
      breadcrumbHref="/me"
      breadcrumbText="Me"
      title="Settings"
      subtitle="Manage your app settings"
    >
      {config.map((section, index) => (
        <section key={section.id} className={`px-4 md:px-6 py-6 ${index > 0 ? 'border-t border-border' : ''}`}>
          <div className="flex items-center gap-3 mb-4">
            <section.icon className="w-5 h-5 text-brand-primary" />
            <h2 className="text-lg font-semibold">{section.title}</h2>
          </div>
          <div className="space-y-2">
            {section.items.map(renderItem)}
          </div>
        </section>
      ))}

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </PageLayout>
  );
}
