import React from 'react';
import { Bell, Shield, Database, Info, LucideIcon } from 'lucide-react';
import { UserSettings } from '@/lib/settings';
import { STORAGE_LIMITS, BYTES_PER_GB, BYTES_PER_MB } from '@/lib/config/storage';

export type SettingItemType = 'toggle' | 'button' | 'link' | 'info' | 'component';

export interface BaseSettingItem {
  id: string;
  type: SettingItemType;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export interface ToggleSettingItem extends BaseSettingItem {
  type: 'toggle';
  settingKey: keyof UserSettings;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface ButtonSettingItem extends BaseSettingItem {
  type: 'button';
  action: () => void;
  variant?: 'default' | 'danger';
}

export interface LinkSettingItem extends BaseSettingItem {
  type: 'link';
  href: string;
}

export interface InfoSettingItem extends BaseSettingItem {
  type: 'info';
  value: string;
}

export interface ComponentSettingItem extends BaseSettingItem {
  type: 'component';
  component: React.ReactNode;
}

export type SettingItem = 
  | ToggleSettingItem 
  | ButtonSettingItem 
  | LinkSettingItem 
  | InfoSettingItem
  | ComponentSettingItem;

export interface SettingSection {
  id: string;
  title: string;
  icon: LucideIcon;
  items: SettingItem[];
}

interface SettingsConfigProps {
  settings: UserSettings;
  storageStats?: {
    database: { usedBytes: number };
    storage: { usedBytes: number };
  };
  handlers: {
    handleSleepReminderChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleChangePassword: () => void;
    handleDataExport: () => void;
    handleTrainingRemindersChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
  env: {
    version: string;
    build: string;
  };
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const getSettingsConfig = ({ settings, storageStats, handlers, env }: SettingsConfigProps): SettingSection[] => {
  const dbUsed = storageStats?.database.usedBytes || 0;
  const dbLimit = STORAGE_LIMITS.DATABASE_SIZE_MB * BYTES_PER_MB;
  const dbPercent = Math.min((dbUsed / dbLimit) * 100, 100);

  const storageUsed = storageStats?.storage.usedBytes || 0;
  const storageLimit = STORAGE_LIMITS.FILE_STORAGE_GB * BYTES_PER_GB;
  const storagePercent = Math.min((storageUsed / storageLimit) * 100, 100);

  return [
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Bell,
    items: [
      {
        id: 'sleepReminder',
        type: 'toggle',
        label: 'Morning Sleep Reminder',
        description: 'Get reminded to log your sleep',
        settingKey: 'sleepReminder',
        onChange: handlers.handleSleepReminderChange,
      },
      {
        id: 'sessionReminders',
        type: 'toggle',
        label: 'Training Reminders',
        description: 'Get notified when it\'s time to get to work',
        settingKey: 'trainingReminders',
        onChange: handlers.handleTrainingRemindersChange,
      },
      {
        id: 'mealReminders',
        type: 'toggle',
        label: 'Meal Reminders',
        description: 'Reminders for meal times',
        settingKey: 'mealReminders',
        disabled: true,
      },
      {
        id: 'progressUpdates',
        type: 'toggle',
        label: 'Progress Updates',
        description: 'Weekly progress summaries',
        settingKey: 'progressUpdates',
        disabled: true,
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    icon: Shield,
    items: [
      {
        id: 'changePassword',
        type: 'button',
        label: 'Change Password',
        description: 'Update your account password',
        action: handlers.handleChangePassword,
      },
      {
        id: 'dataExport',
        type: 'button',
        label: 'Data Export',
        description: 'Download your data',
        action: handlers.handleDataExport,
      },
    ],
  },
  {
    id: 'data',
    title: 'Data & Storage',
    icon: Database,
    items: [
      {
        id: 'dbStorage',
        type: 'component',
        component: (
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Database Size</span>
              <span className="text-sm text-muted-foreground">
                {formatBytes(dbUsed)} / {STORAGE_LIMITS.DATABASE_SIZE_MB} MB
              </span>
            </div>
            <div className="w-full bg-input rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${dbPercent > 90 ? 'bg-red-500' : 'bg-brand-primary'}`} 
                style={{ width: `${dbPercent}%` }}
              ></div>
            </div>
          </div>
        ),
      },
      {
        id: 'fileStorage',
        type: 'component',
        component: (
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">File Storage</span>
              <span className="text-sm text-muted-foreground">
                {formatBytes(storageUsed)} / {STORAGE_LIMITS.FILE_STORAGE_GB} GB
              </span>
            </div>
            <div className="w-full bg-input rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${storagePercent > 90 ? 'bg-red-500' : 'bg-brand-primary'}`}
                style={{ width: `${storagePercent}%` }}
              ></div>
            </div>
          </div>
        ),
      }
    ],
  },
  {
    id: 'about',
    title: 'About',
    icon: Info,
    items: [
      {
        id: 'version',
        type: 'info',
        label: 'Version',
        value: env.version,
      },
      {
        id: 'build',
        type: 'info',
        label: 'Build',
        value: env.build,
      },
      {
        id: 'methods',
        type: 'link',
        label: 'Methods',
        href: '/methods',
      },
      {
        id: 'tos',
        type: 'link',
        label: 'Terms of Service',
        href: '/terms-of-service',
      },
      {
        id: 'privacyPolicy',
        type: 'link',
        label: 'Privacy Policy',
        href: '/privacy-policy',
      },
    ],
  },
];
};


