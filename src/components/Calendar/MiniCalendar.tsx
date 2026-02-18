import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DAYS_SHORT } from '../../constants/calendar';

export const MiniCalendar = () => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const selectedDay = new Date().getDate();

  return (
    <div className="mt-4 px-1">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-black text-gray-700">February 2026</h4>
        <div className="flex gap-3 text-gray-400">
          <ChevronLeft size={14} className="cursor-pointer hover:text-emerald-600" />
          <ChevronRight size={14} className="cursor-pointer hover:text-emerald-600" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-2 text-center">
        {DAYS_SHORT.map((day, i) => (
          <span key={i} className="text-[10px] font-bold text-gray-400">{day}</span>
        ))}
        {days.map(day => (
          <div key={day} className="flex justify-center items-center">
            <span className={`text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full cursor-pointer transition-all
              ${day === selectedDay ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}>
              {day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};