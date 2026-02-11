import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import PropertyDetailsStep from '@/components/TenantVerification/PropertyDetailsStep';
import LandlordDetailsStep from '@/components/TenantVerification/LandlordDetailsStep';
import TenancyDetailsStep from '@/components/TenantVerification/TenancyDetailsStep';
import { TenantVerificationData } from '@/types/tenant-verification';
import { tenantVerificationApi } from '@/services/tenantVerificationApi';
import { toast } from 'sonner';

const ExternalTenantForm = () => {
  const navigate = useNavigate();
  const { loading, hasAccess } = useAuthGuard();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<TenantVerificationData>({
    verificationMethod: 'manual',
    tenantFullName: '',
    propertyAddress: '',
    propertyCode: '',
    agentLandlordName: '',
    agentLandlordEmail: '',
    agentLandlordPhone: '',
    moveInDate: undefined,
    tenancyLengthMonths: undefined,
    monthlyRent: undefined,
    securityDeposit: undefined,
    tenancyProof: null
  });

  if (loading || !hasAccess) {
    return <div>Loading...</div>;
  }

  const steps = [
    { number: 1, title: 'Property Details', description: 'Tell us about your property' },
    { number: 2, title: 'Landlord/Agent Info', description: 'Your landlord or agent details' },
    { number: 3, title: 'Tenancy Details', description: 'Tenancy terms and documents' }
  ];

  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/tenant-onboarding');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await tenantVerificationApi.submitVerificationRequest(formData);
      
      if (result.success) {
        toast.success('Your tenancy details have been submitted successfully!');
        navigate('/external-tenant-dashboard');
      } else {
        toast.error(result.error || 'Failed to submit tenancy details');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit tenancy details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (updates: Partial<TenantVerificationData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PropertyDetailsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <LandlordDetailsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <TenancyDetailsStep
            formData={formData}
            updateFormData={updateFormData}
            onSubmit={handleSubmit}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Tell Us About Your Tenancy
            </h1>
            <p className="text-muted-foreground">
              We need some information to set up your account and connect you with the right support
            </p>
          </div>

          {/* Progress Indicator */}
          <Card className="p-6 mb-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">
                  Step {currentStep} of {steps.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="grid grid-cols-3 gap-4">
                {steps.map((step) => (
                  <div 
                    key={step.number}
                    className={`text-center p-3 rounded-lg transition-colors ${
                      step.number === currentStep 
                        ? 'bg-primary/10 border border-primary/20' 
                        : step.number < currentStep 
                        ? 'bg-muted/50' 
                        : 'bg-muted/20'
                    }`}
                  >
                    <div className={`text-sm font-medium ${
                      step.number === currentStep 
                        ? 'text-primary' 
                        : step.number < currentStep 
                        ? 'text-foreground' 
                        : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Current Step Content */}
          {renderCurrentStep()}
        </div>
      </div>
    </Layout>
  );
};

export default ExternalTenantForm;