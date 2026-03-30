import { useState, useEffect } from 'react';
import { SharedCalendar } from '@/components/Calendar/SharedCalendar';
import { externalTenantApi } from '@/services/api';

interface ExternalTenantCalendarProps {
  user: any;
}

const ExternalTenantCalendar = ({ user }: ExternalTenantCalendarProps) => {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    externalTenantApi.getCalendarEvents?.()
      .then((res) => {
        if (res?.success && res.data) {
          const raw = Array.isArray(res.data)
            ? res.data
            : res.data.events ?? res.data.data ?? [];
          setEvents(
            raw.map((e: any) => ({
              id: e.id ?? e.event_id,
              title: e.title,
              date: e.date ?? (e.start_time ? e.start_time.split('T')[0] : ''),
              time: e.time ?? '',
              type: e.event_type ?? 'general',
              location: e.location ?? '',
            }))
          );
        }
      })
      .catch(() => {/* silently fall through to empty state */})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <SharedCalendar
        events={events}
        isLoading={isLoading}
        accentColorClass="emerald-600"
        title="My Calendar"
      />
    </div>
  );
};

export default ExternalTenantCalendar;
