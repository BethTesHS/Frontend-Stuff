import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { 
  UserCheck, 
  MapPin, 
  Mail, 
  Phone, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Download,
  Search,
  TrendingUp,
  Calendar,
  Users,
  Edit,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { tenantApprovalApi, TenantVerificationRequest } from '@/services/tenantApprovalApi';
import { getAuthToken } from '@/utils/tokenStorage';

interface TenantApprovalRequestsProps {
  onApprove?: (requestId: number) => void;
  onReject?: (requestId: number) => void;
}

const TenantApprovalRequests = ({ onApprove, onReject }: TenantApprovalRequestsProps) => {
  const [requests, setRequests] = useState<TenantVerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedTenant, setSelectedTenant] = useState<TenantVerificationRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Load requests on component mount and tab change
  useEffect(() => {
    console.log('TenantApprovalRequests component mounted/tab changed:', activeTab);
    loadRequests();
  }, [activeTab]);

  const loadRequests = async () => {
    console.log('loadRequests called for tab:', activeTab);
    setLoading(true);
    try {
      // Check what auth tokens we have available
      const authToken = getAuthToken();
      console.log('Auth token check:', {
        hasAuthToken: !!authToken
      });
      
      const response = await tenantApprovalApi.getRequests(activeTab === 'pending' ? 'pending' : undefined);
      console.log('API response received:', response);
      setRequests(response.requests);
    } catch (error) {
      console.error('Failed to load requests:', error);
      toast.error('Failed to load tenant requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    const request = requests.find(req => req.id === requestId);
    if (!request) return;

    setActionLoading(true);
    try {
      await tenantApprovalApi.approveRequest(requestId, `Approved tenant ${request.tenant_full_name}`);
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'approved' } : req
      ));

      // Call parent callback
      onApprove?.(requestId);
      
      toast.success(`${request.tenant_full_name} has been approved successfully`);
    } catch (error: any) {
      console.error('Error approving tenant:', error);
      toast.error(error.message || 'Failed to approve tenant. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId: number) => {
    const request = requests.find(req => req.id === requestId);
    if (!request) return;

    setActionLoading(true);
    try {
      await tenantApprovalApi.rejectRequest(
        requestId, 
        'Request did not meet verification requirements',
        `Rejected tenant ${request.tenant_full_name}`
      );

      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'rejected' } : req
      ));

      // Call parent callback
      onReject?.(requestId);
      
      toast.success(`${request.tenant_full_name} has been rejected`);
    } catch (error: any) {
      console.error('Error rejecting tenant:', error);
      toast.error(error.message || 'Failed to reject tenant. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesStatus = activeTab === 'pending' ? req.status === 'pending' : 
                         activeTab === 'approved' ? req.status === 'approved' : 
                         req.status === 'rejected';
    
    const matchesSearch = !searchQuery || 
      req.tenant_full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.property_address && req.property_address.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  const pendingCount = requests.filter(req => req.status === 'pending').length;
  const approvedCount = requests.filter(req => req.status === 'approved').length;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleViewTenant = (request: TenantVerificationRequest) => {
    setSelectedTenant(request);
    setIsViewDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  const renderTenantItem = (request: TenantVerificationRequest, showActions = true) => {
    return (
      <div key={request.id} className="grid grid-cols-[60px_1fr_auto] items-center gap-4 p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-all duration-200">
        <Avatar className="w-12 h-12">
          <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold">
            {getInitials(request.tenant_full_name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-gray-900">{request.tenant_full_name}</div>
          <div className="flex gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              #{request.id}
            </div>
            {request.property_address && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {request.property_address.split(',')[0]}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {request.status === 'pending' ? 'Applied' : 
               request.status === 'approved' ? 'Approved' : 'Rejected'} {' '}
              {formatDate(request.created_at)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {request.status === 'pending' && showActions ? (
            <>
              <Button 
                size="sm"
                className="bg-success text-white hover:bg-success/90"
                onClick={() => handleApprove(request.id)}
                disabled={actionLoading}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                {actionLoading ? 'Approving...' : 'Approve'}
              </Button>
              <Button 
                size="sm"
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => handleReject(request.id)}
                disabled={actionLoading}
              >
                <XCircle className="w-4 h-4 mr-1" />
                {actionLoading ? 'Rejecting...' : 'Reject'}
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleViewTenant(request)}
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            </>
          ) : (
            <>
              {getStatusBadge(request.status)}
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleViewTenant(request)}
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tenant Approvals</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-2">Pending Approvals</div>
          <div className="text-2xl font-bold text-gray-900">{pendingCount}</div>
          <div className="text-xs text-success flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            Awaiting review
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-2">Approved This Month</div>
          <div className="text-2xl font-bold text-gray-900">{approvedCount}</div>
          <div className="text-xs text-success flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            Total approved
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-2">Average Approval Time</div>
          <div className="text-2xl font-bold text-gray-900">2.4 days</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" />
            Processing time
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="approved">Approved Tenants</TabsTrigger>
          <TabsTrigger value="rejected">Rejected Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Pending Approval Requests
              </CardTitle>
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search tenants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No pending requests found</p>
                  </div>
                ) : (
                  filteredRequests.map(request => renderTenantItem(request, true))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Approved Tenants
              </CardTitle>
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search tenants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No approved tenants found</p>
                  </div>
                ) : (
                  filteredRequests.map(request => renderTenantItem(request, false))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Rejected Applications
              </CardTitle>
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search tenants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No rejected applications found</p>
                  </div>
                ) : (
                  filteredRequests.map(request => renderTenantItem(request, false))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tenant Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Tenant Details
            </DialogTitle>
            <DialogDescription>
              View detailed information about the tenant application.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTenant && (
            <div className="space-y-6">
              {/* Header with Avatar and Basic Info */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                    {getInitials(selectedTenant.tenant_full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{selectedTenant.tenant_full_name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Application #{selectedTenant.id} • Submitted {formatDate(selectedTenant.created_at)}
                  </p>
                  {getStatusBadge(selectedTenant.status)}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTenant.tenant_email && (
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-sm">Email Address</span>
                    </div>
                    <p className="text-sm text-gray-600">{selectedTenant.tenant_email}</p>
                  </Card>
                )}
                
                {selectedTenant.tenant_phone && (
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-sm">Phone Number</span>
                    </div>
                    <p className="text-sm text-gray-600">{selectedTenant.tenant_phone}</p>
                  </Card>
                )}
              </div>

              {/* Property Information */}
              {selectedTenant.property_address && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="font-medium text-sm">Property Address</span>
                  </div>
                  <p className="text-sm text-gray-600">{selectedTenant.property_address}</p>
                  {selectedTenant.property_code && (
                    <p className="text-xs text-gray-500 mt-1">Code: {selectedTenant.property_code}</p>
                  )}
                </Card>
              )}

              {/* Financial Information */}
              {(selectedTenant.monthly_rent || selectedTenant.security_deposit) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTenant.monthly_rent && (
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-sm">Monthly Rent</span>
                      </div>
                      <p className="text-sm text-gray-600">£{selectedTenant.monthly_rent}</p>
                    </Card>
                  )}
                  
                  {selectedTenant.security_deposit && (
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-sm">Security Deposit</span>
                      </div>
                      <p className="text-sm text-gray-600">£{selectedTenant.security_deposit}</p>
                    </Card>
                  )}
                </div>
              )}

              {/* Documents */}
              {selectedTenant.tenancy_proof_filename && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-purple-500" />
                    <span className="font-medium text-sm">Tenancy Proof</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{selectedTenant.tenancy_proof_filename}</span>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </Card>
              )}

              {/* Notes */}
              {selectedTenant.admin_notes && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-sm">Admin Notes</span>
                  </div>
                  <p className="text-sm text-gray-600">{selectedTenant.admin_notes}</p>
                </Card>
              )}

              {/* Actions for pending requests */}
              {selectedTenant.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    className="flex-1 bg-success text-white hover:bg-success/90"
                    onClick={() => {
                      handleApprove(selectedTenant.id);
                      setIsViewDialogOpen(false);
                    }}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Application
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      handleReject(selectedTenant.id);
                      setIsViewDialogOpen(false);
                    }}
                    disabled={actionLoading}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Application
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantApprovalRequests;