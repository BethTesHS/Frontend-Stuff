import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Wrench,
  Droplets,
  Zap,
  Thermometer,
  Home,
  Bug,
  Shield,
  Settings,
  Volume2,
  HelpCircle,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { complaintsApi, Complaint, ComplaintNote } from '@/services/complaintsApi';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface MaintenanceRequestCardProps {
  complaint: Complaint;
}

const issueIcons: Record<string, any> = {
  'Plumbing Issues': Droplets,
  'Electrical Problems': Zap,
  'Heating/Cooling': Thermometer,
  'Structural Issues': Home,
  'Pest Control': Bug,
  'Security Issues': Shield,
  'Appliance Malfunction': Settings,
  'Noise Complaints': Volume2,
};

function getIssueIcon(issueType: string) {
  return issueIcons[issueType] || Wrench;
}

// Parse a proposed schedule date from a note text
function parseScheduleNote(note: string): { date: string; time: string; message: string } | null {
  if (!note.includes('[MAINTENANCE_SCHEDULE]')) return null;
  const dateMatch = note.match(/Date:\s*([^\n,]+)/);
  const timeMatch = note.match(/Time:\s*([^\n,]+)/);
  const msgMatch = note.match(/Notes?:\s*([\s\S]+)/);
  return {
    date: dateMatch ? dateMatch[1].trim() : '',
    time: timeMatch ? timeMatch[1].trim() : '',
    message: msgMatch ? msgMatch[1].trim() : '',
  };
}

function formatNoteText(note: string): string {
  // Clean up [MAINTENANCE_SCHEDULE] tag for display
  return note
    .replace('[MAINTENANCE_SCHEDULE]', '')
    .replace('📅 MAINTENANCE SCHEDULED', '')
    .trim();
}

export function MaintenanceRequestCard({ complaint }: MaintenanceRequestCardProps) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState<ComplaintNote[]>(complaint.notes || []);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const IssueIcon = getIssueIcon(complaint.issue_type);

  const isActive = complaint.status === 'in_progress';
  const isCompleted = complaint.status === 'resolved' || complaint.status === 'closed';

  // Find the latest schedule proposal from notes
  const scheduleNote = notes
    .slice()
    .reverse()
    .map(n => parseScheduleNote(n.note))
    .find(Boolean);

  const statusLabel = isActive ? 'Scheduled' : isCompleted ? 'Completed' : 'Pending';
  const statusColor = isActive
    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    : isCompleted
    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';

  const urgencyColor: Record<string, string> = {
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  };

  const handleExpand = async () => {
    if (!expanded && notes.length === 0) {
      setLoadingNotes(true);
      try {
        const response = await complaintsApi.getComplaintDetails(complaint.id);
        const details = (response.complaint || response.data || response) as Complaint;
        if (details?.notes) setNotes(details.notes);
      } catch {
        // silent - show empty
      } finally {
        setLoadingNotes(false);
      }
    }
    setExpanded(v => !v);
  };

  const handleSendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const response = await complaintsApi.addComplaintNote(complaint.id, reply.trim());
      const newNote = response.note || (response.data as any)?.note;
      if (newNote) {
        setNotes(prev => [...prev, newNote]);
      } else {
        // Optimistically add
        setNotes(prev => [
          ...prev,
          {
            id: Date.now(),
            complaint_id: complaint.id,
            note: reply.trim(),
            added_by: user?.name || 'You',
            created_at: new Date().toISOString(),
          },
        ]);
      }
      setReply('');
      toast.success('Message sent');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <IssueIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                {complaint.issue_type}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate">
                  House #{complaint.house_number}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <Badge className={`text-xs ${statusColor}`}>
              {isActive ? (
                <Clock className="w-3 h-3 mr-1" />
              ) : isCompleted ? (
                <CheckCircle2 className="w-3 h-3 mr-1" />
              ) : (
                <AlertTriangle className="w-3 h-3 mr-1" />
              )}
              {statusLabel}
            </Badge>
            <Badge variant="outline" className={`text-xs ${urgencyColor[complaint.urgency] || ''}`}>
              {complaint.urgency}
            </Badge>
          </div>
        </div>

        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{complaint.description}</p>

        {/* Schedule info if proposed */}
        {scheduleNote && (
          <div className="mt-3 flex items-start gap-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg p-3">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800 dark:text-blue-300">
              <span className="font-medium">Proposed schedule: </span>
              {scheduleNote.date}
              {scheduleNote.time && ` at ${scheduleNote.time}`}
              {scheduleNote.message && (
                <span className="block text-blue-700 dark:text-blue-400 mt-0.5">
                  {scheduleNote.message}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Submitted {new Date(complaint.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={handleExpand}
            className="text-xs flex items-center gap-1 h-7 px-2"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {notes.length > 0 ? `${notes.length} message${notes.length !== 1 ? 's' : ''}` : 'Messages'}
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </Button> */}
        </div>
      </div>

      {/* Expandable Communication Thread */}
      {expanded && (
        <div className="border-t bg-muted/20 dark:bg-muted/10">
          <div className="p-4 space-y-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Scheduling Communication
            </h4>

            {/* Notes Thread */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {loadingNotes ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
                </div>
              ) : notes.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No messages yet. Use the box below to communicate with your agent about scheduling.
                </p>
              ) : (
                notes.map(note => {
                  const isSchedule = note.note.includes('[MAINTENANCE_SCHEDULE]');
                  const displayText = formatNoteText(note.note);
                  const isOwn = note.added_by === user?.id || note.added_by === user?.email || note.added_by === user?.name;

                  return (
                    <div
                      key={note.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                          isSchedule
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-700 w-full'
                            : isOwn
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-gray-800 border text-foreground'
                        }`}
                      >
                        {isSchedule && (
                          <div className="flex items-center gap-1 font-semibold mb-1 text-blue-700 dark:text-blue-300">
                            <Calendar className="w-3 h-3" />
                            Maintenance Date Proposed
                          </div>
                        )}
                        <p className="leading-relaxed whitespace-pre-wrap">{displayText}</p>
                        <p className={`mt-1 text-[10px] ${isOwn && !isSchedule ? 'text-blue-200' : 'text-muted-foreground'}`}>
                          {note.added_by} &middot; {new Date(note.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} {new Date(note.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply Input */}
            <div className="flex gap-2">
              <Textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="Reply to your agent about scheduling..."
                className="text-sm resize-none min-h-[60px]"
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    handleSendReply();
                  }
                }}
              />
              <Button
                size="sm"
                disabled={!reply.trim() || sending}
                onClick={handleSendReply}
                className="self-end px-3"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">Press Ctrl+Enter to send</p>
          </div>
        </div>
      )}
    </div>
  );
}
