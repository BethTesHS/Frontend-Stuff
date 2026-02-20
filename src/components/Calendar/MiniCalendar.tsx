import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MiniCalendarProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onMonthChange: (date: Date) => void;
}

export const MiniCalendar = ({ currentDate, onDateClick, onMonthChange }: MiniCalendarProps) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="mt-4 px-1">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-black text-gray-700 dark:text-slate-200">
          {format(currentDate, 'MMMM yyyy')}
        </h4>
        <div className="flex gap-3 text-gray-400 dark:text-slate-500">
          <ChevronLeft 
            size={14} 
            className="cursor-pointer hover:text-emerald-600 transition-colors" 
            onClick={() => onMonthChange(subMonths(currentDate, 1))}
          />
          <ChevronRight 
            size={14} 
            className="cursor-pointer hover:text-emerald-600 transition-colors" 
            onClick={() => onMonthChange(addMonths(currentDate, 1))}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {DAYS_SHORT.map((day, i) => (
          <span key={i} className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1">{day}</span>
        ))}
        
        {days.map((day, i) => {
          const isSelected = isSameDay(day, currentDate);
          const isThisMonth = isSameMonth(day, monthStart);
          
          return (
            <div key={i} className="flex justify-center items-center">
              <span 
                onClick={() => onDateClick(day)}
                className={`text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full cursor-pointer transition-all
                  ${isSelected 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : isThisMonth 
                      ? 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800' 
                      : 'text-gray-300 dark:text-slate-600 hover:text-emerald-500'}`}
              >
                {format(day, 'd')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};