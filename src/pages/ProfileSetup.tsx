
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { profileApi } from '@/services/api';
import { setHomedUser } from '@/utils/tokenStorage';
import {
  User, Building, MapPin, Phone, FileText, Briefcase, ArrowLeft, Mail,
  Globe, Calendar, Award, Upload, Image as ImageIcon, Clock, Users
} from 'lucide-react';

// Backend API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://homedapp1.azurewebsites.net/api';
// Extract base URL without /api suffix for image URLs
const BASE_URL = API_BASE_URL.replace('/api', '');

interface ProfileSetupData {
  name: string;
  company?: string;
  location: string;
  description: string;
  phone: string;
  email: string;
  specialization?: string;
  experience?: string;
  officeAddress?: string;
  aboutMe?: string;
  serviceAreas?: string;
}

const ProfileSetup = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { loading, hasAccess } = useAuthGuard(['agent', 'owner'], false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<ProfileSetupData>({
    defaultValues: {
      name: user ? `${user.firstName} ${user.lastName}` : '',
      email: user?.email || '',
    }
  });

  // Watch form data for auto-save
  const formData = watch();

  useEffect(() => {
    if (user?.id) {
      setImagePreview(null);
      setExistingImageUrl(null);
      setProfileImage(null);
      reset({
        name: `${user.firstName} ${user.lastName}` || '',
        email: user.email || '',
        phone: '',
        location: '',
        company: '',
        specialization: '',
        experience: '',
        serviceAreas: '',
        officeAddress: '',
        description: '',
      });
    }
  }, [user?.id, reset]);

  useEffect(() => {
    const loadExistingProfile = async () => {
      try {
        setLoadingProfile(true);
        
        setImagePreview(null);
        setExistingImageUrl(null);
        setProfileImage(null);
        
        const response = await profileApi.getProfile();
        
        if (response.success && response.data.profile) {
          const profile = response.data.profile;
          
          // If profile already exists and is complete, redirect to dashboard
          if (profile.is_profile_complete) {
            toast.success('Profile already completed. Redirecting to dashboard...');
            navigate('/dashboard');
            return;
          }
          
          // Pre-fill form with existing data
          reset({
            name: profile.name || `${user?.firstName} ${user?.lastName}` || '',
            email: user?.email || '',
            phone: profile.phone || '',
            location: profile.location || '',
            company: profile.company || '',
            specialization: profile.specialization || '',
            experience: profile.experience || '',
            serviceAreas: profile.service_areas || '',
            officeAddress: profile.office_address || '',
            description: profile.description || '',
          });
          
          // Set existing profile image if available
          if (profile.profile_picture_url) {
            const fullImageUrl = `${BASE_URL}${profile.profile_picture_url}`;
            setExistingImageUrl(fullImageUrl);
            setImagePreview(fullImageUrl);
          }
          
        } else {
          loadDraftData();
        }
      } catch (error) {
        loadDraftData();
      } finally {
        setLoadingProfile(false);
      }
    };

    const loadDraftData = () => {
      if (user) {
        const draftKey = `profileDraft_${user.id}`;
        const savedDraft = localStorage.getItem(draftKey);
        
        if (savedDraft) {
          try {
            const draftData = JSON.parse(savedDraft);
            console.log('📄 Loading draft data for user', user.id, ':', draftData);
            
            // Only load draft if we don't have existing profile data
            if (!existingImageUrl) {
              Object.entries(draftData).forEach(([key, value]) => {
                if (value && typeof value === 'string' && value.trim()) {
                  setValue(key as keyof ProfileSetupData, value);
                }
              });
              console.log('✅ Draft data loaded into form');
            }
          } catch (error) {
            console.log('⚠️ Could not parse draft data for user', user.id, ':', error);
          }
        } else {
          console.log('📝 No draft data found for user', user.id);
        }
      }
    };

    if (user && hasAccess) {
      loadExistingProfile();
    } else {
      setLoadingProfile(false);
    }
  }, [user, hasAccess, reset, setValue, existingImageUrl]);

  // Save form data to localStorage on every change (draft save)
  useEffect(() => {
    if (!loadingProfile && formData && user) {
      const draftKey = `profileDraft_${user.id}`;
      // Only save non-empty values
      const dataToSave = Object.fromEntries(
        Object.entries(formData).filter(([key, value]) => value && value.trim && value.trim() !== '')
      );
      
      if (Object.keys(dataToSave).length > 0) {
        localStorage.setItem(draftKey, JSON.stringify(dataToSave));
      }
    }
  }, [formData, user, loadingProfile]);

  const clearDraft = () => {
    if (user) {
      const draftKey = `profileDraft_${user.id}`;
      localStorage.removeItem(draftKey);
    }
  };

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
        setExistingImageUrl(null); // Clear existing image when new one is selected
      };
      reader.readAsDataURL(file);
      
      toast.success('New profile image selected');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading || loadingProfile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {loadingProfile ? 'Loading your profile...' : 'Loading...'}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!hasAccess) {
    return null;
  }

  const isAgent = user?.role === 'agent';
  const isOwner = user?.role === 'owner';

  const getRoleDescription = () => {
    if (isAgent) return 'Set up your professional profile to be featured in our agent directory';
    if (isOwner) return 'Complete your profile to start listing and managing your properties';
    return 'Complete your profile to get started';
  };

  const onSubmit = async (data: ProfileSetupData) => {
    if (isAgent && !profileImage && !existingImageUrl) {
      toast.error('Profile picture is required for agents');
      return;
    }

    setSubmitting(true);
    try {
      
      if (isAgent) {
        // For agents, use FormData to include profile image
        const formDataToSend = new FormData();
        
        // Add all form fields
        Object.entries(data).forEach(([key, value]) => {
          if (value) {
            formDataToSend.append(key, value);
          }
        });
        
        // Add role
        if (user?.role) {
          formDataToSend.append('role', user.role);
        }
        
        if (profileImage) {
          formDataToSend.append('profileImage', profileImage);
        }
        
        await profileApi.setupProfileWithImage(formDataToSend);
        
      } else {
        const profileData = {
          ...data,
          role: user?.role
        };
        
        await profileApi.setupProfile(profileData);
      }
      
      if (updateUser) {
        updateUser({
          ...user,
          profileComplete: true
        });
      }

      if (user) {
        const updatedUser = { ...user, profileComplete: true };
        setHomedUser(updatedUser);
      }
      
      clearDraft();
      
      toast.success('Profile setup completed successfully!');
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Profile setup error:', error);
      toast.error(error.message || 'Failed to setup profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Modern Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] bg-[length:50px_50px] opacity-20"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-8 flex items-center text-muted-foreground hover:text-foreground bg-card/50 backdrop-blur-md hover:bg-card/80 border border-border rounded-2xl h-12 px-6 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 mr-3" />
            Back to Dashboard
          </Button>

          {/* Progress Indicator */}
          {!loadingProfile && (
            <div className="mb-6 space-y-3">
              {/* Auto-save indicator */}
              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl">
                <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Your progress is automatically saved as you type
                  </span>
                </div>
              </div>

              {/* Existing data indicator */}
              {existingImageUrl && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Your existing profile data has been loaded
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modern Profile Setup Form */}
          <div className="bg-card/50 backdrop-blur-xl border border-border shadow-2xl rounded-3xl overflow-hidden animate-fade-in">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-card/70 to-card/50 backdrop-blur-md border-b border-border px-10 py-12 text-center">
              <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/25 animate-scale-in">
                <User className="w-12 h-12 text-primary-foreground" />
              </div>
              <h1 className="text-5xl font-bold text-foreground mb-4 tracking-tight">
                Complete Profile Setup
              </h1>
              <p className="text-muted-foreground text-xl font-medium max-w-lg mx-auto leading-relaxed">
                {getRoleDescription()}
              </p>
            </div>

            {/* Form Content */}
            <div className="p-10">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                
                {/* Profile Picture Section - Only for Agents */}
                {isAgent && (
                  <div className="text-center space-y-8">
                    <div className="flex items-center justify-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <h3 className="text-2xl font-semibold text-foreground">Profile Picture</h3>
                      <span className="text-destructive text-xl">*</span>
                    </div>
                    
                    <div className="flex flex-col items-center space-y-6">
                      <div 
                        onClick={triggerFileInput}
                        className="relative w-40 h-40 rounded-2xl border-2 border-dashed border-border hover:border-primary transition-all duration-300 cursor-pointer bg-muted/20 hover:bg-muted/40 flex items-center justify-center group overflow-hidden backdrop-blur-sm"
                      >
                        {imagePreview ? (
                          <img 
                            src={imagePreview} 
                            alt="Profile preview" 
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors mb-3 mx-auto" />
                            <p className="text-sm text-muted-foreground font-medium">Upload Photo</p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-background/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                          <Upload className="w-8 h-8 text-foreground" />
                        </div>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <div className="text-center">
                        <p className="text-muted-foreground text-sm font-medium mb-2">
                          Click to upload your professional photo (Max 5MB)
                        </p>
                        {existingImageUrl && !profileImage && (
                          <p className="text-green-600 text-xs">
                            Using your existing profile photo
                          </p>
                        )}
                        {profileImage && (
                          <p className="text-blue-600 text-xs">
                            New photo selected: {profileImage.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Basic Information Section */}
                <div className="space-y-8">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h3 className="text-2xl font-semibold text-foreground">Basic Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-foreground font-medium text-base flex items-center gap-2">
                        Full Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        {...register('name', { required: 'Name is required' })}
                        placeholder="e.g., Sarah Johnson"
                        className="h-14 bg-muted/20 backdrop-blur-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder-muted-foreground rounded-xl text-base transition-all duration-300"
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive mt-2 font-medium">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-foreground font-medium text-base flex items-center gap-2">
                        Email Address <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-5 top-5 w-5 h-5 text-muted-foreground" />
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
                          placeholder="sarah@example.com"
                          className="h-14 pl-14 bg-muted/20 backdrop-blur-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder-muted-foreground rounded-xl text-base transition-all duration-300"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-destructive mt-2 font-medium">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Show additional fields for agents only */}
                    {isAgent && (
                      <>
                        <div className="space-y-3">
                          <Label htmlFor="phone" className="text-foreground font-medium text-base flex items-center gap-2">
                            Phone Number <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-5 top-5 w-5 h-5 text-muted-foreground" />
                            <Input
                              id="phone"
                              {...register('phone', { required: 'Phone number is required' })}
                              placeholder="e.g., +44 20 1234 5678"
                              className="h-14 pl-14 bg-muted/20 backdrop-blur-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder-muted-foreground rounded-xl text-base transition-all duration-300"
                            />
                          </div>
                          {errors.phone && (
                            <p className="text-sm text-destructive mt-2 font-medium">{errors.phone.message}</p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="location" className="text-foreground font-medium text-base flex items-center gap-2">
                            Primary Location <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <MapPin className="absolute left-5 top-5 w-5 h-5 text-muted-foreground" />
                            <Input
                              id="location"
                              {...register('location', { required: 'Location is required' })}
                              placeholder="e.g., Central London"
                              className="h-14 pl-14 bg-muted/20 backdrop-blur-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder-muted-foreground rounded-xl text-base transition-all duration-300"
                            />
                          </div>
                          {errors.location && (
                            <p className="text-sm text-destructive mt-2 font-medium">{errors.location.message}</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Professional Information Section - Only for Agents */}
                {isAgent && (
                  <div className="space-y-8">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-secondary-foreground" />
                      </div>
                      <h3 className="text-2xl font-semibold text-foreground">Professional Details</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label htmlFor="company" className="text-foreground font-medium text-base flex items-center gap-2">
                          Company <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Building className="absolute left-5 top-5 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="company"
                            {...register('company', { 
                              required: 'Company is required'
                            })}
                            placeholder="e.g., Premier Properties Ltd"
                            className="h-14 pl-14 bg-muted/20 backdrop-blur-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder-muted-foreground rounded-xl text-base transition-all duration-300"
                          />
                        </div>
                        {errors.company && (
                          <p className="text-sm text-destructive mt-2 font-medium">{errors.company.message}</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="specialization" className="text-foreground font-medium text-base flex items-center gap-2">
                          Specialization <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="specialization"
                          {...register('specialization', { required: 'Specialization is required' })}
                          placeholder="e.g., Residential Sales & New Homes"
                          className="h-14 bg-muted/20 backdrop-blur-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder-muted-foreground rounded-xl text-base transition-all duration-300"
                        />
                        {errors.specialization && (
                          <p className="text-sm text-destructive mt-2 font-medium">{errors.specialization.message}</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="experience" className="text-foreground font-medium text-base flex items-center gap-2">
                          Years of Experience <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Calendar className="absolute left-5 top-5 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="experience"
                            {...register('experience', { required: 'Experience is required' })}
                            placeholder="e.g., 8+ years"
                            className="h-14 pl-14 bg-muted/20 backdrop-blur-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder-muted-foreground rounded-xl text-base transition-all duration-300"
                          />
                        </div>
                        {errors.experience && (
                          <p className="text-sm text-destructive mt-2 font-medium">{errors.experience.message}</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="serviceAreas" className="text-foreground font-medium text-base flex items-center gap-2">
                          Service Areas <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="serviceAreas"
                          {...register('serviceAreas', { required: 'Service areas are required' })}
                          placeholder="e.g., Mayfair, Marylebone, Fitzrovia"
                          className="h-14 bg-muted/20 backdrop-blur-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder-muted-foreground rounded-xl text-base transition-all duration-300"
                        />
                        {errors.serviceAreas && (
                          <p className="text-sm text-destructive mt-2 font-medium">{errors.serviceAreas.message}</p>
                        )}
                      </div>

                      <div className="md:col-span-2 space-y-3">
                        <Label htmlFor="officeAddress" className="text-foreground font-medium text-base flex items-center gap-2">
                          Office Address <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-5 top-5 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="officeAddress"
                            {...register('officeAddress', { required: 'Office address is required' })}
                            placeholder="e.g., 123 Oxford Street, London W1D 2HX"
                            className="h-14 pl-14 bg-muted/20 backdrop-blur-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder-muted-foreground rounded-xl text-base transition-all duration-300"
                          />
                        </div>
                        {errors.officeAddress && (
                          <p className="text-sm text-destructive mt-2 font-medium">{errors.officeAddress.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Description Section - Only for Agents */}
                {isAgent && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                        <FileText className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                        Professional Summary <span className="text-destructive">*</span>
                      </h3>
                    </div>
                    <Textarea
                      id="description"
                      {...register('description', { required: 'Description is required' })}
                      placeholder="Describe your experience, expertise, and professional background..."
                      rows={5}
                      className="bg-muted/20 backdrop-blur-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none text-foreground placeholder-muted-foreground rounded-xl text-base p-5 transition-all duration-300"
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive mt-2 font-medium">{errors.description.message}</p>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-8">
                  <Button 
                    type="submit" 
                    className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground border-none shadow-2xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] text-lg font-semibold rounded-2xl active:scale-[0.98]" 
                    disabled={submitting}
                  >
                    {submitting ? (
                      <div className="flex items-center space-x-4">
                        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary-foreground"></div>
                        <span className="text-lg">Setting up profile...</span>
                      </div>
                    ) : (
                      <span className="text-lg">Complete Profile Setup</span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileSetup;
