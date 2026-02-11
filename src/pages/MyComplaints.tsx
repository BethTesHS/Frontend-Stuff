import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Plus } from 'lucide-react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Complaint } from '@/types';
import { ComplaintCard } from '@/components/Complaints/ComplaintCard';
import { ComplaintEmptyState } from '@/components/Complaints/ComplaintEmptyState';
import { ComplaintStats } from '@/components/Complaints/ComplaintStats';
import { useComplaintNotifications } from '@/hooks/useComplaintNotifications';
import { ComplaintResolutionNotification } from '@/components/Complaints/ComplaintResolutionNotification';
import { complaintsApi, Complaint as ApiComplaint, ComplaintStats as ApiComplaintStats } from '@/services/complaintsApi';
import { toast } from 'sonner';

const MyComplaints = () => {
  const { loading: authLoading, hasAccess } = useAuthGuard(['tenant'], true);
  const navigate = useNavigate();
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
    if (hasAccess) {
      fetchComplaints();
    }
  }, [hasAccess]);

  console.log('MyComplaints - Current complaints state:', complaints);
  console.log('MyComplaints - Auth loading:', authLoading);
  console.log('MyComplaints - Has access:', hasAccess);

  if (authLoading) {
    console.log('MyComplaints - Showing loading spinner');
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (!hasAccess) {
    console.log('MyComplaints - Access denied');
    return null;
  }

  // Use stats from API or calculate from local data
  const totalComplaints = stats.total || complaints.length;
  const openComplaints = stats.open || complaints.filter(c => c.status === 'open').length;
  const inProgressComplaints = stats.in_progress || complaints.filter(c => c.status === 'in_progress').length;
  const closedComplaints = stats.resolved || complaints.filter(c => c.status === 'resolved').length;

  console.log('MyComplaints - Statistics:', {
    totalComplaints,
    openComplaints,
    inProgressComplaints,
    closedComplaints
  });

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 relative overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-green-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl p-6 sm:p-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')}
                className="mb-4 flex items-center text-gray-600 hover:text-gray-900 bg-white/10 backdrop-blur-sm hover:bg-white/20 border-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent mb-2 flex items-center">
                    <FileText className="w-8 h-8 mr-3 text-emerald-600" />
                    My Complaints
                  </h1>
                  <p className="text-gray-700 text-base sm:text-lg opacity-90">
                    Track the status of all your property maintenance complaints
                  </p>
                </div>
                
                <Button 
                  onClick={() => navigate('/submit-complaint')} 
                  className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Complaint
                </Button>
              </div>

              {/* Summary Cards */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <ComplaintStats
                  totalComplaints={totalComplaints}
                  openComplaints={openComplaints}
                  inProgressComplaints={inProgressComplaints}
                  closedComplaints={closedComplaints}
                />
              </div>
            </div>
          </div>

          {/* Complaints List */}
          <div className="bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/20">
              <h3 className="text-xl font-bold text-gray-800">Your Complaints</h3>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
              ) : complaints.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
                  <ComplaintEmptyState />
                </div>
              ) : (
                <div className="space-y-6">
                  {complaints.map((complaint) => (
                    <div key={complaint.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-1 hover:bg-white/20 transition-all duration-300">
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
    </Layout>
  );
};

export default MyComplaints;
