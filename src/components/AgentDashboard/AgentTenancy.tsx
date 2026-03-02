import React, { useState } from "react";
import {
  CheckCircle2,
  Building2,
  ArrowRight,
  ClipboardCheck,
  Paperclip,
  Plus,
} from "lucide-react";

export type TenancyStatus =
  | "ACTIVE"
  | "NOTICE_SENT"
  | "ACKNOWLEDGED"
  | "INSPECTION_SET"
  | "COMPLETED";

export const AgentTenancy = () => {
  const [status, setStatus] = useState<TenancyStatus>("NOTICE_SENT");
  const moveOutDate = "2026-03-10";

  const steps = [
    { key: "ACTIVE", label: "Tenancy Active" },
    { key: "NOTICE_SENT", label: "Notice Issued" },
    { key: "ACKNOWLEDGED", label: "Acknowledged" },
    { key: "INSPECTION_SET", label: "Inspection Arranged" },
    { key: "COMPLETED", label: "Tenancy Closed" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-in fade-in duration-500">
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
          {status === "NOTICE_SENT" && (
            <div className="border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-900/10 rounded-2xl p-6 sm:p-8 transition-all">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300">
                  Notice to Vacate Received
                </h3>
                <p className="text-blue-800/80 dark:text-blue-400/80 mt-1">
                  The tenant has requested to move out on{" "}
                  <span className="font-bold underline underline-offset-4 text-blue-900 dark:text-blue-200">
                    {moveOutDate}
                  </span>
                  .
                </p>
              </div>
              <button
                onClick={() => setStatus("ACKNOWLEDGED")}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                Acknowledge Notice <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {(status === "ACTIVE" || status === "NOTICE_SENT") && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Initiate Termination (Eviction)
              </h3>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Reason for termination (mandatory)
                </label>
                <textarea
                  className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm min-h-[100px] outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                  placeholder="Rent arrears + breach"
                  defaultValue="Rent arrears + breach"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Upload official documents (PDF, required)
                </label>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Paperclip className="w-4 h-4" /> Section 22 notice.pdf
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">
                      (uploaded 12 Apr 2025)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 p-3 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 text-sm text-gray-600 dark:text-gray-300">
                    <Paperclip className="w-4 h-4" /> termination_letter.pdf
                  </div>
                </div>
                <p className="text-[11px] text-gray-400">
                  * mandatory: termination letter or Section 22 attached
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setStatus("NOTICE_SENT")}
                  className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-8 py-3 rounded-full font-bold text-sm hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all shadow-md"
                >
                  Issue Termination Notice
                </button>
              </div>
            </div>
          )}
          {status === "ACKNOWLEDGED" && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  schedule inspection
                </h3>
                <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  action needed
                </span>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setStatus("INSPECTION_SET")}
                  className="flex items-center gap-2 px-5 py-2 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" /> schedule exit inspection
                </button>

                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  proposed dates:{" "}
                  <span className="text-gray-900 dark:text-gray-100 font-bold">
                    15 May
                  </span>{" "}
                  (pending tenant confirm)
                </p>
              </div>
            </div>
          )}
          {["INSPECTION_SET", "COMPLETED"].includes(status) && (
            <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-10 bg-gray-50/50 dark:bg-gray-900/40 text-center border-dashed">
              <ClipboardCheck className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Process Advancing
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Currently at:{" "}
                <span className="capitalize">
                  {status.replace("_", " ").toLowerCase()}
                </span>
              </p>
            </div>
          )}
        </div>
        <div className="lg:col-span-4">
          <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 bg-white dark:bg-gray-900 shadow-sm sticky top-6">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-8">
              Closure Progress
            </h3>
            <div className="space-y-8 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-800" />

              {steps.map((step, index) => {
                const isCompleted =
                  index <= steps.findIndex((s) => s.key === status) &&
                  status !== "ACTIVE";
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
                    <div>
                      <span
                        className={`text-sm font-bold ${isCompleted ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-600"}`}
                      >
                        {step.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setStatus("COMPLETED")}
                disabled={status === "COMPLETED" || status === "ACTIVE"}
                className="w-full bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-500 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-30"
              >
                Close Tenancy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
