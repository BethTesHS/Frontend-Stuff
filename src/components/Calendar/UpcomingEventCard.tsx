import { MapPin, Clock, Calendar, AlertTriangle } from 'lucide-react';

export const UpcomingEventCard = ({ event }: any) => (
  <div className={`
    p-4 rounded-xl border mb-4 transition-all hover:scale-[1.02]
    ${event.hasConflict 
      ? 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20' 
      : 'border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900/50 shadow-sm'}
  `}>
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider
          ${event.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'}`}>
          {event.status}
        </span>
        {event.hasConflict && (
          <span className="flex items-center gap-1 text-[8px] font-bold text-red-600 uppercase">
            <AlertTriangle size={10} /> Conflict
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 text-slate-400">
        <Clock size={10} />
        <span className="text-[10px] font-bold">{event.startTime}</span>
      </div>
    </div>

    <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight mb-2">
      {event.title}
    </h4>

    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-4">
      <MapPin size={12} className="text-emerald-500" />
      <span className="text-[10px] font-medium truncate">{event.location}</span>
    </div>

    <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-emerald-600">
          {event.clientName?.[0]}
        </div>
        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{event.clientName}</span>
      </div>
      <button className="text-[10px] font-bold text-emerald-600 hover:underline">Details</button>
    </div>
  </div>
);