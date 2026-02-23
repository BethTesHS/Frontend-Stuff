import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, MapPin, Phone, Mail, Calendar, ShieldAlert, 
  Edit2, Save, X, User as UserIcon, Briefcase 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export interface UserProfileProps {
  /** * Defines which specific dashboard blocks to render. 
   * If not provided, it falls back to the role found in the AuthContext user object.
   */
  userType?: 'owner' | 'tenant' | 'agent' | 'buyer' | 'admin' | 'external_tenant';
}

export const UserProfile: React.FC<UserProfileProps> = ({ userType }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Determine the active role
  const activeRole = userType || user?.role?.toLowerCase() || 'user';
  const isTenant = activeRole === 'tenant' || activeRole === 'external_tenant';
  const isAgent = activeRole === 'agent' || activeRole === 'agency';

  const getUserInitials = () => {
    if (!user?.firstName && !user?.lastName) return "U"; // 'U' for User
    return `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();
  };

  const [isEditing, setIsEditing] = useState(false);
  
  // 1. Generalized unified state
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profilePicture: "",
    
    // Emergency Contact (General)
    emergencyContactName: "Not Set",
    emergencyContactPhone: "Not Set",

    // Tenant-specific properties
    propertyName: "Not Assigned",
    unitNumber: "N/A",
    leaseStart: "N/A",
    leaseEnd: "N/A",

    // Agent/Professional specific properties
    agencyName: "N/A",
    licenseNumber: "N/A"
  });
  
  const [formData, setFormData] = useState(userData);

  // 2. Hydrate state
  useEffect(() => {
    if (user) {
      const hydratedData = {
        firstName: user.firstName || "Unknown",
        lastName: user.lastName ||  "",
        email: user.email || "",
        phone: user.phone ||  "???",
        profilePicture: user.avatar || getUserInitials(),

        emergencyContactName: "N/A",
        emergencyContactPhone: "N/A",

        propertyName: "N/A",
        unitNumber: "N/A",
        leaseStart: "N/A",
        leaseEnd: "N/A",

        agencyName: "N/A",
        licenseNumber: "N/A",
      };

      setUserData(hydratedData);
      setFormData(hydratedData);
    }
  }, [user]);

  const handleEditClick = () => {
    setFormData(userData);
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setFormData(userData);
    setIsEditing(false);
  };

  const handleSaveClick = async () => {
    try {
      // TODO: Replace with your actual unified update API call
      // await api.updateUserProfile(user.id, formData);
      
      setUserData(formData);
      setIsEditing(false);
      
      toast({
        title: "Profile saved",
        description: "Your profile information has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error saving profile",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profilePicture: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const renderField = (label: string, name: keyof typeof formData, icon: React.ReactNode, type = "text", readOnly = false) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={name} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          {icon} {label}
        </Label>
        {isEditing && !readOnly ? (
          <Input
            id={name}
            name={name}
            type={type}
            value={formData[name]}
            onChange={handleInputChange}
            className="w-full transition-colors focus-visible:ring-primary"
          />
        ) : (
          <div className={`w-full p-3 rounded-md border ${readOnly && isEditing ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : 'bg-secondary/20'} border-border/50 text-sm font-medium transition-colors`}>
            {isEditing ? formData[name] : userData[name]}
          </div>
        )}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/10">
        <p className="text-muted-foreground animate-pulse">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-muted/10 p-4 md:p-8 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6 pb-12">

        {/* Main Profile Info Card */}
        <Card className="shadow-sm border-border/50 overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4 shrink-0">
                <div className="relative group">
                  <Avatar className="w-32 h-32 border-4 border-background shadow-md">
                    <AvatarImage 
                      src={isEditing ? formData.profilePicture : userData.profilePicture} 
                      alt={`${userData.firstName} ${userData.lastName}`} 
                      className="object-cover" 
                    />
                    <AvatarFallback className="text-3xl bg-primary/10 text-primary font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {isEditing && (
                    <Label
                      htmlFor="photo-upload"
                      className="absolute bottom-1 right-1 p-2.5 bg-primary text-primary-foreground rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
                    >
                      <Camera className="w-4 h-4" />
                      <Input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </Label>
                  )}
                </div>
                
                {/* Mobile basic info view */}
                <div className="text-center md:hidden mt-2">
                  <h2 className="text-xl font-bold text-foreground">
                    {isEditing ? formData.firstName : userData.firstName} {isEditing ? formData.lastName : userData.lastName}
                  </h2>
                  {isTenant && <p className="text-sm text-muted-foreground mt-1">{userData.propertyName}</p>}
                  {isAgent && <p className="text-sm text-muted-foreground mt-1">{userData.agencyName}</p>}
                </div>
              </div>

              {/* Personal Details Form Grid */}
              <div className="flex-1 w-full space-y-6">
                <div className="hidden md:block mb-6 border-b pb-4">
                  <h2 className="text-2xl font-bold text-foreground">
                    {isEditing ? formData.firstName : userData.firstName} {isEditing ? formData.lastName : userData.lastName}
                  </h2>
                  {isTenant && (
                    <p className="text-muted-foreground flex items-center gap-2 mt-1.5 font-medium">
                      <MapPin className="w-4 h-4 text-primary/70" /> 
                      {userData.propertyName} <span className="opacity-50">|</span> Unit {userData.unitNumber}
                    </p>
                  )}
                  {isAgent && (
                    <p className="text-muted-foreground flex items-center gap-2 mt-1.5 font-medium">
                      <Briefcase className="w-4 h-4 text-primary/70" /> 
                      {userData.agencyName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  {renderField("First Name", "firstName", <UserIcon className="w-3.5 h-3.5" />)}
                  {renderField("Last Name", "lastName", <UserIcon className="w-3.5 h-3.5" />)}
                  {renderField("Email Address", "email", <Mail className="w-3.5 h-3.5" />, "email")}
                  {renderField("Phone Number", "phone", <Phone className="w-3.5 h-3.5" />, "tel")}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto mt-4 md:mt-0">
                {!isEditing ? (
                  <Button onClick={handleEditClick} className="w-full sm:w-auto gap-2 shadow-sm hover:-translate-y-0.5 transition-transform">
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleCancelClick} className="w-full sm:w-auto gap-2">
                      <X className="w-4 h-4" /> Cancel
                    </Button>
                    <Button onClick={handleSaveClick} className="w-full sm:w-auto gap-2 shadow-sm hover:-translate-y-0.5 transition-transform">
                      <Save className="w-4 h-4" /> Save Changes
                    </Button>
                  </>
                )}
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Dynamic Two-Column Grid for Secondary Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Tenant-Only Block: Lease Details */}
          {isTenant && (
            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-4 border-b border-border/50 bg-secondary/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> Lease Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  {renderField("Property Name", "propertyName", <MapPin className="w-3.5 h-3.5" />, "text", true)}
                  {renderField("Unit Number", "unitNumber", <MapPin className="w-3.5 h-3.5" />, "text", true)}
                  {renderField("Lease Start", "leaseStart", <Calendar className="w-3.5 h-3.5" />, "date", true)}
                  {renderField("Lease End", "leaseEnd", <Calendar className="w-3.5 h-3.5" />, "date", true)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Agent-Only Block: Agency Details */}
          {isAgent && (
            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-4 border-b border-border/50 bg-secondary/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" /> Professional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                  {renderField("Agency Name", "agencyName", <Briefcase className="w-3.5 h-3.5" />)}
                  {renderField("License Number", "licenseNumber", <ShieldAlert className="w-3.5 h-3.5" />)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emergency Contact Card (Visible to everyone) */}
          <Card className={`shadow-sm border-border/50 ${(!isTenant && !isAgent) ? 'lg:col-span-2' : ''}`}>
            <CardHeader className="pb-4 border-b border-border/50 bg-secondary/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-destructive" /> Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className={`grid grid-cols-1 gap-x-6 gap-y-5 ${(!isTenant && !isAgent) ? 'sm:grid-cols-2' : ''}`}>
                {renderField("Contact Name", "emergencyContactName", <UserIcon className="w-3.5 h-3.5" />)}
                {renderField("Contact Phone", "emergencyContactPhone", <Phone className="w-3.5 h-3.5" />, "tel")}
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  );
};

export default UserProfile;