import { useState, useEffect } from 'react';
import { Wrench, Clock, CheckCircle2, ListFilter, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { complaintsApi, type Complaint } from '@/services/complaintsApi';
import { MaintenanceRequestCard } from './MaintenanceRequestCard';
import { useAuth } from '@/contexts/AuthContext';

type FilterOption = 'all' | 'active' | 'completed';

interface MessagesContext {
  subject: string;
  agentName?: string;
}

interface MaintenanceRequestsProps {
  onGoToMessages?: (context: MessagesContext) => void;
}

const filterOptions: { label: string; value: FilterOption; icon: any }[] = [
  { label: 'All', value: 'all', icon: ListFilter },
  { label: 'Active', value: 'active', icon: Clock },
  { label: 'Completed', value: 'completed', icon: CheckCircle2 },
];

const MOCK_MAINTENANCE_REQUESTS: Complaint[] = [
  {
    id: 1,
    tenant_id: 'tenant-001',
    tenant_name: 'James Davies',
    tenant_email: 'james.davies@email.com',
    house_number: '14B, Riverside Court',
    issue_type: 'Plumbing Issues',
    description: 'The kitchen sink has been leaking for 4 days. Water is pooling under the cabinet and causing visible damp damage to the unit below.',
    urgency: 'high',
    status: 'in_progress',
    priority: 2,
    ticket_number: 'TKT-0001',
    created_at: '2026-02-19T10:30:00.000Z',
    updated_at: '2026-02-21T14:35:00.000Z',
    notes: [
      {
        id: 101,
        complaint_id: 1,
        note: '[MAINTENANCE_SCHEDULE]\n📅 MAINTENANCE SCHEDULED\nDate: 28 Feb 2026\nTime: 10:00 AM\nNotes: Plumber will attend. Please ensure kitchen is accessible.',
        added_by: 'Agent Sarah M.',
        created_at: '2026-02-21T14:32:00.000Z',
      }
    ],
  },
];

const MaintenanceRequests = ({ onGoToMessages }: MaintenanceRequestsProps) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>('all');
  const isVerified = user?.tenantVerified || false;

  useEffect(() => {
//     if (import.meta.env.DEV) {
//       setComplaints(MOCK_MAINTENANCE_REQUESTS);
//       setLoading(false);
//       return;
//     }

    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const response = await complaintsApi.getMyComplaints();
        let data: Complaint[] = [];
        
        if (Array.isArray(response.complaints)) {
          data = response.complaints;
        } else if (response.data && Array.isArray((response.data as any).complaints)) {
          data = (response.data as any).complaints;
        } else if (Array.isArray(response)) {
          data = response as unknown as Complaint[];
        }

        const maintenance = data.filter(
          c => c.status === 'in_progress' || c.status === 'resolved' || c.status === 'closed'
        );
        
        setComplaints(maintenance.length === 0 ? MOCK_MAINTENANCE_REQUESTS : maintenance);
      } catch {
        setComplaints(MOCK_MAINTENANCE_REQUESTS);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const filtered = complaints.filter(c => {
    if (filter === 'active') return c.status === 'in_progress';
    if (filter === 'completed') return c.status === 'resolved' || c.status === 'closed';
    return true;
  });

  const counts = {
    all: complaints.length,
    active: complaints.filter(c => c.status === 'in_progress').length,
    completed: complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length,
  };

  return (
    <div className="space-y-6">
      {!isVerified && (
        <Alert className="border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            Please verify your tenancy to access maintenance features.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {filterOptions.map(opt => {
          const Icon = opt.icon;
          const active = filter === opt.value;
          return (
            <Button
              key={opt.value}
              variant={active ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(opt.value)}
              className={`flex items-center gap-1.5 ${
                active ? 'bg-blue-600 text-white border-none' : ''
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {opt.label}
              <Badge
                variant="secondary"
                className={`ml-1 px-1.5 py-0 text-[10px] ${active ? 'bg-white/20 text-white' : ''}`}
              >
                {counts[opt.value]}
              </Badge>
            </Button>
          );
        })}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border rounded-xl p-12 text-center">
            <Wrench className="w-14 h-14 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No maintenance requests</h3>
            <p className="text-muted-foreground text-sm">
              {filter === 'all'
                ? 'When your complaints are picked up by an agent and scheduled for maintenance, they will appear here.'
                : filter === 'active'
                ? 'No active maintenance scheduled at the moment.'
                : 'No completed maintenance requests yet.'}
            </p>
          </div>
        ) : (
          filtered.map(complaint => (
            <MaintenanceRequestCard key={complaint.id} complaint={complaint} onGoToMessages={onGoToMessages} />
          ))
        )}
      </div>
    </div>
  );
};

export default MaintenanceRequests;