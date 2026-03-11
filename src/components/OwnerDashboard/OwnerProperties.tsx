// src/components/OwnerDashboard/OwnerProperties.tsx
import { Building, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PropertyManagementList } from '../Properties/PropertyManagementList';
import SelectAgent from '@/pages/SelectAgent';
import ListProperty from '@/pages/ListProperty';
import { PropertyImprovementModal } from '../AgentDashboard/PropertyImprovementModal';
import { useState, useEffect } from 'react';


interface OwnerPropertiesProps {
  onOpenListModal: () => void;
  isSelectingAgent: boolean;
  setIsSelectingAgent: (val: boolean) => void;
  pendingPropertyData: any;
  user: any;
  initialMode?: "default" | "improve";
}

export const OwnerProperties = ({ onOpenListModal, isSelectingAgent, setIsSelectingAgent, pendingPropertyData, user, initialMode = "default"}: OwnerPropertiesProps) => {
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [isImproveModalOpen, setIsImproveModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<"default" | "improve">(initialMode);

  useEffect(() => {
    setCurrentMode(initialMode);
  }, [initialMode]);

  const handleRunAnalysis = (property: any) => {
    setSelectedProperty(property);
    setIsImproveModalOpen(true);
  };

  const handleOpenEdit = () => {
    setIsImproveModalOpen(false);
    setIsEditModalOpen(true);
  };
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
        <div className="flex items-center gap-3">
          {currentMode === "improve" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMode("default")}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {currentMode === "improve"
                ? "Select Property to Improve"
                : "My Properties"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {currentMode === "improve"
                ? "Choose a listing to analyze for AI-powered improvements"
                : "Manage your property listings"}
            </p>
          </div>
        </div>

        {currentMode === "default" && (
          <Button
            onClick={onOpenListModal}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        )}
      </div>

      <PropertyManagementList
        onAnalyze={handleRunAnalysis}
        // Pass the mode to the list so it can show "Analyze" buttons instead of standard actions
        selectionMode={currentMode}
      />

      <PropertyImprovementModal
        property={selectedProperty}
        open={isImproveModalOpen}
        onClose={() => {
          setIsImproveModalOpen(false);
          if (!isEditModalOpen) setSelectedProperty(null);
        }}
        onFix={handleOpenEdit}
      />

      <ListProperty
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProperty(null);
        }}
        user={user}
        isAgencyMode={false}
        defaultValues={selectedProperty}
      />
    </div>
  );
};