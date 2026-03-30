import { Button } from '@/components/ui/button';
import {
  Wrench, Droplets, Zap, Thermometer, Home, Bug,
  Shield, Settings, Volume2, Calendar, MapPin,
  MessageSquare, Clock, CheckCircle2, AlertTriangle,
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

const urgencyColor: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

export function ExternalTenantMaintenanceRequestCard({
  complaint,
  onGoToMessages,
}: ExternalTenantMaintenanceRequestCardProps) {
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
    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    : isCompleted
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';

  const StatusIcon = isActive ? Clock : isCompleted ? CheckCircle2 : AlertTriangle;

  const handleMessageAgent = () => {
    if (onGoToMessages) {
      const agentNote = (complaint.notes || []).find(
        (n: any) =>
          n.added_by !== user?.name &&
          n.added_by !== 'You' &&
          n.added_by !== complaint.tenant_name
      );
      onGoToMessages({
        subject: `Maintenance: ${complaint.issue_type} - ${complaint.ticket_number}`,
        agentName: agentNote?.added_by,
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex-shrink-0 size-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <IssueIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
              {complaint.issue_type}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {complaint.house_number}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
            <StatusIcon className="w-3 h-3" />
            {statusLabel}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${urgencyColor[complaint.urgency] || ''}`}>
            {complaint.urgency}
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
        {complaint.description}
      </p>

      {scheduleNote && (
        <div className="mt-3 flex items-start gap-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg p-3">
          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800 dark:text-blue-300">
            <span className="font-medium">Visit scheduled: </span>
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

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
        <span className="text-xs text-gray-400">
          Submitted{' '}
          {new Date(complaint.created_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
        <button
          onClick={handleMessageAgent}
          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Message agent
        </button>
      </div>
    </div>
  );
}
