
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  AlertTriangle, 
  ArrowLeft, 
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
  X,
  Camera,
  Eye,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { complaintsApi } from '@/services/complaintsApi';

const SubmitComplaint = () => {
  const { loading: authLoading, hasAccess } = useAuthGuard(['tenant'], true);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [formData, setFormData] = useState({
    tenantName: '',
    tenantEmail: '',
    houseNumber: '',
    issueType: '',
    description: '',
    urgency: 'medium',
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const steps = [
    { number: 1, title: 'Complete Details', description: 'All information' },
    { number: 2, title: 'Review', description: 'Verify your details' },
    { number: 3, title: 'Submit', description: 'Finalize complaint' },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const generateTicketNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TC-${timestamp}${random}`;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate Step 1 before proceeding
      if (!formData.tenantName || !formData.tenantEmail || !formData.houseNumber || 
          !formData.issueType || !formData.description) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      // Submit complaint to Flask API
      const response = await complaintsApi.createComplaint({
        tenantName: formData.tenantName,
        tenantEmail: formData.tenantEmail,
        houseNumber: formData.houseNumber,
        issueType: formData.issueType,
        description: formData.description,
        urgency: formData.urgency,
      });

      if (response.complaint) {
        setTicketNumber(response.complaint.ticket_number);
        
        // Upload image if provided
        if (formData.image) {
          try {
            await complaintsApi.uploadComplaintImage(response.complaint.id, formData.image);
          } catch (imageError) {
            console.error('Failed to upload image:', imageError);
            // Don't fail the whole submission for image upload failure
          }
        }

        toast.success('Complaint submitted successfully!');
        setShowSuccessDialog(true);
      }
    } catch (error) {
      console.error('Complaint submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    navigate('/my-complaints');
  };

  const progressPercentage = (currentStep / 3) * 100;

  const getSelectedUrgencyLevel = () => {
    return urgencyLevels.find(level => level.value === formData.urgency);
  };

  const getSelectedIssueType = () => {
    return issueTypes.find(type => type.value === formData.issueType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-green-50/20">
      {/* Back Button - Extreme Left */}
      <div className="absolute top-4 left-4 z-10">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/tenant-dashboard')}
          className="text-emerald-600 hover:bg-emerald-50 border border-emerald-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

        {/* Header - Moved to top with reduced padding */}
        <div className="pt-16 pb-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-primary via-emerald-600 to-primary text-white shadow-2xl rounded-2xl">
              <div className="p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold mb-2">Submit Complaint</h1>
                    <p className="text-emerald-100 text-lg">
                      Report issues quickly and efficiently - we are here to help
                    </p>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    {steps.map((step, index) => (
                      <div key={step.number} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          currentStep >= step.number 
                            ? 'bg-white text-primary border-white' 
                            : 'border-white/50 text-white/70'
                        }`}>
                          {currentStep > step.number ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <span className="font-semibold">{step.number}</span>
                          )}
                        </div>
                        <div className="ml-3 text-left hidden md:block">
                          <p className="font-semibold text-white">{step.title}</p>
                          <p className="text-sm text-emerald-100">{step.description}</p>
                        </div>
                        {index < steps.length - 1 && (
                          <div className="w-12 md:w-24 h-0.5 bg-white/30 mx-4 md:mx-8" />
                        )}
                      </div>
                    ))}
                  </div>
                  <Progress value={progressPercentage} className="h-2 bg-white/20" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content - Reduced top margin */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Step {currentStep}: {steps[currentStep - 1].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Step 1: All Information */}
                {currentStep === 1 && (
                  <div className="space-y-8 animate-fade-in">
                    {/* Basic Information */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="tenantName" className="text-gray-700 font-medium">
                            Your Full Name *
                          </Label>
                          <Input
                            id="tenantName"
                            value={formData.tenantName}
                            onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                            placeholder="Enter your full name"
                            className="border-gray-200 focus:border-primary focus:ring-primary h-12"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="tenantEmail" className="text-gray-700 font-medium">
                            Email Address *
                          </Label>
                          <Input
                            id="tenantEmail"
                            type="email"
                            value={formData.tenantEmail}
                            onChange={(e) => setFormData({ ...formData, tenantEmail: e.target.value })}
                            placeholder="Enter your email address"
                            className="border-gray-200 focus:border-primary focus:ring-primary h-12"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="houseNumber" className="text-gray-700 font-medium">
                          Property/Unit Number *
                        </Label>
                        <Input
                          id="houseNumber"
                          value={formData.houseNumber}
                          onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                          placeholder="e.g., Apartment 3B, Unit 42, House 123"
                          className="border-gray-200 focus:border-primary focus:ring-primary h-12"
                          required
                        />
                      </div>
                    </div>

                    {/* Issue Details */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Issue Details</h3>
                      <div className="space-y-4">
                        <Label className="text-gray-700 font-medium">Issue Type *</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {issueTypes.map((type) => (
                            <div
                              key={type.value}
                              onClick={() => setFormData({ ...formData, issueType: type.value })}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                formData.issueType === type.value
                                  ? 'border-primary bg-emerald-50 shadow-md'
                                  : 'border-gray-200 hover:border-emerald-300'
                              }`}
                            >
                              <div className="flex flex-col items-center text-center space-y-2">
                                <type.icon className={`w-8 h-8 ${type.color}`} />
                                <span className="font-medium text-gray-900 text-sm">{type.value}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-gray-700 font-medium">
                          Detailed Description *
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Please provide a detailed description of the issue, including when it started, what you have tried, and how it is affecting you..."
                          rows={5}
                          className="border-gray-200 focus:border-primary focus:ring-primary"
                          required
                        />
                      </div>
                    </div>

                    {/* Priority & Media */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Priority & Media</h3>
                      
                      {/* Urgency Selection */}
                      <div className="space-y-4">
                        <Label className="text-gray-700 font-medium">Priority Level *</Label>
                        <RadioGroup
                          value={formData.urgency}
                          onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          {urgencyLevels.map((level) => (
                            <div key={level.value} className="flex items-center space-x-3">
                              <RadioGroupItem
                                value={level.value}
                                id={level.value}
                                className="border-gray-300"
                              />
                              <Label
                                htmlFor={level.value}
                                className="flex-1 cursor-pointer p-4 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors"
                              >
                                <div className="flex items-center space-x-3">
                                  <level.icon className={`w-5 h-5 ${level.color}`} />
                                  <div>
                                    <p className="font-medium text-gray-900">{level.label}</p>
                                    <p className="text-sm text-gray-600">{level.description}</p>
                                  </div>
                                </div>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      {/* Photo Upload */}
                      <div className="space-y-4">
                        <Label className="text-gray-700 font-medium">Upload Photo (Optional)</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors">
                          {imagePreview ? (
                            <div className="relative">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-w-full h-64 object-cover mx-auto rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={removeImage}
                                className="absolute top-2 right-2"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <label htmlFor="image" className="cursor-pointer">
                              <div className="flex flex-col items-center space-y-4">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                                  <Camera className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">Click to upload or drag and drop</p>
                                  <p className="text-sm text-gray-600">PNG, JPG, GIF up to 10MB</p>
                                </div>
                              </div>
                              <input
                                id="image"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Review */}
                {currentStep === 2 && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="bg-emerald-50 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Eye className="w-6 h-6 text-primary" />
                        <h3 className="text-lg font-semibold text-gray-900">Review Your Complaint</h3>
                      </div>
                      <p className="text-gray-600">Please review all the information below before submitting your complaint.</p>
                    </div>

                    {/* Basic Information Review */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 border-b pb-2">Personal Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Full Name</p>
                          <p className="font-medium">{formData.tenantName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email Address</p>
                          <p className="font-medium">{formData.tenantEmail}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Property/Unit Number</p>
                          <p className="font-medium">{formData.houseNumber}</p>
                        </div>
                      </div>
                    </div>

                    {/* Issue Details Review */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 border-b pb-2">Issue Details</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Issue Type</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {getSelectedIssueType() && (
                              <>
                                {React.createElement(getSelectedIssueType()!.icon, {
                                  className: `w-5 h-5 ${getSelectedIssueType()!.color}`
                                })}
                                <p className="font-medium">{formData.issueType}</p>
                              </>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Description</p>
                          <p className="font-medium bg-gray-50 p-3 rounded-lg mt-1">{formData.description}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Priority Level</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {getSelectedUrgencyLevel() && (
                              <>
                                {React.createElement(getSelectedUrgencyLevel()!.icon, {
                                  className: `w-5 h-5 ${getSelectedUrgencyLevel()!.color}`
                                })}
                                <p className="font-medium">{getSelectedUrgencyLevel()!.label}</p>
                              </>
                            )}
                          </div>
                        </div>
                        {imagePreview && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Uploaded Image</p>
                            <img
                              src={imagePreview}
                              alt="Complaint"
                              className="max-w-sm h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Submit */}
                {currentStep === 3 && (
                  <div className="space-y-8 animate-fade-in text-center">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-8">
                      <div className="flex flex-col items-center space-y-6">
                        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                          <Send className="w-10 h-10 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Submit</h3>
                          <p className="text-gray-600 text-lg">
                            Your complaint is ready to be submitted. Click the button below to send it to our team.
                          </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                          <p className="text-sm text-gray-600 mb-2">Once submitted, you will receive:</p>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li>• A unique ticket number for tracking</li>
                            <li>• Email confirmation within 5 minutes</li>
                            <li>• Response from our team within 24 hours</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="px-6"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex space-x-4">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => navigate('/tenant-dashboard')}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                    
                    {currentStep < 3 ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="px-6 bg-primary hover:bg-primary/90"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={loading}
                        className="px-8 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-700"
                      >
                        {loading ? 'Submitting...' : 'Submit Complaint'}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={() => {}}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <DialogTitle className="text-center text-xl font-bold text-gray-900">
                  Complaint Submitted Successfully!
                </DialogTitle>
              </div>
            </DialogHeader>
            <DialogDescription className="text-center space-y-4">
              <p className="text-gray-600">
                Your complaint has been submitted and assigned ticket number:
              </p>
              <div className="bg-emerald-50 p-4 rounded-lg">
                <p className="font-mono text-lg font-bold text-primary">{ticketNumber}</p>
              </div>
              <p className="text-sm text-gray-500">
                You will receive an email confirmation shortly. Our team will respond within 24 hours.
              </p>
            </DialogDescription>
            <div className="flex justify-center pt-4">
              <Button onClick={handleSuccessDialogClose} className="px-8">
                View My Complaints
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default SubmitComplaint;
