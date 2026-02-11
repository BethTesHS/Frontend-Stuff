import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TenantVerificationData } from '@/types/tenant-verification';

interface PropertyDetailsStepProps {
  formData: TenantVerificationData;
  updateFormData: (updates: Partial<TenantVerificationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PropertyDetailsStep = ({ formData, updateFormData, onNext, onBack }: PropertyDetailsStepProps) => {
  const handleNext = () => {
    if (!formData.propertyAddress || !formData.tenantFullName) {
      return;
    }
    onNext();
  };

  const isValid = formData.propertyAddress && formData.tenantFullName;

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Property Details</h2>
          <p className="text-muted-foreground">
            Please provide information about the property you're renting
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="tenantFullName">Your Full Name *</Label>
            <Input
              id="tenantFullName"
              type="text"
              value={formData.tenantFullName}
              onChange={(e) => updateFormData({ tenantFullName: e.target.value })}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <Label htmlFor="propertyAddress">Property Address *</Label>
            <Input
              id="propertyAddress"
              type="text"
              value={formData.propertyAddress || ''}
              onChange={(e) => updateFormData({ propertyAddress: e.target.value })}
              placeholder="Enter the full property address"
              required
            />
          </div>

          <div>
            <Label htmlFor="propertyCode">Property Code (if available)</Label>
            <Input
              id="propertyCode"
              type="text"
              value={formData.propertyCode || ''}
              onChange={(e) => updateFormData({ propertyCode: e.target.value })}
              placeholder="Property reference or code"
            />
          </div>

          <div>
            <Label htmlFor="tenantEmail">Your Email Address</Label>
            <Input
              id="tenantEmail"
              type="email"
              value={formData.tenantEmail || ''}
              onChange={(e) => updateFormData({ tenantEmail: e.target.value })}
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <Label htmlFor="tenantPhone">Your Phone Number</Label>
            <Input
              id="tenantPhone"
              type="tel"
              value={formData.tenantPhone || ''}
              onChange={(e) => updateFormData({ tenantPhone: e.target.value })}
              placeholder="Your contact number"
            />
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!isValid}
            className="min-w-[120px]"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PropertyDetailsStep;