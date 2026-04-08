import React from 'react';
import { Eye, Film, Image as ImageIcon } from 'lucide-react';

interface ReviewStepProps {
  formData: any;
  attachments: File[];
  getSelectedIssueType: () => any;
  getSelectedUrgencyLevel: () => any;
}

function isVideo(file: File): boolean {
  return file.type.startsWith('video/');
}

export const ReviewStep = ({
  formData,
  attachments,
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

          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Attachments ({attachments.length} file{attachments.length !== 1 ? 's' : ''})
              </p>
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {isVideo(file) ? (
                      <div className="w-16 h-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Film className="w-6 h-6 text-purple-500" />
                      </div>
                    ) : (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{isVideo(file) ? 'Video' : 'Image'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
