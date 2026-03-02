import { useState, useEffect } from 'react';
import { Wrench, Clock, CheckCircle2, ListFilter, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { complaintsApi, type Complaint } from '@/services/complaintsApi';
import { MaintenanceRequestCard } from './MaintenanceRequestCard';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type FilterOption = 'all' | 'active' | 'completed';

const filterOptions: { label: string; value: FilterOption; icon: any }[] = [
  { label: 'All', value: 'all', icon: ListFilter },
  { label: 'Active', value: 'active', icon: Clock },
  { label: 'Completed', value: 'completed', icon: CheckCircle2 },
];

// ── Mock data (remove when backend is ready) ───────────────────────────────
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
      },
      {
        id: 102,
        complaint_id: 1,
        note: 'That date works for me, I\'ll be home all morning. Thank you!',
        added_by: 'James Davies',
        created_at: '2026-02-21T15:10:00.000Z',
      },
      {
        id: 103,
        complaint_id: 1,
        note: 'Great — the plumber will arrive between 9:30–10:30 AM. You\'ll receive a reminder the day before.',
        added_by: 'Agent Sarah M.',
        created_at: '2026-02-21T15:45:00.000Z',
      },
    ],
  },
  {
    id: 2,
    tenant_id: 'tenant-001',
    tenant_name: 'James Davies',
    tenant_email: 'james.davies@email.com',
    house_number: '14B, Riverside Court',
    issue_type: 'Electrical Problems',
    description: 'Living room sockets on the east wall have stopped working. Extension leads are currently used as a workaround — this is a safety concern.',
    urgency: 'urgent',
    status: 'in_progress',
    priority: 1,
    ticket_number: 'TKT-0002',
    created_at: '2026-02-20T08:15:00.000Z',
    updated_at: '2026-02-22T09:20:00.000Z',
    notes: [
      {
        id: 201,
        complaint_id: 2,
        note: 'We\'ve assigned a certified electrician. Can you confirm availability for 1 March, anytime from 2 PM?',
        added_by: 'Agent Sarah M.',
        created_at: '2026-02-22T09:15:00.000Z',
      },
    ],
  },
  {
    id: 3,
    tenant_id: 'tenant-001',
    tenant_name: 'James Davies',
    tenant_email: 'james.davies@email.com',
    house_number: '14B, Riverside Court',
    issue_type: 'Heating/Cooling',
    description: 'Boiler stopped producing heat. House temperature dropped significantly overnight — the radiators are cold to the touch across all rooms.',
    urgency: 'medium',
    status: 'resolved',
    priority: 3,
    ticket_number: 'TKT-0003',
    created_at: '2026-01-05T09:00:00.000Z',
    updated_at: '2026-01-14T14:05:00.000Z',
    resolved_at: '2026-01-14T14:00:00.000Z',
    notes: [
      {
        id: 301,
        complaint_id: 3,
        note: '[MAINTENANCE_SCHEDULE]\n📅 MAINTENANCE SCHEDULED\nDate: 14 Jan 2026\nTime: 09:00 AM\nNotes: Boiler engineer scheduled. Please have the boiler accessible.',
        added_by: 'Agent Mike T.',
        created_at: '2026-01-08T11:00:00.000Z',
      },
      {
        id: 302,
        complaint_id: 3,
        note: 'Confirmed, works for me.',
        added_by: 'James Davies',
        created_at: '2026-01-08T11:30:00.000Z',
      },
      {
        id: 303,
        complaint_id: 3,
        note: 'Engineer has completed the repair. Boiler thermostat and pressure valve replaced. System fully tested and signed off. No further action required.',
        added_by: 'Agent Mike T.',
        created_at: '2026-01-14T14:00:00.000Z',
      },
      {
        id: 304,
        complaint_id: 3,
        note: 'All good, thank you for the quick response!',
        added_by: 'James Davies',
        created_at: '2026-01-14T15:22:00.000Z',
      },
    ],
  },
  {
    id: 4,
    tenant_id: 'tenant-001',
    tenant_name: 'James Davies',
    tenant_email: 'james.davies@email.com',
    house_number: '14B, Riverside Court',
    issue_type: 'Structural Issues',
    description: 'Visible crack running across the bedroom ceiling, approximately 40 cm long. Started small but has widened over the past two weeks.',
    urgency: 'low',
    status: 'resolved',
    priority: 4,
    ticket_number: 'TKT-0004',
    created_at: '2025-12-12T10:00:00.000Z',
    updated_at: '2025-12-20T13:00:00.000Z',
    resolved_at: '2025-12-20T13:00:00.000Z',
    notes: [
      {
        id: 401,
        complaint_id: 4,
        note: 'Contractor will attend 20 Dec between 08:00–12:00. Work should take around 2 hours to plaster and repaint.',
        added_by: 'Agent Sarah M.',
        created_at: '2025-12-15T10:00:00.000Z',
      },
      {
        id: 402,
        complaint_id: 4,
        note: 'Perfect, I\'ll be in. Thanks.',
        added_by: 'James Davies',
        created_at: '2025-12-15T10:30:00.000Z',
      },
    ],
  },
];
// ──────────────────────────────────────────────────────────────────────────

const MaintenanceRequests = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>('all');
  const isVerified = user?.tenantVerified || false;

  useEffect(() => {
    // if (import.meta.env.DEV) {
      setComplaints(MOCK_MAINTENANCE_REQUESTS);
      setLoading(false);
      return;
    // }

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
        setComplaints(maintenance);
      } catch {
        toast.error('Failed to load maintenance requests');
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
      {/* Verification alert */}
      {!isVerified && (
        <Alert className="border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            Please verify your tenancy to access maintenance features.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      {/* <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center">
          <Wrench className="w-8 h-8 mr-3 text-blue-600" />
          Maintenance Requests
        </h1>
        <p className="text-muted-foreground text-base">
          Track scheduled and completed maintenance for your property
        </p>
      </div> */}

      {/* Filter tabs */}
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
                active
                  ? 'bg-blue-600 text-white border-none'
                  : ''
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

      {/* List */}
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
            <MaintenanceRequestCard key={complaint.id} complaint={complaint} />
          ))
        )}
      </div>
    </div>
  );
};

export default MaintenanceRequests;
