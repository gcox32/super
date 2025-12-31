import Link from 'next/link';
import { Target, Settings, Edit2 } from 'lucide-react';
import { UserProfile } from '@/types/user';
import ProfileCalendar from './ProfileCalendar';

interface OverviewTabProps {
  profile: UserProfile | null;
  workoutDates?: Date[];
}

export default function OverviewTab({ profile, workoutDates = [] }: OverviewTabProps) {
  return (
    <div className="flex flex-col gap-6 px-4 md:px-6 py-6">
      {/* Profile Header */}
      <div className="flex justify-between items-center bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="bg-brand-primary/20 rounded-full ring-2 ring-brand-primary/30 w-16 h-16 overflow-hidden">
            {profile?.profilePicture ? (
              <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
                <div className="flex justify-center items-center w-full h-full font-bold text-brand-primary text-2xl">
                    {profile?.firstName?.[0] || profile?.email?.[0]?.toUpperCase() || '?'}
                </div>
            )}
          </div>
          <div>
            <h2 className="font-bold text-xl">
              {profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : 'User'}
            </h2>
            <p className="text-muted-foreground text-sm">
                {profile?.bio || 'No bio yet'}
            </p>
          </div>
        </div>
        <Link href="/me/profile" className="p-3">
          <Edit2 className="w-4 h-4" />
        </Link>
      </div>

      {/* Manage Goals Button */}
      <Link
          href="/me/goals"
          className="flex justify-between items-center bg-card p-4 w-full text-center active:scale-[0.98] transition-transform"
        >
          <span className="w-full font-medium text-center">Manage Goals</span>
      </Link>

      {/* Calendar */}
      <ProfileCalendar workoutDates={workoutDates} />
    </div>
  );
}

