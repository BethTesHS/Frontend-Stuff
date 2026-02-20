import { useState } from 'react';
import { User, Home, FileText, Phone, Edit, Save, X, AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export const TenantProfile = ({ user }: any) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postcode: '',
    county: '',
    dateOfBirth: '',
    employmentStatus: '',
    employerName: '',
    annualIncome: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    nationality: '',
    rightToRentStatus: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      postcode: '',
      county: '',
      dateOfBirth: '',
      employmentStatus: '',
      employerName: '',
      annualIncome: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
      nationality: '',
      rightToRentStatus: ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-foreground tracking-light text-3xl font-bold leading-tight">
            Profile
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your personal information and tenant verification details
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <User className="h-5 w-5" />
              Personal Information
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your basic personal details
            </p>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., British, American"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Home className="h-5 w-5" />
              Address Information
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your current residential address
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input
                id="addressLine1"
                value={formData.addressLine1}
                onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                disabled={!isEditing}
                placeholder="Street address"
              />
            </div>
            <div>
              <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
              <Input
                id="addressLine2"
                value={formData.addressLine2}
                onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                disabled={!isEditing}
                placeholder="Apartment, suite, etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={formData.postcode}
                  onChange={(e) => handleInputChange('postcode', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="county">County</Label>
              <Input
                id="county"
                value={formData.county}
                onChange={(e) => handleInputChange('county', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <FileText className="h-5 w-5" />
              Employment Information
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your employment and income details
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="employmentStatus">Employment Status</Label>
              <Input
                id="employmentStatus"
                value={formData.employmentStatus}
                onChange={(e) => handleInputChange('employmentStatus', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., Full-time, Part-time, Self-employed"
              />
            </div>
            <div>
              <Label htmlFor="employerName">Employer Name</Label>
              <Input
                id="employerName"
                value={formData.employerName}
                onChange={(e) => handleInputChange('employerName', e.target.value)}
                disabled={!isEditing}
                placeholder="Company or organization name"
              />
            </div>
            <div>
              <Label htmlFor="annualIncome">Annual Income (£)</Label>
              <Input
                id="annualIncome"
                type="number"
                value={formData.annualIncome}
                onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., 35000"
              />
            </div>
            <div>
              <Label htmlFor="rightToRentStatus">Right to Rent Status</Label>
              <Input
                id="rightToRentStatus"
                value={formData.rightToRentStatus}
                onChange={(e) => handleInputChange('rightToRentStatus', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., British Citizen, EU Settled Status"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Phone className="h-5 w-5" />
              Emergency Contact
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Emergency contact information
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="emergencyContactName">Contact Name</Label>
              <Input
                id="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                disabled={!isEditing}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
              <Input
                id="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                disabled={!isEditing}
                placeholder="Phone number"
              />
            </div>
            <div>
              <Label htmlFor="emergencyContactRelationship">Relationship</Label>
              <Input
                id="emergencyContactRelationship"
                value={formData.emergencyContactRelationship}
                onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., Parent, Sibling, Friend"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <AlertTriangle className="h-5 w-5" />
            Verification Status
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your tenant verification and platform status
          </p>
        </div>
        <div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={user?.isVerified ? "default" : "secondary"}>
                {user?.isVerified ? "Email Verified" : "Email Pending"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={user?.tenantVerified ? "default" : "secondary"}>
                {user?.tenantVerified ? "Tenant Verified" : "Tenant Verification Pending"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={user?.profileComplete ? "default" : "secondary"}>
                {user?.profileComplete ? "Profile Complete" : "Profile Incomplete"}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};