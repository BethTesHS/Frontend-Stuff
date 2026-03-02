import {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdditionalDetailsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  isSaleRequired: boolean; 
}

export const AdditionalDetailsSection = ({
  register,
  errors,
  setValue,
  watch,
  isSaleRequired,
}: AdditionalDetailsProps) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
        <Info className="w-5 h-5 mr-2 text-blue-500" />
        Additional Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tenure */}
        <div className="space-y-2">
          <Label className="text-gray-700 dark:text-gray-300 font-medium">
            Tenure {isSaleRequired && <span className="text-red-500">*</span>}
          </Label>
          <Select
            onValueChange={(value) =>
              setValue("tenure", value, { shouldValidate: true })
            }
          >
            <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
              <SelectValue placeholder="Select tenure" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="freehold">Freehold</SelectItem>
              <SelectItem value="leasehold">Leasehold</SelectItem>
            </SelectContent>
          </Select>
          {isSaleRequired && !watch("tenure") && (
            <p className="text-xs text-red-500 mt-1">Required for sale</p>
          )}
        </div>

        {/* Property Size */}
        <div className="space-y-2">
          <Label
            htmlFor="propertySize"
            className="text-gray-700 dark:text-gray-300 font-medium"
          >
            Property Size (sq ft){" "}
            {isSaleRequired && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="propertySize"
            type="number"
            {...register("propertySize", {
              required: isSaleRequired ? "Required for sale" : false,
            })}
            placeholder="e.g., 1200"
            className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
          />
          {errors.propertySize && (
            <p className="text-xs text-red-500">
              {errors.propertySize.message as string}
            </p>
          )}
        </div>

        {/* Year Built */}
        <div className="space-y-2">
          <Label
            htmlFor="yearBuilt"
            className="text-gray-700 dark:text-gray-300 font-medium"
          >
            Year Built{" "}
            {isSaleRequired && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="yearBuilt"
            type="number"
            {...register("yearBuilt", {
              required: isSaleRequired ? "Required for sale" : false,
            })}
            placeholder="e.g., 1995"
            className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
          />
          {errors.yearBuilt && (
            <p className="text-xs text-red-500">
              {errors.yearBuilt.message as string}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Energy Rating */}
        <div className="space-y-2">
          <Label className="text-gray-700 dark:text-gray-300 font-medium">
            Energy Rating{" "}
            {isSaleRequired && <span className="text-red-500">*</span>}
          </Label>
          <Select
            onValueChange={(value) =>
              setValue("energyRating", value, { shouldValidate: true })
            }
          >
            <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent>
              {["A", "B", "C", "D", "E", "F", "G"].map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isSaleRequired && !watch("energyRating") && (
            <p className="text-xs text-red-500 mt-1">Required for sale</p>
          )}
        </div>

        {/* Council Tax */}
        <div className="space-y-2">
          <Label className="text-gray-700 dark:text-gray-300 font-medium">
            Council Tax Band{" "}
            {isSaleRequired && <span className="text-red-500">*</span>}
          </Label>
          <Select
            onValueChange={(value) =>
              setValue("councilTaxBand", value, { shouldValidate: true })
            }
          >
            <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
              <SelectValue placeholder="Select band" />
            </SelectTrigger>
            <SelectContent>
              {["A", "B", "C", "D", "E", "F", "G", "H"].map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isSaleRequired && !watch("councilTaxBand") && (
            <p className="text-xs text-red-500 mt-1">Required for sale</p>
          )}
        </div>

        {/* Land Size */}
        <div className="space-y-2">
          <Label
            htmlFor="landSize"
            className="text-gray-700 dark:text-gray-300 font-medium"
          >
            Land Size (sq ft)
          </Label>
          <Input
            id="landSize"
            type="number"
            {...register("landSize")}
            placeholder="e.g., 500"
            className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
          />
        </div>
      </div>

      {/* Conditional Info Alert */}
      {isSaleRequired && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mt-6">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Sale Requirements:</strong> Details marked with * are
              mandatory for properties listed for sale to meet compliance and
              buyer transparency.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
