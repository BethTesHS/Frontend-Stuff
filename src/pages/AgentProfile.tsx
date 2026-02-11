import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import {
  User, Building, MapPin, Phone, FileText, Briefcase, ArrowLeft, Mail,
  Calendar, Award, Upload, Image as ImageIcon,
  MessageSquare, Edit
} from 'lucide-react';
import { ViewInquiries } from '@/components/Agent/ViewInquiries';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '@/services/api';

interface AgentProfileData {
  name: string;
  company: string;
  location: string;
  description: string;
  phone: string;
  email: string;
  specialization: string;
  experience: string;
  officeAddress: string;
  serviceAreas: string;
}

const AgentProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { loading, hasAccess } = useAuthGuard(['agent']);
  const [submitting, setSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AgentProfileData>({
    defaultValues: {
      name: user ? `${user.firstName} ${user.lastName}` : '',
      email: user?.email || '',
    }
  });

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!hasAccess) return;

      try {
        setProfileLoading(true);
        const response = await profileApi.getProfile();

        if (response.success && response.data) {
          const { profile, user: userData } = response.data;
          setProfileData(profile);

          // Set image preview if profile has an image
          if (profile?.profile_picture_url) {
            setImagePreview(profile.profile_picture_url);
          }

          // Reset form with fetched data
          reset({
            name: profile?.name || `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim(),
            email: userData?.email || '',
            company: profile?.company || '',
            location: profile?.location || '',
            description: profile?.description || '',
            phone: profile?.phone || userData?.phone || '',
            specialization: profile?.specialization || '',
            experience: profile?.experience || '',
            officeAddress: profile?.office_address || '',
            serviceAreas: profile?.service_areas || '',
          });

          // Set edit mode to false if profile exists
          setIsEditMode(!profile || Object.keys(profile).length === 0);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
        setIsEditMode(true); // Enable edit mode if fetch fails
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [hasAccess, reset]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading || profileLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!hasAccess) {
    return null;
  }

  const onSubmit = async (data: AgentProfileData) => {
    setSubmitting(true);
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('company', data.company);
      formData.append('location', data.location);
      formData.append('description', data.description);
      formData.append('phone', data.phone);
      formData.append('specialization', data.specialization);
      formData.append('experience', data.experience);
      formData.append('office_address', data.officeAddress);
      formData.append('service_areas', data.serviceAreas);

      // Add profile image if it exists
      if (profileImage) {
        formData.append('profile_picture', profileImage);
      }

      // Call API based on whether we're creating or updating
      let response;
      if (profileData && Object.keys(profileData).length > 0) {
        // Update existing profile - convert FormData to JSON for update
        const updateData = {
          name: data.name,
          company: data.company,
          location: data.location,
          description: data.description,
          phone: data.phone,
          specialization: data.specialization,
          experience: data.experience,
          office_address: data.officeAddress,
          service_areas: data.serviceAreas,
        };
        response = await profileApi.updateProfile(updateData);
      } else {
        // Setup new profile
        response = await profileApi.setupProfileWithImage(formData);
      }

      if (response.success) {
        toast.success('Profile updated successfully!');
        setIsEditMode(false);
        // Refresh profile data
        const updatedProfile = await profileApi.getProfile();
        if (updatedProfile.success && updatedProfile.data) {
          setProfileData(updatedProfile.data.profile);
        }
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 w-full">
        <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
          {/* Modern Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                onClick={() => navigate('/agent-dashboard')}
                className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>

              {profileData && Object.keys(profileData).length > 0 && (
                <Button
                  variant={isEditMode ? "outline" : "default"}
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  {isEditMode ? 'Cancel Edit' : 'Edit Profile'}
                </Button>
              )}
            </div>

            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
                Agent Profile {isEditMode ? 'Management' : ''}
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {isEditMode
                  ? 'Complete your professional profile and manage client inquiries'
                  : 'View your professional profile information'
                }
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Profile Setup Form */}
            <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  
                  {/* Profile Picture Section */}
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center justify-center gap-2">
                      <ImageIcon className="w-5 h-5 text-primary" />
                      Profile Picture *
                    </h3>
                    <div className="flex flex-col items-center space-y-4">
                      <div
                        onClick={isEditMode ? triggerFileInput : undefined}
                        className={`relative w-32 h-32 rounded-full border-4 border-dashed border-primary/30 transition-colors duration-200 bg-muted/20 flex items-center justify-center group overflow-hidden ${
                          isEditMode ? 'hover:border-primary/60 hover:bg-muted/40 cursor-pointer' : 'cursor-default'
                        }`}
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Profile preview"
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                            <p className="text-xs text-muted-foreground">Upload Photo</p>
                          </div>
                        )}
                        {isEditMode && (
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                            <Upload className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <p className="text-sm text-muted-foreground">
                        Click to upload your professional photo (Max 5MB)
                      </p>
                    </div>
                  </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="bg-card/80 border-primary/20">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Basic Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name" className="text-foreground font-medium">Full Name *</Label>
                          <Input
                            id="name"
                            {...register('name', { required: 'Name is required' })}
                            placeholder="e.g., Sarah Johnson"
                            className="mt-2"
                            readOnly={!isEditMode}
                          />
                          {errors.name && (
                            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="email" className="text-foreground font-medium">Email *</Label>
                          <div className="relative mt-2">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                  value: /^\S+@\S+$/i,
                                  message: 'Invalid email address'
                                }
                              })}
                              placeholder="sarah@premierproperties.com"
                              className="pl-10"
                              readOnly={!isEditMode}
                            />
                          </div>
                          {errors.email && (
                            <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="phone" className="text-foreground font-medium">Phone Number *</Label>
                          <div className="relative mt-2">
                            <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="phone"
                              {...register('phone', { required: 'Phone number is required' })}
                              placeholder="e.g., +44 20 1234 5678"
                              className="pl-10"
                              readOnly={!isEditMode}
                            />
                          </div>
                          {errors.phone && (
                            <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="location" className="text-foreground font-medium">Primary Location *</Label>
                          <div className="relative mt-2">
                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="location"
                              {...register('location', { required: 'Location is required' })}
                              placeholder="e.g., Central London"
                              className="pl-10"
                              readOnly={!isEditMode}
                            />
                          </div>
                          {errors.location && (
                            <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Professional Information */}
                  <Card className="bg-card/80 border-primary/20">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary" />
                        Professional Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="company" className="text-foreground font-medium">Company *</Label>
                          <div className="relative mt-2">
                            <Building className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="company"
                              {...register('company', { required: 'Company is required' })}
                              placeholder="e.g., Premier Properties Ltd"
                              className="pl-10"
                              readOnly={!isEditMode}
                            />
                          </div>
                          {errors.company && (
                            <p className="text-sm text-destructive mt-1">{errors.company.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="specialization" className="text-foreground font-medium">Specialization *</Label>
                          <Input
                            id="specialization"
                            {...register('specialization', { required: 'Specialization is required' })}
                            placeholder="e.g., Residential Sales & New Homes"
                            className="mt-2"
                            readOnly={!isEditMode}
                          />
                          {errors.specialization && (
                            <p className="text-sm text-destructive mt-1">{errors.specialization.message}</p>
                          )}
                        </div>


                        <div>
                          <Label htmlFor="experience" className="text-foreground font-medium">Years of Experience *</Label>
                          <div className="relative mt-2">
                            <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="experience"
                              {...register('experience', { required: 'Experience is required' })}
                              placeholder="e.g., 8+ years"
                              className="pl-10"
                              readOnly={!isEditMode}
                            />
                          </div>
                          {errors.experience && (
                            <p className="text-sm text-destructive mt-1">{errors.experience.message}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="bg-card/80 border-primary/20">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" />
                        Additional Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="serviceAreas" className="text-foreground font-medium">Service Areas *</Label>
                          <Input
                            id="serviceAreas"
                            {...register('serviceAreas', { required: 'Service areas are required' })}
                            placeholder="e.g., Mayfair, Marylebone, Fitzrovia"
                            className="mt-2"
                            readOnly={!isEditMode}
                          />
                          {errors.serviceAreas && (
                            <p className="text-sm text-destructive mt-1">{errors.serviceAreas.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="officeAddress" className="text-foreground font-medium">Office Address *</Label>
                          <div className="relative mt-2">
                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="officeAddress"
                              {...register('officeAddress', { required: 'Office address is required' })}
                              placeholder="e.g., 123 Oxford Street, London W1D 2HX"
                              className="pl-10"
                              readOnly={!isEditMode}
                            />
                          </div>
                          {errors.officeAddress && (
                            <p className="text-sm text-destructive mt-1">{errors.officeAddress.message}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Description Section */}
                <Card className="bg-card/80 border-primary/20">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Professional Summary
                    </h3>
                    <div>
                      <Label htmlFor="description" className="text-foreground font-medium">Professional Summary *</Label>
                      <Textarea
                        id="description"
                        {...register('description', { required: 'Description is required' })}
                        placeholder="Describe your experience, expertise, and professional background..."
                        rows={4}
                        className="mt-2 resize-none"
                        readOnly={!isEditMode}
                      />
                      {errors.description && (
                        <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                {isEditMode && (
                  <div className="pt-6">
                    <Button
                      type="submit"
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
                          <span>Updating Profile...</span>
                        </div>
                      ) : (
                        profileData && Object.keys(profileData).length > 0 ? 'Update Profile' : 'Complete Profile Setup'
                      )}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground mt-3">
                      * All fields marked with asterisk are required
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Client Inquiries Overview */}
          <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Client Inquiries Overview</h2>
              </div>
              <ViewInquiries />
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default AgentProfile;