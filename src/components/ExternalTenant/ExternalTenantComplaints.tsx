import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  FileText, Plus, AlertTriangle, MapPin, MessageSquare,
  Clock, CheckCircle2, ListFilter, Wrench, Droplets, Zap,
  Thermometer, Home, Bug, Shield, Settings, Volume2, Loader2,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { externalTenantApi } from '@/services/api';
import { externalTenantComplaintsApi } from '@/services/externalTenantComplaintsApi';
import SubmitComplaint from '@/pages/SubmitComplaint';

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
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

interface MessagesContext {
  subject: string;
  agentName?: string;
}


const ComplaintCard = ({
  complaint,
  onGoToMessages,
}: {
  complaint: any;
  onGoToMessages: (context: MessagesContext) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const IssueIcon = getIssueIcon(complaint.issue_type);
  const isOpen = complaint.status === 'open';
  const isActive = complaint.status === 'in_progress';
  const isResolved = complaint.status === 'resolved' || complaint.status === 'closed';

  const statusLabel = isOpen ? 'Open' : isActive ? 'In Progress' : 'Resolved';
  const statusColor = isOpen
    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    : isActive
    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';

  const StatusIcon = isOpen ? AlertTriangle : isActive ? Clock : CheckCircle2;

  const handleExpand = async () => {
    if (!expanded && !detail) {
      setLoadingDetail(true);
      try {
        const res = await externalTenantComplaintsApi.getComplaintDetails(complaint.id);
        if (res.data) setDetail(res.data);
      } catch {
        toast.error('Could not load complaint details');
      } finally {
        setLoadingDetail(false);
      }
    }
    setExpanded((v) => !v);
  };

  const adminReplies = (detail?.notes ?? []).filter((n: any) => n.added_by_type === 'admin');
  const hasAdminReply = adminReplies.length > 0;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex-shrink-0 size-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
              <IssueIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
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
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${urgencyColor[complaint.urgency ?? 'low']}`}>
              {complaint.urgency}
            </span>
          </div>
        </div>

        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {complaint.description}
        </p>

        <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              #{complaint.ticket_number} &middot;{' '}
              {new Date(complaint.created_at).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </span>
            {hasAdminReply && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                <MessageSquare className="w-2.5 h-2.5" /> Admin replied
              </span>
            )}
          </div>
          <button
            onClick={handleExpand}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Hide' : 'Details'}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/30 space-y-4">
          {loadingDetail ? (
            <div className="flex justify-center py-3"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
          ) : (
            <>
              {/* Admin replies */}
              {adminReplies.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Admin Replies
                  </p>
                  <div className="space-y-2">
                    {adminReplies.map((n: any) => (
                      <div key={n.id} className="bg-white dark:bg-gray-900 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 text-sm">
                        <p className="text-gray-800 dark:text-gray-200">{n.note}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution description */}
              {detail?.resolution_description && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Resolution
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{detail.resolution_description}</p>
                </div>
              )}

              {/* Status history */}
              {(detail?.status_history ?? []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Status History
                  </p>
                  <div className="space-y-1.5">
                    {detail.status_history.map((h: any, i: number) => (
                      <div key={h.id} className="flex items-start gap-2 text-xs">
                        <div className="flex flex-col items-center pt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                          {i < detail.status_history.length - 1 && (
                            <div className="w-px bg-gray-200 dark:bg-gray-700 flex-1 mt-0.5" style={{ minHeight: 10 }} />
                          )}
                        </div>
                        <div className="pb-1">
                          <span className="font-medium capitalize text-gray-800 dark:text-gray-200">
                            {h.new_status.replace('_', ' ')}
                          </span>
                          {h.change_reason && (
                            <span className="text-gray-500 dark:text-gray-400"> — {h.change_reason}</span>
                          )}
                          <div className="text-gray-400">
                            {new Date(h.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => onGoToMessages({
                  subject: `${complaint.issue_type} - ${complaint.ticket_number}`,
                })}
                className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Message agent
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const ExternalTenantComplaints = ({
  onGoToMessages,
}: {
  onGoToMessages?: (context: MessagesContext) => void;
}) => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const fetchComplaints = async () => {
    try {
      const res = await externalTenantApi.getComplaints?.();
      if (res?.success && res.data) {
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data.complaints ?? res.data.data ?? []);

        setComplaints(
          list.map((c: any) => ({
            ...c,
            issue_type: c.issue_type ?? c.category ?? "General",
            urgency: c.urgency ?? c.severity ?? "low",
          })),
        );
      }
    } catch (error) {
      toast.error("Could not load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filtered = complaints.filter((c) => {
    if (filter === 'active') return c.status === 'open' || c.status === 'in_progress';
    if (filter === 'resolved') return c.status === 'resolved' || c.status === 'closed';
    return true;
  });

  const counts = {
    all: complaints.length,
    active: complaints.filter((c) => c.status === 'open' || c.status === 'in_progress').length,
    resolved: complaints.filter((c) => c.status === 'resolved' || c.status === 'closed').length,
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-1 shadow-sm">
          {filterOptions.map((opt) => {
            const Icon = opt.icon;
            const active = filter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  active
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {opt.label}
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0 rounded-full ${
                    active
                      ? 'bg-white/20 dark:bg-black/20 text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {counts[opt.value]}
                </span>
              </button>
            );
          })}
        </div>

        <Button
          onClick={() => setIsSubmitModalOpen(true)}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Complaint
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-60" />
          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
            {filter === 'all' ? 'No complaints yet' : filter === 'active' ? 'No active complaints' : 'No resolved complaints'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filter === 'all'
              ? 'Everything looks good 👍 File a complaint if something needs attention.'
              : filter === 'active'
              ? 'No open or in-progress complaints at the moment.'
              : 'No resolved complaints yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              onGoToMessages={onGoToMessages ?? (() => {})}
            />
          ))}
        </div>
      )}
      <SubmitComplaint
        isOpen={isSubmitModalOpen}
        isExternalTenant={true}
        onClose={() => {
          setIsSubmitModalOpen(false);
          fetchComplaints();
        }}
      />
    </div>
  );
};

export default ExternalTenantComplaints;
