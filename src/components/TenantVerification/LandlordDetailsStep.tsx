import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TenantVerificationData } from '@/types/tenant-verification';

interface LandlordDetailsStepProps {
  formData: TenantVerificationData;
  updateFormData: (updates: Partial<TenantVerificationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const LandlordDetailsStep = ({ formData, updateFormData, onNext, onBack }: LandlordDetailsStepProps) => {
  const handleNext = () => {
    if (!formData.agentLandlordName) {
      return;
    }
    onNext();
  };

  const isValid = formData.agentLandlordName;

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Landlord/Agent Information</h2>
          <p className="text-muted-foreground">
            Please provide details about your landlord or letting agent
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="agentLandlordName">Landlord/Agent Name *</Label>
            <Input
              id="agentLandlordName"
              type="text"
              value={formData.agentLandlordName || ''}
              onChange={(e) => updateFormData({ agentLandlordName: e.target.value })}
              placeholder="Enter landlord or agent name"
              required
            />
          </div>

          <div>
            <Label htmlFor="agentLandlordEmail">Landlord/Agent Email</Label>
            <Input
              id="agentLandlordEmail"
              type="email"
              value={formData.agentLandlordEmail || ''}
              onChange={(e) => updateFormData({ agentLandlordEmail: e.target.value })}
              placeholder="landlord@example.com"
            />
          </div>

          <div>
            <Label htmlFor="agentLandlordPhone">Landlord/Agent Phone</Label>
            <Input
              id="agentLandlordPhone"
              type="tel"
              value={formData.agentLandlordPhone || ''}
              onChange={(e) => updateFormData({ agentLandlordPhone: e.target.value })}
              placeholder="Contact phone number"
            />
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Why do we need this?</strong> We'll use this information to help facilitate communication 
            and verify your tenancy. Your landlord or agent may be contacted to confirm your tenancy details.
          </p>
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

export default LandlordDetailsStep;