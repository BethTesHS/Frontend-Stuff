import { Home, Clock, AlertTriangle } from 'lucide-react';

export const EventGrid = ({ event }: any) => {
  const styles: any = {
    confirmed: "bg-emerald-50 text-emerald-700 border-l-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-l-emerald-400",
    pending: "bg-amber-50 text-amber-700 border-l-amber-500 dark:bg-amber-900/30 dark:text-amber-400 dark:border-l-amber-400",
    cancelled: "bg-slate-50 text-slate-500 border-l-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-l-slate-600"
  };

  const currentStyle = styles[event.status] || styles.pending;

  return (
    <div className={`
      text-[9px] p-1.5 rounded-md flex items-center gap-1.5 font-bold truncate border-l-2 mb-1 transition-all
      ${currentStyle}
      ${event.hasConflict ? 'ring-1 ring-red-500 animate-pulse' : ''}
    `}>
      {event.hasConflict ? (
        <AlertTriangle size={10} className="text-red-500 flex-shrink-0" />
      ) : (
        <Home size={10} className="flex-shrink-0" />
      )}
      
      <span className="truncate">{event.startTime}</span>
      <span className="truncate opacity-80">{event.title}</span>
    </div>
  );
};