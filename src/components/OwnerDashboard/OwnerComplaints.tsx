import { useState, useEffect } from 'react';
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
  TrendingUp,
} from 'lucide-react';
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

const statusBorderColor: Record<string, string> = {
  open: 'border-l-red-500',
  in_progress: 'border-l-blue-500',
  resolved: 'border-l-green-500',
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

  const resolutionRate = counts.all > 0
    ? Math.round((counts.resolved / counts.all) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          Property Complaints
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor and manage all tenant complaints across your properties
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{counts.open}</p>
            <p className="text-xs text-muted-foreground">Open</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{counts.in_progress}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{counts.resolved}</p>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </div>
        </div>
      </div>

      {/* Resolution Rate Bar */}
      {counts.all > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-foreground">Resolution Rate</span>
            </div>
            <span className="text-sm font-bold text-green-600 dark:text-green-400">{resolutionRate}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
              style={{ width: `${resolutionRate}%` }}
            />
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {filterOptions.map(opt => {
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
              <span className={`ml-0.5 px-1.5 py-0 text-[10px] rounded-full font-semibold ${
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

      {/* Complaints List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <h3 className="text-base font-semibold text-foreground mb-1">No complaints found</h3>
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
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
              : isActive
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';

            const StatusIcon = isOpen ? AlertTriangle : isActive ? Clock : CheckCircle2;
            const expanded = expandedId === complaint.id;
            const borderColor = statusBorderColor[complaint.status] || 'border-l-gray-300';

            return (
              <div
                key={complaint.id}
                className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 border-l-4 ${borderColor} rounded-xl shadow-sm overflow-hidden`}
              >
                {/* Clickable Header */}
                <div
                  className="p-4 sm:p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => setExpandedId(expanded ? null : complaint.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <IssueIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground text-sm sm:text-base">
                            {complaint.issue_type}
                          </h3>
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
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{complaint.house_number}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Tenant: <span className="text-foreground font-medium">{complaint.tenant_name}</span>
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {complaint.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {complaint.notes && complaint.notes.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MessageSquare className="w-3 h-3" />
                          <span>{complaint.notes.length}</span>
                        </div>
                      )}
                      {expanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center text-xs text-muted-foreground">
                    <span>{complaint.ticket_number}</span>
                    <span className="mx-1.5">·</span>
                    <span>
                      {new Date(complaint.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {expanded && (
                  <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 p-4 sm:p-5 space-y-4">
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
                            Resolved On
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
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                          {complaint.notes.map(note => (
                            <div
                              key={note.id}
                              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-xs"
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-foreground">{note.added_by}</span>
                                <span className="text-muted-foreground">
                                  {new Date(note.created_at).toLocaleDateString('en-GB', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{note.note}</p>
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
