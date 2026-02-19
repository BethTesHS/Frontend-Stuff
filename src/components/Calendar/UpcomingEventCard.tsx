import { MapPin } from 'lucide-react';

export const UpcomingEventCard = ({ event }) => (
  <div className={`p-4 rounded-xl border border-gray-200 bg-white shadow-sm mb-4 transition-all hover:shadow-md ${event.hasConflict ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30' : 'border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm'}`}>
    <div className="flex justify-between items-center mb-2">
      <span className={`text-[9px] font-black uppercase tracking-tighter ${event.hasConflict ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
      {event.status}
      </span>
      <span className="text-[10px] text-gray-500 dark:text-slate-400 font-bold">{event.startTime}</span>
    </div>
    <h4 className="text-sm font-black text-gray-800 dark:text-slate-100 leading-tight">{event.title}</h4>
    <div className="flex items-center gap-1 text-gray-500 dark:text-slate-400 mt-1 mb-4">
      <MapPin size={10} />
      <span className="text-[10px] font-medium truncate">{event.location}</span>
    </div>
    <div className="flex items-center gap-2 border-t border-gray-100 dark:border-slate-800 pt-3">
      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
        {event.clientName?.[0] || 'A'}
      </div>
      <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300">{event.clientName}</span>
    </div>
  </div>
);