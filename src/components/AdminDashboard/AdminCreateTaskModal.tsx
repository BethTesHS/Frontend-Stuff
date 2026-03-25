import React, { useState, useEffect } from "react";
import { X, Clock, PlusCircle, Loader2, Braces, Calendar } from "lucide-react";
import { adminApi, CreateTaskPayload, Task } from "@/services/adminApi";
import { useToast } from "@/hooks/use-toast";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  initialData?: Task | null;
}

export const AdminCreateTaskModal = ({
  isOpen,
  onClose,
  onCreated,
  initialData,
}: CreateTaskModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [registeredTasks, setRegisteredTasks] = useState<string[]>([]);
  const isEditing = !!initialData;

  const initialFormState = {
    celery_tasks_name: "",
    task_uid: "",
    schedule_type: "interval" as "interval" | "crontab",
    // Interval fields
    days: "0",
    hours: "0",
    minutes: "0",
    seconds: "0",
    // Crontab field
    crontab: "* * * * *",
    priority: "Medium",
    retry: false,
    task_args: "{}",
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
      if (initialData) { 
        setFormData({
          celery_tasks_name: initialData.celery_tasks_name,
          task_uid: initialData.task_uid || "",
          schedule_type: initialData.schedule_type as any,
          days: "0", hours: "0", minutes: "0", seconds: "0", 
          crontab: initialData.schedule_type === "crontab" ? initialData.schedule_value : "* * * * *",
          priority: initialData.priority || "Medium",
          retry: !!initialData.retry_on_failure,
          task_args: initialData.task_args || "{}",
        });
      } else {
        setFormData(initialFormState);
      } const fetchRegistered = async () => {
        try {
          const resp = await adminApi.getRegisteredTasks();
          setRegisteredTasks(resp.data || []);
        } catch (error) {
          console.error("Failed to fetch registered tasks", error);
        }
      };
      fetchRegistered();
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.task_args.trim()) JSON.parse(formData.task_args);
    } catch (err) {
      return toast({ title: "Invalid JSON", description: "Check Task Arguments formatting.", variant: "destructive" });
    }

    setLoading(true);
    try {
      const payload: CreateTaskPayload = {
        celery_tasks_name: formData.celery_tasks_name,
        schedule_type: formData.schedule_type,
        task_args: formData.task_args,
        priority: formData.priority as any,
        retry_on_failure: formData.retry,
        ...(formData.schedule_type === "interval" ? {
          duration_days: parseInt(formData.days) || 0,
          duration_hours: parseInt(formData.hours) || 0,
          duration_minutes: parseInt(formData.minutes) || 0,
          duration_seconds: parseInt(formData.seconds) || 0,
        } : {
          crontab_expression: formData.crontab
        })
      };
      if (isEditing) {
        await adminApi.updateTask({ ...payload, celery_tasks_id: initialData.celery_tasks_id });
        toast({ title: "Updated", description: "Schedule updated successfully." });
      } else {
        if (formData.task_uid.trim()) (payload as any).task_uid = formData.task_uid;

        await adminApi.createTask(payload);
        toast({ title: "Success", description: "Task schedule created successfully." });
        setFormData(initialFormState);
      }
      
      onCreated();
      onClose();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDurationChange = (field: string, value: string) => {
    const onlyNums = value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({ ...prev, [field]: onlyNums }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
        <div className="p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{isEditing ? "Edit Schedule" : "Create New Schedule"}</h2>
            <p className="text-sm text-gray-500 mt-1">Configure your dynamic task execution.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-5">
          {/* Task Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Registered Task</label>
            <select
              required
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.celery_tasks_name}
              onChange={(e) => setFormData({ ...formData, celery_tasks_name: e.target.value })}
            >
              <option value="">Select a task function...</option>
              {registeredTasks.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Type Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, schedule_type: "interval" })}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.schedule_type === "interval" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500"}`}
            >
              INTERVAL
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, schedule_type: "crontab" })}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.schedule_type === "crontab" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500"}`}
            >
              CRONTAB
            </button>
          </div>

          {/* Dynamic Schedule Input */}
          {formData.schedule_type === "interval" ? (
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2"><Clock size={16} className="text-blue-500" /> Run Every</label>
              <div className="grid grid-cols-4 gap-3">
                {["days", "hours", "minutes", "seconds"].map((unit) => (
                  <div key={unit} className="text-center">
                    <input
                      type="text"
                      value={(formData as any)[unit]}
                      onChange={(e) => handleDurationChange(unit, e.target.value)}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 text-center font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{unit.slice(0, 3)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2"><Calendar size={16} className="text-purple-500" /> Cron Expression</label>
              <input
                placeholder="* * * * *"
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.crontab}
                onChange={(e) => setFormData({ ...formData, crontab: e.target.value })}
              />
              <p className="text-[10px] text-gray-400">Format: minute hour day_of_month month day_of_week</p>
            </div>
          )}

          {/* JSON Args */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2"><Braces size={16} /> Task Arguments (JSON)</label>
            <input
              value={formData.task_args}
              onChange={(e) => setFormData({ ...formData, task_args: e.target.value })}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-mono text-xs outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Priority & Retry (Original layout) */}
          <div className="flex items-center gap-6">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-semibold">Priority</label>
              <select
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm appearance-none outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Retry</label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, retry: !formData.retry })}
                className={`w-14 h-7 rounded-full transition-colors relative ${formData.retry ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"}`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${formData.retry ? "left-8" : "left-1"}`} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">Cancel</button>
            <button
              type="submit"
              disabled={loading || !formData.celery_tasks_name}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg transition-all active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" /> : <PlusCircle />}
              {isEditing ? " Update Schedule" : " Save Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};