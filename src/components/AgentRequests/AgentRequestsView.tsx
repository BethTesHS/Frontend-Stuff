import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Building,
  MapPin,
  DollarSign,
  User,
  Check,
  X,
  Bed,
  Bath,
  MessageSquare,
  Loader2,
  Clock,
  Home
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface AgentRequest {
  id: number;
  propertyTitle: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  price: string;
  location: string;
  ownerName: string;
  ownerEmail?: string;
  requestDate: string;
  description: string;
  status?: 'pending' | 'accepted' | 'declined';
}

const AgentRequestsView = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AgentRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AgentRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showAcceptForm, setShowAcceptForm] = useState(false);
  const [agentDetails, setAgentDetails] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    phone: user?.phone || '',
    message: ''
  });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/agent-requests');
      // const data = await response.json();
      // setRequests(data);

      // Mock data for now
      const mockRequests: AgentRequest[] = [
        {
          id: 1,
          propertyTitle: 'Beautiful 3-bedroom Victorian House',
          propertyType: 'House',
          bedrooms: '3',
          bathrooms: '2',
          price: '450000',
          location: 'London, SW1A 1AA',
          ownerName: 'John Smith',
          ownerEmail: 'john.smith@email.com',
          requestDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          description: 'Looking for an experienced agent to help sell this beautiful Victorian property. It has been recently renovated and is in excellent condition.',
          status: 'pending'
        },
        {
          id: 2,
          propertyTitle: 'Modern City Centre Apartment',
          propertyType: 'Apartment',
          bedrooms: '2',
          bathrooms: '1',
          price: '320000',
          location: 'Manchester, M1 2AB',
          ownerName: 'Sarah Johnson',
          ownerEmail: 'sarah.johnson@email.com',
          requestDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          description: 'Seeking a lettings specialist for this modern apartment with great transport links.',
          status: 'pending'
        },
        {
          id: 3,
          propertyTitle: 'Luxury Penthouse with River Views',
          propertyType: 'Apartment',
          bedrooms: '4',
          bathrooms: '3',
          price: '850000',
          location: 'Birmingham, B1 1AA',
          ownerName: 'Michael Brown',
          ownerEmail: 'michael.brown@email.com',
          requestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          description: 'Premium penthouse requiring an experienced luxury property agent. Excellent condition with panoramic views.',
          status: 'pending'
        }
      ];

      setRequests(mockRequests);

      // Auto-select first request
      if (mockRequests.length > 0) {
        setSelectedRequest(mockRequests[0]);
      }
    } catch (error) {
      console.error('Failed to load requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const formatRequestTime = (timestamp: string) => {
    const date = new Date(timestamp);
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

  const handleAcceptRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !agentDetails.name || !agentDetails.email || !agentDetails.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setProcessing(true);
    try {
      // TODO: Replace with actual API call
      // await acceptAgentRequest(selectedRequest.id, agentDetails);

      console.log('Request accepted:', { requestId: selectedRequest.id, agentDetails });

      // Remove the request from the list
      setRequests(prev => prev.filter(req => req.id !== selectedRequest.id));

      // Clear selection
      const remainingRequests = requests.filter(req => req.id !== selectedRequest.id);
      setSelectedRequest(remainingRequests.length > 0 ? remainingRequests[0] : null);
      setShowAcceptForm(false);

      // Show success message
      toast.success('Request accepted successfully! The property owner has been notified.');
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeclineRequest = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      // TODO: Replace with actual API call
      // await rejectAgentRequest(selectedRequest.id);

      console.log('Request declined:', selectedRequest.id);

      // Remove the request from the list
      setRequests(prev => prev.filter(req => req.id !== selectedRequest.id));

      // Clear selection
      const remainingRequests = requests.filter(req => req.id !== selectedRequest.id);
      setSelectedRequest(remainingRequests.length > 0 ? remainingRequests[0] : null);

      // Show success message
      toast.success('Request declined.');
    } catch (error) {
      console.error('Error declining request:', error);
      toast.error('Failed to decline request. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleChatClick = () => {
    toast.info('Chat feature coming soon! This will redirect to messages.');
    // TODO: Implement navigation to messages with this conversation
  };

  return (
    <div className="h-full">
      <div className="flex h-full rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
        {/* Requests List */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-800 bg-muted/30 dark:bg-gray-800/30">
          <div className="p-4 border-b bg-background">
            <h3 className="font-medium text-foreground">Requests</h3>
            <p className="text-sm text-muted-foreground">Property management requests</p>
          </div>
          <ScrollArea className="h-full">
            <div className="space-y-2 p-2">
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">Loading requests...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8">
                  <Home className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">No requests yet</p>
                  <p className="text-xs text-muted-foreground">Property requests will appear here</p>
                </div>
              ) : (
                requests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowAcceptForm(false);
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedRequest?.id === request.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">
                          {request.ownerName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'O'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {request.ownerName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {request.propertyTitle}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            {formatRequestTime(request.requestDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Request Details */}
        <div className="flex-1 flex flex-col">
          {selectedRequest ? (
            <>
              {/* Header */}
              <div className="p-4 border-b bg-background">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">
                        {selectedRequest.ownerName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'O'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {selectedRequest.ownerName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Property Owner
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {formatRequestTime(selectedRequest.requestDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details Content */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {/* Property Details */}
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-foreground mb-4 flex items-center">
                        <Building className="w-5 h-5 mr-2 text-emerald-600" />
                        Property Details
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Property Title</p>
                          <p className="text-base text-foreground">{selectedRequest.propertyTitle}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Type</p>
                            <p className="text-base text-foreground">{selectedRequest.propertyType}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Price</p>
                            <p className="text-base text-foreground font-semibold">£{parseInt(selectedRequest.price).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Bed className="w-4 h-4 text-emerald-600" />
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Bedrooms</p>
                              <p className="text-base text-foreground">{selectedRequest.bedrooms}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Bath className="w-4 h-4 text-emerald-600" />
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Bathrooms</p>
                              <p className="text-base text-foreground">{selectedRequest.bathrooms}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            <p className="text-sm font-medium text-muted-foreground">Location</p>
                          </div>
                          <p className="text-base text-foreground">{selectedRequest.location}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Description */}
                  {selectedRequest.description && (
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="font-semibold text-foreground mb-3">Owner's Message</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedRequest.description}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Accept Form */}
                  {showAcceptForm && (
                    <Card>
                      <CardContent className="p-6">
                        <form onSubmit={handleAcceptRequest} className="space-y-4">
                          <h4 className="font-semibold text-foreground mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2 text-emerald-600" />
                            Your Contact Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name" className="text-foreground font-medium">
                                Full Name *
                              </Label>
                              <Input
                                id="name"
                                value={agentDetails.name}
                                onChange={(e) => setAgentDetails({ ...agentDetails, name: e.target.value })}
                                className="mt-2"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="email" className="text-foreground font-medium">
                                Email Address *
                              </Label>
                              <Input
                                id="email"
                                type="email"
                                value={agentDetails.email}
                                onChange={(e) => setAgentDetails({ ...agentDetails, email: e.target.value })}
                                className="mt-2"
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="phone" className="text-foreground font-medium">
                              Phone Number *
                            </Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={agentDetails.phone}
                              onChange={(e) => setAgentDetails({ ...agentDetails, phone: e.target.value })}
                              className="mt-2"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="message" className="text-foreground font-medium">
                              Message to Owner (Optional)
                            </Label>
                            <Textarea
                              id="message"
                              value={agentDetails.message}
                              onChange={(e) => setAgentDetails({ ...agentDetails, message: e.target.value })}
                              placeholder="Introduce yourself and explain how you'll help..."
                              className="mt-2"
                              rows={4}
                            />
                          </div>
                          <div className="flex gap-3 pt-4">
                            <Button
                              type="submit"
                              disabled={processing || !agentDetails.name || !agentDetails.email || !agentDetails.phone}
                              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                              {processing ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-2" />
                                  Confirm & Accept
                                </>
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowAcceptForm(false)}
                              disabled={processing}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>

              {/* Actions Footer */}
              {!showAcceptForm && (
                <div className="p-4 border-t bg-background">
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowAcceptForm(true)}
                      disabled={processing}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Accept Request
                    </Button>
                    <Button
                      onClick={handleDeclineRequest}
                      disabled={processing}
                      variant="outline"
                      className="flex-1 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          Decline
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="mt-3">
                    <Button
                      onClick={handleChatClick}
                      variant="outline"
                      className="w-full"
                      disabled
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat with Owner (Coming Soon)
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Select a request to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentRequestsView;
