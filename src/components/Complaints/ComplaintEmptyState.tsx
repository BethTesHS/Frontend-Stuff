
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ComplaintEmptyState = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints yet</h3>
        <p className="text-gray-600 mb-6">
          You haven't submitted any complaints. If you're experiencing any issues with your property, submit a complaint to your agent.
        </p>
        <Button onClick={() => navigate('/submit-complaint')}>
          <Plus className="w-4 h-4 mr-2" />
          Submit Your First Complaint
        </Button>
      </CardContent>
    </Card>
  );
};
