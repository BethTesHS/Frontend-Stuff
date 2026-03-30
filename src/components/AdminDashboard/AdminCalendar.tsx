import { useState, useEffect, useMemo } from "react";
import { FileBarChart } from "lucide-react";
import { SharedCalendar } from "@/components/Calendar/SharedCalendar";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/apiEndpoints";
import { getAdminToken } from "@/utils/tokenStorage";

export const AdminCalendar = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const token = getAdminToken();
        const response = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.ADMIN.CALENDAR_EVENTS}?limit=100`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        if (!response.ok) throw new Error("Failed to load calendar events");
        const result = await response.json();
        const raw: any[] = Array.isArray(result.data) ? result.data : [];
        setEvents(
          raw.map((e) => ({
            id: e.id,
            title: e.title,
            // SharedCalendar expects a `date` string (YYYY-MM-DD)
            date: e.start_time ? e.start_time.split("T")[0] : e.date,
            status: e.status,
            type: e.event_type,
            start_time: e.start_time,
            end_time: e.end_time,
            location: e.location,
          }))
        );
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const processedEvents = useMemo(() => events, [events]);

  return (
    <SharedCalendar
      events={processedEvents}
      isLoading={loading}
      accentColorClass="blue-600"
      title="System Schedule"
      renderActionButtons={
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95">
          <FileBarChart size={18} /> <span>Export Schedule</span>
        </button>
      }
    />
  );
};
