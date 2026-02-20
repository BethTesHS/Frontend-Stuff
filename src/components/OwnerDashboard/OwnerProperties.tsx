// src/components/OwnerDashboard/OwnerProperties.tsx
import { Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const OwnerProperties = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">My Properties</h2>
        <Link to="/my-properties">
          <Button className="bg-primary hover:bg-primary/90">
            View All Properties
          </Button>
        </Link>
      </div>
      <div className="text-center py-8">
        <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Property management content will be displayed here</p>
      </div>
    </div>
  );
};