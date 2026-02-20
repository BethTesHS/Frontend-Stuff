// src/components/AgentDashboard/AgentComplaints.tsx
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const AgentComplaints = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground mb-2">Property Complaints</h2>
          <p className="text-sm text-muted-foreground">Manage tenant complaints and issues</p>
        </div>
        <Button onClick={() => navigate('/agent-complaints')} className="bg-primary hover:bg-primary/90">
          <Eye className="w-4 h-4 mr-2" />
          View All Complaints
        </Button>
      </div>

      <Card className="p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Complaints Management</h3>
        <p className="text-muted-foreground mb-4">Use the dedicated complaints page for full complaint management features</p>
        <Button onClick={() => navigate('/agent-complaints')} variant="outline">
          Go to Complaints Page
        </Button>
      </Card>
    </div>
  );
};