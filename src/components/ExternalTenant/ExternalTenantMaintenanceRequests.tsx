import { useState, useEffect } from 'react';
import { Wrench, Clock, CheckCircle2, ListFilter, Loader2 } from 'lucide-react';
import { ExternalTenantMaintenanceRequestCard } from './ExternalTenantMaintenanceRequestCard';
import { externalTenantApi } from '@/services/api';
import { toast } from 'sonner';

type FilterOption = 'all' | 'active' | 'completed';

interface MessagesContext {
  subject: string;
  agentName?: string;
}

interface ExternalTenantMaintenanceRequestsProps {
  onGoToMessages?: (context: MessagesContext) => void;
}

const filterOptions: { label: string; value: FilterOption; icon: any }[] = [
  { label: 'All', value: 'all', icon: ListFilter },
  { label: 'Active', value: 'active', icon: Clock },
  { label: 'Completed', value: 'completed', icon: CheckCircle2 },
];


export default function ExternalTenantMaintenanceRequests({
  onGoToMessages,
}: ExternalTenantMaintenanceRequestsProps) {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>('all');

  useEffect(() => {
    // Maintenance = in-progress complaints (picked up by admin/maintenance)
    externalTenantApi.getComplaints?.({ status: 'in_progress' })
      .then((res) => {
        if (res?.success && res.data) {
          const list = Array.isArray(res.data)
            ? res.data
            : res.data.complaints ?? res.data.data ?? [];
          setComplaints(
            list.map((c: any) => ({
              ...c,
              issue_type: c.issue_type ?? c.category ?? 'General',
              urgency: c.urgency ?? c.severity ?? 'low',
            }))
          );
        }
      })
      .catch(() => toast.error('Could not load maintenance requests'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = complaints.filter((c) => {
    if (filter === 'active') return c.status === 'in_progress';
    if (filter === 'completed') return c.status === 'resolved' || c.status === 'closed';
    return true;
  });

  const counts = {
    all: complaints.length,
    active: complaints.filter((c) => c.status === 'in_progress').length,
    completed: complaints.filter((c) => c.status === 'resolved' || c.status === 'closed').length,
  };

  return (
    <div className="space-y-5">
      {/* Filter toolbar */}
      <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-1 shadow-sm w-fit">
        {filterOptions.map((opt) => {
          const Icon = opt.icon;
          const active = filter === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                active
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {opt.label}
              <span
                className={`text-[10px] font-semibold px-1.5 rounded-full ${
                  active
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {counts[opt.value]}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center shadow-sm">
          <Wrench className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
            No maintenance requests
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filter === 'all'
              ? 'When a complaint is picked up and scheduled for maintenance, it will appear here.'
              : filter === 'active'
              ? 'No active maintenance scheduled at the moment.'
              : 'No completed maintenance requests yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((complaint) => (
            <ExternalTenantMaintenanceRequestCard
              key={complaint.id}
              complaint={complaint}
              onGoToMessages={onGoToMessages}
            />
          ))}
        </div>
      )}
    </div>
  );
}
