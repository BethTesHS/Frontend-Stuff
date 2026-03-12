import { useState } from "react";
import { BarChart2 } from "lucide-react";
import { PropertyManagementList } from "../Properties/PropertyManagementList";
import { MarketComparisonModal } from "../AgentDashboard/MarketComparison";
import { toast } from "sonner";

export const OwnerCompareMarket = () => {
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const handleOpenCompare = (property: any) => {
    setSelectedProperty(property);
    setIsCompareModalOpen(true);
  };

  const handleMarketAction = (type: "boost" | "improve", property: any) => {
    setIsCompareModalOpen(false);
    if (type === "boost") {
      toast.info(`Boosting visibility for your property: ${property.title}`);
    } else {
      toast.info(`Generating optimization plan for ${property.title}...`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground font-poppins">
            Property Performance Benchmarks
          </h2>
        </div>
        <p className="text-sm text-muted-foreground ml-11">
          See how your investment properties compare to others in the same
          neighborhood.
        </p>
      </div>
      <PropertyManagementList
        selectionMode="compare"
        onCompare={handleOpenCompare}
      />

      {selectedProperty && (
        <MarketComparisonModal
          open={isCompareModalOpen}
          onClose={() => {
            setIsCompareModalOpen(false);
            setSelectedProperty(null);
          }}
          property={selectedProperty}
          onAction={handleMarketAction}
        />
      )}
    </div>
  );
};
