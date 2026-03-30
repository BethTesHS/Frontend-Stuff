import { useState, useEffect } from 'react';
import {
  Wrench, FileText, MessageSquare, AlertTriangle,
  MapPin, Calendar, CheckCircle2, Clock, Home,
  ArrowRight, CreditCard, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const ExternalTenantOverview = ({ user, setActiveTab, navigate, dashboardData, dashboardLoading }: any) => {
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [recentMaintenance, setRecentMaintenance] = useState<any[]>([]);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const { externalTenantApi } = await import('@/services/api');
        const [complaintsRes, maintenanceRes] = await Promise.all([
          externalTenantApi.getComplaints?.().catch(() => ({ success: false, data: null })),
          externalTenantApi.getMaintenanceRequests?.().catch(() => ({ success: false, data: null })),
        ]);
        if (complaintsRes?.success && complaintsRes.data) {
          const list = Array.isArray(complaintsRes.data) ? complaintsRes.data : complaintsRes.data.complaints ?? [];
          setRecentComplaints(list.slice(0, 3));
        }
        if (maintenanceRes?.success && maintenanceRes.data) {
          const list = Array.isArray(maintenanceRes.data) ? maintenanceRes.data : maintenanceRes.data.requests ?? [];
          setRecentMaintenance(list.slice(0, 3));
        }
      } catch {
        // Silent fail — dashboard still renders without recent data
      }
    };
    loadRecent();
  }, []);

  const tenancy = dashboardData?.tenancy;
  const property = dashboardData?.property_summary;
  const address = property?.address || dashboardData?.property_summary?.address || null;

  const rentStatus: 'paid' | 'due' | 'unknown' = tenancy?.rent_status ?? 'unknown';
  const nextPaymentDate = tenancy?.next_payment_date ?? null;

  const rentStatusConfig = {
    paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dot: 'bg-emerald-500' },
    due: { label: 'Due', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-500' },
    unknown: { label: 'Check status', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', dot: 'bg-gray-400' },
  };
  const rentBadge = rentStatusConfig[rentStatus];

  if (dashboardLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl" />
          <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  const hasRecentActivity = recentComplaints.length > 0 || recentMaintenance.length > 0;

  return (
    <div className="space-y-6">

      {/* ── Tenancy Summary ── */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              <Home size={15} />
              Your property
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <MapPin size={18} className="text-gray-400 flex-shrink-0" />
              <span className="truncate">{address ?? "Property address not available"}</span>
            </h2>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-1.5">
                <span className={`inline-block size-2 rounded-full ${rentBadge.dot}`} />
                <span className="text-sm text-gray-600 dark:text-gray-400">Rent:</span>
                <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${rentBadge.color}`}>
                  {rentBadge.label}
                </span>
              </div>

              {nextPaymentDate && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar size={14} />
                  Next payment: <span className="font-medium text-gray-900 dark:text-gray-200">
                    {new Date(nextPaymentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}

              {tenancy?.status && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{tenancy.status} tenancy</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('tenancy-overview')}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1 transition-colors flex-shrink-0"
          >
            View details <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setActiveTab("maintenance")}
            className="group flex items-center gap-4 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 transition-all text-left"
          >
            <div className="flex-shrink-0 flex items-center justify-center size-11 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <Wrench size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">Request Maintenance</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Having an issue? We'll sort it.</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("complaints")}
            className="group flex items-center gap-4 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-700 transition-all text-left"
          >
            <div className="flex-shrink-0 flex items-center justify-center size-11 rounded-xl bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
              <FileText size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">File a Complaint</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">We take every issue seriously.</p>
            </div>
          </button>
        </div>
      </section>

      {/* ── Recent Activity ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Activity size={16} />
            Recent Activity
          </h2>
          {hasRecentActivity && (
            <button
              onClick={() => setActiveTab('history')}
              className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={13} />
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
          {!hasRecentActivity ? (
            <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              <CheckCircle2 className="mx-auto mb-2 text-emerald-400" size={28} />
              No complaints yet — everything looks good 👍
            </div>
          ) : (
            <>
              {recentMaintenance.map((req: any, i: number) => (
                <button
                  key={`m-${i}`}
                  onClick={() => setActiveTab('maintenance')}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                >
                  <div className="flex-shrink-0 size-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                    <Wrench size={14} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {req.title ?? req.description ?? "Maintenance request"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                      {req.status ?? "submitted"}
                    </p>
                  </div>
                  <Clock size={13} className="text-gray-400 flex-shrink-0" />
                </button>
              ))}

              {recentComplaints.map((c: any, i: number) => (
                <button
                  key={`c-${i}`}
                  onClick={() => setActiveTab('complaints')}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                >
                  <div className="flex-shrink-0 size-8 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                    <AlertTriangle size={14} className="text-orange-500 dark:text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {c.title ?? c.subject ?? "Complaint"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                      {c.status ?? "submitted"}
                    </p>
                  </div>
                  <Clock size={13} className="text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </>
          )}
        </div>
      </section>

      {/* ── Messages Preview ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <MessageSquare size={16} />
            Messages
          </h2>
          <button
            onClick={() => setActiveTab('messages')}
            className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1 transition-colors"
          >
            Open inbox <ArrowRight size={13} />
          </button>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm px-5 py-4 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <MessageSquare size={16} className="flex-shrink-0 text-gray-400" />
          {lastMessage ? lastMessage.preview : "No messages yet — your inbox is empty."}
        </div>
      </section>

    </div>
  );
};
