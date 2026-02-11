import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { profileApi } from '@/services/api';
import { User, Mail, Save, Phone, Building } from 'lucide-react';

interface ProfileData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

interface ProfileUpdateDialogProps {
  children: React.ReactNode;
}

export const ProfileUpdateDialog = ({ children }: ProfileUpdateDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileData>({
    defaultValues: {
      name: user ? `${user.firstName} ${user.lastName}` : '',
      email: user?.email || '',
      phone: '',
      company: '',
    }
  });

  // Fetch existing profile data when dialog opens
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!open) return;
      
      try {
        setLoading(true);
        const response = await profileApi.getProfile();
        
        if (response.success && response.data.profile) {
          const profile = response.data.profile;
          reset({
            name: profile.name || `${user?.firstName} ${user?.lastName}` || '',
            email: user?.email || '',
            phone: profile.phone || '',
            company: profile.company || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [open, user, reset]);

  const onSubmit = async (data: ProfileData) => {
    setSubmitting(true);
    try {
      const response = await profileApi.updateProfile(data);
      
      if (response.success) {
        toast.success('Profile updated successfully!');
        setOpen(false);
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-lg border border-white/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <User className="w-5 h-5 text-blue-600" />
            Update Profile
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Update your basic profile information.
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin mr-3" />
            <span className="text-gray-600">Loading profile data...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-medium text-sm">Full Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                placeholder="e.g., John Smith"
                className="h-12 bg-white/40 backdrop-blur-sm border border-white/30 focus:border-blue-400 focus:ring-blue-400/20 text-gray-800 placeholder-gray-500"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium text-sm">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 w-4 h-4 text-gray-500" />
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
                  placeholder="john@example.com"
                  className="h-12 pl-12 bg-white/40 backdrop-blur-sm border border-white/30 focus:border-blue-400 focus:ring-blue-400/20 text-gray-800 placeholder-gray-500"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 font-medium text-sm">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-4 top-4 w-4 h-4 text-gray-500" />
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  placeholder="+1 (555) 123-4567"
                  className="h-12 pl-12 bg-white/40 backdrop-blur-sm border border-white/30 focus:border-blue-400 focus:ring-blue-400/20 text-gray-800 placeholder-gray-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-gray-700 font-medium text-sm">Company</Label>
              <div className="relative">
                <Building className="absolute left-4 top-4 w-4 h-4 text-gray-500" />
                <Input
                  id="company"
                  {...register('company')}
                  placeholder="e.g., Smith Real Estate Holdings"
                  className="h-12 pl-12 bg-white/40 backdrop-blur-sm border border-white/30 focus:border-blue-400 focus:ring-blue-400/20 text-gray-800 placeholder-gray-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};