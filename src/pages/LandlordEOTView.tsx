import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2, Clock, AlertTriangle, MapPin, Calendar,
  User, Loader2, XCircle, ArrowRight, Home, Check,
  Banknote, Upload, X, FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { landlordEOTApi, type EOTRecord, type EOTStatus } from '@/services/externalTenantEOTApi';

// ── Status display config ─────────────────────────────────────────────────────

const statusConfig: Record<EOTStatus, { label: string; color: string; bg: string; Icon: any }> = {
  NOTICE_SENT: {
    label: 'Notice Received',
    color: 'text-orange-700',
    bg: 'bg-orange-50 border-orange-200',
    Icon: AlertTriangle,
  },
  ACKNOWLEDGED: {
    label: 'Acknowledged',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    Icon: Clock,
  },
  INSPECTION_SET: {
    label: 'Inspection Scheduled',
    color: 'text-purple-700',
    bg: 'bg-purple-50 border-purple-200',
    Icon: Calendar,
  },
  DEPOSIT_REFUND: {
    label: 'Awaiting Deposit Refund',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50 border-indigo-200',
    Icon: Banknote,
  },
  COMPLETED: {
    label: 'Completed',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    Icon: CheckCircle2,
  },
};

const STEPS: { key: EOTStatus; label: string }[] = [
  { key: 'NOTICE_SENT', label: 'Notice Received' },
  { key: 'ACKNOWLEDGED', label: 'Acknowledged' },
  { key: 'INSPECTION_SET', label: 'Inspection' },
  { key: 'DEPOSIT_REFUND', label: 'Deposit Refund' },
  { key: 'COMPLETED', label: 'Completed' },
];

const stepIndex = (s: EOTStatus) => STEPS.findIndex((step) => step.key === s);

const fmt = (n: number | null | undefined) =>
  n !== null && n !== undefined ? `£${Number(n).toFixed(2)}` : '—';

// ── Component ─────────────────────────────────────────────────────────────────

export default function LandlordEOTView() {
  const { token } = useParams<{ token: string }>();
  const [eot, setEot] = useState<EOTRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [actionDone, setActionDone] = useState(false);

  // Inspection date form
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('');

  // Complete inspection form
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [hasDamage, setHasDamage] = useState(false);
  const [damageDescription, setDamageDescription] = useState('');
  const [contractorName, setContractorName] = useState('');
  const [repairCost, setRepairCost] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [quotationFile, setQuotationFile] = useState<File | null>(null);
  const [quotationUrl, setQuotationUrl] = useState('');
  const [quotationFilename, setQuotationFilename] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [completeNotes, setCompleteNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid link. No access token found.');
      setLoading(false);
      return;
    }
    landlordEOTApi
      .getEOT(token)
      .then((res) => {
        if (res.data) setEot(res.data);
        else setError('Record not found.');
      })
      .catch((err) => setError(err.message || 'Could not load details.'))
      .finally(() => setLoading(false));
  }, [token]);

  // ── Derived values ──────────────────────────────────────────────────────────

  const repairCostNum = parseFloat(repairCost) || 0;
  const depositAmountNum = parseFloat(depositAmount) || 0;
  const deduction = hasDamage && depositAmountNum && repairCostNum
    ? Math.min(repairCostNum, depositAmountNum)
    : 0;
  const refundAmount = depositAmountNum ? depositAmountNum - deduction : 0;

  // ── Action handlers ──────────────────────────────────────────────────────────

  const handleAcknowledge = async () => {
    if (!token) return;
    setUpdating(true);
    try {
      const res = await landlordEOTApi.acknowledge(token);
      if (res.data) {
        setEot(res.data);
        toast.success('Notice acknowledged. The tenant has been notified.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not acknowledge. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSetInspection = async () => {
    if (!token || !inspectionDate) return;
    setUpdating(true);
    try {
      const res = await landlordEOTApi.setInspection(token, inspectionDate, inspectionNotes || undefined);
      if (res.data) {
        setEot(res.data);
        setShowInspectionForm(false);
        toast.success('Inspection date set. The tenant has been notified.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not set inspection date. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!token) return;
    setQuotationFile(file);
    setUploadingFile(true);
    try {
      const res = await landlordEOTApi.uploadQuotation(token, file);
      if (res.data) {
        setQuotationUrl(res.data.quotation_url);
        setQuotationFilename(res.data.quotation_filename);
        toast.success('Quotation uploaded.');
      }
    } catch (err: any) {
      toast.error(err.message || 'File upload failed. Please try again.');
      setQuotationFile(null);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCompleteInspection = async () => {
    if (!token) return;
    if (hasDamage && (!damageDescription || !repairCost || !depositAmount)) {
      toast.error('Please fill in all damage details before submitting.');
      return;
    }
    setUpdating(true);
    try {
      const res = await landlordEOTApi.completeInspection(token, {
        damage_reported: hasDamage,
        damage_description: hasDamage ? damageDescription : undefined,
        repair_contractor_name: hasDamage ? contractorName || undefined : undefined,
        repair_cost: hasDamage ? repairCostNum : undefined,
        deposit_amount: depositAmountNum || undefined,
        quotation_url: hasDamage ? quotationUrl || undefined : undefined,
        quotation_filename: hasDamage ? quotationFilename || undefined : undefined,
        notes: completeNotes || undefined,
      });
      if (res.data) {
        setEot(res.data);
        setShowCompleteForm(false);
        setActionDone(true);
        if (hasDamage) {
          toast.success('Damage report sent to tenant for review.');
        } else {
          toast.success('Inspection complete. Tenant notified to confirm deposit refund.');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not complete inspection. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // ── Loading / error states ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-gray-500 text-sm">Loading end of tenancy details…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Link not found</h2>
          <p className="text-gray-500 text-sm">{error}</p>
          <p className="text-gray-400 text-xs">
            This link may be invalid or expired. Please check your email for the correct link.
          </p>
        </div>
      </div>
    );
  }

  if (!eot) return null;

  const status = eot.status;
  const cfg = statusConfig[status];
  const StatusIcon = cfg.Icon;
  const activeIdx = stepIndex(status);

  const formatDate = (iso: string | null) => {
    if (!iso) return 'TBD';
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top bar ── */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Homed</span>
          </div>
          <Link
            to="/register"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Create an account <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">End of Tenancy Notice</h1>
          <p className="text-gray-500 text-sm mt-1">
            Ticket <span className="font-medium text-gray-700">#{eot.ticket_number}</span>
          </p>
        </div>

        {/* Action done banner */}
        {actionDone && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-emerald-800 text-sm">Inspection marked as complete</p>
              <p className="text-emerald-700 text-xs mt-0.5">
                {eot.damage_reported
                  ? 'Damage report has been sent to the tenant for review.'
                  : 'The tenant has been notified to confirm their deposit refund.'}
              </p>
            </div>
          </div>
        )}

        {/* Reschedule request banner */}
        {eot.reschedule_pending && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 text-sm">Tenant has requested a reschedule</p>
              <p className="text-amber-700 text-xs mt-0.5">
                Preferred date:{' '}
                <strong>{formatDate(eot.reschedule_requested_date)}</strong>. Please update
                the inspection date below.
              </p>
            </div>
          </div>
        )}

        {/* Status badge */}
        <div className={`border rounded-xl p-4 flex items-center gap-3 ${cfg.bg}`}>
          <StatusIcon className={`w-5 h-5 ${cfg.color} flex-shrink-0`} />
          <div>
            <p className={`font-semibold text-sm ${cfg.color}`}>Status: {cfg.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Notice submitted on {formatDate(eot.notice_submitted_at)}
            </p>
          </div>
        </div>

        {/* Process tracker */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-700 text-sm mb-4">Process Overview</h2>
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-3 h-0.5 bg-gray-100 mx-8" />
            {STEPS.map((step, idx) => {
              const done = idx <= activeIdx;
              return (
                <div key={step.key} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      done ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white border-2 border-gray-200 text-gray-400'
                    }`}
                  >
                    {done ? <Check className="w-3 h-3" /> : idx + 1}
                  </div>
                  <span className={`text-[10px] font-semibold text-center leading-tight ${done ? 'text-gray-700' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Details card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
              <Home className="w-4 h-4 text-gray-400" />
              Tenancy Details
            </h2>
          </div>
          <div className="px-5 py-4 space-y-3">
            {eot.property_address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">Property</p>
                  <p className="text-sm text-gray-800 font-medium">
                    {eot.property_address}{eot.postcode ? `, ${eot.postcode}` : ''}
                  </p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {eot.tenant_name && (
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Tenant</p>
                    <p className="text-sm text-gray-800 font-medium">{eot.tenant_name}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Move-Out Date</p>
                  <p className="text-sm text-gray-800 font-medium">{formatDate(eot.move_out_date)}</p>
                </div>
              </div>
              {eot.inspection_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Exit Inspection</p>
                    <p className="text-sm text-gray-800 font-medium">{formatDate(eot.inspection_date)}</p>
                  </div>
                </div>
              )}
            </div>
            {eot.notice_reason && (
              <div>
                <p className="text-xs text-gray-400">Reason for leaving</p>
                <p className="text-sm text-gray-700 mt-0.5">{eot.notice_reason}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Action panels ── */}

        {/* 1: Acknowledge */}
        {eot.can_acknowledge && !actionDone && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
            <h2 className="font-semibold text-gray-900 text-sm">Acknowledge Notice</h2>
            <p className="text-gray-500 text-sm">
              Confirm you have received the tenant's notice to vacate. This will notify the tenant.
            </p>
            <button
              onClick={handleAcknowledge}
              disabled={updating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-blue-200 bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
              Acknowledge Notice
            </button>
          </div>
        )}

        {/* 2: Set / update inspection date */}
        {eot.can_set_inspection && !actionDone && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 text-sm">
                {eot.inspection_date ? 'Update Inspection Date' : 'Set Exit Inspection Date'}
              </h2>
              {!showInspectionForm && (
                <button
                  onClick={() => setShowInspectionForm(true)}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  {eot.inspection_date ? 'Update' : 'Set date'}
                </button>
              )}
            </div>

            {!showInspectionForm ? (
              <p className="text-gray-500 text-sm">
                {eot.inspection_date
                  ? `Currently scheduled for ${formatDate(eot.inspection_date)}.`
                  : 'Schedule an exit inspection for the property.'}
              </p>
            ) : (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Inspection Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Notes (optional)</label>
                  <textarea
                    placeholder="e.g. Please ensure all keys are ready"
                    rows={2}
                    value={inspectionNotes}
                    onChange={(e) => setInspectionNotes(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSetInspection}
                    disabled={updating || !inspectionDate}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Confirm Date
                  </button>
                  <button
                    onClick={() => setShowInspectionForm(false)}
                    className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3: Complete inspection (with optional damage reporting) */}
        {eot.can_complete_inspection && !actionDone && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 text-sm">Complete Inspection</h2>
              {!showCompleteForm && (
                <button
                  onClick={() => setShowCompleteForm(true)}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Complete now
                </button>
              )}
            </div>

            {!showCompleteForm ? (
              <p className="text-gray-500 text-sm">
                Once the inspection is done, mark it as complete. If there is any damage, you
                can attach a repair quotation and the system will calculate the deposit deduction.
              </p>
            ) : (
              <div className="space-y-5 animate-in fade-in slide-in-from-top-2">

                {/* Damage toggle */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase">Was damage found?</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setHasDamage(false)}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors ${
                        !hasDamage
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      No Damage
                    </button>
                    <button
                      onClick={() => setHasDamage(true)}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors ${
                        hasDamage
                          ? 'border-red-400 bg-red-50 text-red-700'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      Damage Found
                    </button>
                  </div>
                </div>

                {/* Damage details section */}
                {hasDamage && (
                  <div className="space-y-4 border border-red-100 bg-red-50/30 rounded-xl p-4">
                    <p className="text-xs font-bold text-red-600 uppercase">Damage & Quotation Details</p>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase">Damage Description *</label>
                      <textarea
                        placeholder="Describe the damage found during inspection…"
                        rows={3}
                        value={damageDescription}
                        onChange={(e) => setDamageDescription(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none outline-none focus:border-red-400 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase">Contractor / Repairer Name</label>
                      <input
                        type="text"
                        placeholder="e.g. John Smith Plumbing, ABC Electricals"
                        value={contractorName}
                        onChange={(e) => setContractorName(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-red-400 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">Repair Cost (£) *</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={repairCost}
                          onChange={(e) => setRepairCost(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-red-400 bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">Tenant Deposit (£) *</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-red-400 bg-white"
                        />
                      </div>
                    </div>

                    {/* Live deposit calculation */}
                    {depositAmountNum > 0 && repairCostNum > 0 && (
                      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                          <p className="text-xs font-bold uppercase text-gray-500">Calculated Refund</p>
                        </div>
                        <div className="p-4 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Deposit</span>
                            <span className="font-semibold">{fmt(depositAmountNum)}</span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>Deduction</span>
                            <span className="font-semibold">- {fmt(deduction)}</span>
                          </div>
                          <div className="flex justify-between font-bold pt-2 border-t border-gray-100">
                            <span>Tenant Refund</span>
                            <span className="text-emerald-600">{fmt(refundAmount)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quotation upload */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">
                        Attach Quotation Document
                      </label>
                      {quotationFile ? (
                        <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-3 bg-white">
                          {uploadingFile ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400 flex-shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          )}
                          <span className="text-sm text-gray-700 flex-1 truncate">{quotationFile.name}</span>
                          {!uploadingFile && (
                            <button
                              onClick={() => {
                                setQuotationFile(null);
                                setQuotationUrl('');
                                setQuotationFilename('');
                              }}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center justify-center gap-2 text-sm text-gray-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          Upload quotation (PDF, image, etc.)
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file);
                        }}
                      />
                      <p className="text-xs text-gray-400">
                        PDF or image recommended. This will be visible to the tenant.
                      </p>
                    </div>
                  </div>
                )}

                {/* Deposit amount for no-damage case */}
                {!hasDamage && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Tenant Deposit Amount (£)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter the deposit amount to be refunded in full"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-emerald-400"
                    />
                    <p className="text-xs text-gray-400">
                      Optional but recommended — helps the tenant see the expected refund amount.
                    </p>
                  </div>
                )}

                {/* Optional notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Notes (optional)</label>
                  <textarea
                    placeholder="Any additional notes for the tenant…"
                    rows={2}
                    value={completeNotes}
                    onChange={(e) => setCompleteNotes(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCompleteInspection}
                    disabled={updating || uploadingFile || (hasDamage && (!damageDescription || !repairCost || !depositAmount))}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 ${
                      hasDamage
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {updating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : hasDamage ? (
                      <><AlertTriangle className="w-4 h-4" /> Submit Damage Report</>
                    ) : (
                      <><Check className="w-4 h-4" /> Inspection Complete — No Damage</>
                    )}
                  </button>
                  <button
                    onClick={() => setShowCompleteForm(false)}
                    className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Deposit refund status (read-only for landlord) */}
        {(status === 'DEPOSIT_REFUND' || status === 'COMPLETED') && eot.damage_reported && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
            <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Damage Report Submitted
            </h2>
            <div className="text-sm space-y-2 text-gray-600">
              {eot.damage_description && <p>{eot.damage_description}</p>}
              <div className="flex gap-6 text-xs font-semibold">
                <span>Repair cost: <span className="text-gray-900">{fmt(eot.repair_cost)}</span></span>
                <span>Deduction: <span className="text-red-600">{fmt(eot.deposit_deduction)}</span></span>
                <span>Refund: <span className="text-emerald-600">{fmt(eot.deposit_refund_amount)}</span></span>
              </div>
              {eot.tenant_agreed_damage && (
                <div className="flex items-center gap-2 text-emerald-700 font-medium text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Tenant has agreed to the deduction
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sign-up CTA */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <Home className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="font-bold text-gray-900">Manage all your properties with Homed</h3>
          <p className="text-gray-600 text-sm">
            Join Homed to manage tenancies, track maintenance requests, view tenant reviews, and
            organise your portfolio — all in one place. Listing a property links any existing
            tenant reviews to your profile automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors"
            >
              Create a Free Account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
