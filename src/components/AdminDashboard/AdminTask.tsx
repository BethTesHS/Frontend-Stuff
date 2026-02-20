import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Clock,
  RefreshCcw,
  AlertCircle,
  Play,
  XCircle,
  Trash2,
  Loader2,
} from "lucide-react";
import { adminApi, Task, TaskStats } from "@/services/adminApi";
import { MOCK_TASKS, MOCK_TASK_STATS } from "@/utils/mockTaskData";

const AdminTask = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>({
    active: 0,
    idle: 0,
    offline: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all tasks");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      // const data = await adminApi.getTasks(); mocking the API call for now
      await new Promise((resolve) => setTimeout(resolve, 600));
      setTasks(MOCK_TASKS);
      setStats(MOCK_TASK_STATS);
      // setTasks(data.tasks);
      // setStats(data.stats);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleAction = async (
    taskId: string,
    action: "retry" | "revoke" | "delete",
  ) => {
    setActionId(`${taskId}-${action}`);
    try {
      // await adminApi.performTaskAction(taskId, action);  this is the real API call, but we'll mock it for now
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (action === "delete") {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      } else {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: action === "retry" ? "running" : "failed",
                  error: action === "revoke" ? "Revoked" : undefined,
                }
              : t,
          ),
        );
      }
      await loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Action failed");
    } finally {
      setActionId(null);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all tasks" || task.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-gray-500 dark:text-gray-400">
          Loading task monitor...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="ACTIVE"
          value={stats.active}
          sub="Workers"
          color="border-emerald-500"
        />
        <StatCard
          label="IDLE"
          value={stats.idle}
          sub=""
          color="border-blue-500"
        />
        <StatCard
          label="OFFLINE"
          value={stats.offline}
          sub=""
          color="border-red-500"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-2xl">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search tasks or ID..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus size={18} /> Create New Task
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {["All Tasks", "Running", "Pending", "Completed", "Failed"].map(
            (t) => (
              <button
                key={t}
                onClick={() => setFilter(t.toLowerCase())}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === t.toLowerCase()
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {t}
              </button>
            ),
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Recent Jobs
          </h2>
          <span className="text-xs text-gray-400">
            Total: {filteredTasks.length}
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 p-12 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No tasks found matching your criteria.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onAction={handleAction}
              loadingAction={actionId}
            />
          ))
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, sub, color }: any) => (
  <div
    className={`bg-white dark:bg-gray-900 p-6 rounded-xl border-l-4 ${color} shadow-sm border border-gray-200 dark:border-gray-800`}
  >
    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      {label}
    </p>
    <div className="flex items-baseline gap-2 mt-1">
      <span className="text-3xl font-bold dark:text-white">{value}</span>
      {sub && <span className="text-sm text-gray-400">{sub}</span>}
    </div>
  </div>
);

const TaskItem = ({
  task,
  onAction,
  loadingAction,
}: {
  task: Task;
  onAction: any;
  loadingAction: string | null;
}) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "running":
        return "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800";
      case "pending":
        return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800";
      case "completed":
        return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800";
      case "failed":
        return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden group hover:border-blue-400 dark:hover:border-blue-900 transition-all">
      <div className="p-5 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
              {task.name}
            </h3>
            <p className="text-xs font-mono text-gray-400 mt-1 uppercase">
              ID: {task.id}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {task.status === "failed" && (
              <button
                onClick={() => onAction(task.id, "retry")}
                className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg flex items-center gap-1 text-xs font-bold"
              >
                {loadingAction === `${task.id}-retry` ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Play size={16} />
                )}
                RETRY
              </button>
            )}

            {(task.status === "running" || task.status === "pending") && (
              <button
                onClick={() => onAction(task.id, "revoke")}
                className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg flex items-center gap-1 text-xs font-bold"
              >
                {loadingAction === `${task.id}-revoke` ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <XCircle size={16} />
                )}
                CANCEL
              </button>
            )}

            <button
              onClick={() => onAction(task.id, "delete")}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              {loadingAction === `${task.id}-delete` ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Trash2 size={16} />
              )}
            </button>

            <span
              className={`ml-2 px-3 py-1 rounded text-[10px] font-bold uppercase border ${getStatusStyle(task.status)}`}
            >
              ● {task.status}
            </span>
          </div>
        </div>

        {task.error && (
          <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 font-medium">
              <AlertCircle size={14} /> Error: {task.error}
            </p>
          </div>
        )}

        <div className="flex items-center gap-8 text-sm">
          <Detail
            icon={<Clock size={16} />}
            label="Duration"
            value={task.duration}
          />
          <Detail
            icon={<RefreshCcw size={16} />}
            label={
              task.status === "completed"
                ? "Finished"
                : task.status === "failed"
                  ? "Failed At"
                  : "ETA"
            }
            value={task.eta || task.finishedAt || task.failedAt || "--:--"}
          />
        </div>
      </div>
    </div>
  );
};

const Detail = ({ icon, label, value }: any) => (
  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
    {icon}
    <div>
      <p className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-1">
        {label}
      </p>
      <p className="font-semibold">{value}</p>
    </div>
  </div>
);

export default AdminTask;
