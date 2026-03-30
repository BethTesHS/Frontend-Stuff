import React from 'react';
import { Send } from 'lucide-react';

export const SubmitStep = () => {
  return (
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
  );
};