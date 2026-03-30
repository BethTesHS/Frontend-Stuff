import React from 'react';
import { Eye } from 'lucide-react';

interface ReviewStepProps {
  formData: any;
  imagePreview: string | null;
  getSelectedIssueType: () => any;
  getSelectedUrgencyLevel: () => any;
}

export const ReviewStep = ({
  formData,
  imagePreview,
  getSelectedIssueType,
  getSelectedUrgencyLevel
}: ReviewStepProps) => {
  const issueType = getSelectedIssueType();
  const urgencyLevel = getSelectedUrgencyLevel();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-emerald-50 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Eye className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">Review Your Complaint</h3>
        </div>
        <p className="text-gray-600">Please review all the information below before submitting your complaint.</p>
      </div>

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

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">Issue Details</h4>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Issue Type</p>
            <div className="flex items-center space-x-2 mt-1">
              {issueType && (
                <>
                  <issueType.icon className={`w-5 h-5 ${issueType.color}`} />
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
              {urgencyLevel && (
                <>
                  <urgencyLevel.icon className={`w-5 h-5 ${urgencyLevel.color}`} />
                  <p className="font-medium">{urgencyLevel.label}</p>
                </>
              )}
            </div>
          </div>
          {imagePreview && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Uploaded Image</p>
              <img src={imagePreview} alt="Complaint" className="max-w-sm h-32 object-cover rounded-lg" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};