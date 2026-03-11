import React from "react";
import { Phone } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SpareRoomFormData } from "@/types/spare-room";

interface ContactSectionProps {
  formData: SpareRoomFormData;
  handleInputChange: (field: keyof SpareRoomFormData, value: any) => void;
}

export const ContactSection = ({
  formData,
  handleInputChange,
}: ContactSectionProps) => {
  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100 text-lg">
          <Phone className="w-5 h-5 text-blue-500" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact_name" className="dark:text-slate-400">
            Contact Name
          </Label>
          <Input
            id="contact_name"
            className="dark:bg-slate-800 dark:border-slate-700"
            value={formData.contact_name}
            onChange={(e) => handleInputChange("contact_name", e.target.value)}
            placeholder="Your name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_email" className="dark:text-slate-400">
            Email Address
          </Label>
          <Input
            id="contact_email"
            type="email"
            className="dark:bg-slate-800 dark:border-slate-700"
            value={formData.contact_email}
            onChange={(e) => handleInputChange("contact_email", e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_phone" className="dark:text-slate-400">
            Phone Number
          </Label>
          <Input
            id="contact_phone"
            type="tel"
            className="dark:bg-slate-800 dark:border-slate-700"
            value={formData.contact_phone}
            onChange={(e) => handleInputChange("contact_phone", e.target.value)}
            placeholder="e.g., +44 7123 456789"
          />
        </div>
      </CardContent>
    </Card>
  );
};
