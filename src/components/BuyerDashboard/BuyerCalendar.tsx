import { useState, useEffect, useMemo } from "react";
import { Plus, Home, Users } from "lucide-react";
import { SharedCalendar } from "@/components/Calendar/SharedCalendar";
import ScheduleViewingDialog from "@/components/Schedule/ScheduleViewingDialog";
import { detectConflicts } from "@/utils/calendarUtils";
import { buyerApi } from "@/services/buyerApi";

export const BuyerCalendar = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    confirmed: true,
    pending: true,
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await buyerApi.getCalendarEvents();
      if (response.success && response.data) {
        setEvents(response.data.events || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const processedEvents = useMemo(() => {
    const filtered = events.filter((event) => {
      if (event.status === "scheduled" && !activeFilters.confirmed) return false;
      if (event.status === "cancelled" && !activeFilters.pending) return false;
      return true;
    });
    return detectConflicts(filtered);
  }, [events, activeFilters]);

  const handleFilterToggle = (id: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [id]: !prev[id as keyof typeof prev],
    }));
  };

  const filterConfigs = [
    { id: "confirmed", label: "Confirmed Viewings", color: "bg-blue-500", icon: Home },
    { id: "pending", label: "Pending Requests", color: "bg-orange-500", icon: Users },
  ];

  return (
    <SharedCalendar
      events={processedEvents}
      isLoading={loading}
      activeFilters={activeFilters}
      filterConfigs={filterConfigs}
      onFilterChange={handleFilterToggle}
      accentColorClass="emerald-600"
      title="Property Viewings"
      renderActionButtons={
        <ScheduleViewingDialog propertyId={0} onSuccess={fetchEvents}>
          <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95">
            <Plus size={18} strokeWidth={3} /> <span>Request Viewing</span>
          </button>
        </ScheduleViewingDialog>
      }
    />
  );
};