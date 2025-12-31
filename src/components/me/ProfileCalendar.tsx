'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import Link from 'next/link';
import { format, isFuture, isToday } from 'date-fns';
interface ProfileCalendarProps {
  workoutDates?: Date[];
}

export default function ProfileCalendar({ workoutDates = [] }: ProfileCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

  // Adjust for Monday start (Monday=0, Sunday=6)
  const startOffset = (firstDayOfMonth + 6) % 7; 

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const renderDays = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Empty cells for days before start of month
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10" />);
    }

    // Days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateToCheck = new Date(year, month, d);
      dateToCheck.setHours(0, 0, 0, 0);

      const isFutureDate = isFuture(dateToCheck);
      const isTodayDate = isToday(dateToCheck);
      
      const hasWorkout = workoutDates.some(date => {
        const d2 = new Date(date);
        return d2.getDate() === d && d2.getMonth() === month && d2.getFullYear() === year;
      });

      days.push(
        <Link 
          key={d} 
          href={`/me/log/${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`}
          className="flex justify-center items-center hover:bg-muted/50 rounded-full w-10 h-10 transition-colors"
        >
          <div 
            className={`
              flex justify-center items-center w-8 h-8 rounded-full text-sm font-medium
              ${hasWorkout ? 'bg-brand-primary text-black' : 
                isTodayDate ? 'bg-muted text-foreground' : 
                isFutureDate ? 'text-muted-foreground opacity-30' : 
                'text-muted-foreground'}
            `}
          >
            {d}
          </div>
        </Link>
      );
    }

    return days;
  };

  return (
    <div className="bg-card p-5 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-2 text-muted-foreground active:scale-90 transition-transform">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-lg">{monthNames[month]}</span>
        <button onClick={nextMonth} className="p-2 text-muted-foreground active:scale-90 transition-transform">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 mb-2 text-center">
        {daysOfWeek.map((day) => (
          <div key={day} className="font-medium text-muted-foreground text-xs">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 text-center row-auto">
        {renderDays()}
      </div>
    </div>
  );
}

