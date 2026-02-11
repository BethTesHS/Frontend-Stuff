
import React from 'react';
import { CheckCircle } from 'lucide-react';

const BrochureSuccessMessage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">Request Sent!</h3>
      <p className="text-gray-600">
        We'll email you the brochure shortly.
      </p>
    </div>
  );
};

export default BrochureSuccessMessage;
