import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Home, 
  User, 
  MapPin, 
  Calendar,
  PoundSterling,
  Phone,
  Mail,
  ArrowLeft
} from 'lucide-react';

interface ExternalTenantFormProps {
  onComplete: () => void;
  onBack: () => void;
}

interface PropertyFormData {
  // Property details
  propertyAddress: string;
  postcode: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  
  // Landlord/Agent details
  landlordName: string;
  landlordEmail: string;
  landlordPhone: string;
  
  // Tenancy details
  moveInDate: Date | undefined;
  tenancyLength: string;
  monthlyRent: number | undefined;
  deposit: number | undefined;
  
  // Additional info
  additionalInfo: string;
}

const ExternalTenantForm = ({ onComplete, onBack }: ExternalTenantFormProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PropertyFormData>({
    propertyAddress: '',
    postcode: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    landlordName: '',
    landlordEmail: '',
    landlordPhone: '',
    moveInDate: undefined,
    tenancyLength: '',
    monthlyRent: undefined,
    deposit: undefined,
    additionalInfo: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.propertyAddress || !formData.landlordName || !formData.moveInDate || !formData.monthlyRent) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Submitting external tenant property information:', formData);
      
      // Import the API
      const { externalTenantApi } = await import('@/services/api');
      
      // Prepare data for Flask API
      const setupData = {
        tenant_type: 'external' as const,
        role: 'tenant' as const,
        property_data: {
          propertyAddress: formData.propertyAddress,
          postcode: formData.postcode,
          propertyType: formData.propertyType,
          bedrooms: parseInt(formData.bedrooms) || 0,
          bathrooms: parseInt(formData.bathrooms) || 0,
          landlordName: formData.landlordName,
          landlordEmail: formData.landlordEmail,
          landlordPhone: formData.landlordPhone,
          moveInDate: formData.moveInDate?.toISOString().split('T')[0] || '',
          tenancyLength: formData.tenancyLength,
          monthlyRent: formData.monthlyRent || 0,
          deposit: formData.deposit,
          additionalInfo: formData.additionalInfo,
        }
      };
      
      // Submit to Flask API
      const response = await externalTenantApi.setupProfile(setupData);
      
      if (response.success) {
        toast.success('External tenant profile created successfully!');
        onComplete();
        navigate('/external-tenant-dashboard');
      } else {
        throw new Error(response.message || 'Failed to create profile');
      }
      
    } catch (error: any) {
      console.error('Error submitting property information:', error);
      toast.error(error.message || 'Failed to submit property information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Home className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Property Information</h1>
        </div>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Please provide details about your rental property to complete your registration
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Property Details
          </CardTitle>
          <CardDescription>
            Tell us about the property you're renting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="propertyAddress" className="text-sm font-medium">
                    Property Address *
                  </Label>
                  <Input
                    id="propertyAddress"
                    placeholder="e.g., 12 King's Road, London"
                    value={formData.propertyAddress}
                    onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="postcode" className="text-sm font-medium">
                    Postcode *
                  </Label>
                  <Input
                    id="postcode"
                    placeholder="e.g., SW3 4NT"
                    value={formData.postcode}
                    onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="propertyType" className="text-sm font-medium">
                    Property Type
                  </Label>
                  <Input
                    id="propertyType"
                    placeholder="e.g., Flat, House, Studio"
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="bedrooms" className="text-sm font-medium">
                    Bedrooms
                  </Label>
                  <Input
                    id="bedrooms"
                    placeholder="e.g., 2"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="bathrooms" className="text-sm font-medium">
                    Bathrooms
                  </Label>
                  <Input
                    id="bathrooms"
                    placeholder="e.g., 1"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Landlord/Agent Information */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Landlord/Agent Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="landlordName" className="text-sm font-medium">
                    Landlord/Agent Name *
                  </Label>
                  <Input
                    id="landlordName"
                    placeholder="Full name or company name"
                    value={formData.landlordName}
                    onChange={(e) => setFormData({ ...formData, landlordName: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="landlordEmail" className="text-sm font-medium flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email Address
                  </Label>
                  <Input
                    id="landlordEmail"
                    type="email"
                    placeholder="landlord@example.com"
                    value={formData.landlordEmail}
                    onChange={(e) => setFormData({ ...formData, landlordEmail: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="landlordPhone" className="text-sm font-medium flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone Number
                  </Label>
                  <Input
                    id="landlordPhone"
                    type="tel"
                    placeholder="+44 7XXX XXX XXX"
                    value={formData.landlordPhone}
                    onChange={(e) => setFormData({ ...formData, landlordPhone: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Tenancy Details */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Tenancy Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="moveInDate" className="text-sm font-medium">
                    Move-in Date *
                  </Label>
                  <DatePicker
                    date={formData.moveInDate}
                    onDateChange={(date) => setFormData({ ...formData, moveInDate: date })}
                    placeholder="Select move-in date"
                    className="mt-1 w-full"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tenancyLength" className="text-sm font-medium">
                    Tenancy Length
                  </Label>
                  <Input
                    id="tenancyLength"
                    placeholder="e.g., 12 months, 6 months"
                    value={formData.tenancyLength}
                    onChange={(e) => setFormData({ ...formData, tenancyLength: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="monthlyRent" className="text-sm font-medium flex items-center gap-1">
                    <PoundSterling className="h-3 w-3" />
                    Monthly Rent *
                  </Label>
                  <CurrencyInput
                    value={formData.monthlyRent}
                    onChange={(value) => setFormData({ ...formData, monthlyRent: value })}
                    placeholder="Enter monthly rent"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="deposit" className="text-sm font-medium flex items-center gap-1">
                    <PoundSterling className="h-3 w-3" />
                    Security Deposit
                  </Label>
                  <CurrencyInput
                    value={formData.deposit}
                    onChange={(value) => setFormData({ ...formData, deposit: value })}
                    placeholder="Enter deposit amount"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-2">
              <Label htmlFor="additionalInfo" className="text-sm font-medium">
                Additional Information
              </Label>
              <Textarea
                id="additionalInfo"
                placeholder="Any additional details about your tenancy..."
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                className="mt-1 min-h-[80px]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              
              <Button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? 'Submitting...' : 'Complete Registration'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExternalTenantForm;