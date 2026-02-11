import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, Plus, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ComplaintCard } from '@/components/Complaints/ComplaintCard';
import { ComplaintEmptyState } from '@/components/Complaints/ComplaintEmptyState';
import { ComplaintStats } from '@/components/Complaints/ComplaintStats';
import { useComplaintNotifications } from '@/hooks/useComplaintNotifications';
import { ComplaintResolutionNotification } from '@/components/Complaints/ComplaintResolutionNotification';
import { complaintsApi, Complaint as ApiComplaint, ComplaintStats as ApiComplaintStats } from '@/services/complaintsApi';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const MyComplaints = () => {
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

  // Use stats from API or calculate from local data
  const totalComplaints = stats.total || complaints.length;
  const openComplaints = stats.open || complaints.filter(c => c.status === 'open').length;
  const inProgressComplaints = stats.in_progress || complaints.filter(c => c.status === 'in_progress').length;
  const closedComplaints = stats.resolved || complaints.filter(c => c.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Verification Alert */}
      {!isVerified && (
        <Alert className="border-orange-300 dark:border-orange-700 bg-orange-100 dark:bg-orange-900/30">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            Please verify your tenancy to submit and manage complaints.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent mb-2 flex items-center">
            <FileText className="w-8 h-8 mr-3 text-emerald-600" />
            My Complaints
          </h1>
          <p className="text-muted-foreground text-base">
            Track the status of all your property maintenance complaints
          </p>
        </div>

        <Button
          onClick={() => navigate('/submit-complaint')}
          disabled={!isVerified}
          className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Complaint
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="bg-gradient-to-r from-emerald-50/50 to-blue-50/50 rounded-xl p-6">
        <ComplaintStats
          totalComplaints={totalComplaints}
          openComplaints={openComplaints}
          inProgressComplaints={inProgressComplaints}
          closedComplaints={closedComplaints}
        />
      </div>

      {/* Complaints List */}
      <div className="bg-card rounded-xl border shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold text-foreground">Your Complaints</h3>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="bg-muted/50 rounded-xl p-8">
              <ComplaintEmptyState />
            </div>
          ) : (
            <div className="space-y-6">
              {complaints.map((complaint) => (
                <div key={complaint.id} className="bg-muted/20 rounded-xl p-1 hover:bg-muted/40 transition-all duration-300">
                  <ComplaintCard complaint={{
                    id: complaint.id.toString(),
                    ticketNumber: complaint.ticket_number || `TC-${complaint.id}`,
                    tenantId: complaint.tenant_id,
                    tenantName: complaint.tenant_name,
                    tenantEmail: complaint.tenant_email,
                    houseNumber: complaint.house_number,
                    issueType: complaint.issue_type,
                    description: complaint.description,
                    status: complaint.status === 'resolved' ? 'closed' : complaint.status as 'open' | 'in_progress' | 'closed',
                    createdAt: complaint.created_at,
                    agentId: complaint.agent_id || '',
                    propertyId: `property-${complaint.id}`,
                    imageUrl: complaint.images?.[0]?.url,
                    closedAt: complaint.resolved_at
                  }} />
                </div>
              ))}
            </div>
          )}
        </div>
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