
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { CurrencyInput } from '@/components/ui/currency-input';
import { toast } from 'sonner';
import { 
  Home, 
  User, 
  CheckCircle, 
  Upload, 
  MapPin, 
  Key,
  Shield,
  ArrowRight,
  ArrowLeft,
  Clock,
  Users,
  Calendar,
  PoundSterling
} from 'lucide-react';
import { TenantVerificationData, PinValidationResponse } from '@/types/tenant-verification';
import { tenantVerificationApi } from '@/services/tenantVerificationApi';
import { useEffect } from 'react';

interface TenantVerificationProps {
  onComplete: () => void;
  onBack?: () => void;
}

const TenantVerification = ({ onComplete, onBack }: TenantVerificationProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingRedirect, setCheckingRedirect] = useState(true);
  const [pinValidation, setPinValidation] = useState<PinValidationResponse | null>(null);
  const [formData, setFormData] = useState<TenantVerificationData>({
    verificationMethod: 'manual',
    tenantFullName: '',
    tenantEmail: '',
    tenantPhone: '',
    propertyAddress: '',
    propertyCode: '',
    agentLandlordName: '',
    agentLandlordEmail: '',
    agentLandlordPhone: '',
    monthlyRent: undefined,
    securityDeposit: undefined,
    tenancyLengthMonths: undefined,
    moveInDate: undefined,
    tenancyProof: null,
    agentPin: ''
  });

  // Check if user should be redirected to dashboard on component mount
  useEffect(() => {
    const checkShouldRedirect = async () => {
      try {
        const result = await tenantVerificationApi.shouldRedirectToDashboard();
        if (result.success && result.data?.should_redirect) {
          toast.success('Welcome back! You already have an active tenancy.');
          navigate('/tenant-dashboard');
          return;
        }
      } catch (error) {
        console.error('Error checking redirect status:', error);
      } finally {
        setCheckingRedirect(false);
      }
    };

    checkShouldRedirect();
  }, [navigate]);

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = async () => {
    if (currentStep === 2) {
      // Check claim status first
      setLoading(true);
      try {
        const checkData: { access_code?: string; pin_code?: string; full_address?: string } = {};
        
        if (formData.verificationMethod === 'pin' && formData.agentPin) {
          checkData.pin_code = formData.agentPin;
        } else if (formData.verificationMethod === 'manual') {
          if (formData.propertyCode) checkData.access_code = formData.propertyCode;
          if (formData.propertyAddress) checkData.full_address = formData.propertyAddress;
        }

        const claimStatus = await tenantVerificationApi.checkClaimStatus(checkData);
        
        if (claimStatus.success && claimStatus.data) {
          if (claimStatus.data.status === 'already_claimed') {
            toast.success('Welcome back! Redirecting to your dashboard...');
            setTimeout(() => {
              navigate('/tenant-dashboard');
            }, 1500);
            return;
          } else if (claimStatus.data.status === 'can_claim') {
            // For PIN method, continue to review
            if (formData.verificationMethod === 'pin') {
              setCurrentStep(5);
            } else {
              setCurrentStep(3); // Continue with manual verification
            }
          } else {
            toast.error('Property not found with provided credentials. Please check and try again.');
          }
        } else {
          toast.error(claimStatus.error || 'Failed to verify property details.');
        }
      } catch (error) {
        toast.error('Failed to verify property details. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (currentStep < totalSteps) {
      // Skip steps 3 and 4 if using PIN method
      if (formData.verificationMethod === 'pin' && (currentStep === 3 || currentStep === 4)) {
        setCurrentStep(5);
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // Handle back navigation for PIN method
      if (formData.verificationMethod === 'pin' && currentStep === 5) {
        setCurrentStep(2);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, tenancyProof: file });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await tenantVerificationApi.submitVerificationRequest(formData, pinValidation);
      
      if (result.success) {
        toast.success('Verification request submitted successfully!');
        setCurrentStep(currentStep + 1); // Move to success step
      } else {
        toast.error(result.error || 'Failed to submit verification. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to submit verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceedFromStep1 = formData.verificationMethod === 'pin' || formData.verificationMethod === 'manual';
  const canProceedFromStep2 = formData.verificationMethod === 'pin' 
    ? formData.agentPin?.trim() !== '' 
    : (formData.propertyAddress?.trim() !== '' || formData.propertyCode?.trim() !== '');
  const canProceedFromStep3 = formData.tenantFullName.trim() !== '' && 
    (formData.tenantEmail?.trim() !== '' || formData.tenantPhone?.trim() !== '') &&
    formData.agentLandlordName?.trim() !== '' &&
    (formData.agentLandlordEmail?.trim() !== '' || formData.agentLandlordPhone?.trim() !== '');
  const canProceedFromStep4 = formData.moveInDate && formData.tenancyLengthMonths && 
    formData.monthlyRent && formData.securityDeposit;

  // Show loading spinner while checking redirect status
  if (checkingRedirect) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-8 w-8 text-primary-600 animate-pulse" />
            <h1 className="text-2xl font-bold text-gray-900">Checking your status...</h1>
          </div>
          <p className="text-gray-600">
            Please wait while we verify your tenant status
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Shield className="h-8 w-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Tenant Verification</h1>
        </div>
        <p className="text-gray-600 max-w-lg mx-auto">
          Complete the verification process to connect with your rented property and access your tenant dashboard
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Step {currentStep > totalSteps ? totalSteps : currentStep} of {totalSteps}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <Card className="shadow-lg border-0 bg-white">
        {/* Step 1: Verification Method Selection */}
        {currentStep === 1 && (
          <>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <CardTitle className="text-xl">Choose Verification Method</CardTitle>
              <CardDescription>
                Select how you'd like to verify your tenancy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.verificationMethod === 'pin' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData({ ...formData, verificationMethod: 'pin' })}
                >
                  <div className="flex items-start space-x-3">
                    <Key className="h-6 w-6 text-primary-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Agent PIN</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Quick verification using a unique PIN provided by your agent or landlord
                      </p>
                      <Badge variant="secondary" className="mt-2">Recommended</Badge>
                    </div>
                  </div>
                </div>

                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.verificationMethod === 'manual' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData({ ...formData, verificationMethod: 'manual' })}
                >
                  <div className="flex items-start space-x-3">
                    <User className="h-6 w-6 text-primary-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Manual Entry</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Provide detailed information about your property and tenancy
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                {onBack && (
                  <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Tenancy Type
                  </Button>
                )}
                <Button 
                  onClick={handleNext}
                  disabled={!canProceedFromStep1}
                  className="flex items-center gap-2 ml-auto"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 2: Property/PIN Details */}
        {currentStep === 2 && (
          <>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                {formData.verificationMethod === 'pin' ? (
                  <Key className="h-6 w-6 text-primary-600" />
                ) : (
                  <Home className="h-6 w-6 text-primary-600" />
                )}
              </div>
              <CardTitle className="text-xl">
                {formData.verificationMethod === 'pin' ? 'Enter Agent PIN' : 'Property Details'}
              </CardTitle>
              <CardDescription>
                {formData.verificationMethod === 'pin' 
                  ? 'Enter the unique PIN provided by your agent or landlord'
                  : 'Provide one of the following to locate your rented property'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.verificationMethod === 'pin' ? (
                <div>
                  <Label htmlFor="agentPin" className="text-sm font-medium flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Agent/Landlord PIN
                  </Label>
                  <Input
                    id="agentPin"
                    placeholder="Enter your unique PIN code"
                    value={formData.agentPin}
                    onChange={(e) => setFormData({ ...formData, agentPin: e.target.value })}
                    className="mt-1 text-center text-lg font-mono tracking-wider"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This PIN was provided by your agent or landlord
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Full Property Address
                    </Label>
                    <Input
                      id="address"
                      placeholder="e.g., 12 King's Road, SW3 4NT, London"
                      value={formData.propertyAddress}
                      onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">OR</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="propertyCode" className="text-sm font-medium flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Unique Property Code
                    </Label>
                    <Input
                      id="propertyCode"
                      placeholder="e.g., HMD-12345"
                      value={formData.propertyCode}
                      onChange={(e) => setFormData({ ...formData, propertyCode: e.target.value })}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Provided by your landlord or agent
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={!canProceedFromStep2 || loading}
                  className="flex items-center gap-2"
                >
                  {loading ? 'Validating...' : 'Continue'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 3: Tenant & Agent Information (Skip if PIN) */}
        {currentStep === 3 && formData.verificationMethod === 'manual' && (
          <>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <CardTitle className="text-xl">Contact Information</CardTitle>
              <CardDescription>
                Provide your details and your agent/landlord's information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Your Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tenantFullName" className="text-sm font-medium">
                      Full Legal Name *
                    </Label>
                    <Input
                      id="tenantFullName"
                      placeholder="As shown in rental agreement"
                      value={formData.tenantFullName}
                      onChange={(e) => setFormData({ ...formData, tenantFullName: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tenantEmail" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="tenantEmail"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.tenantEmail}
                      onChange={(e) => setFormData({ ...formData, tenantEmail: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tenantPhone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="tenantPhone"
                    type="tel"
                    placeholder="+44 7XXX XXX XXX"
                    value={formData.tenantPhone}
                    onChange={(e) => setFormData({ ...formData, tenantPhone: e.target.value })}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Provide either email or phone number
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Agent/Landlord Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="agentLandlordName" className="text-sm font-medium">
                      Name *
                    </Label>
                    <Input
                      id="agentLandlordName"
                      placeholder="Agent or landlord name"
                      value={formData.agentLandlordName}
                      onChange={(e) => setFormData({ ...formData, agentLandlordName: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="agentLandlordEmail" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="agentLandlordEmail"
                      type="email"
                      placeholder="agent@example.com"
                      value={formData.agentLandlordEmail}
                      onChange={(e) => setFormData({ ...formData, agentLandlordEmail: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="agentLandlordPhone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="agentLandlordPhone"
                    type="tel"
                    placeholder="+44 20 XXXX XXXX"
                    value={formData.agentLandlordPhone}
                    onChange={(e) => setFormData({ ...formData, agentLandlordPhone: e.target.value })}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Provide either email or phone number
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={!canProceedFromStep3}
                  className="flex items-center gap-2"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 4: Tenancy Details (Skip if PIN) */}
        {currentStep === 4 && formData.verificationMethod === 'manual' && (
          <>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <CardTitle className="text-xl">Tenancy Details</CardTitle>
              <CardDescription>
                Provide information about your rental agreement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium">Move-in Date *</Label>
                  <DatePicker
                    date={formData.moveInDate}
                    onDateChange={(date) => setFormData({ ...formData, moveInDate: date })}
                    placeholder="Select move-in date"
                    className="mt-1 w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="tenancyLength" className="text-sm font-medium">
                    Tenancy Length (Months) *
                  </Label>
                  <Input
                    id="tenancyLength"
                    type="number"
                    min="1"
                    max="60"
                    placeholder="e.g., 12"
                    value={formData.tenancyLengthMonths || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      tenancyLengthMonths: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <PoundSterling className="h-4 w-4" />
                    Monthly Rent *
                  </Label>
                  <CurrencyInput
                    value={formData.monthlyRent}
                    onChange={(value) => setFormData({ ...formData, monthlyRent: value })}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <PoundSterling className="h-4 w-4" />
                    Security Deposit *
                  </Label>
                  <CurrencyInput
                    value={formData.securityDeposit}
                    onChange={(value) => setFormData({ ...formData, securityDeposit: value })}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Proof of Tenancy (Optional)
                </Label>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      Signed agreement, utility bill, or council tax document
                    </p>
                  </div>
                </div>
                {formData.tenancyProof && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    {formData.tenancyProof.name}
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={!canProceedFromStep4}
                  className="flex items-center gap-2"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 5: Review & Submit */}
        {currentStep === 5 && (
          <>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary-600" />
              </div>
              <CardTitle className="text-xl">Review & Submit</CardTitle>
              <CardDescription>
                Please review your information before submitting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-gray-900">Verification Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <Badge variant={formData.verificationMethod === 'pin' ? "default" : "secondary"}>
                      {formData.verificationMethod === 'pin' ? 'Agent PIN' : 'Manual Entry'}
                    </Badge>
                  </div>
                  
                  {formData.verificationMethod === 'pin' && pinValidation ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Agent:</span>
                        <span className="font-medium">{pinValidation.agentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Property:</span>
                        <span className="font-medium">{pinValidation.propertyAddress}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Property:</span>
                        <span className="font-medium">
                          {formData.propertyAddress || formData.propertyCode}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Agent/Landlord:</span>
                        <span className="font-medium">{formData.agentLandlordName}</span>
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tenant:</span>
                    <span className="font-medium">{formData.tenantFullName}</span>
                  </div>
                  
                  {formData.verificationMethod === 'manual' && (
                    <>
                      {formData.moveInDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Move-in Date:</span>
                          <span className="font-medium">
                            {formData.moveInDate.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {formData.monthlyRent && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly Rent:</span>
                          <span className="font-medium">£{formData.monthlyRent.toFixed(2)}</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Documents:</span>
                    <span className="font-medium">
                      {formData.tenancyProof ? 'Uploaded' : 'None'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-medium text-blue-900">What happens next?</h4>
                    <p className="text-sm text-blue-800">
                      {formData.verificationMethod === 'pin' 
                        ? 'Your agent will receive a notification to approve your tenancy request. You\'ll be contacted once approved.'
                        : 'Your verification request will be sent to the property\'s owner or managing agent. You\'ll receive an email notification once your tenancy is confirmed.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 6: Success */}
        {currentStep === 6 && (
          <>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl text-green-900">Request Submitted!</CardTitle>
              <CardDescription>
                Your verification request has been successfully submitted
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {formData.verificationMethod === 'pin' ? 'Agent Notified' : 'Pending Review'}
                </Badge>
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">What's Next?</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {formData.verificationMethod === 'pin' ? (
                      <>
                        <li>• Your agent has been notified of your request</li>
                        <li>• They will review and approve your tenancy details</li>
                        <li>• You'll receive an email confirmation once approved</li>
                        <li>• Access to your Tenant Dashboard will be granted immediately</li>
                      </>
                    ) : (
                      <>
                        <li>• Your landlord/agent will review your verification request</li>
                        <li>• You'll receive an email notification once approved</li>
                        <li>• Access to your Tenant Dashboard will be granted</li>
                        <li>• Manage rent payments, maintenance requests, and documents</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              <div className="flex justify-center">
                <Button onClick={onComplete} className="flex items-center gap-2">
                  Complete Setup
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default TenantVerification;
