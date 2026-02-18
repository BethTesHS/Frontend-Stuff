export const detectConflicts = (events: any[]) => {
  return events.map(event => {
    const overlaps = events.filter(other => 
      other.id !== event.id && 
      other.date === event.date &&
      other.startTime < (other.endTime || other.startTime) && 
      event.startTime < (other.endTime || other.startTime)
    );
    return { ...event, hasConflict: overlaps.length > 0 };
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