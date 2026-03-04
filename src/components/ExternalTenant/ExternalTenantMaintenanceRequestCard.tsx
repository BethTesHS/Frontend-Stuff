import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Calendar,
  MapPin,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface MessagesContext {
  subject: string;
  agentName?: string;
}

interface ExternalTenantMaintenanceRequestCardProps {
  complaint: any;
  onGoToMessages?: (context: MessagesContext) => void;
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

export function ExternalTenantMaintenanceRequestCard({ complaint, onGoToMessages }: ExternalTenantMaintenanceRequestCardProps) {
  const { user } = useAuth();

  const IssueIcon = getIssueIcon(complaint.issue_type);

  const isActive = complaint.status === 'in_progress';
  const isCompleted = complaint.status === 'resolved' || complaint.status === 'closed';

  const scheduleNote = (complaint.notes || [])
    .slice()
    .reverse()
    .map((n: any) => parseScheduleNote(n.note))
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

  const handleMessageAgent = () => {
    if (onGoToMessages) {
      const agentNote = (complaint.notes || []).find(
        (n: any) => n.added_by !== user?.name && n.added_by !== 'You' && n.added_by !== complaint.tenant_name
      );
      onGoToMessages({
        subject: `Maintenance: ${complaint.issue_type} - ${complaint.ticket_number}`,
        agentName: agentNote?.added_by,
      });
    }
  };

  return (
    <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
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
          <span className="text-xs text-muted-foreground hidden sm:block">
            Submitted {new Date(complaint.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-muted-foreground block sm:hidden">
              {new Date(complaint.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMessageAgent}
              className="text-xs flex items-center gap-1 h-7 px-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}