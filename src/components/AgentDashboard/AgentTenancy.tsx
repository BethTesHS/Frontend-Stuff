import React, { useState } from "react";
import {
  CheckCircle2,
  ArrowRight,
  ClipboardCheck,
  Paperclip,
  Plus,
  Calendar,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export type TenancyStatus =
  | "ACTIVE"
  | "NOTICE_SENT"
  | "ACKNOWLEDGED"
  | "INSPECTION_SET"
  | "COMPLETED";

export const AgentTenancy = () => {
  const [status, setStatus] = useState<TenancyStatus>("ACTIVE");
  const [loading, setLoading] = useState(false);
  const [inspectionDate, setInspectionDate] = useState("");
  const [terminationReason, setTerminationReason] = useState("");
  const [moveOutDate] = useState("2026-03-10");

  const steps = [
    { key: "ACTIVE", label: "Tenancy Active" },
    { key: "NOTICE_SENT", label: "Notice Issued" },
    { key: "ACKNOWLEDGED", label: "Acknowledged" },
    { key: "INSPECTION_SET", label: "Inspection Arranged" },
    { key: "COMPLETED", label: "Tenancy Closed" },
  ];

  const handleIssueTermination = async () => {
    if (!terminationReason.trim()) {
      toast.error("Please provide a reason for termination");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setStatus("NOTICE_SENT");
      setLoading(false);
      toast.success("Termination notice issued to tenant");
    }, 1000);
  };

  const handleAcknowledge = async () => {
    setLoading(true);
    setTimeout(() => {
      setStatus("ACKNOWLEDGED");
      setLoading(false);
      toast.success("Notice acknowledged");
    }, 800);
  };

  const handleScheduleInspection = async () => {
    if (!inspectionDate) {
      toast.error("Please select a date first");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setStatus("INSPECTION_SET");
      setLoading(false);
      toast.success(`Inspection scheduled for ${inspectionDate}`);
    }, 800);
  };

  const handleCloseTenancy = async () => {
    setLoading(true);
    setTimeout(() => {
      setStatus("COMPLETED");
      setLoading(false);
      toast.success("Tenancy closed successfully");
    }, 800);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-200 dark:border-gray-800 pb-8">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
            Tenancy Management
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Monitor lease lifecycles and process termination requests.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium shadow-sm text-gray-500">
          Property ID:{" "}
          <span className="font-bold text-gray-900 dark:text-gray-100">
            123 Baker St
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Tenant Notice Banner */}
          {status === "NOTICE_SENT" && (
            <div className="border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-900/10 rounded-2xl p-6 sm:p-8 transition-all">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300">
                  Notice to Vacate Processed
                </h3>
                <p className="text-blue-800/80 dark:text-blue-400/80 mt-1">
                  Move out date set for:{" "}
                  <span className="font-bold underline underline-offset-4 text-blue-900 dark:text-blue-200">
                    {moveOutDate}
                  </span>
                </p>
              </div>
              <button
                onClick={handleAcknowledge}
                disabled={loading}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  "Acknowledge & Proceed"
                )}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 2. Agent Termination Form (Active State) */}
          {status === "ACTIVE" && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Initiate Termination (Eviction)
                </h3>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Reason for termination (mandatory)
                </label>
                <textarea
                  value={terminationReason}
                  onChange={(e) => setTerminationReason(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  placeholder="e.g., Rent arrears exceeding 2 months or breach of Clause 4.2..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Required Documents
                </label>
                <div className="p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Paperclip className="w-4 h-4" />{" "}
                    termination_notice_draft.pdf
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 cursor-pointer hover:underline">
                    Replace
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleIssueTermination}
                  disabled={loading || !terminationReason}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="animate-spin w-4 h-4" />}
                  Issue Official Termination
                </button>
              </div>
            </div>
          )}

          {/* 3. Schedule Inspection Section */}
          {status === "ACKNOWLEDGED" && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 animate-in slide-in-from-bottom-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Schedule Exit Inspection
              </h3>
              <div className="relative max-w-xs">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
              <button
                onClick={handleScheduleInspection}
                disabled={loading || !inspectionDate}
                className="flex items-center gap-2 px-8 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-all shadow-md"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Confirm Inspection Date
              </button>
            </div>
          )}

          {/* 4. Progress Placeholders */}
          {["INSPECTION_SET", "COMPLETED"].includes(status) && (
            <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-10 bg-gray-50/50 dark:bg-gray-900/40 text-center border-dashed">
              <ClipboardCheck
                className={`w-12 h-12 mx-auto mb-4 ${status === "COMPLETED" ? "text-green-500" : "text-blue-500"}`}
              />
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {status === "COMPLETED"
                  ? "Tenancy Closed"
                  : "Ready for Final Walkthrough"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {status === "INSPECTION_SET"
                  ? `Confirmed for: ${inspectionDate}`
                  : "Lease termination complete."}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 bg-white dark:bg-gray-900 shadow-sm sticky top-6">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-8">
              Closure Progress
            </h3>
            <div className="space-y-8 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-800" />
              {steps.map((step, index) => {
                const isCompleted =
                  index < steps.findIndex((s) => s.key === status) ||
                  status === "COMPLETED";
                const isCurrent = step.key === status;
                return (
                  <div
                    key={step.key}
                    className="flex items-start gap-4 relative z-10"
                  >
                    <div
                      className={`mt-1 w-[24px] h-[24px] rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? "bg-blue-600"
                          : isCurrent
                            ? "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500"
                            : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : (
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${isCurrent ? "bg-blue-500 animate-pulse" : "bg-transparent"}`}
                        />
                      )}
                    </div>
                    <span
                      className={`text-sm font-bold ${isCompleted || isCurrent ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-600"}`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={handleCloseTenancy}
                disabled={status !== "INSPECTION_SET" || loading}
                className="w-full bg-red-50 dark:bg-red-900/10 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-500 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-30"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-4 h-4 mx-auto" />
                ) : (
                  "Finalize Closure"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
