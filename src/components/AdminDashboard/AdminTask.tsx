import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Plus, Play, Trash2, Loader2, X, Check } from "lucide-react";
import { adminApi, Task } from "@/services/adminApi";
import { AdminCreateTaskModal } from "./AdminCreateTaskModal";
import { useToast } from "@/hooks/use-toast";

const AdminTask = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all tasks");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const stats = useMemo(
    () => ({
      active: tasks.filter((t) => t.status === true || t.status === 1).length,
      inactive: tasks.filter((t) => t.status === false || t.status === 0)
        .length,
    }),
    [tasks],
  );

  const loadData = useCallback(async () => {
    try {
      if (tasks.length === 0) setLoading(true);
      const response = await adminApi.getTasks(currentPage, 10);
      const taskList = Array.isArray(response.data) ? response.data : [];
      setTasks(taskList);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, tasks.length]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleAction = async (id: number, action: "delete" | "trigger" | "toggle") => {
    setActionId(`${id}-${action}`);
    try {
      if (action === "toggle") {
        const task = tasks.find((t) => t.celery_tasks_id === id);
        if (task) {
          await adminApi.updateTask({ ...task, status: !task.status });
          toast({
            title: "Status Updated",
            description: "Task status changed successfully.",
          });
          await loadData();
        }
      } else if (action === "delete") {
        await adminApi.deleteTask(id);
        setTasks((prev) => prev.filter((t) => t.celery_tasks_id !== id));

        toast({
          title: "Schedule Deleted",
          description: `Task has been removed successfully.`,
        });

        setTimeout(() => loadData(), 500);
      } else {
        const task = tasks.find((t) => t.celery_tasks_id === id);
        if (task) {
          let parsedArgs = {};
          try {
            parsedArgs = task.task_args ? JSON.parse(task.task_args) : {};
          } catch (e) {
            console.error("JSON Parse error for task args", e);
          }
          await adminApi.triggerTask(task.celery_tasks_name);
          toast({
            title: "Task Triggered",
            description: `${task.celery_tasks_name} is now running.`,
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Action Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      await loadData();
    } finally {
      setActionId(null);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const nameMatch = task.celery_tasks_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const idMatch = String(task.celery_tasks_id).includes(searchQuery);
      const isActive = task.status === true || task.status === 1;

      if (filter === "active") return (nameMatch || idMatch) && isActive;
      if (filter === "inactive") return (nameMatch || idMatch) && !isActive;
      return nameMatch || idMatch;
    });
  }, [tasks, searchQuery, filter]);

  if (loading && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-gray-500">Connecting to Task Service...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          label="ACTIVE SCHEDULES"
          value={stats.active}
          color="border-emerald-500"
        />
        <StatCard
          label="PAUSED / INACTIVE"
          value={stats.inactive}
          color="border-gray-400"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or ID..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            <Plus size={18} /> New Schedule
          </button>
        </div>
        <div className="flex gap-2">
          {["All Tasks", "Active", "Inactive"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t.toLowerCase())}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === t.toLowerCase()
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <TaskItem
            key={task.celery_tasks_id}
            task={task}
            onAction={handleAction}
            onEdit={(t: Task) => { setEditingTask(t); setIsModalOpen(true); }}
            loadingAction={actionId}
          />
        ))}
      </div>

      <AdminCreateTaskModal
        isOpen={isModalOpen}
        initialData={editingTask}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        onCreated={loadData}
      />
    </div>
  );
};

const TaskItem = ({ task, onAction, onEdit, loadingAction }: any) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const isActive = task.status === true || task.status === 1;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm group hover:border-blue-400 transition-all">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
              {task.celery_tasks_name}
            </h3>
            <p className="text-xs font-mono text-gray-400 mt-1">
              ID: {task.celery_tasks_id} | UID: {task.task_uid || "NONE"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => onEdit(task)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 text-xs font-bold transition-colors"
              title="Edit Schedule"
            >
              Edit
            </button>
            <button
              onClick={() => onAction(task.celery_tasks_id, "trigger")}
              disabled={loadingAction !== null}
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg flex items-center gap-1 text-xs font-bold transition-colors"
            >
              {loadingAction === `${task.celery_tasks_id}-trigger` ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Play size={16} />
              )}
              RUN NOW
            </button>
            {showConfirm ? (
              <div className="flex items-center gap-1 animate-in slide-in-from-right-2 duration-200">
                <button
                  onClick={() => onAction(task.celery_tasks_id, "delete")}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  title="Confirm Delete"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Cancel"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                disabled={loadingAction !== null}
              >
                {loadingAction === `${task.celery_tasks_id}-delete` ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            )}

            <span
              className={`px-3 py-1 rounded text-[10px] font-bold uppercase border ${isActive ? "text-emerald-600 border-emerald-200" : "text-gray-400 border-gray-200"}`}
            >
              ● {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
          <Detail
            label="Schedule"
            value={`${task.schedule_type}: ${task.schedule_value || "None"}`}
          />
          <Detail label="Priority" value={task.priority} />
          <Detail
            label="Retry"
            value={task.retry_on_failure ? "Enabled" : "Disabled"}
          />
          <Detail 
            label="Arguments" 
            value={task.task_args && task.task_args !== "{}" ? task.task_args : "None"} 
            isMono={true}
          />
          <Detail
            label="Created"
            value={new Date(task.created_at).toLocaleDateString()}
          />
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value, isMono }: any) => (
  <div>
    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
      {label}
    </p>
    <p
      className={`text-sm font-semibold dark:text-white truncate ${isMono ? "font-mono text-[11px] text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-1 rounded" : ""}`}
    >
      {value}
    </p>
  </div>
);

const StatCard = ({ label, value, color }: any) => (
  <div
    className={`bg-white dark:bg-gray-900 p-6 rounded-xl border-l-4 ${color} shadow-sm border border-gray-200 dark:border-gray-800`}
  >
    <p className="text-xs font-bold text-gray-500 uppercase">{label}</p>
    <p className="text-3xl font-bold dark:text-white mt-1">{value}</p>
  </div>
);

export default AdminTask;
