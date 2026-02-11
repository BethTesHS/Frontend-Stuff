import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { CurrencyInput } from '@/components/ui/currency-input';
import { ArrowLeft, Upload, FileText } from 'lucide-react';
import { TenantVerificationData } from '@/types/tenant-verification';

interface TenancyDetailsStepProps {
  formData: TenantVerificationData;
  updateFormData: (updates: Partial<TenantVerificationData>) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const TenancyDetailsStep = ({ formData, updateFormData, onSubmit, onBack, isSubmitting }: TenancyDetailsStepProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    updateFormData({ tenancyProof: file });
  };

  const handleSubmit = () => {
    if (!formData.moveInDate) {
      return;
    }
    onSubmit();
  };

  const isValid = formData.moveInDate;

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Tenancy Details</h2>
          <p className="text-muted-foreground">
            Tell us about your tenancy terms and upload any supporting documents
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="moveInDate">Move-in Date *</Label>
            <DatePicker
              date={formData.moveInDate}
              onDateChange={(date) => updateFormData({ moveInDate: date })}
              placeholder="Select your move-in date"
            />
          </div>

          <div>
            <Label htmlFor="tenancyLength">Tenancy Length (Months)</Label>
            <Input
              id="tenancyLength"
              type="number"
              value={formData.tenancyLengthMonths || ''}
              onChange={(e) => updateFormData({ tenancyLengthMonths: parseInt(e.target.value) || undefined })}
              placeholder="e.g., 12"
              min="1"
            />
          </div>

          <div>
            <Label htmlFor="monthlyRent">Monthly Rent</Label>
            <CurrencyInput
              id="monthlyRent"
              value={formData.monthlyRent}
              onChange={(value) => updateFormData({ monthlyRent: value })}
              placeholder="Enter monthly rent amount"
            />
          </div>

          <div>
            <Label htmlFor="securityDeposit">Security Deposit</Label>
            <CurrencyInput
              id="securityDeposit"
              value={formData.securityDeposit}
              onChange={(value) => updateFormData({ securityDeposit: value })}
              placeholder="Enter security deposit amount"
            />
          </div>

          <div>
            <Label htmlFor="tenancyProof">Tenancy Agreement/Proof (Optional)</Label>
            <div className="mt-2">
              <label 
                htmlFor="tenancyProof"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="text-center">
                  {formData.tenancyProof ? (
                    <div className="flex items-center space-x-2 text-primary">
                      <FileText className="w-6 h-6" />
                      <span className="text-sm font-medium">{formData.tenancyProof.name}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-primary">Click to upload</span> or drag and drop
                      </div>
                      <div className="text-xs text-muted-foreground">
                        PDF, JPG, PNG up to 10MB
                      </div>
                    </div>
                  )}
                </div>
              </label>
              <input
                id="tenancyProof"
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Optional Document:</strong> Uploading your tenancy agreement or proof of tenancy 
            helps us verify your details faster and provide better support.
          </p>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="min-w-[160px]"
          >
            {isSubmitting ? 'Submitting...' : 'Complete Setup'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TenancyDetailsStep;