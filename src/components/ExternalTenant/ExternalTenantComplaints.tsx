import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText, Plus, AlertTriangle, MapPin, MessageSquare,
  Clock, CheckCircle2, ListFilter, Wrench, Droplets, Zap,
  Thermometer, Home, Bug, Shield, Settings, Volume2, Loader2,
  ChevronDown, ChevronUp, Star, Send, RefreshCw,
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

// ── Star rating input ──────────────────────────────────────────────────────────
const StarInput = ({ value, onChange, size = 20 }: { value: number; onChange: (v: number) => void; size?: number }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 focus:outline-none"
        >
          <Star
            width={size}
            height={size}
            className={n <= (hovered || value) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}
          />
        </button>
      ))}
    </div>
  );
};

// ── Inline review form ─────────────────────────────────────────────────────────
const COMPLAINT_ASPECTS = [
  { key: 'response_speed', label: 'Response Speed' },
  { key: 'resolution_quality', label: 'Resolution Quality' },
  { key: 'agent_attitude', label: 'Professionalism' },
];

const ReviewForm = ({
  complaint,
  onSubmitted,
}: {
  complaint: any;
  onSubmitted: () => void;
}) => {
  const [step, setStep] = useState<'complaint' | 'landlord'>('complaint');
  const [complaintScore, setComplaintScore] = useState(0);
  const [complaintText, setComplaintText] = useState('');
  const [aspects, setAspects] = useState<Record<string, number>>({});
  const [landlordScore, setLandlordScore] = useState(0);
  const [landlordText, setLandlordText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (complaintScore === 0) {
      toast.error('Please give a star rating for the complaint handling.');
      return;
    }
    setSubmitting(true);
    try {
      const filledAspects = Object.fromEntries(Object.entries(aspects).filter(([, v]) => v > 0));
      const res = await externalTenantComplaintsApi.rateComplaintResolution(complaint.id, {
        rating_score: complaintScore,
        rating_review: complaintText.trim() || undefined,
        aspects: Object.keys(filledAspects).length > 0 ? filledAspects : undefined,
        landlord_rating_score: landlordScore > 0 ? landlordScore : undefined,
        landlord_rating_review: landlordText.trim() || undefined,
      });
      if (res.data) {
        toast.success('Review submitted. Thank you!');
        onSubmitted();
      } else {
        toast.error(res.message || 'Failed to submit review.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-t border-emerald-200 dark:border-emerald-800 mt-3 pt-3 space-y-4">
      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
        <Star className="w-3.5 h-3.5" /> Leave a Review
      </p>

      {step === 'complaint' && (
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              How was your complaint handled? <span className="text-red-500">*</span>
            </p>
            <StarInput value={complaintScore} onChange={setComplaintScore} />
            {complaintScore > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][complaintScore]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Rate specific areas (optional)</p>
            {COMPLAINT_ASPECTS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
                <StarInput value={aspects[key] ?? 0} onChange={(v) => setAspects((p) => ({ ...p, [key]: v }))} size={16} />
              </div>
            ))}
          </div>

          <Textarea
            placeholder="Tell us about your experience (optional)..."
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            rows={2}
            maxLength={500}
            className="text-sm resize-none"
          />

          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setStep('landlord'); }}
              className="text-xs"
              disabled={complaintScore === 0}
            >
              Next: Rate Landlord/Agent
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitting || complaintScore === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            >
              {submitting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
              Submit
            </Button>
          </div>
        </div>
      )}

      {step === 'landlord' && (
        <div className="space-y-3">
          <button
            onClick={() => setStep('complaint')}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 flex items-center gap-1"
          >
            ← Back to complaint review
          </button>
          <div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              How well did your landlord or agent handle this issue?
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Optional. They will be notified by email and invited to sign up on Homed.
            </p>
            <StarInput value={landlordScore} onChange={setLandlordScore} />
            {landlordScore > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][landlordScore]}
              </p>
            )}
          </div>

          <Textarea
            placeholder="Comment on how your landlord/agent handled the issue (optional)..."
            value={landlordText}
            onChange={(e) => setLandlordText(e.target.value)}
            rows={2}
            maxLength={500}
            className="text-sm resize-none"
          />

          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitting || complaintScore === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            >
              {submitting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
              Submit Review
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Complaint card ─────────────────────────────────────────────────────────────
const ComplaintCard = ({
  complaint,
  onGoToMessages,
  onStatusChanged,
}: {
  complaint: any;
  onGoToMessages: (context: MessagesContext) => void;
  onStatusChanged: (updatedComplaint: any) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const IssueIcon = getIssueIcon(complaint.issue_type);
  const isOpen = complaint.status === 'open';
  const isInProgress = complaint.status === 'in_progress';
  const isResolved = complaint.status === 'resolved' || complaint.status === 'closed';

  const statusLabel = isOpen ? 'Open' : isInProgress ? 'In Progress' : 'Resolved';
  const statusColor = isOpen
    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    : isInProgress
    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';

  const StatusIcon = isOpen ? AlertTriangle : isInProgress ? Clock : CheckCircle2;

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

  const handleStatusChange = async (newStatus: 'in_progress' | 'resolved') => {
    setStatusChanging(true);
    try {
      const res = await externalTenantComplaintsApi.updateComplaintStatus(complaint.id, newStatus);
      if (res.data) {
        toast.success(newStatus === 'resolved' ? 'Complaint marked as resolved!' : 'Complaint marked as in progress.');
        onStatusChanged({ ...complaint, status: newStatus });
        setDetail(null); // reset so detail reloads on next expand
      } else {
        toast.error(res.message || 'Could not update status.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Could not update status.');
    } finally {
      setStatusChanging(false);
    }
  };

  const hasRated = complaint.rating_score != null;
  const canReview = isResolved && !hasRated;
  const adminReplies = (detail?.notes ?? []).filter((n: any) => n.added_by_type === 'admin');

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
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{complaint.house_number}</span>
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

        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{complaint.description}</p>

        <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-400">
              #{complaint.ticket_number} &middot;{' '}
              {new Date(complaint.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            {adminReplies.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                <MessageSquare className="w-2.5 h-2.5" /> Admin replied
              </span>
            )}
            {hasRated && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                <Star className="w-2.5 h-2.5 fill-amber-400" /> Reviewed
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
                          {h.change_reason && <span className="text-gray-500 dark:text-gray-400"> — {h.change_reason}</span>}
                          <div className="text-gray-400">
                            {new Date(h.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tenant status change actions */}
              {!isResolved && (
                <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex-1">Update status:</p>
                  {isOpen && (
                    <button
                      onClick={() => handleStatusChange('in_progress')}
                      disabled={statusChanging}
                      className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50"
                    >
                      {statusChanging ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      Mark In Progress
                    </button>
                  )}
                  <button
                    onClick={() => handleStatusChange('resolved')}
                    disabled={statusChanging}
                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50"
                  >
                    {statusChanging ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                    Mark Resolved
                  </button>
                </div>
              )}

              {/* Review prompt / form */}
              {canReview && !showReview && (
                <button
                  onClick={() => setShowReview(true)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-900/30 transition-colors"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  Leave a review for this complaint
                </button>
              )}

              {canReview && showReview && (
                <ReviewForm
                  complaint={complaint}
                  onSubmitted={() => {
                    setShowReview(false);
                    onStatusChanged({ ...complaint, rating_score: 5 }); // mark as rated locally
                  }}
                />
              )}

              {/* Message agent */}
              <button
                onClick={() => onGoToMessages({ subject: `${complaint.issue_type} - ${complaint.ticket_number}` })}
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

// ── Main component ─────────────────────────────────────────────────────────────
const ExternalTenantComplaints = ({
  onGoToMessages,
}: {
  onGoToMessages?: (context: MessagesContext) => void;
}) => {
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
            issue_type: c.issue_type ?? c.category ?? 'General',
            urgency: c.urgency ?? c.severity ?? 'low',
          })),
        );
      }
    } catch {
      toast.error('Could not load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleStatusChanged = (updated: any) => {
    setComplaints((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
  };

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
              onStatusChanged={handleStatusChanged}
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
