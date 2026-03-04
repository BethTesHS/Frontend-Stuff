import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Plus,
  AlertTriangle,
  MapPin,
  MessageSquare,
  Clock,
  CheckCircle2,
  ListFilter,
  Wrench,
  Droplets,
  Zap,
  Thermometer,
  Home,
  Bug,
  Shield,
  Settings,
  Volume2,
} from 'lucide-react';
import { toast } from 'sonner';

type FilterOption = 'all' | 'active' | 'resolved';

const filterOptions: { label: string; value: FilterOption; icon: any }[] = [
  { label: 'All', value: 'all', icon: ListFilter },
  { label: 'Active', value: 'active', icon: Clock },
  { label: 'Resolved', value: 'resolved', icon: CheckCircle2 },
];

const issueIcons: Record<string, any> = {
  'Plumbing Issues': Droplets,
  'Electrical Problems': Zap,
  'Heating/Cooling': Thermometer,
  'Structural Issues': Home,
  'Pest Control': Bug,
  'Security Issues': Shield,
  'Appliance Malfunction': Settings,
  'Noise Complaints': Volume2,
  'Window/Door Issues': Home,
};

function getIssueIcon(issueType: string) {
  return issueIcons[issueType] || Wrench;
}

const urgencyColor: Record<string, string> = {
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

interface MessagesContext {
  subject: string;
  agentName?: string;
}

// ── Mock data matching the UI of the tenant dashboard ───────────────────
const MOCK_COMPLAINTS = [
  {
    id: '1',
    ticket_number: 'TKT-001',
    issue_type: 'Plumbing Issues',
    house_number: 'Apt 4B, Sunset Building',
    description: 'There is a persistent leak under the kitchen sink. It seems to be getting worse and is starting to damage the wooden cabinet base.',
    urgency: 'high',
    status: 'open',
    tenant_name: 'External Tenant',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    notes: []
  },
  {
    id: '2',
    ticket_number: 'TKT-002',
    issue_type: 'Electrical Problems',
    house_number: 'Apt 4B, Sunset Building',
    description: 'The hallway light fixture keeps flickering and making a buzzing noise even after I replaced the bulb.',
    urgency: 'medium',
    status: 'in_progress',
    tenant_name: 'External Tenant',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    notes: [{ added_by: 'Agent Sarah M.', note: 'Electrician scheduled.' }]
  },
  {
    id: '3',
    ticket_number: 'TKT-003',
    issue_type: 'Noise Complaints',
    house_number: 'Apt 4B, Sunset Building',
    description: 'The neighbors upstairs are playing loud music past midnight on weekdays.',
    urgency: 'low',
    status: 'resolved',
    tenant_name: 'External Tenant',
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(), // 14 days ago
    notes: [{ added_by: 'Agent Sarah M.', note: 'Spoke to the neighbors, issue resolved.' }]
  }
];
// ────────────────────────────────────────────────────────────────────────

const ComplaintRow = ({ complaint, onGoToMessages }: { complaint: any, onGoToMessages: (context: MessagesContext) => void }) => {
  const IssueIcon = getIssueIcon(complaint.issue_type);

  const isOpen = complaint.status === 'open';
  const isActive = complaint.status === 'in_progress';

  const statusLabel = isOpen ? 'Open' : isActive ? 'In Progress' : 'Resolved';
  const statusColor = isOpen
    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    : isActive
    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';

  const StatusIcon = isOpen ? AlertTriangle : isActive ? Clock : CheckCircle2;

  const handleMessage = () => {
    const agentNote = complaint.notes?.find((n: any) => n.added_by !== complaint.tenant_name);
    onGoToMessages({
      subject: `${complaint.issue_type} - ${complaint.ticket_number}`,
      agentName: agentNote?.added_by,
    });
  };

  return (
    <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
              <IssueIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                {complaint.issue_type}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate">
                  {complaint.house_number}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <Badge className={`text-xs ${statusColor}`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusLabel}
            </Badge>
            <Badge variant="outline" className={`text-xs ${urgencyColor[complaint.urgency ?? 'low'] ?? ''}`}>
              {complaint.urgency ?? 'low'}
            </Badge>
          </div>
        </div>

        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{complaint.description}</p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            #{complaint.ticket_number} &middot; Submitted{' '}
            {new Date(complaint.created_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMessage}
            className="text-xs flex items-center gap-1 h-7 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Message
          </Button>
        </div>
      </div>
    </div>
  );
};

const ExternalTenantComplaints = ({ onGoToMessages }: { onGoToMessages?: (context: MessagesContext) => void }) => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>('all');

  useEffect(() => {
    // Simulating API fetch for external tenants
    setTimeout(() => {
      setComplaints(MOCK_COMPLAINTS);
      setLoading(false);
    }, 600);
  }, []);

  const filtered = complaints.filter(c => {
    if (filter === 'active') return c.status === 'open' || c.status === 'in_progress';
    if (filter === 'resolved') return c.status === 'resolved' || c.status === 'closed';
    return true;
  });

  const counts = {
    all: complaints.length,
    active: complaints.filter(c => c.status === 'open' || c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length,
  };

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {filterOptions.map(opt => {
            const Icon = opt.icon;
            const active = filter === opt.value;
            return (
              <Button
                key={opt.value}
                variant={active ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(opt.value)}
                className={`flex items-center gap-1.5 ${
                  active
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-none'
                    : ''
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {opt.label}
                <Badge
                  variant="secondary"
                  className={`ml-1 px-1.5 py-0 text-[10px] ${active ? 'bg-white/20 text-white' : ''}`}
                >
                  {counts[opt.value]}
                </Badge>
              </Button>
            );
          })}
        </div>
        
        <Button
          onClick={() => navigate('/submit-complaint')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-md transition-all duration-300 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Complaint
        </Button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border rounded-xl p-12 text-center">
            <FileText className="w-14 h-14 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No complaints</h3>
            <p className="text-muted-foreground text-sm">
              {filter === 'all'
                ? 'When you file a complaint, it will appear here.'
                : filter === 'active'
                ? 'No open or in-progress complaints at the moment.'
                : 'No resolved complaints yet.'}
            </p>
          </div>
        ) : (
          filtered.map(complaint => (
            <ComplaintRow
              key={complaint.id}
              complaint={complaint}
              onGoToMessages={onGoToMessages ?? (() => {})}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ExternalTenantComplaints;