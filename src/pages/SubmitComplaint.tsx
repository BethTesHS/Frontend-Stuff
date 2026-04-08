import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { playNotificationSound } from '@/hooks/useNotificationSound';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  AlertTriangle,
  Droplets,
  Zap,
  Thermometer,
  Home,
  Bug,
  Shield,
  Settings,
  Volume2,
  HelpCircle,
  Clock,
  AlertCircle,
  Flame,
  CheckCircle,
  Loader2
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { complaintsApi } from '@/services/complaintsApi';
import { externalTenantComplaintsApi } from '@/services/externalTenantComplaintsApi';
import { externalTenantApi } from '@/services/api';

// Sub-components
import { DetailsStep } from '@/components/ExternalTenant/ComplaintFormSubComponents/DetailsStep';
import { ReviewStep } from '@/components/ExternalTenant/ComplaintFormSubComponents/ReviewStep';
import { SubmitStep } from '@/components/ExternalTenant/ComplaintFormSubComponents/SubmitStep';

interface SubmitComplaintProps {
  isOpen?: boolean;
  onClose?: () => void;
  isExternalTenant?: boolean;
}

const SubmitComplaint = ({ isOpen, onClose, isExternalTenant = false }: SubmitComplaintProps) => {
  const { loading: authLoading, hasAccess } = useAuthGuard(['tenant'], true);
  const { refreshUnreadCount } = useNotifications();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [formData, setFormData] = useState({
    tenantName: '',
    tenantEmail: '',
    houseNumber: '',
    issueType: '',
    description: '',
    urgency: 'medium',
    attachments: [] as File[],
  });

  const issueTypes = [
    { value: 'Plumbing Issues', icon: Droplets, color: 'text-blue-500' },
    { value: 'Electrical Problems', icon: Zap, color: 'text-yellow-500' },
    { value: 'Heating/Cooling', icon: Thermometer, color: 'text-red-500' },
    { value: 'Structural Issues', icon: Home, color: 'text-gray-500' },
    { value: 'Pest Control', icon: Bug, color: 'text-green-500' },
    { value: 'Security Issues', icon: Shield, color: 'text-purple-500' },
    { value: 'Appliance Malfunction', icon: Settings, color: 'text-orange-500' },
    { value: 'Noise Complaints', icon: Volume2, color: 'text-pink-500' },
    { value: 'Other', icon: HelpCircle, color: 'text-emerald-500' },
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low Priority', icon: Clock, color: 'text-green-600', description: 'Can wait a few days' },
    { value: 'medium', label: 'Medium Priority', icon: AlertCircle, color: 'text-yellow-600', description: 'Should be addressed soon' },
    { value: 'high', label: 'High Priority', icon: AlertTriangle, color: 'text-orange-600', description: 'Needs immediate attention' },
    { value: 'urgent', label: 'Urgent', icon: Flame, color: 'text-red-600', description: 'Emergency situation' },
  ];

  // Fetch profile data to pre-fill the form when modal opens
  useEffect(() => {
    if (!isExternalTenant || !isOpen) return;

    const prefillFromProfile = async () => {
      try {
        const res = await externalTenantApi.getProfile();
        if (res.data?.external_tenant_profile) {
          const profile = res.data.external_tenant_profile;
          const addr = profile.property_address || '';
          // Extract house number from address (first number or whole address if short)
          const houseNumMatch = addr.match(/^(\d+[a-zA-Z]?)/);
          const houseNumber = houseNumMatch ? houseNumMatch[1] : addr;

          setFormData(prev => ({
            ...prev,
            tenantName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
            tenantEmail: user?.email || '',
            houseNumber,
          }));
          setProfileLoaded(true);
        }
      } catch {
        // Profile fetch failed — user will fill in manually
      }
    };

    prefillFromProfile();
  }, [isExternalTenant, isOpen]);

  const handleFilesAdd = (newFiles: File[]) => {
    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...newFiles] }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const missingBasic = !profileLoaded && (!formData.tenantName || !formData.tenantEmail || !formData.houseNumber);
      if (missingBasic || !formData.issueType || !formData.description) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let complaintId: number | undefined;
      let ticket: string = '';

      if (isExternalTenant) {
        const response = await externalTenantComplaintsApi.submitComplaint({
          issue_type: formData.issueType,
          description: formData.description,
          urgency: formData.urgency,
        });

        if (response.data) {
          ticket = response.data.ticket_number;
          complaintId = response.data.complaint?.id;
        }

        // Upload all attachments (images + videos)
        if (complaintId && formData.attachments.length > 0) {
          for (const file of formData.attachments) {
            try {
              await externalTenantComplaintsApi.uploadComplaintFile(complaintId, file);
            } catch (uploadErr) {
              console.error('Failed to upload attachment:', uploadErr);
            }
          }
        }
      } else {
        const response = await complaintsApi.createComplaint({
          tenantName: formData.tenantName,
          tenantEmail: formData.tenantEmail,
          houseNumber: formData.houseNumber,
          issueType: formData.issueType,
          description: formData.description,
          urgency: formData.urgency,
        });

        if (response.data) {
          ticket = (response.data as any).ticket_number ?? '';
          complaintId = (response.data as any).id;
        }

        if (complaintId && formData.attachments.length > 0) {
          try {
            await complaintsApi.uploadComplaintImage(complaintId, formData.attachments[0]);
          } catch (imageError) {
            console.error('Failed to upload image:', imageError);
          }
        }
      }

      if (ticket) {
        setTicketNumber(ticket);

        // Play notification sound and show orange banner at top
        playNotificationSound();
        toast.warning(`Ticket ${ticket} opened — complaint sent successfully.`, {
          position: 'top-right',
          duration: 6000,
          description: 'Our team will review your complaint within 24 hours.',
        });

        // Refresh unread count so the bell badge updates immediately
        refreshUnreadCount();

        setShowSuccessDialog(true);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit complaint.');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedUrgencyLevel = () => urgencyLevels.find(l => l.value === formData.urgency);
  const getSelectedIssueType = () => issueTypes.find(t => t.value === formData.issueType);

  if (authLoading || !hasAccess) return null;

  const progressPercentage = (currentStep / 3) * 100;

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => !loading && !open && onClose()}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none bg-white dark:bg-slate-950">
          {/* Minimalist Header styled like ListProperty */}
          <DialogHeader className="p-6 border-b sticky top-0 z-50 bg-white dark:bg-slate-950 dark:border-slate-800">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center transition-colors">
                <AlertTriangle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-foreground">
                  Submit Complaint
                </DialogTitle>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-muted-foreground">
                    Step {currentStep} of 3: {currentStep === 1 ? 'Details' : currentStep === 2 ? 'Review' : 'Finalize'}
                  </p>
                  <span className="text-xs font-medium text-emerald-600">{Math.round(progressPercentage)}% Complete</span>
                </div>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-1.5 mt-4 bg-emerald-100 dark:bg-emerald-900/40" />
          </DialogHeader>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white dark:bg-slate-950">
            <form onSubmit={handleSubmit} className="space-y-8">
              {currentStep === 1 && (
                <DetailsStep
                  formData={formData}
                  setFormData={setFormData}
                  issueTypes={issueTypes}
                  urgencyLevels={urgencyLevels}
                  attachments={formData.attachments}
                  handleFilesAdd={handleFilesAdd}
                  removeAttachment={removeAttachment}
                  profileLoaded={profileLoaded}
                />
              )}
              {currentStep === 2 && (
                <ReviewStep
                  formData={formData}
                  attachments={formData.attachments}
                  getSelectedIssueType={getSelectedIssueType}
                  getSelectedUrgencyLevel={getSelectedUrgencyLevel}
                />
              )}
              {currentStep === 3 && <SubmitStep />}

              {/* Action Buttons */}
              <div className="pt-6 border-t dark:border-slate-800 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1 || loading}
                >
                  Previous
                </Button>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>

                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
                    >
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 shadow-lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Complaint'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center space-y-4 text-center p-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-xl font-bold">Complaint Submitted!</DialogTitle>
            <DialogDescription>
              Your ticket number is:
              <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-lg my-4 font-mono text-lg font-bold text-emerald-700 dark:text-emerald-400">
                {ticketNumber}
              </div>
              Our team will respond within 24 hours.
            </DialogDescription>
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                setCurrentStep(1);
                setFormData({ tenantName: '', tenantEmail: '', houseNumber: '', issueType: '', description: '', urgency: 'medium', attachments: [] });
                setProfileLoaded(false);
                onClose();
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              View My Complaints
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubmitComplaint;
