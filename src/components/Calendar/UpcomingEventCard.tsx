import { MapPin } from 'lucide-react';

export const UpcomingEventCard = ({ event }) => (
  <div className={`p-4 rounded-xl border border-gray-200 bg-white shadow-sm mb-4 transition-all hover:shadow-md ${event.hasConflict ? 'border-red-200 bg-red-50' : ''}`}>
    <div className="flex justify-between items-center mb-2">
       <span className="text-[9px] font-black uppercase text-emerald-600 tracking-tighter">{event.status}</span>
       <span className="text-[10px] text-gray-500 font-bold">{event.startTime}</span>
    </div>
    <h4 className="text-sm font-black text-gray-800 leading-tight">{event.title}</h4>
    <div className="flex items-center gap-1 text-gray-500 mt-1 mb-4">
      <MapPin size={10} />
      <span className="text-[10px] font-medium truncate">{event.location}</span>
    </div>
    <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700">
        {event.clientName?.[0] || 'A'}
      </div>
      <span className="text-[11px] font-bold text-gray-700">{event.clientName}</span>
    </div>
  </div>
);