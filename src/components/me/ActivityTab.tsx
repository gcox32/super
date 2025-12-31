import { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Utensils, 
  Moon, 
  Droplets, 
  Pill, 
  Scale, 
  Camera, 
  ChevronRight,
  Activity
} from 'lucide-react';
import Link from 'next/link';

interface ActivityItem {
  id: string;
  type: 'workout' | 'meal' | 'sleep' | 'stats' | 'image' | 'water' | 'supplement';
  date: string; // ISO string from JSON
  title: string;
  details?: any;
}

export default function ActivityTab() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const res = await fetch('/api/me/activity?dateFrom=' + new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
        if (res.ok) {
          const data = await res.json();
          setActivities(data.activities);
        }
      } catch (error) {
        console.error('Failed to fetch activities', error);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="border-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center px-4 py-12 text-center">
        <Activity className="mb-4 w-12 h-12 text-muted-foreground" />
        <h3 className="font-medium text-muted-foreground text-lg">No recent activity</h3>
        <p className="mt-2 text-muted-foreground text-sm">
          Your activity history will appear here.
        </p>
      </div>
    );
  }

  // Group activities by date
  const groupedActivities: { [key: string]: ActivityItem[] } = {};
  activities.forEach(activity => {
    const date = new Date(activity.date).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
    if (!groupedActivities[date]) {
      groupedActivities[date] = [];
    }
    groupedActivities[date].push(activity);
  });

  return (
    <div className="space-y-6 pb-20">
      {Object.entries(groupedActivities).map(([date, items]) => (
        <div key={date} className="space-y-2">
          <h3 className="top-0 z-10 sticky py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
            {date}
          </h3>
          <div className="space-y-3">
            {items.map((item) => (
              <ActivityCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityCard({ item }: { item: ActivityItem }) {
  const getIcon = () => {
    switch (item.type) {
      case 'workout': return <Dumbbell className="w-5 h-5 text-blue-500" />;
      case 'meal': return <Utensils className="w-5 h-5 text-green-500" />;
      case 'sleep': return <Moon className="w-5 h-5 text-indigo-500" />;
      case 'water': return <Droplets className="w-5 h-5 text-cyan-500" />;
      case 'supplement': return <Pill className="w-5 h-5 text-purple-500" />;
      case 'stats': return <Scale className="w-5 h-5 text-orange-500" />;
      case 'image': return <Camera className="w-5 h-5 text-pink-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTime = () => {
    return new Date(item.date).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getDetails = () => {
    switch (item.type) {
      case 'workout':

        const duration = item.details.duration?.total ? `${Math.round(item.details.duration.total / 60)}m` : null;
        const vol = item.details.volume?.total ? `${item.details.volume.total}kg` : null;
        return [duration, vol].filter(Boolean).join(' • ');
      
      case 'meal':

         return 'Logged';

      case 'sleep':
        const sleepHours = Math.floor(item.details.timeAsleep?.value || 0);
        const sleepMinutes = Math.round(item.details.timeAsleep?.value % 60);
        const sleepDuration = item.details.timeAsleep ? `${sleepHours}h ${sleepMinutes}m` : null;
        const score = item.details.sleepScore ? `Score: ${item.details.sleepScore}` : null;
        return [sleepDuration, score].filter(Boolean).join(' • ');

      case 'water':
        return item.details.amount?.value ? `${item.details.amount.value} ${item.details.amount.unit}` : 'Logged';

      case 'supplement':
         return item.details.dosage?.amount ? `${item.details.dosage.amount} ${item.details.dosage.unit}` : 'Taken';

      case 'stats':
         const weight = item.details.weight?.value ? `${item.details.weight.value} ${item.details.weight.unit}` : null;
         const bodyFat = item.details.bodyFatPercentage?.value ? `${item.details.bodyFatPercentage.value}% BF` : null;
         return [weight, bodyFat].filter(Boolean).join(' • ');

      case 'image':
         return 'Photo added';

      default:
        return null;
    }
  };

  const getLink = () => {
    switch(item.type) {
      case 'workout': return `/log/workouts/${item.id}`;
      case 'sleep': return `/log/sleep`; 
      default: return null;
    }
  };

  const link = getLink();

  return (
    <div className="flex justify-between items-center bg-card shadow-sm p-4 border border-border rounded-lg">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-full bg-secondary/50 opacity-30`}>
          {getIcon()}
        </div>
        <div>
          <h4 className="font-medium text-sm">{item.title}</h4>
          <p className="flex items-center gap-2 text-muted-foreground text-xs">
            <span>{getTime()}</span>
            {getDetails() && (
              <>
                <span>•</span>
                <span>{getDetails()}</span>
              </>
            )}
          </p>
        </div>
      </div>
      
      {link && (
        <Link href={link} className="text-muted-foreground hover:text-foreground">
          <ChevronRight className="w-5 h-5" />
        </Link>
      )}
    </div>
  );
}
