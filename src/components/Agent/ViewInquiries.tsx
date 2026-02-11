import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { profileApi, findAgentApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Search, 
  Filter,
  Eye,
  Star,
  Clock,
  X
} from 'lucide-react';

interface Inquiry {
  id: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  property_title: string;
  inquiry_type: string;
  status: 'pending' | 'responded' | 'closed';
  message: string;
  created_at: string;
  agent_name?: string;
  agent_company?: string;
}


const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'responded': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};


const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const ViewInquiries = () => {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        
        // First get the user profile to get the correct user ID
        const profileResponse = await profileApi.getProfile();
        console.log('Profile response:', profileResponse);
        
        if (!profileResponse.success || !profileResponse.data?.user?.id) {
          console.log('No valid profile data found');
          return;
        }
        
        const userId = profileResponse.data.user.id;
        console.log('Using user ID from profile:', userId);
        
        // Now fetch inquiries with the correct user ID
        const response = await findAgentApi.getAgentInquiries(userId);
        console.log('Inquiries response:', response);
        
        if (response.success && response.data) {
          // Map the API response to match our interface
          const mappedInquiries = (response.data.inquiries || []).map((inquiry: any) => ({
            id: inquiry.id,
            client_name: inquiry.client_name,
            client_email: inquiry.client_email,
            client_phone: inquiry.client_phone,
            property_title: inquiry.property_title,
            inquiry_type: inquiry.inquiry_type,
            status: inquiry.status,
            message: inquiry.message,
            created_at: inquiry.created_at,
            agent_name: inquiry.agent_name,
            agent_company: inquiry.agent_company
          }));
          setInquiries(mappedInquiries);
        }
      } catch (error) {
        console.error('Failed to fetch inquiries:', error);
        toast({
          title: "Error",
          description: "Failed to load inquiries. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [toast]);

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = (inquiry.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (inquiry.property_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (inquiry.client_email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground">Client Inquiries</h3>
        <div className="flex gap-2 items-center">
          <Badge variant="secondary" className="px-3 py-1">
            {filteredInquiries.length} inquiries
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by client name, email, or property..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inquiries List */}
      <div className="space-y-4">
        {filteredInquiries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No inquiries found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'You haven\'t received any client inquiries yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInquiries.map((inquiry) => (
            <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {inquiry.client_name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatDate(inquiry.created_at)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(inquiry.status)}>
                      {inquiry.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{inquiry.client_email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{inquiry.client_phone}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-foreground">{inquiry.property_title}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex items-center gap-2 mb-2">
                     <Badge variant="outline" className="text-xs">
                       {inquiry.inquiry_type}
                     </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {inquiry.message}
                  </p>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Eye className="w-5 h-5" />
                          Inquiry Details
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Client Information</h4>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Name:</span>
                                  <span>{inquiry.client_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-muted-foreground" />
                                  <span>{inquiry.client_email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-muted-foreground" />
                                  <span>{inquiry.client_phone}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Inquiry Details</h4>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">{formatDate(inquiry.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Status:</span>
                                  <Badge className={getStatusColor(inquiry.status)}>
                                    {inquiry.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Buyer Type:</span>
                                  <Badge variant="outline">{inquiry.inquiry_type}</Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Property Interest</h4>
                          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <span>{inquiry.property_title}</span>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Message</h4>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm leading-relaxed">{inquiry.message}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-4 border-t">
                          <Button className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Reply to Client
                          </Button>
                          <Button variant="outline" className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Call Client
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" variant="outline" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Reply
                  </Button>
                  <Button size="sm" variant="outline" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};