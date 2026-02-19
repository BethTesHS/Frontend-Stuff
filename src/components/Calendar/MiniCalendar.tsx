import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DAYS_SHORT } from '../../constants/calendar';

export const MiniCalendar = () => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const selectedDay = new Date().getDate();

  return (
    <div className="mt-4 px-1">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-black text-gray-700 dark:text-slate-200">February 2026</h4>
        <div className="flex gap-3 text-gray-400 dark:text-slate-500">
          <ChevronLeft size={14} className="cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" />
          <ChevronRight size={14} className="cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-2 text-center">
        {DAYS_SHORT.map((day, i) => (
          <span key={i} className="text-[10px] font-bold text-gray-400 dark:text-slate-500">{day}</span>
        ))}
        {days.map(day => (
          <div key={day} className="flex justify-center items-center">
            <span className={`text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full cursor-pointer transition-all
              ${day === selectedDay ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
              {day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};