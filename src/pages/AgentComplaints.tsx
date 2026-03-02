
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
  ArrowLeft,
  Send,
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

// ── Mock data for agent view (remove when backend is ready) ──────────────
const MOCK_AGENT_COMPLAINTS: ApiComplaint[] = [
  {
    id: 101,
    tenant_id: 'tenant-001',
    tenant_name: 'James Davies',
    tenant_email: 'james.davies@email.com',
    house_number: '14B, Riverside Court',
    issue_type: 'Plumbing Issues',
    description:
      'The kitchen sink has been leaking steadily for 4 days. Water is pooling under the cabinet and causing visible damp damage to the unit below.',
    urgency: 'high',
    status: 'open',
    priority: 2,
    ticket_number: 'TKT-1001',
    created_at: '2026-02-22T09:15:00.000Z',
    updated_at: '2026-02-22T09:15:00.000Z',
    notes: [],
  },
  {
    id: 102,
    tenant_id: 'tenant-001',
    tenant_name: 'James Davies',
    tenant_email: 'james.davies@email.com',
    house_number: '14B, Riverside Court',
    issue_type: 'Electrical Problems',
    description:
      'Living room sockets on the east wall have stopped working. Extension leads are currently used as a workaround — this is a safety concern.',
    urgency: 'urgent',
    status: 'in_progress',
    priority: 1,
    ticket_number: 'TKT-1002',
    created_at: '2026-02-20T08:15:00.000Z',
    updated_at: '2026-02-23T10:00:00.000Z',
    notes: [
      {
        id: 201,
        complaint_id: 102,
        note: "We've reviewed your complaint and have assigned a certified electrician. Can you confirm your availability for 1 March from 2 PM onwards?",
        added_by: 'Agent Sarah M.',
        created_at: '2026-02-23T09:45:00.000Z',
      },
    ],
  },
  {
    id: 103,
    tenant_id: 'tenant-001',
    tenant_name: 'James Davies',
    tenant_email: 'james.davies@email.com',
    house_number: '14B, Riverside Court',
    issue_type: 'Heating/Cooling',
    description:
      'Boiler stopped producing heat overnight. All radiators are cold. The house temperature has dropped significantly — children are in the household.',
    urgency: 'medium',
    status: 'in_progress',
    priority: 3,
    ticket_number: 'TKT-1003',
    created_at: '2026-02-18T07:30:00.000Z',
    updated_at: '2026-02-21T16:00:00.000Z',
    notes: [
      {
        id: 301,
        complaint_id: 103,
        note: '[MAINTENANCE_SCHEDULE]\n📅 MAINTENANCE SCHEDULED\nDate: 28 Feb 2026\nTime: 10:00 AM\nNotes: Boiler engineer scheduled. Please have the boiler accessible.',
        added_by: 'Agent Sarah M.',
        created_at: '2026-02-20T11:00:00.000Z',
      },
      {
        id: 302,
        complaint_id: 103,
        note: "Morning works, but I have a school run at 8:45 AM. I'll be back by 9:15 — is 10 AM still OK?",
        added_by: 'James Davies',
        created_at: '2026-02-20T11:30:00.000Z',
      },
      {
        id: 303,
        complaint_id: 103,
        note: "That's fine — the engineer will arrive between 10:00–10:30 AM. You'll receive a reminder the evening before.",
        added_by: 'Agent Sarah M.',
        created_at: '2026-02-20T12:05:00.000Z',
      },
    ],
  },
  {
    id: 104,
    tenant_id: 'tenant-002',
    tenant_name: 'Emily Carter',
    tenant_email: 'emily.carter@email.com',
    house_number: '7A, Oak Lane',
    issue_type: 'Structural Issues',
    description:
      'A visible crack running across the bedroom ceiling, approximately 40 cm long. It has widened noticeably over the past two weeks.',
    urgency: 'low',
    status: 'resolved',
    priority: 4,
    ticket_number: 'TKT-1004',
    created_at: '2026-01-10T10:00:00.000Z',
    updated_at: '2026-01-18T13:00:00.000Z',
    resolved_at: '2026-01-18T13:00:00.000Z',
    notes: [
      {
        id: 401,
        complaint_id: 104,
        note: '[MAINTENANCE_SCHEDULE]\n📅 MAINTENANCE SCHEDULED\nDate: 18 Jan 2026\nTime: 09:00 AM\nNotes: Contractor will plaster and repaint. Should take around 2 hours.',
        added_by: 'Agent Sarah M.',
        created_at: '2026-01-14T10:00:00.000Z',
      },
      {
        id: 402,
        complaint_id: 104,
        note: "Perfect, I'll be in. Thanks for sorting this so quickly!",
        added_by: 'Emily Carter',
        created_at: '2026-01-14T10:25:00.000Z',
      },
      {
        id: 403,
        complaint_id: 104,
        note: 'Work has been completed — ceiling fully repaired, re-plastered and repainted. Ticket closed.',
        added_by: 'Agent Sarah M.',
        created_at: '2026-01-18T13:00:00.000Z',
      },
    ],
  },
  {
    id: 105,
    tenant_id: 'tenant-003',
    tenant_name: 'Marcus Reid',
    tenant_email: 'marcus.reid@email.com',
    house_number: '22C, Birchwood Close',
    issue_type: 'Window/Door Issues',
    description:
      'The front door lock has become very stiff. On two occasions the tenant was almost unable to enter the flat.',
    urgency: 'medium',
    status: 'in_progress',
    priority: 3,
    ticket_number: 'TKT-1005',
    created_at: '2026-02-15T14:00:00.000Z',
    updated_at: '2026-02-23T11:00:00.000Z',
    notes: [
      {
        id: 501,
        complaint_id: 105,
        note: "Thanks for reporting this. We'll send a locksmith to inspect and replace the lock mechanism. Are you available on 3 March in the morning?",
        added_by: 'Agent Sarah M.',
        created_at: '2026-02-22T09:00:00.000Z',
      },
      {
        id: 502,
        complaint_id: 105,
        note: "[TENANT_PROPOSAL]\n⏰ ALTERNATIVE DATE PROPOSED\nDate: 2026-03-05\nTime: 14:00\nMessage: Morning doesn't work for me — could we do 5 March in the afternoon instead?",
        added_by: 'Marcus Reid',
        created_at: '2026-02-22T09:45:00.000Z',
      },
    ],
  },
];
// ──────────────────────────────────────────────────────────────────────────

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

  // Scheduling dialog state
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [schedulingLoading, setSchedulingLoading] = useState(false);

  // Communication thread state
  const [noteMessage, setNoteMessage] = useState('');
  const [noteSending, setNoteSending] = useState(false);

  const loadComplaints = async () => {
    try {
      setComplaintsLoading(true);
      const response = await complaintsApi.getAgentComplaints({
        assigned_to_me: true
      });

      let complaintsData: ApiComplaint[] = [];

      if (Array.isArray(response.complaints)) {
        complaintsData = response.complaints;
      } else if (response.data && Array.isArray(response.data.complaints)) {
        complaintsData = response.data.complaints;
      } else if (Array.isArray(response)) {
        complaintsData = response;
      }

      // Fall back to mock data if API returns empty
      const data = complaintsData.length > 0 ? complaintsData : MOCK_AGENT_COMPLAINTS;
      setComplaints(data);
      if (data.length > 0) {
        setSelectedComplaint(data[0]);
      }

      if (response.stats) {
        setStats(response.stats);
      } else if (response.data && response.data.stats) {
        setStats(response.data.stats);
      }
    } catch {
      // Use mock data when API is unavailable
      setComplaints(MOCK_AGENT_COMPLAINTS);
      if (MOCK_AGENT_COMPLAINTS.length > 0) {
        setSelectedComplaint(MOCK_AGENT_COMPLAINTS[0]);
      }
    } finally {
      setComplaintsLoading(false);
    }
  };

  const handleSendNote = async () => {
    if (!selectedComplaint || !noteMessage.trim() || noteSending) return;
    setNoteSending(true);
    const text = noteMessage.trim();
    try {
      await complaintsApi.addComplaintNote(selectedComplaint.id, text);
    } catch {
      // continue with optimistic update even on API failure (mock mode)
    }
    const newNote = {
      id: Date.now(),
      complaint_id: selectedComplaint.id,
      note: text,
      added_by: 'Agent',
      created_at: new Date().toISOString(),
    };
    setComplaints(prev =>
      prev.map(c =>
        c.id === selectedComplaint.id
          ? { ...c, notes: [...(c.notes ?? []), newNote] }
          : c
      )
    );
    setSelectedComplaint(prev =>
      prev ? { ...prev, notes: [...(prev.notes ?? []), newNote] } : null
    );
    setNoteMessage('');
    setNoteSending(false);
    toast.success('Message sent to tenant');
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

  const handleScheduleMaintenance = async () => {
    if (!selectedComplaint) return;
    if (!scheduleDate) {
      toast.error('Please select a date');
      return;
    }

    setSchedulingLoading(true);
    try {
      const noteText = [
        '[MAINTENANCE_SCHEDULE]',
        '📅 MAINTENANCE SCHEDULED',
        `Date: ${scheduleDate}`,
        scheduleTime ? `Time: ${scheduleTime}` : '',
        scheduleNotes ? `Notes: ${scheduleNotes}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      await complaintsApi.addComplaintNote(selectedComplaint.id, noteText);

      // Also move to in_progress if still open
      if (selectedComplaint.status === 'open') {
        await complaintsApi.updateComplaintStatus(selectedComplaint.id, 'in_progress');
        setComplaints(prev =>
          prev.map(c =>
            c.id === selectedComplaint.id ? { ...c, status: 'in_progress' } : c
          )
        );
        setSelectedComplaint(prev =>
          prev ? { ...prev, status: 'in_progress' } : null
        );
      }

      toast.success('Maintenance scheduled and tenant notified');
      setScheduleDialogOpen(false);
      setScheduleDate('');
      setScheduleTime('');
      setScheduleNotes('');
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      toast.error('Failed to schedule maintenance');
    } finally {
      setSchedulingLoading(false);
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
                            <Button
                              onClick={() => setScheduleDialogOpen(true)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-8"
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              Schedule Maintenance
                            </Button>
                          </div>
                        </div>

                        {/* Communication Thread */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                          <h4 className="font-semibold text-gray-900 text-sm flex items-center mb-3">
                            <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                            Communication with Tenant
                          </h4>

                          {/* Messages */}
                          <div className="space-y-3 max-h-64 overflow-y-auto mb-3 pr-1">
                            {(selectedComplaint.notes ?? []).length === 0 ? (
                              <div className="flex flex-col items-center py-4 text-gray-500 text-sm gap-1">
                                <MessageSquare className="w-6 h-6 opacity-30" />
                                <p className="text-xs">No messages yet. Start the conversation below.</p>
                              </div>
                            ) : (
                              (selectedComplaint.notes ?? []).map((note: any) => {
                                const isAgent = note.added_by?.toLowerCase().startsWith('agent');

                                // Schedule card
                                if (note.note?.startsWith('[MAINTENANCE_SCHEDULE]')) {
                                  const lines: string[] = note.note.split('\n');
                                  let date = '', time = '', schedNotes = '';
                                  lines.forEach((l: string) => {
                                    if (l.startsWith('Date:')) date = l.replace('Date:', '').trim();
                                    if (l.startsWith('Time:')) time = l.replace('Time:', '').trim();
                                    if (l.startsWith('Notes:')) schedNotes = l.replace('Notes:', '').trim();
                                  });
                                  return (
                                    <div key={note.id} className="flex justify-end">
                                      <div className="max-w-[85%] bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-1.5">
                                        <div className="flex items-center gap-2 text-blue-700 font-semibold text-xs">
                                          <Calendar className="w-4 h-4" />
                                          Maintenance Scheduled (sent by you)
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 text-sm">
                                          {date && <p className="text-gray-800"><span className="font-medium">Date:</span> {date}</p>}
                                          {time && <p className="text-gray-800"><span className="font-medium">Time:</span> {time}</p>}
                                        </div>
                                        {schedNotes && <p className="text-xs text-gray-500 italic">{schedNotes}</p>}
                                        <p className="text-[10px] text-gray-400">{new Date(note.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                      </div>
                                    </div>
                                  );
                                }

                                // Tenant date proposal card
                                if (note.note?.startsWith('[TENANT_PROPOSAL]')) {
                                  const lines: string[] = note.note.split('\n');
                                  let date = '', time = '', msg = '';
                                  lines.forEach((l: string) => {
                                    if (l.startsWith('Date:')) date = l.replace('Date:', '').trim();
                                    if (l.startsWith('Time:')) time = l.replace('Time:', '').trim();
                                    if (l.startsWith('Message:')) msg = l.replace('Message:', '').trim();
                                  });
                                  return (
                                    <div key={note.id} className="flex justify-start">
                                      <div className="max-w-[85%] bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1.5">
                                        <div className="flex items-center gap-2 text-amber-700 font-semibold text-xs">
                                          <Calendar className="w-4 h-4" />
                                          Tenant Proposed Alternative Date
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 text-sm">
                                          {date && <p className="text-gray-800"><span className="font-medium">Date:</span> {date}</p>}
                                          {time && <p className="text-gray-800"><span className="font-medium">Time:</span> {time}</p>}
                                        </div>
                                        {msg && <p className="text-xs text-gray-600 italic">"{msg}"</p>}
                                        <p className="text-[10px] text-gray-400">{note.added_by} &middot; {new Date(note.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                        <Button
                                          size="sm"
                                          onClick={() => {
                                            setScheduleDate(date);
                                            setScheduleTime(time.replace(':', ':').slice(0, 5));
                                            setScheduleDialogOpen(true);
                                          }}
                                          className="bg-amber-500 hover:bg-amber-600 text-white h-7 text-[11px] mt-1"
                                        >
                                          <Calendar className="w-3 h-3 mr-1" />
                                          Confirm This Date
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                }

                                // Regular message
                                return (
                                  <div key={note.id} className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                                      isAgent
                                        ? 'bg-blue-500 text-white rounded-br-sm'
                                        : 'bg-white/30 text-gray-900 rounded-bl-sm border border-white/20'
                                    }`}>
                                      {!isAgent && (
                                        <p className="text-[10px] font-semibold mb-0.5 opacity-70">{note.added_by}</p>
                                      )}
                                      <p className="leading-relaxed">{note.note}</p>
                                      <p className={`text-[10px] mt-1 ${isAgent ? 'text-white/70 text-right' : 'text-gray-500'}`}>
                                        {new Date(note.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* Message input */}
                          {selectedComplaint.status !== 'resolved' && selectedComplaint.status !== 'closed' && (
                            <div className="space-y-2 pt-2 border-t border-white/20">
                              <Textarea
                                placeholder="Type a message to the tenant..."
                                value={noteMessage}
                                onChange={e => setNoteMessage(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendNote();
                                  }
                                }}
                                className="resize-none text-sm bg-white/20 border-white/30 text-gray-900 placeholder-gray-500"
                                rows={2}
                              />
                              <div className="flex justify-end">
                                <Button
                                  size="sm"
                                  onClick={handleSendNote}
                                  disabled={!noteMessage.trim() || noteSending}
                                  className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs"
                                >
                                  {noteSending ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
                                  ) : (
                                    <Send className="w-3 h-3 mr-1" />
                                  )}
                                  Send Message
                                </Button>
                              </div>
                            </div>
                          )}
                          {(selectedComplaint.status === 'resolved' || selectedComplaint.status === 'closed') && (
                            <p className="text-xs text-gray-500 pt-2 border-t border-white/20 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                              This complaint is resolved. Thread is read-only.
                            </p>
                          )}
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

      {/* Schedule Maintenance Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Schedule Maintenance
            </DialogTitle>
          </DialogHeader>

          {selectedComplaint && (
            <div className="text-sm text-muted-foreground mb-2">
              Scheduling for: <span className="font-medium text-foreground">{(selectedComplaint as any).issueType || selectedComplaint.issue_type}</span>
              {' '}— House #{(selectedComplaint as any).houseNumber || selectedComplaint.house_number}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="schedule-date">Date <span className="text-destructive">*</span></Label>
              <Input
                id="schedule-date"
                type="date"
                value={scheduleDate}
                onChange={e => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="schedule-time">Preferred Time</Label>
              <Input
                id="schedule-time"
                type="time"
                value={scheduleTime}
                onChange={e => setScheduleTime(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="schedule-notes">Message to Tenant</Label>
              <Textarea
                id="schedule-notes"
                placeholder="e.g. A plumber will visit to fix the issue. Please ensure someone is home."
                value={scheduleNotes}
                onChange={e => setScheduleNotes(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 mt-2">
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleScheduleMaintenance}
              disabled={!scheduleDate || schedulingLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {schedulingLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Confirm & Notify Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AgentComplaints;
