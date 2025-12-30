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
    <div className="flex flex-col gap-6 py-6 px-4 md:px-6">
      {/* Profile Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-muted rounded-full overflow-hidden">
            {profile?.profilePicture ? (
              <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
                <div className="flex items-center justify-center w-full h-full bg-secondary text-secondary-foreground text-2xl font-bold">
                    {profile?.firstName?.[0] || profile?.email?.[0]?.toUpperCase() || '?'}
                </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : 'User'}
            </h2>
            <p className="text-muted-foreground text-sm">
                {profile?.bio || 'No bio yet'}
            </p>
          </div>
        </div>
        <Link href="/me/profile" className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors">
          <Edit2 className="w-4 h-4" />
        </Link>
      </div>

      {/* Manage Goals Button */}
      <Link 
          href="/me/goals" 
          className="flex justify-between items-center bg-card hover:bg-hover p-4 border border-border rounded-(--radius) w-full transition-colors"
        >
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Manage Goals</span>
          </div>
      </Link>

      {/* Calendar */}
      <ProfileCalendar workoutDates={workoutDates} />
    </div>
  );
}

