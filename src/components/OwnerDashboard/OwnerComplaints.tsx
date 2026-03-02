import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  MapPin,
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
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { complaintsApi, type Complaint } from '@/services/complaintsApi';
import { toast } from 'sonner';

type FilterOption = 'all' | 'open' | 'in_progress' | 'resolved';

const filterOptions: { label: string; value: FilterOption; icon: any }[] = [
  { label: 'All', value: 'all', icon: ListFilter },
  { label: 'Open', value: 'open', icon: AlertTriangle },
  { label: 'In Progress', value: 'in_progress', icon: Clock },
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

export function OwnerComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        // Fetch all complaints visible to owner (their properties)
        const response = await complaintsApi.getAgentComplaints();
        const complaintsList = Array.isArray(response.complaints)
          ? response.complaints
          : response.data?.complaints || [];
        setComplaints(complaintsList);
      } catch (error) {
        console.error('Error fetching complaints:', error);
        toast.error('Failed to load complaints');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const filtered = complaints.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const counts = {
    all: complaints.length,
    open: complaints.filter(c => c.status === 'open').length,
    in_progress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center">
          <AlertTriangle className="w-8 h-8 mr-3 text-red-600" />
          Property Complaints
        </h1>
        <p className="text-muted-foreground text-base">
          Monitor and manage all tenant complaints across your properties
        </p>
      </div>

      {/* Filter Tabs */}
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
                active ? 'bg-blue-600 text-white border-none' : ''
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

      {/* Complaints List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border rounded-xl p-12 text-center">
            <AlertTriangle className="w-14 h-14 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No complaints found</h3>
            <p className="text-muted-foreground text-sm">
              {filter === 'all'
                ? 'Your properties have no complaints at the moment.'
                : filter === 'open'
                ? 'No open complaints.'
                : filter === 'in_progress'
                ? 'No complaints in progress.'
                : 'No resolved complaints yet.'}
            </p>
          </div>
        ) : (
          filtered.map(complaint => {
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
            const expanded = expandedId === complaint.id;

            return (
              <div key={complaint.id} className="bg-card border rounded-xl shadow-sm overflow-hidden">
                {/* Complaint Header - Clickable */}
                <div
                  className="p-4 sm:p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(expanded ? null : complaint.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <IssueIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                          {complaint.issue_type}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">
                            {complaint.house_number}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Tenant: <span className="text-foreground font-medium">{complaint.tenant_name}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <Badge className={`text-xs ${statusColor}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusLabel}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${urgencyColor[complaint.urgency] || ''}`}
                      >
                        {complaint.urgency}
                      </Badge>
                      {expanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                    {complaint.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {complaint.ticket_number}
                      {' • '}
                      {new Date(complaint.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    {complaint.notes && complaint.notes.length > 0 && (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{complaint.notes.length} message{complaint.notes.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expandable Details */}
                {expanded && (
                  <div className="border-t bg-muted/20 dark:bg-muted/10 p-4 sm:p-5 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                          Tenant Contact
                        </p>
                        <p className="text-sm text-foreground font-medium">{complaint.tenant_email}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                          Submitted
                        </p>
                        <p className="text-sm text-foreground">
                          {new Date(complaint.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    {complaint.status === 'resolved' && complaint.resolved_at && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            Resolved
                          </p>
                          <p className="text-sm text-foreground">
                            {new Date(complaint.resolved_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        {complaint.resolution_description && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              Resolution
                            </p>
                            <p className="text-sm text-foreground">{complaint.resolution_description}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {complaint.notes && complaint.notes.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          Communication ({complaint.notes.length})
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {complaint.notes.map(note => (
                            <div
                              key={note.id}
                              className="bg-white dark:bg-gray-800 rounded p-2 text-xs"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-foreground">{note.added_by}</span>
                                <span className="text-muted-foreground text-[10px]">
                                  {new Date(note.created_at).toLocaleDateString('en-GB', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                              <p className="text-muted-foreground whitespace-pre-wrap">{note.note}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
