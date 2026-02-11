import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, MapPin, User, Plus, Loader2, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { ownerDashboardApi, CalendarEvent } from "@/services/api"
import { toast } from "sonner"
import { format, addDays, startOfMonth, endOfMonth } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Property {
  id: number;
  title: string;
}

interface EventFormData {
  property_id?: number;
  title: string;
  description: string;
  event_type: 'viewing' | 'maintenance' | 'inspection' | 'meeting' | 'reminder' | 'other';
  start_datetime: string;
  end_datetime: string;
  all_day: boolean;
  location: string;
  attendees: string;
  notes: string;
  reminder_minutes_before?: number;
}

export function OwnerCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    event_type: 'meeting',
    start_datetime: '',
    end_datetime: '',
    all_day: false,
    location: '',
    attendees: '',
    notes: '',
  })

  // Fetch events when component mounts or selected date changes
  useEffect(() => {
    fetchEvents();
    fetchProperties();
  }, [selectedDate])

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const start = startOfMonth(today);
      const end = endOfMonth(addDays(today, 60)); // Get 2 months of events

      const response = await ownerDashboardApi.getCalendarEvents({
        start_date: format(start, 'yyyy-MM-dd'),
        end_date: format(end, 'yyyy-MM-dd'),
      });

      if (response.success && response.data) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://homedapp1.azurewebsites.net'}/properties/my-properties`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_type: 'meeting',
      start_datetime: '',
      end_datetime: '',
      all_day: false,
      location: '',
      attendees: '',
      notes: '',
    });
    setEditingEvent(null);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.start_datetime || !formData.end_datetime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await ownerDashboardApi.createCalendarEvent({
        property_id: formData.property_id,
        title: formData.title,
        description: formData.description || undefined,
        event_type: formData.event_type,
        start_datetime: formData.start_datetime,
        end_datetime: formData.end_datetime,
        all_day: formData.all_day,
        location: formData.location || undefined,
        attendees: formData.attendees || undefined,
        notes: formData.notes || undefined,
        reminder_minutes_before: formData.reminder_minutes_before,
      });

      if (response.success) {
        toast.success('Event created successfully!');
        setIsCreateModalOpen(false);
        resetForm();
        fetchEvents();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingEvent || !formData.title || !formData.start_datetime || !formData.end_datetime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await ownerDashboardApi.updateCalendarEvent(editingEvent.id, {
        property_id: formData.property_id,
        title: formData.title,
        description: formData.description || undefined,
        event_type: formData.event_type,
        start_datetime: formData.start_datetime,
        end_datetime: formData.end_datetime,
        all_day: formData.all_day,
        location: formData.location || undefined,
        attendees: formData.attendees || undefined,
        notes: formData.notes || undefined,
        reminder_minutes_before: formData.reminder_minutes_before,
      });

      if (response.success) {
        toast.success('Event updated successfully!');
        setIsEditModalOpen(false);
        resetForm();
        fetchEvents();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const response = await ownerDashboardApi.deleteCalendarEvent(eventId);

      if (response.success) {
        toast.success('Event deleted successfully!');
        fetchEvents();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete event');
    }
  };

  const openEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      property_id: event.property_id,
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      start_datetime: event.start_datetime,
      end_datetime: event.end_datetime,
      all_day: event.all_day,
      location: event.location || '',
      attendees: event.attendees || '',
      notes: event.notes || '',
      reminder_minutes_before: event.reminder_minutes_before,
    });
    setIsEditModalOpen(true);
  };

  // Get upcoming events (next 7 days)
  const upcomingEvents = events
    .filter(event => {
      const eventDate = new Date(event.start_datetime);
      const now = new Date();
      const weekFromNow = addDays(now, 7);
      return eventDate >= now && eventDate <= weekFromNow && event.status !== 'cancelled';
    })
    .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
    .slice(0, 5)
    .map(event => ({
      id: event.id,
      title: event.title,
      time: format(new Date(event.start_datetime), 'h:mm a'),
      date: format(new Date(event.start_datetime), 'EEEE, MMM d'),
      location: event.location || event.property?.address || 'No location',
      type: event.event_type,
      attendees: event.attendees ? event.attendees.split(',').length : 0,
      rawEvent: event
    }));

  // Calculate stats
  const thisWeekEvents = events.filter(event => {
    const eventDate = new Date(event.start_datetime);
    const now = new Date();
    const weekFromNow = addDays(now, 7);
    return eventDate >= now && eventDate <= weekFromNow;
  }).length;

  const thisMonthEvents = events.filter(event => {
    const eventDate = new Date(event.start_datetime);
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    return eventDate >= monthStart && eventDate <= monthEnd;
  }).length;

  const pendingActions = events.filter(event =>
    event.status === 'scheduled' && new Date(event.start_datetime) < new Date()
  ).length;

  const getEventTypeColor = (type: string) => {
    return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      <div className="relative z-10 p-6 space-y-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Calendar & Events
          </h1>
          <p className="text-muted-foreground text-lg">Manage your schedule and important dates</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Calendar Card */}
          <div className="xl:col-span-2">
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800 dark:text-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-gray-600 dark:bg-gray-700 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-white" />
                  </div>
                  Calendar View
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-lg"
                  classNames={{
                    months: "flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-6 w-full",
                    caption: "flex justify-center pt-2 relative items-center",
                    caption_label: "text-lg font-semibold text-gray-800 dark:text-gray-100",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-8 w-8 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-0 opacity-70 hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200",
                    nav_button_previous: "absolute left-2",
                    nav_button_next: "absolute right-2",
                    table: "w-full border-collapse space-y-2",
                    head_row: "flex mb-2",
                    head_cell: "text-muted-foreground rounded-lg w-12 h-12 font-semibold text-sm flex items-center justify-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
                    row: "flex w-full mt-2",
                    cell: "text-center text-sm p-1 relative [&:has([aria-selected])]:bg-gray-100 dark:[&:has([aria-selected])]:bg-gray-800 first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg focus-within:relative focus-within:z-20",
                    day: "h-12 w-12 p-0 font-medium aria-selected:opacity-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:border hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 flex items-center justify-center",
                    day_selected: "bg-gray-700 dark:bg-gray-600 text-white hover:bg-gray-800 dark:hover:bg-gray-500 shadow-lg",
                    day_today: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold border-2 border-gray-400 dark:border-gray-600 shadow-md",
                    day_outside: "text-muted-foreground opacity-40",
                    day_disabled: "text-muted-foreground opacity-30",
                    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible"
                  }}
                />
                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div className="xl:col-span-1">
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 h-fit">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-gray-600 dark:bg-gray-700 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-600 dark:text-gray-400" />
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading events...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className="group p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-lg animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Badge className={`${getEventTypeColor(event.type)} border font-medium`}>
                          {event.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                          {event.date}
                        </span>
                      </div>

                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-gray-900 dark:group-hover:text-gray-50 transition-colors">
                        {event.title}
                      </h4>

                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                          <span>{event.attendees} attendee{event.attendees > 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      {event.rawEvent.status === 'scheduled' && (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(event.rawEvent)}
                            className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteEvent(event.id)}
                            className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                    ))}

                    {upcomingEvents.length === 0 && !loading && (
                      <div className="text-center py-6">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <CalendarDays className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          No upcoming events
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[
            { label: "This Week", value: `${thisWeekEvents} Event${thisWeekEvents !== 1 ? 's' : ''}`, icon: CalendarDays },
            { label: "This Month", value: `${thisMonthEvents} Event${thisMonthEvents !== 1 ? 's' : ''}`, icon: Clock },
            { label: "Pending", value: `${pendingActions} Action${pendingActions !== 1 ? 's' : ''}`, icon: User }
          ].map((stat, index) => (
            <Card key={stat.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gray-600 dark:bg-gray-700 flex items-center justify-center shadow-lg">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create Event Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Add a new event to your calendar
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="event_type">Event Type *</Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(value: any) => setFormData({ ...formData, event_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewing">Viewing</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="property">Property (Optional)</Label>
                <Select
                  value={formData.property_id?.toString() || ''}
                  onValueChange={(value) => setFormData({ ...formData, property_id: value ? parseInt(value) : undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        {property.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="start_datetime">Start Date & Time *</Label>
                <Input
                  id="start_datetime"
                  type="datetime-local"
                  value={formData.start_datetime}
                  onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="end_datetime">End Date & Time *</Label>
                <Input
                  id="end_datetime"
                  type="datetime-local"
                  value={formData.end_datetime}
                  onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Event location"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="attendees">Attendees (comma-separated)</Label>
                <Input
                  id="attendees"
                  value={formData.attendees}
                  onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                  placeholder="john@example.com, jane@example.com"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event description"
                  rows={3}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="reminder">Reminder (minutes before)</Label>
                <Input
                  id="reminder"
                  type="number"
                  value={formData.reminder_minutes_before || ''}
                  onChange={(e) => setFormData({ ...formData, reminder_minutes_before: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="e.g., 30"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="all_day"
                  checked={formData.all_day}
                  onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="all_day" className="cursor-pointer">All Day Event</Label>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Event'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Event Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update event details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditEvent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="edit_title">Event Title *</Label>
                <Input
                  id="edit_title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="edit_event_type">Event Type *</Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(value: any) => setFormData({ ...formData, event_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewing">Viewing</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="edit_property">Property (Optional)</Label>
                <Select
                  value={formData.property_id?.toString() || ''}
                  onValueChange={(value) => setFormData({ ...formData, property_id: value ? parseInt(value) : undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        {property.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit_start_datetime">Start Date & Time *</Label>
                <Input
                  id="edit_start_datetime"
                  type="datetime-local"
                  value={formData.start_datetime}
                  onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit_end_datetime">End Date & Time *</Label>
                <Input
                  id="edit_end_datetime"
                  type="datetime-local"
                  value={formData.end_datetime}
                  onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="edit_location">Location</Label>
                <Input
                  id="edit_location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Event location"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="edit_attendees">Attendees (comma-separated)</Label>
                <Input
                  id="edit_attendees"
                  value={formData.attendees}
                  onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                  placeholder="john@example.com, jane@example.com"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="edit_description">Description</Label>
                <Textarea
                  id="edit_description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event description"
                  rows={3}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="edit_notes">Notes</Label>
                <Textarea
                  id="edit_notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="edit_reminder">Reminder (minutes before)</Label>
                <Input
                  id="edit_reminder"
                  type="number"
                  value={formData.reminder_minutes_before || ''}
                  onChange={(e) => setFormData({ ...formData, reminder_minutes_before: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="e.g., 30"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_all_day"
                  checked={formData.all_day}
                  onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="edit_all_day" className="cursor-pointer">All Day Event</Label>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Event'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}