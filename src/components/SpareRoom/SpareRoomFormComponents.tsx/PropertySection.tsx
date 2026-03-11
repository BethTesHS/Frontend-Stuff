import React from "react";
import { Home, Check, ChevronsUpDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserProperty, SpareRoomFormData } from "@/types/spare-room";

interface PropertySectionProps {
  formData: SpareRoomFormData;
  isTenant: boolean;
  userProperties: UserProperty[];
  loadingProperties: boolean;
  openPropertyCombobox: boolean;
  setOpenPropertyCombobox: (open: boolean) => void;
  handleInputChange: (field: keyof SpareRoomFormData, value: any) => void;
  handlePropertySelect: (id: string) => void;
}

export const PropertySection = ({
  formData,
  isTenant,
  userProperties,
  loadingProperties,
  openPropertyCombobox,
  setOpenPropertyCombobox,
  handleInputChange,
  handlePropertySelect,
}: PropertySectionProps) => {
  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <Home className="w-5 h-5 text-blue-500" />
          Property Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isTenant && (
          <div className="flex items-center space-x-2 pb-2">
            <Checkbox
              id="use_existing_property"
              checked={formData.use_existing_property}
              onCheckedChange={(checked) => handleInputChange("use_existing_property", checked)}
              className="border-slate-300 dark:border-slate-600 data-[state=checked]:bg-blue-600"
            />
            <Label htmlFor="use_existing_property" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300">
              Use existing property
            </Label>
          </div>
        )}

        {formData.use_existing_property ? (
          <div className="grid gap-4">
            <div>
              <Label className="dark:text-slate-400">Select Property</Label>
              <Popover open={openPropertyCombobox} onOpenChange={setOpenPropertyCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between mt-1.5 border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                  >
                    {formData.selected_property_id
                      ? userProperties.find((p) => p.id === formData.selected_property_id)?.title
                      : "Search properties..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl">
                  <Command className="dark:bg-slate-900">
                    <CommandInput placeholder="Search address..." className="dark:text-slate-200" />
                    <CommandList>
                      <CommandEmpty className="p-4 text-sm text-center">
                        <p className="text-slate-500 mb-2">No properties found.</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-500 hover:text-blue-600"
                          onClick={() => {
                            handleInputChange("use_existing_property", false);
                            setOpenPropertyCombobox(false);
                          }}
                        >
                          Add New Property Details
                        </Button>
                      </CommandEmpty>
                      <CommandGroup>
                        {userProperties.map((property) => (
                          <CommandItem
                            key={property.id}
                            onSelect={() => {
                              handlePropertySelect(property.id);
                              setOpenPropertyCombobox(false);
                            }}
                            className="dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <Check className={`mr-2 h-4 w-4 ${formData.selected_property_id === property.id ? "opacity-100" : "opacity-0"}`} />
                            <div className="flex flex-col">
                              <span className="font-medium dark:text-slate-200">{property.title}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">{property.address}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {loadingProperties && <p className="text-xs text-blue-500 mt-2 animate-pulse">Fetching your properties...</p>}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property_address" className="dark:text-slate-400">Property Address</Label>
              <Input
                id="property_address"
                className="dark:bg-slate-800 dark:border-slate-700"
                value={formData.property_address}
                onChange={(e) => handleInputChange("property_address", e.target.value)}
                placeholder="Enter full address"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postcode" className="dark:text-slate-400">Postcode</Label>
              <Input
                id="postcode"
                className="dark:bg-slate-800 dark:border-slate-700"
                value={formData.postcode}
                onChange={(e) => handleInputChange("postcode", e.target.value)}
                placeholder="SW1A 1AA"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="property_type" className="dark:text-slate-400">Property Type</Label>
              <Select value={formData.property_type} onValueChange={(v) => handleInputChange("property_type", v)}>
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="flat">Flat</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="maisonette">Maisonette</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};