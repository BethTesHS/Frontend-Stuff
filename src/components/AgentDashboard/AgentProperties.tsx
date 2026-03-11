import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Wand2, X } from "lucide-react";
import { PropertyManagementList } from "../Properties/PropertyManagementList";
import { PropertyImprovementModal } from "./PropertyImprovementModal";
import ListProperty from "@/pages/ListProperty";

interface AgentPropertiesProps {
  onOpenListModal: () => void;
  initialMode?: "default" | "improve";
  user: any; 
  isAgencyMode: boolean;
}

export const AgentProperties = ({
  onOpenListModal,
  initialMode = "default",
  user,
  isAgencyMode,
}: AgentPropertiesProps) => {
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [isImproveModalOpen, setIsImproveModalOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState(initialMode);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {currentMode === "improve" ? (
          <>
            <div>
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-foreground font-poppins">
                  Improve Your Properties
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Choose a property to see performance analysis
              </p>
            </div>
            <Button
              onClick={() => setCurrentMode("default")}
              className="bg-primary hover:bg-primary/90"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel Selection
            </Button>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                My Properties
              </h2>
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
          </>
        )}
      </div>
      <PropertyManagementList
        selectionMode={currentMode}
        onAnalyze={handleRunAnalysis}
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
        isAgencyMode={isAgencyMode}
        defaultValues={selectedProperty}
      />
    </div>
  );
};