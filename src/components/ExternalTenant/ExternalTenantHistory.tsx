import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Clock, FileText, MessageCircle, User, Settings,
  CheckCircle, AlertCircle, Search, Calendar, Loader2,
} from "lucide-react";
import { externalTenantApi } from "@/services/api";


const typeConfig: Record<string, { icon: any; bg: string; iconColor: string; border: string }> = {
  complaint: {
    icon: FileText,
    bg: "bg-orange-50 dark:bg-orange-900/20",
    iconColor: "text-orange-500 dark:text-orange-400",
    border: "border-l-orange-400",
  },
  message: {
    icon: MessageCircle,
    bg: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-blue-500 dark:text-blue-400",
    border: "border-l-blue-400",
  },
  profile: {
    icon: User,
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    border: "border-l-emerald-400",
  },
  system: {
    icon: Settings,
    bg: "bg-purple-50 dark:bg-purple-900/20",
    iconColor: "text-purple-500 dark:text-purple-400",
    border: "border-l-purple-400",
  },
};

const statusBadge: Record<string, string> = {
  open: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  in_progress: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  unread: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  read: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  sent: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

function formatDate(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffH = Math.floor((now.getTime() - date.getTime()) / 3_600_000);
  const diffD = Math.floor(diffH / 24);
  if (diffH < 1) return "Just now";
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD < 7) return `${diffD}d ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const ExternalTenantHistory = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiStats, setApiStats] = useState<{ total_complaints: number; resolved_complaints: number; total_messages: number } | null>(null);

  useEffect(() => {
    externalTenantApi.getHistory?.()
      .then((res) => {
        if (res?.success && res.data) {
          setActivities(res.data.activities ?? []);
          setApiStats(res.data.stats ?? null);
        }
      })
      .catch(() => {/* silently fall through to empty state */})
      .finally(() => setLoading(false));
  }, []);

  const filtered = activities.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || a.type === typeFilter;
    let matchDate = true;
    if (dateFilter !== "all") {
      const d = Math.floor(
        (Date.now() - new Date(a.timestamp).getTime()) / 86_400_000
      );
      if (dateFilter === "week") matchDate = d <= 7;
      if (dateFilter === "month") matchDate = d <= 30;
    }
    return matchSearch && matchType && matchDate;
  });

  // Group by date label
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, a) => {
    const label = new Date(a.timestamp).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    (acc[label] = acc[label] || []).push(a);
    return acc;
  }, {});

  const stats = [
    {
      label: "Complaints",
      count: apiStats?.total_complaints ?? activities.filter((a) => a.type === "complaint").length,
      icon: FileText,
      color: "text-orange-500",
    },
    {
      label: "Messages",
      count: apiStats?.total_messages ?? activities.filter((a) => a.type === "message").length,
      icon: MessageCircle,
      color: "text-blue-500",
    },
    {
      label: "Resolved",
      count: apiStats?.resolved_complaints ?? activities.filter((a) => a.status === "resolved").length,
      icon: CheckCircle,
      color: "text-emerald-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats strip */}
      <div className="flex gap-3 flex-wrap">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 shadow-sm"
          >
            <s.icon className={`w-4 h-4 ${s.color}`} />
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{s.count}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search activity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="complaint">Complaints</SelectItem>
            <SelectItem value="message">Messages</SelectItem>
            <SelectItem value="profile">Profile</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="week">Past week</SelectItem>
            <SelectItem value="month">Past month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center shadow-sm">
          <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">No activity found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting the filters above.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {date}
                </span>
              </div>

              <div className="space-y-2 pl-6 border-l border-gray-200 dark:border-gray-700 ml-2">
                {items.map((a) => {
                  const cfg = typeConfig[a.type] || typeConfig.system;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={a.id}
                      className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm"
                    >
                      {/* dot on the timeline line */}
                      <span className="absolute -left-[1.85rem] top-5 size-2.5 rounded-full bg-gray-300 dark:bg-gray-600 ring-2 ring-white dark:ring-gray-950" />

                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 size-8 rounded-lg flex items-center justify-center ${cfg.bg}`}>
                          <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {a.title}
                            </p>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span
                                className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                                  statusBadge[a.status] || "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {a.status.replace("_", " ")}
                              </span>
                              <span className="text-xs text-gray-400 whitespace-nowrap">
                                {formatDate(a.timestamp)}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {a.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExternalTenantHistory;
