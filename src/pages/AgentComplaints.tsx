
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import SupportBot from '@/components/Support/SupportBot';
import { complaintsApi, Complaint as ApiComplaint, ComplaintStats } from '@/services/complaintsApi';
import { toast } from 'sonner';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search,
  User,
  MapPin,
  Calendar,
  MessageSquare,
  Phone,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Types for backend integration
interface Complaint {
  id: string;
  tenantName: string;
  tenantPhone: string;
  property: string;
  address: string;
  issue: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
  submittedDate: string;
  category: string;
  images: string[];
}

// Mock data - replace with actual API call
const fetchComplaints = async (): Promise<Complaint[]> => {
  // This will be replaced with actual API call
  return [
    {
      id: '1',
      tenantName: 'Alice Johnson',
      tenantPhone: '+44 7700 900456',
      property: 'Apartment 3B - Riverside Heights',
      address: '123 Oak Street, Manchester M1 2AB',
      issue: 'Kitchen sink leak',
      description: 'The kitchen sink has been leaking for the past 3 days. Water is dripping onto the floor and causing damage to the cabinet below.',
      priority: 'High',
      status: 'Open',
      submittedDate: '2024-01-15',
      category: 'Plumbing',
      images: ['sink1.jpg', 'sink2.jpg']
    },
    {
      id: '2',
      tenantName: 'Bob Smith',
      tenantPhone: '+44 7700 900457',
      property: 'House 12 - Elm Gardens',
      address: '456 Elm Street, Birmingham B2 3CD',
      issue: 'Heating system not working',
      description: 'The central heating system stopped working yesterday. The house is very cold and the boiler is making strange noises.',
      priority: 'High',
      status: 'In Progress',
      submittedDate: '2024-01-14',
      category: 'Heating',
      images: ['boiler1.jpg']
    },
    {
      id: '3',
      tenantName: 'Carol Wilson',
      tenantPhone: '+44 7700 900458',
      property: 'Flat 5A - Park View',
      address: '789 Park Lane, London SW1 4EF',
      issue: 'Broken window latch',
      description: 'The bedroom window latch is broken and the window won\'t stay closed properly. This is a security concern.',
      priority: 'Medium',
      status: 'Resolved',
      submittedDate: '2024-01-10',
      category: 'Maintenance',
      images: []
    }
  ];
};

const AgentComplaints = () => {
  const { loading, hasAccess } = useAuthGuard(['agent']);
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<ApiComplaint[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<ApiComplaint | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [stats, setStats] = useState<ComplaintStats>({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
    urgent: 0,
    unassigned: 0
  });

  const loadComplaints = async () => {
    try {
      setComplaintsLoading(true);
      const response = await complaintsApi.getAgentComplaints({
        assigned_to_me: true // Get only complaints assigned to current agent
      });
      
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
      if (complaintsData.length > 0) {
        setSelectedComplaint(complaintsData[0]);
      }
      
      if (response.stats) {
        setStats(response.stats);
      } else if (response.data && response.data.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error loading complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setComplaintsLoading(false);
    }
  };

  useEffect(() => {
    if (hasAccess) {
      loadComplaints();
    }
  }, [hasAccess]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (!hasAccess) {
    return null;
  }

  const filteredComplaints = complaints.filter(complaint => {
    // Handle both camelCase (API response) and snake_case (type interface) property names
    const tenantName = (complaint as any).tenantName || complaint.tenant_name || '';
    const issueType = (complaint as any).issueType || complaint.issue_type || '';
    const description = complaint.description || '';
    
    const matchesSearch = tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issueType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMap: Record<string, string> = {
      'All': 'all',
      'Open': 'open',
      'In Progress': 'in_progress', 
      'Resolved': 'resolved'
    };
    const matchesStatus = statusFilter === 'All' || complaint.status === statusMap[statusFilter];
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': 
      case 'Open': return 'bg-red-100 text-red-800';
      case 'in_progress':
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
      case 'closed':
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
      case 'high':
      case 'High': return 'bg-red-100 text-red-800';
      case 'medium':
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'low':
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateStatus = async (complaintId: number, newStatus: string) => {
    try {
      // Map status to Flask API format
      const apiStatus = newStatus.toLowerCase().replace(' ', '_');
      
      await complaintsApi.updateComplaintStatus(complaintId, apiStatus);
      
      // Update local state optimistically
      setComplaints(prev => 
        prev.map(complaint => 
          complaint.id === complaintId 
            ? { ...complaint, status: apiStatus as ApiComplaint['status'] }
            : complaint
        )
      );
      
      if (selectedComplaint?.id === complaintId) {
        setSelectedComplaint(prev => 
          prev ? { ...prev, status: apiStatus as ApiComplaint['status'] } : null
        );
      }
      
      toast.success('Complaint status updated successfully');
    } catch (error) {
      console.error('Error updating complaint status:', error);
      toast.error('Failed to update complaint status');
    }
  };

  if (complaintsLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
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
                onClick={() => navigate('/agent-dashboard')}
                className="mb-4 flex items-center text-gray-600 hover:text-gray-900 bg-white/10 backdrop-blur-sm hover:bg-white/20 border-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent mb-2 flex items-center">
                    <AlertTriangle className="w-8 h-8 mr-3 text-emerald-600" />
                    Tenant Complaints
                  </h1>
                  <p className="text-gray-700 text-base sm:text-lg opacity-90">
                    Manage and respond to tenant complaints efficiently
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl overflow-hidden">
            <div className="flex flex-col lg:flex-row h-[calc(100vh-300px)]">
              {/* Complaints List */}
              <div className="lg:w-1/3 border-b lg:border-b-0 lg:border-r border-white/20">
                <div className="p-4 sm:p-6 border-b border-white/20">
                  <h2 className="text-lg font-semibold mb-4 text-gray-800">Complaints</h2>
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search complaints..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/20 backdrop-blur-sm border-white/30 text-gray-800 placeholder-gray-500"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['All', 'Open', 'In Progress', 'Resolved'].map((status) => (
                        <Button
                          key={status}
                          variant={statusFilter === status ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setStatusFilter(status)}
                          className={`text-xs ${
                            statusFilter === status 
                              ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white' 
                              : 'bg-white/10 backdrop-blur-sm hover:bg-white/20 text-gray-700'
                          }`}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <ScrollArea className="h-[400px] lg:h-[calc(100vh-450px)]">
                  <div className="divide-y divide-white/10">
                    {filteredComplaints.map((complaint) => (
                      <div
                        key={complaint.id}
                        className={`p-4 cursor-pointer transition-colors ${
                          selectedComplaint?.id === complaint.id 
                            ? 'bg-white/20 backdrop-blur-sm border-l-4 border-l-emerald-500' 
                            : 'hover:bg-white/10 backdrop-blur-sm'
                        }`}
                        onClick={() => setSelectedComplaint(complaint)}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-gray-900 text-sm">{(complaint as any).issueType || complaint.issue_type}</h3>
                            <Badge className={`text-xs ${getStatusColor(complaint.status)} backdrop-blur-sm`}>
                              {complaint.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{(complaint as any).tenantName || complaint.tenant_name}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700 truncate">House #{(complaint as any).houseNumber || complaint.house_number}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Badge className={`text-xs ${getPriorityColor(complaint.urgency)} backdrop-blur-sm`}>
                              {complaint.urgency.toUpperCase()} Priority
                            </Badge>
                            <span className="text-xs text-gray-500">{new Date((complaint as any).createdAt || complaint.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Complaint Detail */}
              <div className="lg:w-2/3 flex-1">
                {selectedComplaint ? (
                  <div className="h-full flex flex-col">
                    <div className="p-4 sm:p-6 border-b border-white/20">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <AlertTriangle className="w-6 h-6 mr-2 text-orange-600" />
                            {(selectedComplaint as any).issueType || selectedComplaint.issue_type}
                          </h2>
                          <p className="text-sm text-gray-600 mt-1">
                            Complaint ID: #{selectedComplaint.id}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getPriorityColor(selectedComplaint.urgency)} backdrop-blur-sm`}>
                            {selectedComplaint.urgency.toUpperCase()} Priority
                          </Badge>
                          <Badge className={`${getStatusColor(selectedComplaint.status)} backdrop-blur-sm`}>
                            {selectedComplaint.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <ScrollArea className="flex-1 p-4 sm:p-6">
                      <div className="space-y-6">
                        {/* Tenant & Property Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <h4 className="font-semibold text-gray-900 text-sm flex items-center mb-3">
                              <User className="w-4 h-4 mr-2 text-blue-600" />
                              Tenant Details
                            </h4>
                            <div className="text-sm space-y-2">
                              <p><span className="font-medium text-gray-700">Name:</span> <span className="text-gray-800">{(selectedComplaint as any).tenantName || selectedComplaint.tenant_name}</span></p>
                              <div className="flex items-center space-x-2">
                                <Phone className="w-3 h-3 text-gray-500" />
                                <span className="text-gray-800">{(selectedComplaint as any).tenantEmail || selectedComplaint.tenant_email}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <h4 className="font-semibold text-gray-900 text-sm flex items-center mb-3">
                              <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
                              Property Details
                            </h4>
                            <div className="text-sm space-y-2">
                              <p><span className="font-medium text-gray-700">House:</span> <span className="text-gray-800">#{(selectedComplaint as any).houseNumber || selectedComplaint.house_number}</span></p>
                              <p><span className="font-medium text-gray-700">Issue Type:</span> <span className="text-gray-800">{(selectedComplaint as any).issueType || selectedComplaint.issue_type}</span></p>
                              <p><span className="font-medium text-gray-700">Urgency:</span> <span className="text-gray-800">{selectedComplaint.urgency}</span></p>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                          <h4 className="font-semibold text-gray-900 text-sm flex items-center mb-3">
                            <MessageSquare className="w-4 h-4 mr-2 text-gray-600" />
                            Description
                          </h4>
                          <p className="text-gray-800 text-sm leading-relaxed">
                            {selectedComplaint.description}
                          </p>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                          <h4 className="font-semibold text-gray-900 text-sm flex items-center mb-3">
                            <Calendar className="w-4 h-4 mr-2 text-gray-600" />
                            Timeline
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">
                                Complaint submitted on {new Date((selectedComplaint as any).createdAt || selectedComplaint.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {selectedComplaint.status === 'in_progress' && (
                              <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">
                                  Maintenance scheduled for resolution
                                </span>
                              </div>
                            )}
                            {selectedComplaint.status === 'resolved' && (
                              <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">
                                  Issue resolved and verified
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                          <h4 className="font-semibold text-gray-900 text-sm mb-3">Quick Actions</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedComplaint.status === 'open' && (
                              <Button 
                                onClick={() => handleUpdateStatus(selectedComplaint.id, 'in_progress')}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1 h-8"
                              >
                                <Clock className="w-3 h-3 mr-1" />
                                Mark In Progress
                              </Button>
                            )}
                            {selectedComplaint.status === 'in_progress' && (
                              <Button 
                                onClick={() => handleUpdateStatus(selectedComplaint.id, 'resolved')}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 h-8"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Mark as Resolved
                              </Button>
                            )}
                            <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-gray-800 border-white/30 text-xs px-3 py-1 h-8">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              Contact Tenant
                            </Button>
                            <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-gray-800 border-white/30 text-xs px-3 py-1 h-8">
                              <Calendar className="w-3 h-3 mr-1" />
                              Schedule Maintenance
                            </Button>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-800 mb-2">No Complaint Selected</h3>
                      <p className="text-gray-600">Select a complaint from the list to view details</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Support Bot */}
      <SupportBot />
    </Layout>
  );
};

export default AgentComplaints;
