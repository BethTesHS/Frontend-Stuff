
import { useState, useEffect } from 'react';
import AgentRequestCard from './AgentRequestCard';
import { toast } from 'sonner';

interface AgentRequest {
  id: number;
  propertyTitle: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  price: string;
  location: string;
  ownerName: string;
  requestDate: string;
  description: string;
}

interface AgentRequestsListProps {
  onAcceptRequest: (requestId: number, agentDetails: { name: string; email: string; phone: string; message?: string }) => void;
  onRejectRequest: (requestId: number) => void;
}

const AgentRequestsList = ({ onAcceptRequest, onRejectRequest }: AgentRequestsListProps) => {
  const [requests, setRequests] = useState<AgentRequest[]>([]);

  useEffect(() => {
    // TODO: Replace with actual API call to fetch agent requests
    // const fetchRequests = async () => {
    //   const response = await fetch('/api/agent-requests');
    //   const data = await response.json();
    //   setRequests(data);
    // };
    // fetchRequests();

    // Mock data for now
    const mockRequests: AgentRequest[] = [
      {
        id: 1,
        propertyTitle: 'Beautiful 3-bedroom Victorian House',
        propertyType: 'house',
        bedrooms: '3',
        bathrooms: '2',
        price: '450000',
        location: 'London, SW1A 1AA',
        ownerName: 'John Smith',
        requestDate: '2 hours ago',
        description: 'Looking for an experienced agent to help sell this beautiful Victorian property. It has been recently renovated and is in excellent condition.'
      },
      {
        id: 2,
        propertyTitle: 'Modern City Centre Apartment',
        propertyType: 'apartment',
        bedrooms: '2',
        bathrooms: '1',
        price: '320000',
        location: 'Manchester, M1 2AB',
        ownerName: 'Sarah Johnson',
        requestDate: '1 day ago',
        description: 'Seeking a lettings specialist for this modern apartment with great transport links.'
      }
    ];
    setRequests(mockRequests);
  }, []);

  const handleAcceptRequest = async (requestId: number, agentDetails: { name: string; email: string; phone: string; message?: string }) => {
    try {
      // TODO: Replace with actual API call
      // await acceptAgentRequest(requestId, agentDetails);
      
      console.log('Request accepted:', { requestId, agentDetails });
      
      // Remove the request from the list
      setRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Show success message
      toast.success('Request accepted successfully! The property owner has been notified.');
      
      // Call parent handler
      onAcceptRequest(requestId, agentDetails);
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request. Please try again.');
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      // TODO: Replace with actual API call
      // await rejectAgentRequest(requestId);
      
      console.log('Request rejected:', requestId);
      
      // Remove the request from the list
      setRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Show success message
      toast.success('Request declined.');
      
      // Call parent handler
      onRejectRequest(requestId);
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to decline request. Please try again.');
    }
  };

  if (requests.length === 0) {
    return (
      <div className="bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No New Requests</h3>
        <p className="text-gray-600">
          When property owners request your services, they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {requests.map((request) => (
        <AgentRequestCard
          key={request.id}
          request={request}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
        />
      ))}
    </div>
  );
};

export default AgentRequestsList;
