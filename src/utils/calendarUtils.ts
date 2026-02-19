export const detectConflicts = (events: any[]) => {
  return events.map((event, i) => {
    const hasConflict = events.some((otherEvent, j) => {
      if (i === j) return false;

      if (event.date !== otherEvent.date) return false;

      const sameAgent = event.agentId === otherEvent.agentId;
      const sameProperty = event.propertyId === otherEvent.propertyId;

      if (sameAgent || sameProperty) {
        const startA = new Date(`${event.date}T${event.startTime}`).getTime();
        const endA = new Date(`${event.date}T${event.endTime}`).getTime();
        const startB = new Date(`${otherEvent.date}T${otherEvent.startTime}`).getTime();
        const endB = new Date(`${otherEvent.date}T${otherEvent.endTime}`).getTime();

        return startA < endB && endA > startB;
      }
      return false;
    });

    return { ...event, hasConflict };
  });
};

export const transformViewingsToEvents = (viewings: any[]) => {
  return viewings.map(v => ({
    id: v.id,
    title: v.property?.title || 'Viewing',
    type: 'viewing',
    date: v.viewing_date.split('T')[0],
    startTime: v.viewing_time,
    location: v.property?.address,
    clientName: v.agent?.name || 'Agent',
    status: v.status
  }));
};