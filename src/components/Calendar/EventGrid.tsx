import { Home } from 'lucide-react';

export const EventGrid = ({ event }) => (
  <div className={`text-[9px] p-1.5 rounded-md flex items-center gap-1.5 font-black truncate border-l-2 mb-1
    ${event.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-l-blue-500' : 'bg-orange-50 text-orange-700 border-l-orange-500'}
    ${event.hasConflict ? 'ring-2 ring-red-500' : ''}`}>
    <Home size={10} />
    {event.title}
  </div>
);