export interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  startTime: string;
  location?: string;
  clientName: string;
  status: 'confirmed' | 'pending' | string;
  hasConflict?: boolean;
}