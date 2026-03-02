// src/components/OwnerDashboard/OwnerProperties.tsx
import { Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PropertyManagementList } from '../Properties/PropertyManagementList';
import SelectAgent from '@/pages/SelectAgent';


interface OwnerPropertiesProps {
  onOpenListModal: () => void;
  isSelectingAgent: boolean;
  setIsSelectingAgent: (val: boolean) => void;
  pendingPropertyData: any;
}

export const OwnerProperties = ({ onOpenListModal, isSelectingAgent, setIsSelectingAgent, pendingPropertyData }: OwnerPropertiesProps) => {

  if (isSelectingAgent) {
    return (
      <SelectAgent
        propertyData={pendingPropertyData}
        onBack={() => setIsSelectingAgent(false)}
      />
    );
  }
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
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>
      <PropertyManagementList />
    </div>
  );
};