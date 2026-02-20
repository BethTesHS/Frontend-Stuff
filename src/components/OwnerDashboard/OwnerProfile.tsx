// src/components/OwnerDashboard/OwnerProfile.tsx
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileUpdateDialog } from '@/components/Owner/ProfileUpdateDialog';

export const OwnerProfile = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Profile Settings</h2>
        <ProfileUpdateDialog>
          <Button className="bg-primary hover:bg-primary/90">
            Update Profile
          </Button>
        </ProfileUpdateDialog>
      </div>
      <div className="text-center py-8">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Profile management content will be displayed here</p>
      </div>
    </div>
  );
};