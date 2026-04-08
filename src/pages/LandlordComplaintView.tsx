import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2, Clock, AlertTriangle, MapPin, Calendar,
  User, Wrench, Loader2, XCircle, ArrowRight, Home, Paperclip, Film, Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { landlordComplaintApi } from '@/services/externalTenantComplaintsApi';

type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

const statusConfig: Record<ComplaintStatus, { label: string; color: string; bg: string; Icon: any }> = {
  open: { label: 'Open', color: 'text-red-700', bg: 'bg-red-50 border-red-200', Icon: AlertTriangle },
  in_progress: { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', Icon: Clock },
  resolved: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', Icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', Icon: CheckCircle2 },
};

const urgencyConfig: Record<string, { label: string; color: string }> = {
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  low: { label: 'Low', color: 'bg-green-100 text-green-700' },
};

export default function LandlordComplaintView() {
  const { token } = useParams<{ token: string }>();
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [actionDone, setActionDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid link. No access token found.');
      setLoading(false);
      return;
    }
    landlordComplaintApi
      .getComplaint(token)
      .then((res) => {
        if (res.data) setComplaint(res.data);
        else setError('Request not found.');
      })
      .catch((err) => setError(err.message || 'Could not load request details.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleStatusUpdate = async (newStatus: 'in_progress' | 'resolved') => {
    if (!token) return;
    setUpdating(true);
    try {
      const res = await landlordComplaintApi.updateStatus(token, newStatus);
      if (res.data) {
        setComplaint((prev: any) => ({ ...prev, ...res.data, can_update: false }));
        setActionDone(true);
        const label = newStatus === 'resolved' ? 'Completed' : 'In Progress';
        toast.success(`Request marked as "${label}" successfully.`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not update status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-gray-500 text-sm">Loading request details…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Link not found</h2>
          <p className="text-gray-500 text-sm">{error}</p>
          <p className="text-gray-400 text-xs">
            This link may be invalid or the request may have been removed. Please check your email for the correct link.
          </p>
        </div>
      </div>
    );
  }

  if (!complaint) return null;

  const status: ComplaintStatus = complaint.status as ComplaintStatus;
  const { label: statusLabel, color: statusColor, bg: statusBg, Icon: StatusIcon } = statusConfig[status] ?? statusConfig.open;
  const urgency = urgencyConfig[complaint.severity ?? complaint.urgency ?? 'medium'] ?? urgencyConfig.medium;
  const canUpdate = complaint.can_update && !actionDone && status !== 'resolved' && status !== 'closed';
  const createdDate = complaint.created_at
    ? new Date(complaint.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Unknown date';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Homed</span>
          </div>
          <Link
            to="/register"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Create an account <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Request</h1>
          <p className="text-gray-500 text-sm mt-1">
            Ticket <span className="font-medium text-gray-700">#{complaint.ticket_number}</span>
          </p>
        </div>

        {/* Status update success banner */}
        {actionDone && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-emerald-800 text-sm">Status updated successfully</p>
              <p className="text-emerald-700 text-xs mt-0.5">
                The tenant has been notified of the status change.
              </p>
            </div>
          </div>
        )}

        {/* Status card */}
        <div className={`border rounded-xl p-4 flex items-center gap-3 ${statusBg}`}>
          <StatusIcon className={`w-5 h-5 ${statusColor} flex-shrink-0`} />
          <div>
            <p className={`font-semibold text-sm ${statusColor}`}>Current Status: {statusLabel}</p>
            {status === 'resolved' || status === 'closed' ? (
              <p className="text-xs text-gray-500 mt-0.5">This request has been marked as completed.</p>
            ) : (
              <p className="text-xs text-gray-500 mt-0.5">Submitted on {createdDate}</p>
            )}
          </div>
        </div>

        {/* Details card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-gray-400" />
              Request Details
            </h2>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Issue Type</p>
                <p className="text-gray-900 font-medium mt-0.5">{complaint.category || complaint.subject}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${urgency.color}`}>
                {urgency.label}
              </span>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Description</p>
              <p className="text-gray-700 text-sm mt-0.5 leading-relaxed">{complaint.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {complaint.house_number && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Property</p>
                    <p className="text-sm text-gray-800 font-medium">{complaint.house_number}</p>
                  </div>
                </div>
              )}
              {complaint.tenant_name && (
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Tenant</p>
                    <p className="text-sm text-gray-800 font-medium">{complaint.tenant_name}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Submitted</p>
                  <p className="text-sm text-gray-800 font-medium">{createdDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attachments */}
        {(complaint.images ?? []).length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                <Paperclip className="w-4 h-4 text-gray-400" />
                Attachments ({complaint.images.length})
              </h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              {complaint.images.map((img: any, i: number) => {
                const isVideo = (img.mime_type ?? '').startsWith('video/');
                return (
                  <div key={img.id ?? i} className="flex items-center gap-3">
                    {isVideo ? (
                      <div className="w-14 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Film className="w-5 h-5 text-purple-500" />
                      </div>
                    ) : (
                      <img
                        src={img.url}
                        alt={img.filename}
                        className="w-14 h-10 object-cover rounded-lg flex-shrink-0 border border-gray-100"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{img.filename}</p>
                      <p className="text-xs text-gray-400">{isVideo ? 'Video' : 'Image'}</p>
                    </div>
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex-shrink-0"
                    >
                      {isVideo ? 'Watch' : 'View'}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Status history */}
        {(complaint.status_history ?? []).length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-sm">Status History</h2>
            </div>
            <div className="px-5 py-3 space-y-2">
              {complaint.status_history.map((h: any, i: number) => (
                <div key={h.id ?? i} className="flex items-start gap-3 text-sm">
                  <div className="flex flex-col items-center pt-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    {i < complaint.status_history.length - 1 && (
                      <div className="w-px bg-gray-200 flex-1 mt-1" style={{ minHeight: 12 }} />
                    )}
                  </div>
                  <div className="pb-2">
                    <span className="font-medium capitalize text-gray-800">
                      {h.new_status.replace('_', ' ')}
                    </span>
                    {h.change_reason && (
                      <span className="text-gray-400 text-xs"> — {h.change_reason}</span>
                    )}
                    <div className="text-xs text-gray-400 mt-0.5">
                      {h.created_at
                        ? new Date(h.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {canUpdate && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
            <h2 className="font-semibold text-gray-900 text-sm">Update Status</h2>
            <p className="text-gray-500 text-sm">
              Let the tenant know you have taken action on this request.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {status === 'open' && (
                <button
                  onClick={() => handleStatusUpdate('in_progress')}
                  disabled={updating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-blue-200 bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  Mark as In Progress
                </button>
              )}
              <button
                onClick={() => handleStatusUpdate('resolved')}
                disabled={updating}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold text-sm hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Mark as Completed
              </button>
            </div>
          </div>
        )}

        {/* Sign-up CTA */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <Home className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="font-bold text-gray-900">Manage your properties with Homed</h3>
          <p className="text-gray-600 text-sm">
            Join thousands of landlords and agents who use Homed to manage maintenance requests,
            communicate with tenants, and organise their portfolio — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors"
            >
              Create a Free Account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
