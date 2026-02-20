// src/components/BuyerDashboard/BuyerCalendar.tsx
import { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Home, Users, Calendar } from 'lucide-react';
import { FilterToggle } from "@/components/Calendar/FilterToggle";
import { EventGrid } from "@/components/Calendar/EventGrid";
import { UpcomingEventCard } from "@/components/Calendar/UpcomingEventCard";
import { MiniCalendar } from "@/components/Calendar/MiniCalendar";
import ScheduleViewingDialog from "@/components/Schedule/ScheduleViewingDialog";
import { detectConflicts, transformViewingsToEvents } from '@/utils/calendarUtils';
import { buyerApi } from '@/services/buyerApi';

export const BuyerCalendar = () => {
  const [viewings, setViewings] = useState<any[]>([]);
  const [viewingsLoading, setViewingsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('Month');
  const [activeFilters, setActiveFilters] = useState({
    confirmed: true,
    pending: true
  });

  useEffect(() => {
    const fetchViewings = async () => {
      try {
        setViewingsLoading(true);
        const response = await buyerApi.getViewings({ page: 1, per_page: 100 });
        if (response.success && response.data) {
          setViewings(response.data.viewings || []);
        }
      } catch (error) {
        console.error('Error fetching viewings:', error);
      } finally {
        setViewingsLoading(false);
      }
    };
    fetchViewings();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart); 
  const endDate = endOfWeek(monthEnd);

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);
  
  const events = useMemo(() => {
    const transformed = transformViewingsToEvents(viewings || []);
    const filtered = transformed.filter(event => {
      if (event.status === 'confirmed' && !activeFilters.confirmed) return false;
      if (event.status === 'pending' && !activeFilters.pending) return false;
      return true;
    });
    const sorted = [...filtered].sort((a, b) => {
      const dateTimeA = new Date(`${a.date} ${a.startTime}`).getTime();
      const dateTimeB = new Date(`${b.date} ${b.startTime}`).getTime();
      return dateTimeA - dateTimeB;
    });

    return detectConflicts(sorted);
  }, [viewings, activeFilters]);

  const toggleFilter = (type: 'confirmed' | 'pending') => {
    setActiveFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  if (viewingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-[600px] bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <aside className="hidden xl:flex w-72 flex-col border-r border-slate-100 dark:border-slate-800 p-6 bg-white dark:bg-slate-900">
        <ScheduleViewingDialog propertyId={viewings?.[0]?.property_id || 0} onSuccess={() => window.location.reload()}>
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 mb-8">
              <Plus size={18} strokeWidth={3} /> <span>Request Viewing</span>
            </button>
        </ScheduleViewingDialog>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-4">Quick Filters</h3>
            <div className="space-y-4">
             <FilterToggle 
                label="Confirmed" 
                color="bg-blue-500" 
                icon={Home} 
                active={activeFilters.confirmed}
                onToggle={() => toggleFilter('confirmed')}
              />
              <FilterToggle 
                label="Pending" 
                color="bg-orange-500" 
                icon={Users} 
                active={activeFilters.pending}
                onToggle={() => toggleFilter('pending')}
              />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
             <MiniCalendar currentDate={currentDate} onDateClick={setCurrentDate} onMonthChange={setCurrentDate} />
          </div>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
        <div className="p-5 border-b border-slate-50 dark:border-slate-900 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mr-4">
              <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700">
              {['Day', 'Week', 'Month'].map(m => (
                <button 
                  key={m} 
                  onClick={() => setViewMode(m)} 
                  className={`px-5 py-1.5 text-[10px] font-bold rounded-lg transition-all ${viewMode === m ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-7 border-t border-l border-slate-100 dark:border-slate-800 rounded-tl-xl overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 text-center border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 uppercase tracking-wider">
                {day}
              </div>
            ))}
            
            {calendarDays.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayEvents = events.filter(e => e.date === dateKey);
              const isCurrentMonth = isSameDay(startOfMonth(day), monthStart);
              const isSelected = isSameDay(day, currentDate);
              const isActualToday = isToday(day); 

              return (
                <div 
                  key={dateKey} 
                  onClick={() => setCurrentDate(day)}
                  className={`min-h-[120px] border-r border-b border-slate-100 dark:border-slate-800 p-2 transition-all cursor-pointer
                    ${!isCurrentMonth ? 'bg-slate-50/30 dark:bg-slate-950/20' : 'bg-white dark:bg-slate-900'}
                    ${isSelected ? 'ring-2 ring-inset ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' : ''} 
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[11px] font-black w-7 h-7 flex items-center justify-center rounded-full 
                      ${isActualToday 
                        ? ' text-white shadow-md'
                        : isSelected 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500 dark:text-white'
                          : isCurrentMonth 
                            ? 'text-slate-700 dark:text-slate-300' 
                            : 'text-slate-300 dark:text-slate-700'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>   
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.map(event => (
                      <EventGrid key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <aside className="hidden lg:block w-80 border-l border-slate-100 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 overflow-y-auto">
        <h3 className="text-xs font-bold dark:text-white text-black uppercase tracking-widest mb-8">Upcoming Viewings</h3>
        {events.length > 0 ? (
          events.map(event => <UpcomingEventCard key={event.id} event={event} />)
        ) : (
          <div className="text-center py-20">
             <Calendar className="text-slate-300 dark:text-slate-700 mx-auto mb-3" size={24} />
             <p className="text-slate-500 dark:text-slate-600 text-xs">No scheduled viewings</p>
          </div>
        )}
      </aside>
    </div>
  );
};