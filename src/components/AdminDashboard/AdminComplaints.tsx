import { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle, CheckCircle2, Clock, Search, Filter,
  ChevronDown, ChevronUp, Send, Loader2, RefreshCw,
  Wrench, Droplets, Zap, Thermometer, Home, Bug,
  Shield, Settings, Volume2, FileText, MessageSquare,
  Mail, Phone, User, BellRing,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  adminComplaintsApi,
  type ExternalTenantComplaint,
  type AdminComplaintStats,
  type ComplaintNote,
  type ComplaintStatusHistory,
} from '@/services/externalTenantComplaintsApi';

// ── helpers ──────────────────────────────────────────────────────────────────

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
const getIssueIcon = (t: string) => issueIcons[t] || Wrench;

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};
const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  closed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};
const SEVERITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

// ── notes thread ──────────────────────────────────────────────────────────────

function NotesThread({
  notes,
  onAddNote,
  addingNote,
}: {
  notes: ComplaintNote[];
  onAddNote: (text: string) => Promise<void>;
  addingNote: boolean;
}) {
  const [text, setText] = useState('');

  const submit = async () => {
    if (!text.trim()) return;
    await onAddNote(text.trim());
    setText('');
  };

  return (
    <div className="space-y-3">
      {notes.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No messages yet.</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {notes.map((n) => {
            const isAdmin = n.added_by_type === 'admin';
            return (
              <div key={n.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${isAdmin ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                  <p className="leading-relaxed">{n.note}</p>
                  <p className={`text-[10px] mt-1 ${isAdmin ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground'}`}>
                    {isAdmin ? 'Admin' : n.added_by} · {fmtDate(n.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="flex gap-2 pt-1">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Reply to tenant..."
          className="text-sm bg-background"
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && submit()}
        />
        <Button size="sm" onClick={submit} disabled={addingNote || !text.trim()}>
          {addingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}

// ── status history timeline ───────────────────────────────────────────────────

function StatusTimeline({ history }: { history: ComplaintStatusHistory[] }) {
  if (!history.length) return null;
  return (
    <div className="space-y-2">
      {history.map((h, i) => (
        <div key={h.id} className="flex items-start gap-2 text-xs">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
            {i < history.length - 1 && <div className="w-px flex-1 bg-border mt-0.5" style={{ minHeight: 12 }} />}
          </div>
          <div className="pb-1">
            <span className="font-medium capitalize">{h.new_status.replace('_', ' ')}</span>
            {h.change_reason && <span className="text-muted-foreground"> — {h.change_reason}</span>}
            <div className="text-muted-foreground">{fmtDate(h.created_at)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── landlord card ─────────────────────────────────────────────────────────────

function LandlordCard({
  detail,
  complaintId,
  onReminderSent,
}: {
  detail: any;
  complaintId: number;
  onReminderSent: (sentAt: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);

  const landlordEmail = detail?.landlord_email;
  const landlordName = detail?.landlord_name;
  const landlordPhone = detail?.landlord_phone;
  const lastNotified = detail?.notification_sent_at;
  const isClosed = detail?.status === 'resolved' || detail?.status === 'closed';

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await adminComplaintsApi.remindLandlord(complaintId, customMessage || undefined);
      if (res.data) {
        toast.success(`Reminder sent to ${res.data.landlord_email}`);
        onReminderSent(res.data.notification_sent_at);
        setShowForm(false);
        setCustomMessage('');
      }
    } catch {
      toast.error('Failed to send reminder');
    } finally {
      setSending(false);
    }
  };

  if (!landlordEmail) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-3 text-xs text-muted-foreground">
        No landlord email on record for this complaint.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Landlord info */}
      <div className="p-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2">
          <User className="w-3.5 h-3.5" /> Landlord
        </div>
        <div className="flex items-center gap-2 text-xs text-foreground">
          <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          <span>{landlordName || '—'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          <a href={`mailto:${landlordEmail}`} className="text-primary hover:underline truncate">{landlordEmail}</a>
        </div>
        {landlordPhone && (
          <div className="flex items-center gap-2 text-xs text-foreground">
            <Phone className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <a href={`tel:${landlordPhone}`} className="hover:underline">{landlordPhone}</a>
          </div>
        )}
        {lastNotified ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <BellRing className="w-3 h-3 flex-shrink-0" />
            Last notified: {fmtDate(lastNotified)}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 pt-1">
            <BellRing className="w-3 h-3 flex-shrink-0" />
            No reminder sent yet
          </div>
        )}
      </div>

      {/* Remind action */}
      {!isClosed && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-3">
          {!showForm ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/20"
              onClick={() => setShowForm(true)}
            >
              <BellRing className="w-3.5 h-3.5" />
              Send Reminder to Landlord
            </Button>
          ) : (
            <div className="space-y-2">
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Optional: add a personal message to include in the reminder email..."
                rows={3}
                className="w-full text-xs px-3 py-2 rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 text-xs" onClick={handleSend} disabled={sending}>
                  {sending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
                  Send Reminder
                </Button>
                <Button size="sm" variant="outline" className="text-xs" onClick={() => { setShowForm(false); setCustomMessage(''); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ── complaint row ─────────────────────────────────────────────────────────────

function ComplaintRow({
  complaint: c,
  onRefresh,
}: {
  complaint: ExternalTenantComplaint;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [newStatus, setNewStatus] = useState(c.status);
  const [resolutionText, setResolutionText] = useState('');

  const IssueIcon = getIssueIcon((c as any).subject ?? (c as any).issue_type ?? '');

  const loadDetail = useCallback(async () => {
    if (detail) return;
    setLoadingDetail(true);
    try {
      const res = await adminComplaintsApi.getItem(c.id);
      if (res.data) setDetail(res.data);
    } catch {
      toast.error('Failed to load complaint detail');
    } finally {
      setLoadingDetail(false);
    }
  }, [c.id, detail]);

  const handleExpand = () => {
    if (!expanded) loadDetail();
    setExpanded((v) => !v);
  };

  const handleStatusUpdate = async () => {
    setUpdatingStatus(true);
    try {
      await adminComplaintsApi.updateStatus(c.id, {
        status: newStatus,
        resolution_description: resolutionText || undefined,
      });
      toast.success('Status updated');
      setDetail(null); // force re-fetch on next expand
      onRefresh();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (text: string) => {
    setAddingNote(true);
    try {
      const res = await adminComplaintsApi.addNote(c.id, text);
      if (res.data) {
        setDetail((prev: any) => prev ? { ...prev, notes: [...(prev.notes ?? []), res.data] } : prev);
      }
      toast.success('Reply sent');
    } catch {
      toast.error('Failed to send reply');
    } finally {
      setAddingNote(false);
    }
  };

  const subject = (c as any).subject ?? (c as any).issue_type ?? 'Unknown';
  const severity = (c as any).severity ?? (c as any).urgency ?? 'low';

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 overflow-hidden">
      {/* Summary row */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        onClick={handleExpand}
      >
        <div className="flex-shrink-0 size-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <IssueIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-foreground truncate">{subject}</span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize ${STATUS_COLORS[c.status] ?? ''}`}>
              {STATUS_LABELS[c.status] ?? c.status}
            </span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize ${SEVERITY_COLORS[severity] ?? ''}`}>
              {severity}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
            <span>{(c as any).tenant_name ?? '—'}</span>
            <span>·</span>
            <span>#{(c as any).ticket_number ?? c.id}</span>
            <span>·</span>
            <span>{fmtDate(c.created_at)}</span>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 space-y-5">
          {loadingDetail ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              {/* Description */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                <p className="text-sm text-foreground">{(c as any).description ?? '—'}</p>
              </div>

              {/* Update status */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-3">
                <p className="text-xs font-semibold text-foreground">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {['open', 'in_progress', 'resolved', 'closed'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setNewStatus(s)}
                      className={`text-xs px-3 py-1.5 rounded-lg border capitalize font-medium transition-colors ${
                        newStatus === s
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-muted'
                      }`}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                {(newStatus === 'resolved' || newStatus === 'closed') && (
                  <Input
                    placeholder="Resolution description (optional)"
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    className="text-sm bg-background"
                  />
                )}
                <Button
                  size="sm"
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus || newStatus === c.status}
                >
                  {updatingStatus && <Loader2 className="w-3 h-3 animate-spin mr-1.5" />}
                  Save Status
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Notes / replies */}
                <div className="md:col-span-1">
                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> Messages
                  </p>
                  <NotesThread
                    notes={detail?.notes ?? []}
                    onAddNote={handleAddNote}
                    addingNote={addingNote}
                  />
                </div>

                {/* Status history */}
                <div className="md:col-span-1">
                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Status History
                  </p>
                  <StatusTimeline history={detail?.status_history ?? []} />
                </div>

                {/* Landlord */}
                <div className="md:col-span-1">
                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                    <BellRing className="w-3.5 h-3.5" /> Landlord
                  </p>
                  <LandlordCard
                    detail={detail}
                    complaintId={c.id}
                    onReminderSent={(sentAt) =>
                      setDetail((prev: any) => prev ? { ...prev, notification_sent_at: sentAt, landlord_notification_sent: true } : prev)
                    }
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function AdminComplaints() {
  const [complaints, setComplaints] = useState<ExternalTenantComplaint[]>([]);
  const [stats, setStats] = useState<AdminComplaintStats>({ total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  const fetchComplaints = useCallback(async (resetPage = true) => {
    setLoading(true);
    const p = resetPage ? 1 : page;
    if (resetPage) setPage(1);
    try {
      const res = await adminComplaintsApi.list({
        page: p,
        limit: 20,
        status: statusFilter,
        severity: severityFilter,
        search: search || undefined,
      });
      if (res.data) {
        setComplaints(res.data.complaints ?? []);
        setStats(res.data.stats ?? { total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 });
      }
      const pageinfo = (res as any).pageinfo ?? {};
      setHasNext((pageinfo.current_page ?? 1) < (pageinfo.total_pages ?? 1));
    } catch {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, severityFilter, search, page]);

  useEffect(() => {
    const t = setTimeout(() => fetchComplaints(true), 300);
    return () => clearTimeout(t);
  }, [statusFilter, severityFilter, search]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Total" value={stats.total} color="text-foreground" />
        <StatCard label="Open" value={stats.open} color="text-red-600 dark:text-red-400" />
        <StatCard label="In Progress" value={stats.in_progress} color="text-blue-600 dark:text-blue-400" />
        <StatCard label="Resolved" value={stats.resolved} color="text-emerald-600 dark:text-emerald-400" />
        <StatCard label="Closed" value={stats.closed} color="text-gray-500 dark:text-gray-400" />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by tenant, subject, ticket..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-gray-50 dark:bg-gray-800"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
            >
              <option value="all">All Severity</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <Button variant="outline" size="sm" onClick={() => fetchComplaints(true)} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* List */}
      {loading && complaints.length === 0 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-50" />
          <p className="font-semibold text-foreground">No complaints found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting the filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <ComplaintRow key={c.id} complaint={c} onRefresh={() => fetchComplaints(false)} />
          ))}
          {hasNext && (
            <div className="text-center pt-2">
              <Button
                variant="outline"
                onClick={() => { setPage((p) => p + 1); fetchComplaints(false); }}
                disabled={loading}
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
