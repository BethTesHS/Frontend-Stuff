import { parse, addHours, areIntervalsOverlapping } from 'date-fns';

export const transformViewingsToEvents = (viewings: any[]) => {
  return viewings.map(v => ({
    id: v.id,
    title: v.property?.title || 'Viewing',
    type: 'viewing',
    date: v.viewing_date.split('T')[0],
    startTime: v.viewing_time,
    location: v.property?.address,
    clientName: v.agent?.full_name || v.agent?.name || 'Agent',
    status: v.status || 'pending'
  }));
};

export const detectConflicts = (events: any[]) => {
  return events.map((event, i) => {
    const startStr = `${event.date} ${event.startTime}`;
    const startA = parse(startStr, 'yyyy-MM-dd hh:mm a', new Date());
    const endA = addHours(startA, 1);

    const hasConflict = events.some((otherEvent, j) => {
      if (i === j) return false;
      if (event.date !== otherEvent.date) return false;

      const otherStartStr = `${otherEvent.date} ${otherEvent.startTime}`;
      const startB = parse(otherStartStr, 'yyyy-MM-dd hh:mm a', new Date());
      const endB = addHours(startB, 1);

      return areIntervalsOverlapping(
        { start: startA, end: endA },
        { start: startB, end: endB }
      );
    });

    return { ...event, hasConflict };
  });
};