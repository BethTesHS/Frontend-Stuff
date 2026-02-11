import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Home,
  Building
} from "lucide-react";
import { toast } from "sonner";
import { externalTenantApi } from "@/services/api";

interface ExternalTenantProfileProps {
  user: any;
}

const ExternalTenantProfile = ({ user }: ExternalTenantProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    property_address: "",
    postcode: "",
    property_type: "",
    bedrooms: 0,
    bathrooms: 0,
    landlord_name: "",
    landlord_email: "",
    landlord_phone: "",
    tenancy_length: "",
    monthly_rent: 0,
    deposit: 0,
    additional_info: "",
    move_in_date: ""
  });

  // Fetch external tenant profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await externalTenantApi.getProfile();
        
        if (response.success && response.data?.external_tenant_profile) {
          const profileData = response.data.external_tenant_profile;
          setProfile(profileData);
          setFormData({
            property_address: profileData.property_address || "",
            postcode: profileData.postcode || "",
            property_type: profileData.property_type || "",
            bedrooms: profileData.bedrooms || 0,
            bathrooms: profileData.bathrooms || 0,
            landlord_name: profileData.landlord_name || "",
            landlord_email: profileData.landlord_email || "",
            landlord_phone: profileData.landlord_phone || "",
            tenancy_length: profileData.tenancy_length || "",
            monthly_rent: profileData.monthly_rent || 0,
            deposit: profileData.deposit || 0,
            additional_info: profileData.additional_info || "",
            move_in_date: profileData.move_in_date || ""
          });
        }
      } catch (error: any) {
        console.error('Error fetching external tenant profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Only send changed fields
      const updates: any = {};
      Object.keys(formData).forEach(key => {
        const currentValue = (formData as any)[key];
        const originalValue = (profile as any)?.[key];
        
        if (currentValue !== originalValue) {
          updates[key] = currentValue;
        }
      });

      if (Object.keys(updates).length === 0) {
        toast.info('No changes detected');
        setIsEditing(false);
        return;
      }

      const response = await externalTenantApi.updateProfile(updates);
      
      if (response.success) {
        setProfile(response.data?.external_tenant_profile);
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (profile) {
      setFormData({
        property_address: profile.property_address || "",
        postcode: profile.postcode || "",
        property_type: profile.property_type || "",
        bedrooms: profile.bedrooms || 0,
        bathrooms: profile.bathrooms || 0,
        landlord_name: profile.landlord_name || "",
        landlord_email: profile.landlord_email || "",
        landlord_phone: profile.landlord_phone || "",
        tenancy_length: profile.tenancy_length || "",
        monthly_rent: profile.monthly_rent || 0,
        deposit: profile.deposit || 0,
        additional_info: profile.additional_info || "",
        move_in_date: profile.move_in_date || ""
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center justify-between">
        <h2 className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent text-2xl font-bold">Profile Information</h2>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-success hover:bg-success/90 text-success-foreground"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={saving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Personal Information */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-4 h-4 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="w-16 h-16">
              <AvatarImage src="" />
              <AvatarFallback className="text-lg font-bold bg-primary text-primary-foreground">
                {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'ET'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                {user?.name || 'External Tenant'}
              </h3>
              <p className="text-muted-foreground text-sm">External Tenant</p>
              <Badge variant={profile?.is_verified ? "default" : "secondary"}>
                {profile?.is_verified ? '✓ Verified Tenant' : '⏳ Pending Verification'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{user?.name || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{user?.email || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_address" className="text-sm font-medium">Property Address</Label>
              {isEditing ? (
                <Textarea
                  id="property_address"
                  value={formData.property_address}
                  onChange={(e) => handleInputChange('property_address', e.target.value)}
                  rows={2}
                  className="text-sm"
                />
              ) : (
                <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{formData.property_address || 'N/A'}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postcode" className="text-sm font-medium">Postcode</Label>
              {isEditing ? (
                <Input
                  id="postcode"
                  value={formData.postcode}
                  onChange={(e) => handleInputChange('postcode', e.target.value)}
                  className="text-sm"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{formData.postcode || 'N/A'}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Information */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Home className="w-4 h-4 text-primary" />
            Property Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-blue-700">Property Type</Label>
              {isEditing ? (
                <Input
                  value={formData.property_type}
                  onChange={(e) => handleInputChange('property_type', e.target.value)}
                  placeholder="e.g., Flat, House, Studio"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-100/60 to-indigo-100/60 rounded-lg border border-blue-200/40">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800">{formData.property_type || 'N/A'}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-blue-700">Bedrooms</Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
                />
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-100/60 to-indigo-100/60 rounded-lg border border-blue-200/40">
                  <Home className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800 font-medium">{formData.bedrooms || 0}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-blue-700">Bathrooms</Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 0)}
                />
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-100/60 to-indigo-100/60 rounded-lg border border-blue-200/40">
                  <Home className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800 font-medium">{formData.bathrooms || 0}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-blue-700">Monthly Rent</Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={formData.monthly_rent}
                  onChange={(e) => handleInputChange('monthly_rent', parseFloat(e.target.value) || 0)}
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-emerald-100/60 to-teal-100/60 rounded-lg border border-emerald-200/40">
                  <span className="font-bold text-xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    £{formData.monthly_rent?.toLocaleString() || '0'}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Move-in Date</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.move_in_date}
                  onChange={(e) => handleInputChange('move_in_date', e.target.value)}
                />
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-100/60 to-indigo-100/60 rounded-lg border border-blue-200/40">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800 font-medium">{formData.move_in_date ? new Date(formData.move_in_date).toLocaleDateString() : 'N/A'}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tenancy Length</Label>
              {isEditing ? (
                <Input
                  value={formData.tenancy_length}
                  onChange={(e) => handleInputChange('tenancy_length', e.target.value)}
                  placeholder="e.g., 12 months"
                />
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-100/60 to-indigo-100/60 rounded-lg border border-blue-200/40">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800 font-medium">{formData.tenancy_length || 'N/A'}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Security Deposit</Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={formData.deposit}
                  onChange={(e) => handleInputChange('deposit', parseFloat(e.target.value) || 0)}
                />
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-100/60 to-yellow-100/60 rounded-lg border border-amber-200/40">
                  <span className="font-bold text-xl bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                    £{formData.deposit?.toLocaleString() || '0'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Landlord Information */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 hover:shadow-2xl transition-all duration-300" style={{ boxShadow: 'var(--shadow-elegant)' }}>
        <CardHeader className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 rounded-t-lg border-b border-orange-200/50">
          <CardTitle className="flex items-center gap-3 text-orange-800">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            Landlord Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-orange-700 font-semibold">Landlord Name</Label>
              {isEditing ? (
                <Input
                  value={formData.landlord_name}
                  onChange={(e) => handleInputChange('landlord_name', e.target.value)}
                  className="border-orange-300 focus:border-primary focus:ring-primary"
                />
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-100/60 to-amber-100/60 rounded-xl border border-orange-200/50 shadow-sm">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg shadow-md">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-orange-800">{formData.landlord_name || 'N/A'}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-orange-700 font-semibold">Landlord Email</Label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.landlord_email}
                  onChange={(e) => handleInputChange('landlord_email', e.target.value)}
                  className="border-orange-300 focus:border-primary focus:ring-primary"
                />
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-100/60 to-amber-100/60 rounded-xl border border-orange-200/50 shadow-sm">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg shadow-md">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-orange-800">{formData.landlord_email || 'N/A'}</span>
                </div>
              )}
            </div>

            <div className="space-y-3 md:col-span-1">
              <Label className="text-orange-700 font-semibold">Landlord Phone</Label>
              {isEditing ? (
                <Input
                  value={formData.landlord_phone}
                  onChange={(e) => handleInputChange('landlord_phone', e.target.value)}
                  className="border-orange-300 focus:border-primary focus:ring-primary"
                />
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-100/60 to-amber-100/60 rounded-xl border border-orange-200/50 shadow-sm">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg shadow-md">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-orange-800">{formData.landlord_phone || 'N/A'}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 hover:shadow-2xl transition-all duration-300" style={{ boxShadow: 'var(--shadow-elegant)' }}>
        <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-t-lg border-b border-indigo-200/50">
          <CardTitle className="text-indigo-800 font-bold">Additional Notes</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isEditing ? (
            <Textarea
              value={formData.additional_info}
              onChange={(e) => handleInputChange('additional_info', e.target.value)}
              placeholder="Add any additional notes about your tenancy..."
              rows={4}
              className="border-indigo-300 focus:border-primary focus:ring-primary resize-none"
            />
          ) : (
            <div className="p-4 bg-gradient-to-r from-indigo-100/60 via-purple-100/60 to-pink-100/60 rounded-xl border border-indigo-200/50 shadow-sm min-h-[120px]">
              {formData.additional_info ? (
                <p className="text-indigo-800 font-medium leading-relaxed">{formData.additional_info}</p>
              ) : (
                <span className="text-indigo-600/70 italic">
                  No additional notes added yet. Click "Edit Profile" to add notes about your tenancy.
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExternalTenantProfile;