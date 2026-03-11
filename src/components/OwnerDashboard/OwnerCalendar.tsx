import { useState, useEffect, useMemo } from "react";
import { format, parseISO, startOfMonth, endOfMonth, addDays } from "date-fns";
import {
  Plus,
  Wrench,
  Calendar as CalendarIcon,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { SharedCalendar } from "@/components/Calendar/SharedCalendar";
import ScheduleViewingDialog from "@/components/Schedule/ScheduleViewingDialog";
import { detectConflicts } from "@/utils/calendarUtils";

import { ownerDashboardApi } from "@/services/api";
import maintenanceApi from "@/services/maintenanceApi";

export const OwnerCalendar = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeFilters, setActiveFilters] = useState({
    maintenance: true,
    custom: true,
    viewings: true,
    complaints: false,
  });

  const fetchUnifiedData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const start = format(startOfMonth(today), "yyyy-MM-dd");
      const end = format(endOfMonth(addDays(today, 60)), "yyyy-MM-dd");

      const [customRes, maintSchedules, viewingsRes] = await Promise.all([
        ownerDashboardApi
          .getCalendarEvents({ start_date: start, end_date: end })
          .catch(() => ({ data: [] })),
        maintenanceApi.getAllSchedules().catch(() => []),
        ownerDashboardApi
          .getViewings({ start_date: start, end_date: end })
          .catch(() => ({ data: [] })),
      ]);

      // 1. Map Custom Events (Meetings)
      const customMapped = (customRes.data || []).map((e: any) => ({
        id: `custom-${e.id}`,
        title: e.title,
        date: format(parseISO(e.start_datetime), "yyyy-MM-dd"),
        time: format(parseISO(e.start_datetime), "HH:mm"),
        type: "custom",
        accentColor: "bg-slate-500",
      }));

      // 2. Map Property Viewings
      const viewingsMapped = (viewingsRes.data || []).map((v: any) => ({
        id: `viewing-${v.id}`,
        title: `Viewing: ${v.property?.title || "Property"}`,
        date: format(parseISO(v.scheduled_date), "yyyy-MM-dd"),
        time: format(parseISO(v.scheduled_date), "HH:mm"),
        type: "viewings",
        accentColor: "bg-indigo-600",
      }));

      // 3. Map Maintenance Schedules
      const maintenanceMapped = Array.isArray(maintSchedules)
        ? maintSchedules.map((s) => ({
            id: `maint-${s.id}`,
            title: `Repair: Scheduled`,
            date: s.scheduled_date,
            time: s.scheduled_time,
            type: "maintenance",
            accentColor: "bg-blue-500",
          }))
        : [];

      setEvents([...customMapped, ...viewingsMapped, ...maintenanceMapped]);
    } catch (error) {
      console.error("Calendar Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnifiedData();
  }, []);

  const processedEvents = useMemo(() => {
    const filtered = events.filter(
      (e) => activeFilters[e.type as keyof typeof activeFilters],
    );
    return detectConflicts(filtered);
  }, [events, activeFilters]);

  const filterConfigs = [
    {
      id: "custom",
      label: "Meetings",
      color: "bg-blue-500",
      icon: CalendarIcon,
    },
    { id: "viewings", label: "Viewings", color: "bg-blue-500", icon: Eye },
    { id: "maintenance", label: "Repairs", color: "bg-blue-500", icon: Wrench },
    {
      id: "complaints",
      label: "Reported Issues",
      color: "bg-blue-500",
      icon: AlertTriangle,
    },
  ];

  return (
    <SharedCalendar
      events={processedEvents}
      isLoading={loading}
      activeFilters={activeFilters}
      filterConfigs={filterConfigs}
      onFilterChange={(id) =>
        setActiveFilters((prev) => ({
          ...prev,
          [id]: !prev[id as keyof typeof prev],
        }))
      }
      title="Property Portfolio Calendar"
      accentColorClass="blue-600"
      renderActionButtons={
        <div className="space-y-3">
          <ScheduleViewingDialog propertyId={0} onSuccess={fetchUnifiedData}>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95">
              <Eye size={18} /> <span>Schedule Viewing</span>
            </button>
          </ScheduleViewingDialog>

          <button
            onClick={() => { }}
            className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Plus size={18} /> <span>Add Event</span>
          </button>
        </div>
      }
    />
  );
};
