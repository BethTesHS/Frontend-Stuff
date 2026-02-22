import React, { useState } from "react";
import { X, Clock, PlusCircle, Loader2 } from "lucide-react";
import { adminApi } from "@/services/adminApi";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const AdminCreateTaskModal = ({
  isOpen,
  onClose,
  onCreated,
}: CreateTaskModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    days: "0",
    hours: "00",
    minutes: "00",
    seconds: "00",
    priority: "Medium Priority",
    retry: true,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        duration: {
          days: parseInt(formData.days) || 0,
          hours: parseInt(formData.hours) || 0,
          minutes: parseInt(formData.minutes) || 0,
          seconds: parseInt(formData.seconds) || 0,
        },
        priority: formData.priority.split(" ")[0].toLowerCase() as
          | "low"
          | "medium"
          | "high",
        retryOnFailure: formData.retry,
      };
      await adminApi.createTask(payload);

      onCreated();
      onClose();

      setFormData({
        title: "",
        days: "0",
        hours: "00",
        minutes: "00",
        seconds: "00",
        priority: "Medium Priority",
        retry: true,
      });
    } catch (error) {
      alert("Failed to create task not yet conneted to backend endpoint.");
    } finally {
        setLoading(false);
        onClose();

        setFormData({
          title: "",
          days: "0",
          hours: "00",
          minutes: "00",
          seconds: "00",
          priority: "Medium Priority",
          retry: true,
        });
    }
  };

  const handleDurationChange = (field: string, value: string) => {
    const onlyNums = value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({ ...prev, [field]: onlyNums }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Task
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configure and launch a new celery worker instance.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Task Title
            </label>
            <input
              required
              placeholder="Enter alphanumeric title..."
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <p className="text-[10px] text-gray-400">
              Title must be unique and contain no special characters.
            </p>
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Clock size={16} className="text-blue-500" /> Duration
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "DAYS", key: "days" },
                { label: "HOURS", key: "hours" },
                { label: "MIN", key: "minutes" },
                { label: "SEC", key: "seconds" },
              ].map((unit) => (
                <div key={unit.key} className="text-center space-y-2">
                  <input
                    type="text"
                    maxLength={2}
                    value={(formData as any)[unit.key]}
                    onChange={(e) =>
                      handleDurationChange(unit.key, e.target.value)
                    }
                    placeholder="00"
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 text-center text-gray-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Priority & Retry */}
          <div className="flex items-center gap-6">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Priority Level
              </label>
              <select
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              >
                <option>Low Priority</option>
                <option>Medium Priority</option>
                <option>High Priority</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Retry on failure
              </label>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, retry: !formData.retry })
                }
                className={`w-14 h-7 rounded-full transition-colors relative ${
                  formData.retry
                    ? "bg-blue-600"
                    : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${
                    formData.retry ? "left-8" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <PlusCircle size={18} />
              )}
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
