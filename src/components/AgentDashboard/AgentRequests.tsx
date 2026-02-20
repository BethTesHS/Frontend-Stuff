// src/components/AgentDashboard/AgentRequests.tsx
import AgentRequestsList from '@/components/AgentRequests/AgentRequestsList';

export const AgentRequests = () => {
  const handleAgentRequestAccept = (requestId: number, agentDetails: any) => {
    console.log(`Agent request ${requestId} accepted`, agentDetails);
  };

  const handleAgentRequestReject = (requestId: number) => {
    console.log(`Agent request ${requestId} rejected`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-2">Agent Requests</h2>
        <p className="text-sm text-muted-foreground">Manage incoming agent collaboration requests</p>
      </div>
      <AgentRequestsList 
        onAcceptRequest={handleAgentRequestAccept}
        onRejectRequest={handleAgentRequestReject}
      />
    </div>
  );
};