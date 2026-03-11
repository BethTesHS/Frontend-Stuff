import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Camera,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Edit2,
  Save,
  X,
  User as UserIcon,
  Heart,
  Briefcase,
  Home,
  CheckCircle2,
  Ban,
  XCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface RoommateProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePicture: string;
  age?: number;
  gender: string;
  occupation: string;
  location: string;
  bio: string;
  budget: string;
  moveInDate: string;
  preferences: string;
  roomDescription?: string;
  preferredLocations?: string[];
  likes?: string[];
  dislikes?: string[];
}

export function RoommateProfile() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const getUserInitials = () => {
    if (!userData?.firstName && !userData?.lastName) {
      if (!user?.firstName && !user?.lastName) return "U";
      return `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();
    }
    return `${userData.firstName?.[0] || ""}${userData.lastName?.[0] || ""}`.toUpperCase();
  };

  const [userData, setUserData] = useState<RoommateProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profilePicture: "",
    age: undefined,
    gender: "",
    occupation: "",
    location: "",
    bio: "",
    budget: "",
    moveInDate: "",
    preferences: "",
  });

  const [formData, setFormData] = useState<RoommateProfileData>(userData);

  // Hydrate state with user data
  useEffect(() => {
    if (user) {
      const hydratedData: RoommateProfileData = {
        firstName: user.firstName || "Unknown",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        profilePicture: user.avatar || "",
        age: 26,
        gender: "Not specified",
        occupation: "Professional",
        location: "London, UK",
        bio: "Hi! I am looking for a great roommate to share a place with.",
        budget: "£800 - £1200",
        moveInDate: "As soon as possible",
        preferences: "Clean, Quiet during weekdays",
        likes: ["Reading", "Coffee", "Traveling"],
        dislikes: ["Smoking", "Loud music late at night"],
        roomDescription: "Looking for a spacious room with a lot of natural light.",
        preferredLocations: ["Central London", "East London"],
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
      // TODO: Replace with actual API call to update profile
      // await api.updateRoommateProfile(user.id, formData);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profilePicture: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const renderField = (
    label: string,
    name: keyof RoommateProfileData,
    icon: React.ReactNode,
    type = "text",
    readOnly = false,
    isTextarea = false
  ) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={name} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          {icon} {label}
        </Label>
        {isEditing && !readOnly ? (
          isTextarea ? (
            <textarea
              id={name}
              name={name}
              value={formData[name]}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          ) : (
            <Input
              id={name}
              name={name}
              type={type}
              value={formData[name]}
              onChange={handleInputChange}
              className="w-full transition-colors focus-visible:ring-blue-500"
            />
          )
        ) : (
          <div
            className={`w-full p-3 rounded-md border ${
              readOnly && isEditing
                ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
                : "bg-secondary/20"
            } border-border/50 text-sm font-medium transition-colors`}
          >
            {isEditing ? formData[name] || "N/A" : userData[name] || "Not provided"}
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

        {/* Main Profile Card */}
        <Card className="shadow-sm border-border/50 overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4 shrink-0">
                <div className="relative group">
                  <Avatar className="w-32 h-32 border-4 border-background shadow-md">
                    {(isEditing ? formData.profilePicture : userData.profilePicture) && 
                     !(isEditing ? formData.profilePicture : userData.profilePicture).includes('ui-avatars') &&
                     !(isEditing ? formData.profilePicture : userData.profilePicture).includes('dicebear') ? (
                      <AvatarImage
                        src={isEditing ? formData.profilePicture : userData.profilePicture}
                        alt={`${userData.firstName} ${userData.lastName}`}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="text-4xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>

                  {isEditing && (
                    <Label
                      htmlFor="photo-upload"
                      className="absolute bottom-1 right-1 p-2.5 bg-blue-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-all hover:scale-105"
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

                {/* Mobile Info View */}
                <div className="text-center md:hidden mt-2">
                  <h2 className="text-xl font-bold text-foreground">
                    {isEditing ? formData.firstName : userData.firstName}{" "}
                    {isEditing ? formData.lastName : userData.lastName}
                  </h2>
                  {userData.location && (
                    <p className="text-sm text-muted-foreground mt-1">
                      📍 {userData.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Personal Details Form Grid */}
              <div className="flex-1 w-full space-y-6">
                <div className="hidden md:block mb-6 border-b pb-4">
                  <h2 className="text-2xl font-bold text-foreground">
                    {isEditing ? formData.firstName : userData.firstName}{" "}
                    {isEditing ? formData.lastName : userData.lastName}
                  </h2>
                  {userData.location && (
                    <p className="text-muted-foreground flex items-center gap-2 mt-1.5 font-medium">
                      <MapPin className="w-4 h-4 text-blue-600/70" />
                      {userData.location}
                      {userData.age && (
                        <>
                          <span className="opacity-50">|</span>
                          {userData.age} years old
                        </>
                      )}
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
                  <Button
                    onClick={handleEditClick}
                    className="w-full sm:w-auto gap-2 shadow-sm bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleCancelClick}
                      className="w-full sm:w-auto gap-2"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </Button>
                    <Button
                      onClick={handleSaveClick}
                      className="w-full sm:w-auto gap-2 shadow-sm bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4" /> Save Changes
                    </Button>
                  </>
                )}
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Two-Column Grid for Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Personal Details Card */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4 border-b border-border/50 bg-secondary/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-blue-600" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {renderField("Age", "age", <UserIcon className="w-3.5 h-3.5" />, "number")}
                {renderField("Gender", "gender", <UserIcon className="w-3.5 h-3.5" />)}
                {renderField("Occupation", "occupation", <Briefcase className="w-3.5 h-3.5" />)}
                {renderField("Location", "location", <MapPin className="w-3.5 h-3.5" />)}
              </div>
            </CardContent>
          </Card>

          {/* Roommate Preferences Card */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4 border-b border-border/50 bg-secondary/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-blue-600" /> Living Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                {renderField("Budget Range", "budget", <DollarSign className="w-3.5 h-3.5" />, "text")}
                {renderField("Move-in Date", "moveInDate", <Home className="w-3.5 h-3.5" />, "date")}
              </div>
            </CardContent>
          </Card>

          {/* Bio/About Card - Full Width */}
          <Card className="lg:col-span-2 shadow-sm border-border/50">
            <CardHeader className="pb-4 border-b border-border/50 bg-secondary/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-orange-500" /> About Me
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {renderField(
                "Bio / About Yourself",
                "bio",
                <UserIcon className="w-3.5 h-3.5" />,
                "text",
                false,
                true
              )}
            </CardContent>
          </Card>

          {/* Preferences Card - Full Width */}
          <Card className="lg:col-span-2 shadow-sm border-border/50">
            <CardHeader className="pb-4 border-b border-border/50 bg-secondary/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <Home className="w-5 h-5 text-orange-500" /> Roommate Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {renderField(
                "What are you looking for in a roommate?",
                "preferences",
                <Heart className="w-3.5 h-3.5" />,
                "text",
                false,
                true
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
