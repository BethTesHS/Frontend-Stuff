import { parseISO, areIntervalsOverlapping } from "date-fns";

export const transformViewingsToEvents = (apiEvents: any[]) => {
  return apiEvents.map((event) => {
    const start = event.start_datetime
      ? parseISO(event.start_datetime)
      : new Date();
    const end = event.end_datetime
      ? parseISO(event.end_datetime)
      : new Date(start.getTime() + 3600000);

    return {
      id: event.id,
      title: event.title || "Viewing",
      type: event.event_type || "viewing",
      date: event.date || event.start_datetime?.split("T")[0],
      startTime:
        event.startTime ||
        event.start_datetime?.split("T")[1]?.substring(0, 5) ||
        "00:00",
      startISO: start,
      endISO: end,
      location: event.location || "Property Location",
      clientName: event.notes || "Agent",
      status:
        event.status === "scheduled" || event.status === "completed"
          ? "confirmed"
          : event.status === "cancelled"
            ? "cancelled"
            : "pending",
    };
  });
};

export const detectConflicts = (events: any[]) => {
  return events.map((event, i) => {
    if (!event.start_datetime && !event.startISO)
      return { ...event, hasConflict: false };

    const startA = event.startISO || parseISO(event.start_datetime);
    const endA = event.endISO || parseISO(event.end_datetime);

    const hasConflict = events.some((otherEvent, j) => {
      if (i === j) return false;

      const startB = otherEvent.startISO || parseISO(otherEvent.start_datetime);
      const endB = otherEvent.endISO || parseISO(otherEvent.end_datetime);

      try {
        return areIntervalsOverlapping(
          { start: startA, end: endA },
          { start: startB, end: endB },
        );
      } catch (e) {
        return false;
      }
    });

    return { ...event, hasConflict };
  });
};