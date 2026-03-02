import React, { useState } from "react";
import {
  CheckCircle2,
  Star,
  FileText,
  AlertCircle,
  Check,
  MapPin,
  Calendar,
  Send,
  User
} from "lucide-react";

const StarRating = ({
  rating,
  setRating,
  disabled,
}: {
  rating: number;
  setRating: (r: number) => void;
  disabled?: boolean;
}) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className={`${disabled ? "cursor-default" : "cursor-pointer"} transition-transform hover:scale-110`}
          onClick={() => !disabled && setRating(star)}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => !disabled && setHover(0)}
        >
          <Star
            className={`w-6 h-6 sm:w-8 sm:h-8 ${star <= (hover || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200 dark:text-gray-800"}`}
          />
        </button>
      ))}
    </div>
  );
};

export const TenantTenancy = () => {
  const [status, setStatus] = useState<any>("ACTIVE");
  const [moveOutDate, setMoveOutDate] = useState("");
  const [noticeReason, setNoticeReason] = useState("");
  const [dateError, setDateError] = useState("");
  const submissionDate = "20 Mar 2025";

  const steps = [
    { key: "ACTIVE", label: "Active" },
    { key: "NOTICE_SENT", label: "Notice" },
    { key: "ACKNOWLEDGED", label: "Confirmed" },
    { key: "INSPECTION_SET", label: "Inspection" },
    { key: "COMPLETED", label: "Finalized" },
  ];

  const getMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.value;
    setMoveOutDate(selected);
    if (new Date(selected) < new Date(getMinDate())) {
      setDateError("Notice must be at least 14 days.");
    } else {
      setDateError("");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-8">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Tenancy & Notice
          </h1>
          <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-sm sm:text-base">
            <MapPin className="w-4 h-4 text-emerald-500" /> Current Residence:
            123 Baker St
          </p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border border-emerald-100 dark:border-emerald-800">
          Lease Status: {status === "ACTIVE" ? "Active" : "Notice Issued"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {status === "ACTIVE" ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Notice to Vacate
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-600 dark:text-gray-400">
                      Intended Move-Out Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        min={getMinDate()}
                        onChange={handleDateChange}
                        className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3 pl-10 text-sm focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 outline-none transition-all"
                      />
                    </div>
                    {dateError && (
                      <p className="text-red-500 text-xs font-bold">
                        {dateError}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-600 dark:text-gray-400">
                      Reason (Optional)
                    </label>
                    <textarea
                      placeholder="e.g. Relocating"
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm h-[46px] resize-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 outline-none transition-all"
                      onChange={(e) => setNoticeReason(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50 dark:border-gray-800 flex justify-end">
                  <button
                    onClick={() => setStatus("NOTICE_SENT")}
                    disabled={!moveOutDate || !!dateError}
                    className="w-full sm:w-auto bg-gray-900 dark:bg-gray-100 hover:bg-black dark:hover:bg-white text-white dark:text-gray-900 px-10 py-3 rounded-xl font-bold transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                  >
                    Submit Notice <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-10 text-center bg-gray-50/50 dark:bg-gray-900/20">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Notice Active
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Your move-out is scheduled for{" "}
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {moveOutDate}
                </span>
              </p>
            </div>
          )}
          {status !== "ACTIVE" && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Notice Status
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    submitted {submissionDate} • move-out {moveOutDate}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 dark:border-gray-700">
                  active • landlord notified
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-bold text-gray-900 dark:text-gray-100">
                    Exit Inspection
                  </h4>
                  <span className="text-[10px] uppercase tracking-widest font-black text-gray-400 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-full">
                    scheduled
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> 15 May 2025 at 10:00 AM
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" /> agent: Sarah
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button className="px-5 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300 hover:shadow-sm transition-all">
                    reschedule
                  </button>
                  <button className="px-5 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300 hover:shadow-sm transition-all">
                    details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Review Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Experience Review
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 text-center flex flex-col items-center">
              <AlertCircle className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium italic max-w-xs">
                Review functionality will unlock automatically once the agent
                finalizes the tenancy closure.
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sticky top-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">
              Process Tracker
            </h3>
            <div className="space-y-8 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-50 dark:bg-gray-800" />
              {steps.map((step, index) => {
                const isCompleted =
                  index <= steps.findIndex((s) => s.key === status) &&
                  status !== "ACTIVE";
                return (
                  <div
                    key={step.key}
                    className="flex items-center gap-4 relative z-10"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isCompleted ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"}`}
                    >
                      {isCompleted ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-bold ${isCompleted ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-600"}`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};