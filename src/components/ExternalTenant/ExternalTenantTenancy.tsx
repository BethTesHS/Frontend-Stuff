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
  Home,
  Clock,
  AlertTriangle,
  Banknote,
  ExternalLink,
} from "lucide-react";
import { extEOTApi, type EOTRecord, type EOTStatus } from "@/services/externalTenantEOTApi";
import { useToast } from "@/hooks/use-toast";

// ── Star rating widget ────────────────────────────────────────────────────────

const StarRating = ({
  rating,
  setRating,
  disabled,
  label,
}: {
  rating: number;
  setRating: (r: number) => void;
  disabled?: boolean;
  label?: string;
}) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="space-y-1">
      {label && <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{label}</p>}
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
              className={`w-6 h-6 sm:w-8 sm:h-8 ${
                star <= (hover || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-200 dark:text-gray-700"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

// ── Step definitions ──────────────────────────────────────────────────────────

const STEPS: { key: EOTStatus; label: string }[] = [
  { key: "NOTICE_SENT", label: "Notice Sent" },
  { key: "ACKNOWLEDGED", label: "Acknowledged" },
  { key: "INSPECTION_SET", label: "Inspection" },
  { key: "DEPOSIT_REFUND", label: "Deposit Refund" },
  { key: "COMPLETED", label: "Completed" },
];

const stepIndex = (s: EOTStatus | null) =>
  STEPS.findIndex((step) => step.key === s);

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number | null) =>
  n !== null && n !== undefined ? `£${n.toFixed(2)}` : "—";

// ── Component ─────────────────────────────────────────────────────────────────

export const ExternalTenantTenancy = () => {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [eot, setEot] = useState<EOTRecord | null>(null);

  // Notice form
  const [moveOutDate, setMoveOutDate] = useState("");
  const [noticeReason, setNoticeReason] = useState("");
  const [dateError, setDateError] = useState("");

  // Reschedule
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newInspectionDate, setNewInspectionDate] = useState("");

  // Review form
  const [landlordRating, setLandlordRating] = useState(0);
  const [landlordReview, setLandlordReview] = useState("");
  const [propertyRating, setPropertyRating] = useState(0);
  const [propertyReview, setPropertyReview] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchStatus = async () => {
    try {
      const res = await extEOTApi.getStatus();
      if (res.data) setEot(res.data);
    } catch {
      // No active EOT — that's fine
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const getMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + (eot ? 0 : 14));
    return d.toISOString().split("T")[0];
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.value;
    setMoveOutDate(selected);
    if (new Date(selected) < new Date(getMinDate())) {
      setDateError("Move-out date must be at least 14 days from today.");
    } else {
      setDateError("");
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "TBD";
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSubmitNotice = async () => {
    if (isSubmitting || !moveOutDate || dateError) return;
    setIsSubmitting(true);
    try {
      const res = await extEOTApi.submitNotice({
        move_out_date: moveOutDate,
        reason: noticeReason || undefined,
      });
      if (res.data) {
        setEot(res.data);
        toast({ title: "Notice Submitted", description: "Your landlord has been notified by email." });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Submission Failed", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!newInspectionDate || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await extEOTApi.requestReschedule(newInspectionDate);
      if (res.data) {
        setEot(res.data);
        toast({ title: "Reschedule Requested", description: "Your landlord has been notified of your preferred date." });
        setIsRescheduling(false);
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Request Failed", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAgreeDamage = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await extEOTApi.agreeToRepairCost();
      if (res.data) {
        setEot(res.data);
        toast({ title: "Agreement Recorded", description: "Your landlord will now arrange the deposit refund." });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDepositRefund = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await extEOTApi.confirmDepositRefund();
      if (res.data) {
        setEot(res.data);
        toast({ title: "Tenancy Complete!", description: "Thank you — please leave a review below." });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (landlordRating === 0 || propertyRating === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await extEOTApi.submitReview({
        landlord_rating: landlordRating,
        landlord_review: landlordReview || undefined,
        property_rating: propertyRating,
        property_review: propertyReview || undefined,
      });
      if (res.data) {
        setEot(res.data);
        toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Submission Failed", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  const status: EOTStatus | null = eot?.status ?? null;
  const activeIdx = stepIndex(status);

  // Whether the landlord has completed inspection but damage is awaiting tenant agreement
  const damageAwaitingAgreement =
    status === "INSPECTION_SET" &&
    eot?.damage_reported &&
    !eot?.tenant_agreed_damage;

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            End of Tenancy
          </h1>
          {eot?.property_address && (
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-emerald-500" />
              {eot.property_address}
              {eot.postcode ? `, ${eot.postcode}` : ""}
            </p>
          )}
        </div>
        {status && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border border-emerald-100 dark:border-emerald-800">
            {status === "COMPLETED" ? "Tenancy Ended" : "Notice Active"}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left column ── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Notice form (no active EOT) */}
          {!eot && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold">Notice to Vacate</h3>
                </div>
                <p className="text-sm text-gray-500">
                  Submitting this notice will email your landlord with the details and
                  a link to acknowledge and arrange an exit inspection.
                </p>
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
                        value={moveOutDate}
                        onChange={handleDateChange}
                        className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3 pl-10 text-sm outline-none focus:border-emerald-400"
                      />
                    </div>
                    {dateError && (
                      <p className="text-red-500 text-xs font-bold">{dateError}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-600 dark:text-gray-400">
                      Reason (Optional)
                    </label>
                    <textarea
                      placeholder="e.g. Relocating for work"
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm h-[46px] resize-none outline-none focus:border-emerald-400"
                      value={noticeReason}
                      onChange={(e) => setNoticeReason(e.target.value)}
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-end">
                  <button
                    onClick={handleSubmitNotice}
                    disabled={!moveOutDate || !!dateError || isSubmitting}
                    className="w-full sm:w-auto bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-10 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-30 transition-opacity"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Submit Notice <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notice active banner */}
          {eot && status !== "COMPLETED" && (
            <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center bg-gray-50/50 dark:bg-gray-900/20">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold">Notice Active</h2>
              <p className="text-gray-500 text-sm mt-1">
                Scheduled move-out:{" "}
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {formatDate(eot.move_out_date)}
                </span>
              </p>
              {eot.notice_reason && (
                <p className="text-gray-400 text-xs mt-1">Reason: {eot.notice_reason}</p>
              )}
            </div>
          )}

          {/* Inspection panel */}
          {eot && status !== "COMPLETED" && status !== "DEPOSIT_REFUND" && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">Exit Inspection</h3>
                  <p className="text-sm text-gray-500">
                    {eot.inspection_date
                      ? `Scheduled for ${formatDate(eot.inspection_date)}`
                      : "Awaiting landlord to set a date"}
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-widest font-black text-gray-400 border px-2 py-0.5 rounded-full">
                  {eot.inspection_completed_at ? "done" : eot.inspection_date ? "scheduled" : "pending"}
                </span>
              </div>

              {/* Reschedule request sent banner */}
              {eot.reschedule_requested && !isRescheduling && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    Reschedule request sent to landlord for{" "}
                    <strong>{formatDate(eot.reschedule_requested_date)}</strong>.
                    Awaiting confirmation.
                  </p>
                </div>
              )}

              {/* Reschedule form */}
              {isRescheduling ? (
                <div className="flex flex-col sm:flex-row gap-3 items-end animate-in fade-in slide-in-from-top-2">
                  <div className="w-full space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">
                      Preferred New Date
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
                      disabled={isSubmitting || !newInspectionDate}
                      className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-2 rounded-lg disabled:opacity-40"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
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
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {eot.inspection_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> {formatDate(eot.inspection_date)}
                    </div>
                  )}
                  {eot.landlord_name && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" /> {eot.landlord_name}
                    </div>
                  )}
                </div>
              )}

              {status !== "NOTICE_SENT" && !isRescheduling && !eot.inspection_completed_at && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsRescheduling(true)}
                    className="px-5 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-bold hover:shadow-sm transition-shadow"
                  >
                    Request Reschedule
                  </button>
                </div>
              )}

              {/* Landlord notes */}
              {eot.landlord_notes && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
                  <p className="text-xs font-bold uppercase text-blue-500 mb-1">
                    Note from Landlord
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    {eot.landlord_notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Damage & Quotation panel (shown when damage has been reported and tenant hasn't agreed yet) ── */}
          {damageAwaitingAgreement && (
            <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Damage Reported
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Your landlord has reported damage during the exit inspection and attached a repair
                    quotation. Please review the details below and agree to proceed.
                  </p>
                </div>
              </div>

              {/* Damage details */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 space-y-4">
                {eot.damage_description && (
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400 mb-1">Damage Description</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{eot.damage_description}</p>
                  </div>
                )}
                {eot.repair_contractor_name && (
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400 mb-1">Quoted by</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{eot.repair_contractor_name}</p>
                  </div>
                )}
                {eot.repair_quotation_url && (
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400 mb-1">Quotation Document</p>
                    <a
                      href={eot.repair_quotation_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      {eot.repair_quotation_filename || "View Quotation"}{" "}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Deposit breakdown */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800/50 px-5 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-bold uppercase text-gray-500">Deposit Breakdown</p>
                </div>
                <div className="p-5 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Original Deposit</span>
                    <span className="font-bold">{fmt(eot.deposit_amount)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Repair Deduction</span>
                    <span className="font-bold">- {fmt(eot.deposit_deduction)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700 text-base font-bold">
                    <span>You Will Receive</span>
                    <span className="text-emerald-600">{fmt(eot.deposit_refund_amount)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300">
                By clicking agree, you confirm that you accept the repair cost deduction of{" "}
                <strong>{fmt(eot.deposit_deduction)}</strong> from your deposit. Your landlord
                will then arrange to refund the remaining <strong>{fmt(eot.deposit_refund_amount)}</strong>.
              </div>

              <button
                onClick={handleAgreeDamage}
                disabled={isSubmitting}
                className="w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-30"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" /> I Agree to the Repair Deduction
                  </>
                )}
              </button>
            </div>
          )}

          {/* ── Deposit Refund panel ── */}
          {status === "DEPOSIT_REFUND" && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex-shrink-0">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Deposit Refund
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    The exit inspection is complete. Once you have received your deposit refund,
                    confirm below to finalise your tenancy.
                  </p>
                </div>
              </div>

              {/* Deposit summary */}
              {eot.deposit_amount !== null && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800/50 px-5 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-bold uppercase text-gray-500">Deposit Summary</p>
                  </div>
                  <div className="p-5 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Original Deposit</span>
                      <span className="font-bold">{fmt(eot.deposit_amount)}</span>
                    </div>
                    {eot.damage_reported && eot.tenant_agreed_damage && (
                      <div className="flex justify-between text-red-600">
                        <span>Agreed Repair Deduction</span>
                        <span className="font-bold">- {fmt(eot.deposit_deduction)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700 text-base font-bold">
                      <span>Refund Amount</span>
                      <span className="text-emerald-600">{fmt(eot.deposit_refund_amount ?? eot.deposit_amount)}</span>
                    </div>
                  </div>
                </div>
              )}

              {eot.damage_reported && eot.tenant_agreed_damage && eot.repair_quotation_url && (
                <div className="text-sm">
                  <p className="text-xs font-bold uppercase text-gray-400 mb-1">Quotation Reference</p>
                  <a
                    href={eot.repair_quotation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {eot.repair_quotation_filename || "View Quotation"}{" "}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-300">
                Only confirm once you have physically received your deposit refund. This will
                complete the tenancy process and unlock your review.
              </div>

              <button
                onClick={handleConfirmDepositRefund}
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-30 transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> I Have Received My Deposit Refund
                  </>
                )}
              </button>
            </div>
          )}

          {/* ── Review section ── */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-6">End of Tenancy Review</h3>

            {status === "COMPLETED" && !eot?.review_submitted ? (
              <div className="space-y-8">
                <p className="text-sm text-gray-500">
                  Share your experience. If your landlord signs up to Homed and lists
                  this property, your review will be linked to their profile.
                </p>

                {/* Landlord rating */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                    Landlord / Agent
                  </h4>
                  <StarRating
                    rating={landlordRating}
                    setRating={setLandlordRating}
                    label="How would you rate your landlord?"
                  />
                  <textarea
                    placeholder="Comment on your experience with the landlord or agent…"
                    className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm resize-none outline-none focus:border-emerald-400"
                    rows={3}
                    value={landlordReview}
                    onChange={(e) => setLandlordReview(e.target.value)}
                  />
                </div>

                {/* Property rating */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">Property</h4>
                  <StarRating
                    rating={propertyRating}
                    setRating={setPropertyRating}
                    label="How would you rate the property?"
                  />
                  <textarea
                    placeholder="Comment on the property condition, location, amenities…"
                    className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm resize-none outline-none focus:border-emerald-400"
                    rows={3}
                    value={propertyReview}
                    onChange={(e) => setPropertyReview(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleReviewSubmit}
                  disabled={isSubmitting || landlordRating === 0 || propertyRating === 0}
                  className="w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-30"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </div>
            ) : status === "COMPLETED" && eot?.review_submitted ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">
                      Review submitted
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                      Thank you for your feedback!
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-bold mb-1">Landlord</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${s <= (eot.landlord_rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                        />
                      ))}
                    </div>
                    {eot.landlord_review && (
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{eot.landlord_review}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-bold mb-1">Property</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${s <= (eot.property_rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                        />
                      ))}
                    </div>
                    {eot.property_review && (
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{eot.property_review}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 text-center flex flex-col items-center">
                <AlertCircle className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm italic max-w-xs">
                  Review unlocks once you confirm receipt of your deposit refund.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right column: tracker + ticket info ── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Process tracker */}
          {eot && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sticky top-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
                Process Tracker
              </h3>
              <div className="space-y-8 relative">
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-800" />
                {STEPS.map((step, idx) => {
                  const isCompleted = activeIdx !== -1 && idx <= activeIdx;
                  const isActive = idx === activeIdx;
                  return (
                    <div key={step.key} className="flex items-center gap-4 relative z-10">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-emerald-500 shadow-lg shadow-emerald-500/20"
                            : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-3 h-3 text-white" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-600" />
                        )}
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          isCompleted
                            ? "text-gray-900 dark:text-gray-100"
                            : "text-gray-400"
                        }`}
                      >
                        {step.label}
                        {isActive && step.key === "INSPECTION_SET" && damageAwaitingAgreement && (
                          <span className="ml-2 text-xs text-red-500 font-normal">
                            — action needed
                          </span>
                        )}
                        {isActive && step.key === "DEPOSIT_REFUND" && (
                          <span className="ml-2 text-xs text-amber-500 font-normal">
                            — confirm refund
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ticket info */}
          {eot && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-3 text-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Reference
              </h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Ticket</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-gray-100 text-xs">
                    {eot.ticket_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Notice Submitted</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {formatDate(eot.notice_submitted_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Move-Out Date</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {formatDate(eot.move_out_date)}
                  </span>
                </div>
                {eot.inspection_date && (
                  <div className="flex justify-between">
                    <span>Inspection</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {formatDate(eot.inspection_date)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Completed state card */}
          {status === "COMPLETED" && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 text-center space-y-2">
              <Home className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                Tenancy Complete
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Completed on {formatDate(eot?.completed_at ?? null)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExternalTenantTenancy;
