import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyFeaturesProps {
  commonFeatures: string[];
  selectedFeatures: string[];
  handleFeatureChange: (feature: string, checked: boolean) => void;
}

export const PropertyFeaturesSection = ({
  commonFeatures,
  selectedFeatures,
  handleFeatureChange,
}: PropertyFeaturesProps) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
        <Sparkles className="w-5 h-5 mr-2 text-amber-500" />
        Property Features
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {commonFeatures.map((feature) => {
          const isSelected = selectedFeatures.includes(feature);

          return (
            <div
              key={feature}
              className={cn(
                "flex items-center space-x-3 rounded-lg p-3 border transition-all duration-200 cursor-pointer",
                isSelected
                  ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800"
                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600",
              )}
            >
              <Checkbox
                id={`feature-${feature}`}
                checked={isSelected}
                onCheckedChange={(checked) =>
                  handleFeatureChange(feature, checked as boolean)
                }
                className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
              />
              <Label
                htmlFor={`feature-${feature}`}
                className={cn(
                  "text-sm font-medium leading-none cursor-pointer transition-colors",
                  isSelected
                    ? "text-amber-900 dark:text-amber-100"
                    : "text-gray-600 dark:text-gray-400",
                )}
              >
                {feature}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
};
