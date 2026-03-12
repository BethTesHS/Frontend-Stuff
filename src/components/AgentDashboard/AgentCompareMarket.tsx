import { useState } from "react";
import { BarChart2 } from "lucide-react";
import { PropertyManagementList } from "../Properties/PropertyManagementList";
import { MarketComparisonModal } from "./MarketComparison";
import { toast } from "sonner";

export const AgentCompareMarket = () => {
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const handleOpenCompare = (property: any) => {
    setSelectedProperty(property);
    setIsCompareModalOpen(true);
  };
  const handleMarketAction = (type: "boost" | "improve", property: any) => {
    setIsCompareModalOpen(false);

    if (type === "boost") {
      toast.info(`Redirecting to boost ${property.title}...`);
    } else {
      toast.info(`Opening analysis for ${property.title}...`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <BarChart2 className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground font-poppins">
            Market Comparison Analysis
          </h2>
        </div>
        <p className="text-sm text-muted-foreground ml-11">
          Benchmark your properties against current market averages in the same
          area.
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
