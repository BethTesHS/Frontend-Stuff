// src/components/AgentDashboard/AgentApprovals.tsx
import TenantApprovalRequests from '@/components/TenantApproval/TenantApprovalRequests';

export const AgentApprovals = () => {
  const handleTenantApproval = (requestId: number) => {
    console.log(`Tenant request ${requestId} approved`);
  };

  const handleTenantRejection = (requestId: number) => {
    console.log(`Tenant request ${requestId} rejected`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-2">Tenant Approval Requests</h2>
        <p className="text-sm text-muted-foreground">Review and approve tenant applications</p>
      </div>
      <TenantApprovalRequests 
        onApprove={handleTenantApproval}
        onReject={handleTenantRejection}
      />
    </div>
  );
};