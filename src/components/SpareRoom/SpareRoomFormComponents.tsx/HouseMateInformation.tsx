import React from "react";
import { Users, Plus, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SpareRoomFormData } from "@/types/spare-room";

interface HousemateInfoSectionProps {
  formData: SpareRoomFormData;
  newProfession: string;
  setNewProfession: (val: string) => void;
  addProfession: () => void;
  removeProfession: (index: number) => void;
  handleInputChange: (field: keyof SpareRoomFormData, value: any) => void;
  handlePreferenceChange: (field: string, value: any) => void;
}

export const HousemateInfoSection = ({
  formData,
  newProfession,
  setNewProfession,
  addProfession,
  removeProfession,
  handleInputChange,
  handlePreferenceChange,
}: HousemateInfoSectionProps) => {
  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <Users className="w-5 h-5 text-blue-500" />
          Housemate Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="current_housemates" className="dark:text-slate-400">Current Housemates</Label>
            <Input
              id="current_housemates"
              type="number"
              className="dark:bg-slate-800 dark:border-slate-700"
              value={formData.current_housemates}
              onChange={(e) => handleInputChange('current_housemates', e.target.value)}
              placeholder="2"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="total_housemates" className="dark:text-slate-400">Total Housemates (incl. new)</Label>
            <Input
              id="total_housemates"
              type="number"
              className="dark:bg-slate-800 dark:border-slate-700"
              value={formData.total_housemates}
              onChange={(e) => handleInputChange('total_housemates', e.target.value)}
              placeholder="3"
            />
          </div>
        </div>

        <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
          <Label className="text-base font-semibold dark:text-slate-200">Preferred Housemate</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="dark:text-slate-400">Gender Preference</Label>
              <Select value={formData.preferences.gender} onValueChange={(v) => handlePreferenceChange('gender', v)}>
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="dark:text-slate-400">Age Range</Label>
              <Select value={formData.preferences.age_range} onValueChange={(v) => handlePreferenceChange('age_range', v)}>
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="18-25">18-25</SelectItem>
                  <SelectItem value="26-35">26-35</SelectItem>
                  <SelectItem value="36-45">36-45</SelectItem>
                  <SelectItem value="46+">46+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="dark:text-slate-400">Preferred Professions</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.preferences.profession.map((prof, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 gap-1 pr-1 py-1">
                  {prof}
                  <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeProfession(index)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                className="dark:bg-slate-800 dark:border-slate-700"
                value={newProfession}
                onChange={(e) => setNewProfession(e.target.value)}
                placeholder="e.g., Student, Professional"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProfession())}
              />
              <Button type="button" onClick={addProfession} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="smoking_ok" 
                checked={formData.preferences.smoking} 
                onCheckedChange={(v) => handlePreferenceChange('smoking', v)} 
                className="data-[state=checked]:bg-blue-600 border-slate-300 dark:border-slate-600"
              />
              <Label htmlFor="smoking_ok" className="dark:text-slate-300 cursor-pointer">Smoking OK</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="pets_ok" 
                checked={formData.preferences.pets} 
                onCheckedChange={(v) => handlePreferenceChange('pets', v)} 
                className="data-[state=checked]:bg-blue-600 border-slate-300 dark:border-slate-600"
              />
              <Label htmlFor="pets_ok" className="dark:text-slate-300 cursor-pointer">Pets OK</Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};