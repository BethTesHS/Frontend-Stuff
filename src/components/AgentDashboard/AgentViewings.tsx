import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SharedCalendar } from "@/components/Calendar/SharedCalendar";

export const AgentViewings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>({
    confirmed: true,
    pending: true,
  });

  const filterConfigs = [
    { id: "confirmed", label: "Confirmed Viewings", color: "bg-blue-600" },
    { id: "pending", label: "Pending Requests", color: "bg-amber-500" },
  ];

  const handleFilterChange = (filterId: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterId]: !prev[filterId],
    }));
  };
  const agentEvents = [
    {
      id: "v1",
      title: "Viewing: Apartment 4B",
      date: "2026-02-24",
      time: "10:00 AM",
      type: "confirmed",
      location: "Riverside Drive, Nairobi",
    },
  ];

  return (
    <div className="h-full space-y-6">
      <SharedCalendar
        events={agentEvents}
        isLoading={loading}
        accentColorClass="blue-600"
        title="Property Viewings"
        activeFilters={activeFilters}
        filterConfigs={filterConfigs}
        onFilterChange={handleFilterChange}
        renderActionButtons={
          <Button
            onClick={() => navigate("/properties")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Viewing
          </Button>
        }
      />
    </div>
  );
};
