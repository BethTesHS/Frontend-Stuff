import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { FilterToggle } from "./FilterToggle";
import { EventGrid } from "./EventGrid";
import { UpcomingEventCard } from "./UpcomingEventCard";
import { MiniCalendar } from "./MiniCalendar";

interface SharedCalendarProps {
  events: any[];
  isLoading: boolean;
  activeFilters?: Record<string, boolean>;
  filterConfigs?: Array<{
    id: string;
    label: string;
    color: string;
    icon?: any;
  }>;
  onFilterChange?: (id: string) => void;
  renderActionButtons?: React.ReactNode;
  accentColorClass?: string;
  title?: string;
}

export const SharedCalendar = ({
  events,
  isLoading,
  activeFilters = {},
  filterConfigs = [], 
  onFilterChange = () => {},
  renderActionButtons,
  accentColorClass = "emerald-600",
  title = "Upcoming Events",
}: SharedCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div
          className={`animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500`}
        ></div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-[600px] bg-white dark:bg-[#0B0E14] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <aside className="hidden xl:flex w-72 flex-col border-r border-slate-100 dark:border-slate-800 p-6 bg-white dark:bg-[#0B0E14]">
        <div className="mb-8">{renderActionButtons}</div>

        <div className="space-y-8">
          <div>
            <h3 className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-4">
              Filters
            </h3>
            <div className="space-y-4">
              {filterConfigs.map((config) => (
                <FilterToggle
                  key={config.id}
                  label={config.label}
                  color={config.color}
                  active={activeFilters[config.id]}
                  accentColor={accentColorClass}
                  onToggle={() => onFilterChange(config.id)}
                />
              ))}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <MiniCalendar
              currentDate={currentDate}
              onDateClick={setCurrentDate}
              onMonthChange={setCurrentDate}
              accentColor={accentColorClass}
            />
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0B0E14]">
        <div className="p-5 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mr-4">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/10 dark:bg-[#0B0E14]">
          <div className="grid grid-cols-7 border-t border-l border-slate-100 dark:border-slate-800 rounded-tl-xl overflow-hidden">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="py-3 text-[10px] font-black text-slate-400 text-center border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}

            {calendarDays.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const dayEvents = events.filter((e) => e.date === dateKey);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isSelected = isSameDay(day, currentDate);

              return (
                <div
                  key={dateKey}
                  onClick={() => setCurrentDate(day)}
                  className={`min-h-[120px] border-r border-b border-slate-100 dark:border-slate-800 p-2 transition-all cursor-pointer
                    ${!isCurrentMonth ? "bg-slate-100/30 dark:bg-slate-900/10" : "bg-white dark:bg-[#0B0E14]"}
                    ${isSelected ? "bg-emerald-50/20 dark:bg-emerald-900/5" : ""}
                  `}
                >
                  <div className="flex justify-start items-start mb-2">
                    <span
                      className={`text-[11px] font-black w-7 h-7 flex items-center justify-center rounded-full transition-all
                        ${
                          isSelected
                            ? `bg-${accentColorClass} text-white shadow-md`
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                      <EventGrid
                        key={event.id}
                        event={event}
                        accentColor={accentColorClass}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <aside className="hidden lg:block w-80 border-l border-slate-100 dark:border-slate-800 p-6 bg-white dark:bg-[#0B0E14] overflow-y-auto">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-8 text-slate-800 dark:text-slate-200">
          {title}
        </h3>
        {events.length > 0 ? (
          events.map((event) => (
            <UpcomingEventCard
              key={event.id}
              event={event}
              accentColor={accentColorClass}
            />
          ))
        ) : (
          <div className="text-center py-20">
            <CalendarIcon
              className="text-slate-300 dark:text-slate-700 mx-auto mb-3"
              size={24}
            />
            <p className="text-slate-500 text-xs">No events scheduled</p>
          </div>
        )}
      </aside>
    </div>
  );
};
