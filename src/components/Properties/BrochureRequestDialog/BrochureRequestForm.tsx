
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Download } from 'lucide-react';
import { Property } from '@/types';
import DeliveryMethodSelector from './DeliveryMethodSelector';
import PropertySummary from './PropertySummary';

interface BrochureRequestFormProps {
  property: Property;
  onSuccess: () => void;
}

const BrochureRequestForm = ({ property, onSuccess }: BrochureRequestFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'download'>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    return formData.name.trim() !== '' && 
           formData.email.trim() !== '' && 
           formData.email.includes('@');
  };

  const handleEmailRequest = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // TODO: Replace with actual backend API call
    // Example: await api.requestBrochureByEmail({ ...formData, propertyId: property.id })
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Brochure request submitted:', {
      ...formData,
      property: {
        id: property.id,
        title: property.title,
        address: property.address
      }
    });
    
    setIsSubmitting(false);
    onSuccess();
  };

  const handleDirectDownload = () => {
    // TODO: Replace with actual backend PDF endpoint
    // Example: const pdfUrl = await api.getBrochurePdfUrl(property.id)
    // For now, using placeholder
    const link = document.createElement('a');
    link.href = '/placeholder.svg'; // TODO: Replace with actual PDF URL from backend
    link.download = `${property.title.replace(/\s+/g, '_')}_brochure.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Close dialog after download
    setTimeout(() => {
      onSuccess();
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (deliveryMethod === 'email') {
      handleEmailRequest();
    } else {
      handleDirectDownload();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DeliveryMethodSelector 
        deliveryMethod={deliveryMethod}
        onDeliveryMethodChange={setDeliveryMethod}
      />

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="Enter your email address"
          />
        </div>

        {deliveryMethod === 'email' && (
          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Any specific questions about this property?"
              rows={3}
            />
          </div>
        )}
      </div>

      <PropertySummary property={property} />

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={!validateForm() || isSubmitting}
      >
        {isSubmitting ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            {deliveryMethod === 'email' ? (
              <Mail className="w-4 h-4" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>
              {deliveryMethod === 'email' ? 'Send Brochure' : 'Download Brochure'}
            </span>
          </div>
        )}
      </Button>
    </form>
  );
};

export default BrochureRequestForm;
