
import React from 'react';
import { Label } from '@/components/ui/label';
import { Mail, Download } from 'lucide-react';

interface DeliveryMethodSelectorProps {
  deliveryMethod: 'email' | 'download';
  onDeliveryMethodChange: (method: 'email' | 'download') => void;
}

const DeliveryMethodSelector = ({ deliveryMethod, onDeliveryMethodChange }: DeliveryMethodSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">How would you like to receive the brochure?</Label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onDeliveryMethodChange('email')}
          className={`p-3 rounded-lg border text-sm flex items-center justify-center space-x-2 transition-colors ${
            deliveryMethod === 'email'
              ? 'border-primary-600 bg-primary-50 text-primary-700'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Email Me</span>
        </button>
        <button
          type="button"
          onClick={() => onDeliveryMethodChange('download')}
          className={`p-3 rounded-lg border text-sm flex items-center justify-center space-x-2 transition-colors ${
            deliveryMethod === 'download'
              ? 'border-primary-600 bg-primary-50 text-primary-700'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};

export default DeliveryMethodSelector;
