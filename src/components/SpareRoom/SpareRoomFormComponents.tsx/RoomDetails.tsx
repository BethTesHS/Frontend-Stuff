import React from "react";
import { Building2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SpareRoomFormData } from "@/types/spare-room";

interface RoomDetailsSectionProps {
  formData: SpareRoomFormData;
  handleInputChange: (field: keyof SpareRoomFormData, value: any) => void;
}

export const RoomDetailsSection = ({ formData, handleInputChange }: RoomDetailsSectionProps) => {
  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <Building2 className="w-5 h-5 text-blue-500" />
          Room Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="dark:text-slate-400">Room Title</Label>
          <Input
            id="title"
            className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Spacious double room in friendly house"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="dark:text-slate-400">Description</Label>
          <Textarea
            id="description"
            className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe the room, house, and area..."
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="dark:text-slate-400">Room Type</Label>
            <Select value={formData.room_type} onValueChange={(v) => handleInputChange('room_type', v)}>
              <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="double">Double</SelectItem>
                <SelectItem value="ensuite">En-suite</SelectItem>
                <SelectItem value="master">Master bedroom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="size_sqft" className="dark:text-slate-400">Size (sq ft)</Label>
            <Input
              id="size_sqft"
              type="number"
              className="dark:bg-slate-800 dark:border-slate-700"
              value={formData.size_sqft}
              onChange={(e) => handleInputChange('size_sqft', e.target.value)}
              placeholder="150"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="available_from" className="dark:text-slate-400">Available From</Label>
            <Input
              id="available_from"
              type="date"
              className="dark:bg-slate-800 dark:border-slate-700 [color-scheme:dark]"
              value={formData.available_from}
              onChange={(e) => handleInputChange('available_from', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rent" className="dark:text-slate-400">Monthly Rent (£)</Label>
            <Input
              id="rent"
              type="number"
              className="dark:bg-slate-800 dark:border-slate-700"
              value={formData.rent}
              onChange={(e) => handleInputChange('rent', e.target.value)}
              placeholder="500"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deposit" className="dark:text-slate-400">Deposit (£)</Label>
            <Input
              id="deposit"
              type="number"
              className="dark:bg-slate-800 dark:border-slate-700"
              value={formData.deposit}
              onChange={(e) => handleInputChange('deposit', e.target.value)}
              placeholder="500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 pt-2">
          {[
            { id: "furnished", label: "Furnished" },
            { id: "bills_included", label: "Bills Included" },
            { id: "internet_included", label: "Internet Included" },
            { id: "parking_available", label: "Parking Available" },
            { id: "garden_access", label: "Garden Access" },
          ].map((amenity) => (
            <div key={amenity.id} className="flex items-center space-x-2">
              <Checkbox
                id={amenity.id}
                checked={(formData as any)[amenity.id]}
                onCheckedChange={(checked) => handleInputChange(amenity.id as keyof SpareRoomFormData, checked)}
                className="data-[state=checked]:bg-blue-600 border-slate-300 dark:border-slate-600"
              />
              <Label htmlFor={amenity.id} className="text-sm dark:text-slate-300 cursor-pointer">{amenity.label}</Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};