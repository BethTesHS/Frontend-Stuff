import { SharedCalendar } from "@/components/Calendar/SharedCalendar";
import { useState } from "react";

export const TenantCalendar = () => {
  const [loading, setLoading] = useState(false);

  const tenantEvents = [
    {
      id: "1",
      title: "Viewing: Apartment 4B",
      date: "2026-02-25",
      time: "2:00 PM",
      type: "viewing",
      location: "Riverside Drive",
    },
  ];

  return (
    <div className="space-y-6">
      <SharedCalendar
        events={tenantEvents}
        isLoading={loading}
        accentColorClass="blue-600"
        title="My Scheduled Viewings"
      />
    </div>
  );
};
