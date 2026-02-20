// src/components/AgentDashboard/AgentViewings.tsx
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScheduledViewingsList from '@/components/Schedule/ScheduledViewingsList';

export const AgentViewings = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground mb-2">Property Viewings</h2>
          <p className="text-sm text-muted-foreground">Manage scheduled property viewings</p>
        </div>
        <Button onClick={() => navigate('/properties')} className="bg-primary hover:bg-primary/90">
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Viewing
        </Button>
      </div>
      <ScheduledViewingsList />
    </div>
  );
};