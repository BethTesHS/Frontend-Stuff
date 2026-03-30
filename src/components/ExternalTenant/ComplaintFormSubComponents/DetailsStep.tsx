import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DetailsStepProps {
  formData: any;
  setFormData: (data: any) => void;
  issueTypes: any[];
  urgencyLevels: any[];
  imagePreview: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: () => void;
}

export const DetailsStep = ({
  formData,
  setFormData,
  issueTypes,
  urgencyLevels,
  imagePreview,
  handleImageUpload,
  removeImage
}: DetailsStepProps) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Basic Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="tenantName" className="text-gray-700 font-medium">Your Full Name *</Label>
            <Input
              id="tenantName"
              value={formData.tenantName}
              onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
              placeholder="Enter your full name"
              className="border-gray-200 focus:border-primary focus:ring-primary h-12"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenantEmail" className="text-gray-700 font-medium">Email Address *</Label>
            <Input
              id="tenantEmail"
              type="email"
              value={formData.tenantEmail}
              onChange={(e) => setFormData({ ...formData, tenantEmail: e.target.value })}
              placeholder="Enter your email address"
              className="border-gray-200 focus:border-primary focus:ring-primary h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="houseNumber" className="text-gray-700 font-medium">Property/Unit Number *</Label>
          <Input
            id="houseNumber"
            value={formData.houseNumber}
            onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
            placeholder="e.g., Apartment 3B, Unit 42, House 123"
            className="border-gray-200 focus:border-primary focus:ring-primary h-12"
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

      {/* Priority & Media */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Priority & Media</h3>
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

        <div className="space-y-4">
          <Label className="text-gray-700 font-medium">Upload Photo (Optional)</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors">
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="max-w-full h-64 object-cover mx-auto rounded-lg" />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeImage}
                  className="absolute top-2 right-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label htmlFor="image" className="cursor-pointer">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-600">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                <input id="image" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};