import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Star,
  FileText,
  AlertCircle,
  Check,
  MapPin,
  Calendar,
  Send,
  User,
  Loader2,
  X,
} from "lucide-react";
import { propertyApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const isSimulation = true;

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
  const [submissionDate, setSubmissionDate] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [tenancyData, setTenancyData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newInspectionDate, setNewInspectionDate] = useState("");

  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const steps = [
    { key: "ACTIVE", label: "Active" },
    { key: "NOTICE_SENT", label: "Notice" },
    { key: "ACKNOWLEDGED", label: "Confirmed" },
    { key: "INSPECTION_SET", label: "Inspection" },
    { key: "COMPLETED", label: "Finalized" },
  ];

  const fetchTenancyData = async () => {
    try {
      const response = await propertyApi.getTenancyStatus();
      if (response.success && response.data) {
        setTenancyData(response.data);
        setStatus(response.data.status);
        setMoveOutDate(response.data.move_out_date || "");
        setSubmissionDate(response.data.submission_date || "");
      }
    } catch (error) {
      if (isSimulation) {
        setTenancyData({ 
            property_name: "Riverside Apartment A4", 
            required_notice_days: 30,
            agent_name: "Brian Omondi" 
        });
      }
      console.error("Failed to fetch tenancy status", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenancyData();
  }, []);

  const getMinDate = () => {
    const d = new Date();
    const noticeDays = tenancyData?.required_notice_days || 14;
    d.setDate(d.getDate() + noticeDays);
    return d.toISOString().split("T")[0];
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.value;
    const noticeDays = tenancyData?.required_notice_days || 14;
    setMoveOutDate(selected);
    if (new Date(selected) < new Date(getMinDate())) {
      setDateError(`Notice must be at least ${noticeDays} days.`);
    } else {
      setDateError("");
    }
  };

  const handleSubmitNotice = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await propertyApi.submitTenancyNotice({
        move_out_date: moveOutDate,
        reason: noticeReason,
      });

      if (response.success) {
        setStatus("NOTICE_SENT");
        setSubmissionDate(new Date().toLocaleDateString());
        toast({ title: "Notice Submitted", description: "Landlord and agent notified." });
        fetchTenancyData();
      }
    } catch (error: any) {
      if (isSimulation) {
        setStatus("NOTICE_SENT");
        setSubmissionDate(new Date().toLocaleDateString());
        toast({ title: "Simulation: Notice Sent" });
      } else {
        toast({ variant: "destructive", title: "Failed", description: error.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!newInspectionDate || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await propertyApi.rescheduleInspection("current", newInspectionDate);
      if (res.success) {
        toast({ title: "Request Sent", description: "Reschedule request submitted." });
        setIsRescheduling(false);
        fetchTenancyData();
      }
    } catch (err: any) {
      if (isSimulation) {
        toast({ title: "Simulation: Reschedule Request Sent" });
        setIsRescheduling(false);
      } else {
        toast({ variant: "destructive", description: err.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (rating === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await propertyApi.submitTenancyReview({
        rating,
        comment: reviewComment,
      });
      if (res.success) {
        toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
      }
    } catch (error: any) {
       if (isSimulation) {
        toast({ title: "Simulation: Review Received" });
      } else {
        toast({ variant: "destructive", description: error.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const DevToolbar = () => (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 pb-32">
      <div className="flex justify-between items-center border-b border-gray-700 pb-2">
        <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-400">
          Dev Simulation Mode
        </span>
        <button
          onClick={() => setStatus("ACTIVE")}
          className="text-[10px] hover:text-red-400 underline"
        >
          Reset
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {steps.map((s) => (
          <button
            key={s.key}
            onClick={() => setStatus(s.key)}
            className={`px-3 py-1 rounded-md text-[10px] font-bold transition-colors ${
              status === s.key
                ? "bg-emerald-500 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p className="text-[9px] text-gray-400 italic text-center">
        Use this to test the Review form (Finalized) and Tracker UI
      </p>
    </div>
  );

  if (loading)
    return <div className="p-10 text-center">Loading tenancy details...</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-8">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Tenancy & Notice
          </h1>
          <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-sm sm:text-base">
            <MapPin className="w-4 h-4 text-emerald-500" />{" "}
            {tenancyData?.property_name || "Current Residence"}
          </p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border border-emerald-100 dark:border-emerald-800">
          Lease Status: {status === "ACTIVE" ? "Active" : "Notice Issued"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {status === "ACTIVE" ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold">Notice to Vacate</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-600">
                      Intended Move-Out Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        min={getMinDate()}
                        onChange={handleDateChange}
                        className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3 pl-10 text-sm outline-none"
                      />
                    </div>
                    {dateError && (
                      <p className="text-red-500 text-xs font-bold">
                        {dateError}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-600">
                      Reason (Optional)
                    </label>
                    <textarea
                      placeholder="e.g. Relocating"
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm h-[46px] resize-none outline-none"
                      onChange={(e) => setNoticeReason(e.target.value)}
                    />
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-50 dark:border-gray-800 flex justify-end">
                  <button
                    onClick={handleSubmitNotice}
                    disabled={!moveOutDate || !!dateError || isSubmitting}
                    className="w-full sm:w-auto bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-10 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-30"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Submit Notice"
                    )}{" "}
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-10 text-center bg-gray-50/50 dark:bg-gray-900/20">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Notice Active</h2>
              <p className="text-gray-500">
                Scheduled for{" "}
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
                  <h3 className="text-xl font-bold">Notice Status</h3>
                  <p className="text-sm text-gray-500">
                    submitted {submissionDate} • move-out {moveOutDate}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold border border-gray-200">
                  active • landlord notified
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold">Exit Inspection</h4>
                  {!isRescheduling && (
                    <span className="text-[10px] uppercase tracking-widest font-black text-gray-400 border px-2 py-0.5 rounded-full">
                      {tenancyData?.inspection_date ? "scheduled" : "pending"}
                    </span>
                  )}
                </div>

                {isRescheduling ? (
                  <div className="flex flex-col sm:flex-row gap-3 items-end animate-in fade-in slide-in-from-top-2">
                    <div className="w-full space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-400">
                        New Date
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 p-2 rounded-lg text-sm"
                        onChange={(e) => setNewInspectionDate(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleRescheduleSubmit}
                        disabled={isSubmitting}
                        className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-2 rounded-lg"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIsRescheduling(false)}
                        className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />{" "}
                      {tenancyData?.inspection_date || "TBD"}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" /> agent:{" "}
                      {tenancyData?.agent_name || "Assigning..."}
                    </div>
                  </div>
                )}

                {!isRescheduling && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setIsRescheduling(true)}
                      className="px-5 py-2 bg-white dark:bg-gray-900 border border-gray-200 rounded-full text-xs font-bold hover:shadow-sm"
                    >
                      reschedule
                    </button>
                    <button className="px-5 py-2 bg-white dark:bg-gray-900 border border-gray-200 rounded-full text-xs font-bold hover:shadow-sm">
                      details
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-6">Experience Review</h3>
            {status === "COMPLETED" ? (
              <div className="space-y-6">
                <StarRating rating={rating} setRating={setRating} />
                <textarea
                  placeholder="Share your experience..."
                  className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 rounded-xl p-4 text-sm"
                  rows={4}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
                <button
                  onClick={handleReviewSubmit}
                  disabled={isSubmitting || rating === 0}
                  className="w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}{" "}
                  Submit Review
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 text-center flex flex-col items-center">
                <AlertCircle className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm italic max-w-xs">
                  Review functionality unlocks once the tenancy is finalized.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sticky top-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
              Process Tracker
            </h3>
            <div className="space-y-8 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-50 dark:bg-gray-800" />
              {steps.map((step, index) => {
                const activeIdx = steps.findIndex((s) => s.key === status);
                // Step is completed if its index is less than or equal to current status index
                const isCompleted = activeIdx !== -1 && index <= activeIdx;

                return (
                  <div
                    key={step.key}
                    className="flex items-center gap-4 relative z-10"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isCompleted ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-white dark:bg-gray-800 border-2 border-gray-200"}`}
                    >
                      {isCompleted ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-bold ${isCompleted ? "text-gray-900 dark:text-gray-100" : "text-gray-400"}`}
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
      {process.env.NODE_ENV === "development" && <DevToolbar />}
    </div>
  );
};