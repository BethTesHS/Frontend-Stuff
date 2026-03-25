import { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  CalendarClock,
  ListFilter,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import maintenanceApi, { MaintenanceSchedule } from '@/services/maintenanceApi';
import { complaintsApi, type Complaint } from '@/services/complaintsApi';
import { toast } from 'sonner';

interface ScheduleWithComplaint extends MaintenanceSchedule {
  complaint?: Complaint;
}

type FilterOption = 'all' | 'upcoming' | 'past';

const urgencyBorderColor: Record<string, string> = {
  urgent: 'border-l-red-500',
  high: 'border-l-orange-500',
  medium: 'border-l-yellow-400',
  low: 'border-l-green-500',
};

const urgencyBadgeColor: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

function isUpcoming(dateStr: string) {
  return new Date(dateStr) >= new Date(new Date().toDateString());
}

export function OwnerMaintenance() {
  const [schedules, setSchedules] = useState<ScheduleWithComplaint[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleWithComplaint | null>(null);
  const [filter, setFilter] = useState<FilterOption>('all');

  // Form state
  const [selectedComplaint, setSelectedComplaint] = useState<number | ''>('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const complaintsResponse = await complaintsApi.getAgentComplaints();
        const complaintsList = Array.isArray(complaintsResponse.complaints)
          ? complaintsResponse.complaints
          : complaintsResponse.data?.complaints || [];
        setComplaints(complaintsList);

        const schedulesData = await maintenanceApi.getAllSchedules();
        const enriched = schedulesData.map(s => ({
          ...s,
          complaint: complaintsList.find(c => c.id === s.complaint_id),
        }));
        setSchedules(enriched);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load maintenance schedules');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const counts = {
    all: schedules.length,
    upcoming: schedules.filter(s => isUpcoming(s.scheduled_date)).length,
    past: schedules.filter(s => !isUpcoming(s.scheduled_date)).length,
  };

  const filtered = schedules.filter(s => {
    if (filter === 'upcoming') return isUpcoming(s.scheduled_date);
    if (filter === 'past') return !isUpcoming(s.scheduled_date);
    return true;
  });

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !scheduledDate || !scheduledTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const scheduleData = {
        complaint_id: Number(selectedComplaint),
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        notes,
      };

      if (editingSchedule?.id) {
        const updated = await maintenanceApi.updateSchedule(editingSchedule.id, scheduleData);
        setSchedules(prev =>
          prev.map(s => s.id === editingSchedule.id ? { ...updated, complaint: editingSchedule.complaint } : s)
        );
        toast.success('Schedule updated');
      } else {
        const created = await maintenanceApi.createSchedule(scheduleData as MaintenanceSchedule);
        const complaint = complaints.find(c => c.id === Number(selectedComplaint));
        setSchedules(prev => [...prev, { ...created, complaint }]);
        toast.success('Schedule created');
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error(editingSchedule ? 'Failed to update schedule' : 'Failed to create schedule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (schedule: ScheduleWithComplaint) => {
    setEditingSchedule(schedule);
    setSelectedComplaint(schedule.complaint_id);
    setScheduledDate(schedule.scheduled_date);
    setScheduledTime(schedule.scheduled_time);
    setNotes(schedule.notes || '');
    setShowModal(true);
  };

  const handleDelete = async (scheduleId: number) => {
    if (!confirm('Are you sure you want to delete this maintenance schedule?')) return;
    try {
      await maintenanceApi.deleteSchedule(scheduleId);
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
      toast.success('Schedule deleted');
    } catch (error) {
      toast.error('Failed to delete schedule');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSchedule(null);
    setSelectedComplaint('');
    setScheduledDate('');
    setScheduledTime('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-500" />
            Maintenance Scheduling
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Schedule and manage repair dates for property complaints
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Schedule Repair
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
            <ListFilter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{counts.all}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
            <CalendarClock className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{counts.upcoming}</p>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{counts.past}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {([
          { label: 'All', value: 'all' as FilterOption, icon: ListFilter },
          { label: 'Upcoming', value: 'upcoming' as FilterOption, icon: CalendarClock },
          { label: 'Past', value: 'past' as FilterOption, icon: CheckCircle2 },
        ] as { label: string; value: FilterOption; icon: any }[]).map(opt => {
          const Icon = opt.icon;
          const active = filter === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-sm'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {opt.label}
              <span className={`ml-0.5 px-1.5 text-[10px] rounded-full font-semibold ${
                active
                  ? 'bg-white/20 dark:bg-gray-900/20 text-inherit'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
                {counts[opt.value]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Schedules List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
            <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <h3 className="text-base font-semibold text-foreground mb-1">No schedules found</h3>
            <p className="text-muted-foreground text-sm">
              {filter === 'all'
                ? 'No maintenance schedules yet. Click "Schedule Repair" to create one.'
                : filter === 'upcoming'
                ? 'No upcoming maintenance scheduled.'
                : 'No past maintenance records.'}
            </p>
          </div>
        ) : (
          filtered.map(schedule => {
            const urgency = schedule.complaint?.urgency || 'low';
            const borderColor = urgencyBorderColor[urgency] || 'border-l-gray-300';
            const upcoming = isUpcoming(schedule.scheduled_date);

            return (
              <div
                key={schedule.id}
                className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 border-l-4 ${borderColor} rounded-xl overflow-hidden`}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    {/* Left content */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground text-sm sm:text-base">
                            {schedule.complaint?.issue_type || 'Maintenance Work'}
                          </h3>
                          {schedule.complaint?.urgency && (
                            <Badge className={`text-xs ${urgencyBadgeColor[urgency]}`}>
                              {urgency}
                            </Badge>
                          )}
                          <Badge
                            className={`text-xs ${
                              upcoming
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                          >
                            {upcoming ? 'Upcoming' : 'Completed'}
                          </Badge>
                        </div>

                        {schedule.complaint?.description && (
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {schedule.complaint.description}
                          </p>
                        )}

                        <div className="mt-2 flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {new Date(schedule.scheduled_date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            {schedule.scheduled_time}
                          </div>
                          {schedule.complaint?.house_number && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {schedule.complaint.house_number}
                            </div>
                          )}
                        </div>

                        {schedule.notes && (
                          <div className="mt-3 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-muted-foreground">
                              <span className="font-semibold text-foreground">Notes: </span>
                              {schedule.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(schedule)}
                        className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => schedule.id && handleDelete(schedule.id)}
                        className="p-2 rounded-lg border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {schedule.complaint && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Linked complaint: <span className="font-medium text-foreground">{schedule.complaint.ticket_number}</span>
                        {schedule.complaint.tenant_name && (
                          <> · Tenant: <span className="font-medium text-foreground">{schedule.complaint.tenant_name}</span></>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={showModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-500" />
              {editingSchedule ? 'Edit Schedule' : 'Schedule a Repair'}
            </DialogTitle>
            <DialogDescription>
              {editingSchedule
                ? 'Update the maintenance schedule details.'
                : 'Link a complaint and set a date and time for the repair.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateOrUpdate} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Complaint *</label>
              <select
                value={selectedComplaint}
                onChange={e => setSelectedComplaint(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
                required
              >
                <option value="">Select a complaint…</option>
                {complaints.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.issue_type} — {c.house_number} ({c.ticket_number})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Date *</label>
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Time *</label>
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={e => setScheduledTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Notes</label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any instructions for the maintenance visit…"
                className="resize-none min-h-[80px]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-60"
              >
                {submitting ? 'Saving…' : editingSchedule ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
