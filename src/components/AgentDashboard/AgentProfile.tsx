// src/components/AgentDashboard/AgentProfile.tsx
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { User, Building, MapPin, Calendar, Award, FileText, Phone, Mail, Briefcase, Upload, Edit } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { profileApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export const AgentProfile = ({ user }: { user: any }) => {
  const [submitting, setSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: user ? `${user.firstName || ''} ${user.lastName || ''}` : '',
      email: user?.email || '',
      company: '', location: '', description: '', phone: '', specialization: '', experience: '', officeAddress: '', serviceAreas: ''
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const response = await profileApi.getProfile();
        if (response.success && response.data) {
          const { profile, user: userData } = response.data;
          setProfileData(profile);
          if (profile?.profile_picture_url) setImagePreview(profile.profile_picture_url);
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
          setIsEditMode(!profile || Object.keys(profile).length === 0);
        }
      } catch (error) {
        setIsEditMode(true);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast({ title: "Error", description: "Image size < 5MB", variant: "destructive" });
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => formData.append(key, data[key]));
      if (profileImage) formData.append('profile_picture', profileImage);

      let response;
      if (profileData && Object.keys(profileData).length > 0) {
        response = await profileApi.updateProfile(data); // Pass flat object as required by API
      } else {
        response = await profileApi.setupProfileWithImage(formData);
      }

      if (response.success) {
        toast({ title: "Success", description: "Profile updated successfully!" });
        setIsEditMode(false);
      }
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (profileLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Agent Profile</h2>
          <p className="text-sm text-muted-foreground">{isEditMode ? 'Update your professional profile' : 'View your profile'}</p>
        </div>
        {profileData && Object.keys(profileData).length > 0 && (
          <Button variant={isEditMode ? "outline" : "default"} onClick={() => setIsEditMode(!isEditMode)}>
            <Edit className="w-4 h-4 mr-2" /> {isEditMode ? 'Cancel Edit' : 'Edit Profile'}
          </Button>
        )}
      </div>

      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <div onClick={isEditMode ? () => fileInputRef.current?.click() : undefined} className={`relative w-32 h-32 rounded-full border-4 border-dashed border-primary/30 flex items-center justify-center overflow-hidden ${isEditMode ? 'cursor-pointer hover:border-primary/60' : ''}`}>
                  {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover rounded-full" /> : <Upload className="w-8 h-8 text-muted-foreground" />}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-card/80 border-primary/20"><CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Basic Information</h3>
                <div><Label>Full Name</Label><Input {...register('name')} readOnly={!isEditMode} /></div>
                <div><Label>Email</Label><Input {...register('email')} readOnly={!isEditMode} /></div>
                <div><Label>Phone</Label><Input {...register('phone')} readOnly={!isEditMode} /></div>
                <div><Label>Location</Label><Input {...register('location')} readOnly={!isEditMode} /></div>
              </CardContent></Card>

              <Card className="bg-card/80 border-primary/20"><CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> Professional Details</h3>
                <div><Label>Company</Label><Input {...register('company')} readOnly={!isEditMode} /></div>
                <div><Label>Specialization</Label><Input {...register('specialization')} readOnly={!isEditMode} /></div>
                <div><Label>Experience</Label><Input {...register('experience')} readOnly={!isEditMode} /></div>
              </CardContent></Card>
            </div>

            {isEditMode && (
              <Button type="submit" className="w-full h-14 text-lg" disabled={submitting}>
                {submitting ? 'Updating...' : 'Save Profile'}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};