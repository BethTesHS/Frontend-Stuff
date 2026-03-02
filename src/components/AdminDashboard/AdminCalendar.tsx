import { useState, useEffect, useMemo } from "react";
import { FileBarChart } from "lucide-react";
import { SharedCalendar } from "@/components/Calendar/SharedCalendar";

export const AdminCalendar = () => {
  // 1. Temporary Mock Data
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate an API call
    const loadMockData = () => {
      setLoading(true);
      setTimeout(() => {
        const mockEvents = [
          {
            id: 1,
            title: "Viewing: Apartment 4B",
            date: "2026-02-23",
            status: "scheduled",
            type: "viewing",
          },
          {
            id: 2,
            title: "Maintenance Check",
            date: "2026-02-25",
            status: "pending",
            type: "maintenance",
          },
        ];
        setEvents(mockEvents);
        setLoading(false);
      }, 800);
    };

    loadMockData();
  }, []);
  const processedEvents = useMemo(() => {
    return events;
  }, [events]);

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
