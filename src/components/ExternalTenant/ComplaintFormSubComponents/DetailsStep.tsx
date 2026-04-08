import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Paperclip, X, Film, Image as ImageIcon, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DetailsStepProps {
  formData: any;
  setFormData: (data: any) => void;
  issueTypes: any[];
  urgencyLevels: any[];
  attachments: File[];
  handleFilesAdd: (files: File[]) => void;
  removeAttachment: (index: number) => void;
  profileLoaded?: boolean;
}

const ACCEPTED_TYPES = 'image/*,video/*';
const MAX_FILE_SIZE_MB = 100;

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isVideo(file: File): boolean {
  return file.type.startsWith('video/');
}

export const DetailsStep = ({
  formData,
  setFormData,
  issueTypes,
  urgencyLevels,
  attachments,
  handleFilesAdd,
  removeAttachment,
  profileLoaded = false,
}: DetailsStepProps) => {

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter(f => f.size <= MAX_FILE_SIZE_MB * 1024 * 1024);
    const oversized = files.filter(f => f.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (oversized.length > 0) {
      // notify via toast is handled higher up; silently skip here
      console.warn('Some files exceed the size limit and were skipped.');
    }
    if (valid.length > 0) handleFilesAdd(valid);
    // Reset input so the same file can be re-added if removed
    e.target.value = '';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Basic Information */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          {profileLoaded && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
              <Info className="w-3 h-3" />
              Pre-filled from your profile
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="tenantName" className="text-gray-700 font-medium">Your Full Name *</Label>
            <Input
              id="tenantName"
              value={formData.tenantName}
              onChange={(e) => !profileLoaded && setFormData({ ...formData, tenantName: e.target.value })}
              placeholder="Enter your full name"
              className={`border-gray-200 focus:border-primary focus:ring-primary h-12 ${profileLoaded ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
              readOnly={profileLoaded}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenantEmail" className="text-gray-700 font-medium">Email Address *</Label>
            <Input
              id="tenantEmail"
              type="email"
              value={formData.tenantEmail}
              onChange={(e) => !profileLoaded && setFormData({ ...formData, tenantEmail: e.target.value })}
              placeholder="Enter your email address"
              className={`border-gray-200 focus:border-primary focus:ring-primary h-12 ${profileLoaded ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
              readOnly={profileLoaded}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="houseNumber" className="text-gray-700 font-medium">Property/Unit Number *</Label>
          <Input
            id="houseNumber"
            value={formData.houseNumber}
            onChange={(e) => !profileLoaded && setFormData({ ...formData, houseNumber: e.target.value })}
            placeholder="e.g., Apartment 3B, Unit 42, House 123"
            className={`border-gray-200 focus:border-primary focus:ring-primary h-12 ${profileLoaded ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
            readOnly={profileLoaded}
            required
          />
        </div>
      </div>

      {/* Issue Details */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Issue Details</h3>
        <div className="space-y-4">
          <Label className="text-gray-700 font-medium">Issue Type *</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {issueTypes.map((type) => (
              <div
                key={type.value}
                onClick={() => setFormData({ ...formData, issueType: type.value })}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  formData.issueType === type.value
                    ? 'border-primary bg-emerald-50 shadow-md'
                    : 'border-gray-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <type.icon className={`w-8 h-8 ${type.color}`} />
                  <span className="font-medium text-gray-900 text-sm">{type.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description" className="text-gray-700 font-medium">Detailed Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Please provide a detailed description..."
            rows={5}
            className="border-gray-200 focus:border-primary focus:ring-primary"
            required
          />
        </div>
      </div>

      {/* Priority & Attachments */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Priority & Attachments</h3>
        <div className="space-y-4">
          <Label className="text-gray-700 font-medium">Priority Level *</Label>
          <RadioGroup
            value={formData.urgency}
            onValueChange={(value) => setFormData({ ...formData, urgency: value })}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {urgencyLevels.map((level) => (
              <div key={level.value} className="flex items-center space-x-3">
                <RadioGroupItem value={level.value} id={level.value} />
                <Label
                  htmlFor={level.value}
                  className="flex-1 cursor-pointer p-4 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <level.icon className={`w-5 h-5 ${level.color}`} />
                    <div>
                      <p className="font-medium text-gray-900">{level.label}</p>
                      <p className="text-sm text-gray-600">{level.description}</p>
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Multi-file upload: images + videos */}
        <div className="space-y-4">
          <Label className="text-gray-700 font-medium">
            Attachments (Optional)
            <span className="text-xs font-normal text-gray-500 ml-2">Images & videos up to {MAX_FILE_SIZE_MB} MB each</span>
          </Label>

          {/* Existing attachments list */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  {isVideo(file) ? (
                    <Film className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{isVideo(file) ? 'Video' : 'Image'} · {formatBytes(file.size)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                    className="flex-shrink-0 h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Drop zone / file picker */}
          <label
            htmlFor="attachments"
            className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-400 transition-colors"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
              <Paperclip className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Click to add photos or videos</p>
              <p className="text-sm text-gray-500 mt-0.5">PNG, JPG, GIF, MP4, MOV and more · up to {MAX_FILE_SIZE_MB} MB each</p>
            </div>
            <input
              id="attachments"
              type="file"
              accept={ACCEPTED_TYPES}
              multiple
              className="hidden"
              onChange={handleFileInputChange}
            />
          </label>
        </div>
      </div>
    </div>
  );
};
