import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { profileApi, findAgentApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import {
  Mail,
  Phone,
  Clock,
  MapPin,
  Loader2,
  MessageSquare,
  User
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
    case 'responded': return 'bg-green-100 text-green-800 border-green-200';
    case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) > 1 ? 's' : ''} ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
};

const formatFullDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const InquiriesView = () => {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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
            client_name: inquiry.client_name || inquiry.full_name,
            client_email: inquiry.client_email || inquiry.email,
            client_phone: inquiry.client_phone || inquiry.phone,
            property_title: inquiry.property_title,
            inquiry_type: inquiry.inquiry_type || inquiry.buyer_type || 'General',
            status: inquiry.status,
            message: inquiry.message,
            created_at: inquiry.created_at,
            agent_name: inquiry.agent_name,
            agent_company: inquiry.agent_company
          }));
          setInquiries(mappedInquiries);

          // Auto-select first inquiry
          if (mappedInquiries.length > 0) {
            setSelectedInquiry(mappedInquiries[0]);
          }
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

  const handleReply = () => {
    if (!selectedInquiry) return;
    // TODO: Implement reply functionality
    toast({
      title: "Reply",
      description: `Opening email to ${selectedInquiry.client_email}`,
    });
  };

  const handleCall = () => {
    if (!selectedInquiry) return;
    // TODO: Implement call functionality
    toast({
      title: "Call",
      description: `Calling ${selectedInquiry.client_phone}`,
    });
  };

  const handleMarkAsResponded = async () => {
    if (!selectedInquiry) return;

    setProcessing(true);
    try {
      // TODO: Replace with actual API call to update inquiry status
      // await updateInquiryStatus(selectedInquiry.id, 'responded');

      // Update local state
      setInquiries(prev =>
        prev.map(inq =>
          inq.id === selectedInquiry.id
            ? { ...inq, status: 'responded' }
            : inq
        )
      );
      setSelectedInquiry(prev => prev ? { ...prev, status: 'responded' } : null);

      toast({
        title: "Success",
        description: "Inquiry marked as responded",
      });
    } catch (error) {
      console.error('Failed to update inquiry status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="h-full">
      <div className="flex h-full rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
        {/* Inquiries List - Left Sidebar */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-800 bg-muted/30 dark:bg-gray-800/30">
          <div className="p-4 border-b bg-background">
            <h3 className="font-medium text-foreground">Client Inquiries</h3>
            <p className="text-sm text-muted-foreground">{inquiries.length} total inquiries</p>
          </div>
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-2 p-2">
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">Loading inquiries...</p>
                </div>
              ) : inquiries.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">No inquiries yet</p>
                  <p className="text-xs text-muted-foreground">Client inquiries will appear here</p>
                </div>
              ) : (
                inquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    onClick={() => setSelectedInquiry(inquiry)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedInquiry?.id === inquiry.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                          {inquiry.client_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm text-foreground truncate">
                            {inquiry.client_name}
                          </p>
                          <Badge className={`text-xs ${getStatusColor(inquiry.status)}`}>
                            {inquiry.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-1">
                          {inquiry.property_title}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDate(inquiry.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Inquiry Details - Right Panel */}
        <div className="flex-1 flex flex-col">
          {!selectedInquiry ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No inquiry selected</h3>
                <p className="text-sm text-muted-foreground">
                  Select an inquiry from the list to view details
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="border-b bg-background p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {selectedInquiry.client_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">
                        {selectedInquiry.client_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formatFullDate(selectedInquiry.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(selectedInquiry.status)}>
                    {selectedInquiry.status}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {/* Property Information */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Property Interest
                    </h4>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm font-medium text-foreground">
                        {selectedInquiry.property_title}
                      </p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {selectedInquiry.inquiry_type}
                      </Badge>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Contact Information
                    </h4>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{selectedInquiry.client_email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{selectedInquiry.client_phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </h4>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm leading-relaxed text-foreground">
                        {selectedInquiry.message}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Action Buttons */}
              <div className="border-t bg-background p-4">
                <div className="flex gap-2">
                  <Button
                    onClick={handleReply}
                    disabled={processing}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Reply to Client
                  </Button>
                  <Button
                    onClick={handleCall}
                    disabled={processing}
                    variant="outline"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  {selectedInquiry.status === 'pending' && (
                    <Button
                      onClick={handleMarkAsResponded}
                      disabled={processing}
                      variant="outline"
                    >
                      Mark as Responded
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
