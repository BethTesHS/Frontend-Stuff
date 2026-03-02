// src/components/AgentDashboard/AgentProperties.tsx
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PropertyManagementList } from '../Properties/PropertyManagementList';

interface AgentPropertiesProps {
  onOpenListModal: () => void;
}

export const AgentProperties = ({ onOpenListModal }: AgentPropertiesProps) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">My Properties</h2>
          <p className="text-sm text-muted-foreground">
            Manage your property listings
          </p>
        </div>
        <Button 
          onClick={onOpenListModal} 
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>
      <PropertyManagementList />
    </div>
  );
};