import React from "react";
import { ScrollText, Train, Plus, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SpareRoomFormData } from "@/types/spare-room";

interface RulesAndTransportProps {
  formData: SpareRoomFormData;
  newRule: string;
  setNewRule: (val: string) => void;
  addHouseRule: () => void;
  removeHouseRule: (index: number) => void;
  newTransportLink: string;
  setNewTransportLink: (val: string) => void;
  addTransportLink: () => void;
  removeTransportLink: (index: number) => void;
  handleInputChange: (field: keyof SpareRoomFormData, value: any) => void;
}

export const RulesAndTransportSection = ({
  formData,
  newRule,
  setNewRule,
  addHouseRule,
  removeHouseRule,
  newTransportLink,
  setNewTransportLink,
  addTransportLink,
  removeTransportLink,
  handleInputChange,
}: RulesAndTransportProps) => {
  return (
    <div className="space-y-6">
      {/* House Rules */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100 text-lg">
            <ScrollText className="w-5 h-5 text-blue-500" />
            House Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {formData.house_rules.map((rule, index) => (
              <Badge key={index} variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 py-1.5 px-3 gap-2">
                {rule}
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeHouseRule(index)} />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              className="dark:bg-slate-800 dark:border-slate-700"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              placeholder="e.g., No parties after 10 PM"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHouseRule())}
            />
            <Button type="button" onClick={addHouseRule} variant="outline" className="dark:border-slate-700 dark:hover:bg-slate-800">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transport Links */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100 text-lg">
            <Train className="w-5 h-5 text-blue-500" />
            Location & Transport
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nearest_station" className="dark:text-slate-400">Nearest Station</Label>
            <Input
              id="nearest_station"
              className="dark:bg-slate-800 dark:border-slate-700"
              value={formData.nearest_station}
              onChange={(e) => handleInputChange('nearest_station', e.target.value)}
              placeholder="e.g., Waterloo Station"
            />
          </div>

          <div className="space-y-2">
            <Label className="dark:text-slate-400">Other Transport Links</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.transport_links.map((link, index) => (
                <Badge key={index} variant="outline" className="border-blue-200 text-blue-600 dark:border-blue-900 dark:text-blue-400 py-1.5 px-3 gap-2">
                  {link}
                  <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeTransportLink(index)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                className="dark:bg-slate-800 dark:border-slate-700"
                value={newTransportLink}
                onChange={(e) => setNewTransportLink(e.target.value)}
                placeholder="e.g., Bus 242, Cycle Superhighway"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTransportLink())}
              />
              <Button type="button" onClick={addTransportLink} variant="outline" className="dark:border-slate-700 dark:hover:bg-slate-800">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};