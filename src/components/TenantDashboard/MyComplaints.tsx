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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useComplaintNotifications } from '@/hooks/useComplaintNotifications';
import { ComplaintResolutionNotification } from '@/components/Complaints/ComplaintResolutionNotification';
import { complaintsApi, Complaint as ApiComplaint, ComplaintStats as ApiComplaintStats } from '@/services/complaintsApi';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

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

interface ComplaintRowProps {
  complaint: ApiComplaint;
  onGoToMessages: (context: MessagesContext) => void;
}

const ComplaintRow = ({ complaint, onGoToMessages }: ComplaintRowProps) => {
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
    const agentNote = complaint.notes?.find(n => n.added_by !== complaint.tenant_name);
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

const MyComplaints = ({ onGoToMessages }: { onGoToMessages?: (context: MessagesContext) => void }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<ApiComplaint[]>([]);
  const [stats, setStats] = useState<ApiComplaintStats>({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>('all');
  const { notification, dismissNotification, submitReview } = useComplaintNotifications();
  const isVerified = user?.tenantVerified || false;

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintsApi.getMyComplaints();

      // Handle different response structures
      let complaintsData: ApiComplaint[] = [];

      if (Array.isArray(response.complaints)) {
        complaintsData = response.complaints;
      } else if (response.data && Array.isArray(response.data.complaints)) {
        complaintsData = response.data.complaints;
      } else if (Array.isArray(response)) {
        complaintsData = response;
      }

      setComplaints(complaintsData);

      if (response.stats || (response.data && response.data.stats)) {
        const fetchedStats = response.stats || response.data.stats;
        setStats(fetchedStats);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filtered = complaints.filter(c => {
    if (filter === 'active') return c.status === 'open' || c.status === 'in_progress';
    if (filter === 'resolved') return c.status === 'resolved' || c.status === 'closed';
    return true;
  });

  const counts = {
    all: stats.total || complaints.length,
    active: (stats.open + stats.in_progress) || complaints.filter(c => c.status === 'open' || c.status === 'in_progress').length,
    resolved: (stats.resolved + (stats.closed ?? 0)) || complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length,
  };

  return (
    <div className="space-y-6">
      {/* Verification Alert */}
      {!isVerified && (
        <Alert className="border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            Please verify your tenancy to submit and manage complaints.
          </AlertDescription>
        </Alert>
      )}

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
          disabled={!isVerified}
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

      {/* Complaint Resolution Notification */}
      {notification && (
        <ComplaintResolutionNotification
          complaint={notification.complaint}
          agentName={notification.agentName}
          agentImage={notification.agentImage}
          onClose={dismissNotification}
          onSubmitReview={submitReview}
        />
      )}
    </div>
  );
};

export default MyComplaints;
