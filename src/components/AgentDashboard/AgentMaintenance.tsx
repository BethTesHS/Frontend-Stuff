import { useState, useEffect } from 'react';
import { Wrench, Plus, Edit2, Trash2, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import maintenanceApi, { MaintenanceSchedule } from '@/services/maintenanceApi';
import { complaintsApi, type Complaint } from '@/services/complaintsApi';
import { toast } from 'sonner';

interface ScheduleWithComplaint extends MaintenanceSchedule {
  complaint?: Complaint;
}

export function AgentMaintenance() {
  const [schedules, setSchedules] = useState<ScheduleWithComplaint[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleWithComplaint | null>(null);

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
        // Fetch agent's complaints
        const complaintsResponse = await complaintsApi.getAgentComplaints();
        const complaintsList = Array.isArray(complaintsResponse.complaints) 
          ? complaintsResponse.complaints 
          : complaintsResponse.data?.complaints || [];
        setComplaints(complaintsList);

        // Fetch schedules
        const schedulesData = await maintenanceApi.getAllSchedules();
        // Enrich with complaint data
        const enrichedSchedules = schedulesData.map(schedule => ({
          ...schedule,
          complaint: complaintsList.find(c => c.id === schedule.complaint_id)
        }));
        setSchedules(enrichedSchedules);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load maintenance schedules');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        notes
      };

      if (editingSchedule?.id) {
        // Update existing
        const updated = await maintenanceApi.updateSchedule(editingSchedule.id, scheduleData);
        setSchedules(prev => prev.map(s => s.id === editingSchedule.id ? { ...updated, complaint: editingSchedule.complaint } : s));
        toast.success('Maintenance schedule updated successfully');
      } else {
        // Create new
        const created = await maintenanceApi.createSchedule(scheduleData as MaintenanceSchedule);
        const complaint = complaints.find(c => c.id === Number(selectedComplaint));
        setSchedules(prev => [...prev, { ...created, complaint }]);
        toast.success('Maintenance schedule created successfully');
      }

      // Reset form
      setSelectedComplaint('');
      setScheduledDate('');
      setScheduledTime('');
      setNotes('');
      setShowCreateModal(false);
      setEditingSchedule(null);
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
    setShowCreateModal(true);
  };

  const handleDelete = async (scheduleId: number) => {
    if (!confirm('Are you sure you want to delete this maintenance schedule?')) return;

    try {
      await maintenanceApi.deleteSchedule(scheduleId);
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
      toast.success('Maintenance schedule deleted successfully');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Failed to delete schedule');
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingSchedule(null);
    setSelectedComplaint('');
    setScheduledDate('');
    setScheduledTime('');
    setNotes('');
  };

  const getComplaintBadgeColor = (urgency?: string) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center">
            <Wrench className="w-8 h-8 mr-3 text-blue-600" />
            Maintenance Scheduling
          </h1>
          <p className="text-muted-foreground text-base">
            Schedule and manage maintenance dates for property complaints
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Maintenance Date
        </Button>
      </div>

      {/* Schedules List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center">
          <Wrench className="w-14 h-14 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No maintenance schedules</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Create a maintenance schedule to get started
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {schedules.map(schedule => (
            <div key={schedule.id} className="bg-card border rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">
                      {schedule.complaint?.issue_type || 'Unknown Issue'}
                    </h3>
                    {schedule.complaint?.urgency && (
                      <Badge className={`text-xs ${getComplaintBadgeColor(schedule.complaint.urgency)}`}>
                        {schedule.complaint.urgency}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground mb-3">
                    <p>{schedule.complaint?.description}</p>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="font-medium text-foreground">{schedule.complaint?.tenant_name}</span>
                      <span>·</span>
                      <span>{schedule.complaint?.house_number}</span>
                    </div>
                    <div className="flex items-center gap-4 text-foreground font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(schedule.scheduled_date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {schedule.scheduled_time}
                      </div>
                    </div>
                  </div>

                  {schedule.notes && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm">
                      <p className="text-muted-foreground"><strong>Notes:</strong> {schedule.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(schedule)}
                    className="gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                    onClick={() => schedule.id && handleDelete(schedule.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={showCreateModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? 'Edit Maintenance Date' : 'Create Maintenance Date'}
            </DialogTitle>
            <DialogDescription>
              {editingSchedule 
                ? 'Update the maintenance schedule details'
                : 'Schedule a new maintenance date for a complaint'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateOrUpdate} className="space-y-4">
            {/* Complaint Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Complaint *</label>
              <select
                value={selectedComplaint}
                onChange={(e) => setSelectedComplaint(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose a complaint...</option>
                {complaints.map(complaint => (
                  <option key={complaint.id} value={complaint.id}>
                    {complaint.issue_type} - {complaint.tenant_name} ({complaint.ticket_number})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Maintenance Date *</label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Maintenance Time *</label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information for the maintenance..."
                className="resize-none min-h-[80px]"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : editingSchedule ? (
                  'Update Schedule'
                ) : (
                  'Create Schedule'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
