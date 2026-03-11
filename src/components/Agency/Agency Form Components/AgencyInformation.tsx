import React from "react";
import { Building2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const AgencyDetailsForm = ({
  formData,
  handleInputChange,
  handleLogoUpload,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Name and Slug Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label
            htmlFor="agency-name"
            className="text-sm font-bold text-slate-700"
          >
            Agency Name *
          </Label>
          <Input
            id="agency-name"
            value={formData.agencyName}
            onChange={(e) => handleInputChange("agencyName", e.target.value)}
            placeholder="Your Estate Agency Ltd"
            required
            className="h-12 border-gray-300 focus:ring-2 focus:ring-blue-900 focus:outline-none transition-all"
          />
        </div>

        <div className="space-y-3">
          <Label
            htmlFor="agency-slug"
            className="text-sm font-bold text-slate-700"
          >
            Agency URL Slug *
          </Label>
          <div className="flex items-center">
            <Input
              id="agency-slug"
              value={formData.slug}
              onChange={(e) => handleInputChange("slug", e.target.value)}
              placeholder="your-agency"
              required
              pattern="[a-z0-9-]+"
              className="h-12 border-gray-300 rounded-r-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 focus:outline-none transition-all"
            />
            <div className="h-12 px-4 flex items-center bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg">
              <span className="text-sm font-bold text-red-600">.homed.com</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 italic">
            Your unique subdomain: {formData.slug || "your-agency"}.homed.com
          </p>
        </div>
      </div>

      {/* Contact Details */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label htmlFor="email" className="text-sm font-bold text-slate-700">
            Contact Email *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="contact@agency.com"
            required
            className="h-12 border-gray-300 focus:ring-2 focus:ring-blue-900 focus:outline-none"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="phone" className="text-sm font-bold text-slate-700">
            Phone Number *
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+44 20 1234 5678"
            required
            className="h-12 border-gray-300 focus:ring-2 focus:ring-blue-900 focus:outline-none"
          />
        </div>
      </div>

      {/* Password Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label
            htmlFor="password"
            className="text-sm font-bold text-slate-700"
          >
            Password *
          </Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            placeholder="Min. 8 characters"
            required
            className="h-12 border-gray-300 focus:ring-2 focus:ring-blue-900 focus:outline-none"
          />
        </div>
        <div className="space-y-3">
          <Label
            htmlFor="confirmPassword"
            className="text-sm font-bold text-slate-700"
          >
            Confirm Password *
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) =>
              handleInputChange("confirmPassword", e.target.value)
            }
            required
            className={`h-12 border-gray-300 focus:ring-2 focus:ring-blue-900 focus:outline-none ${
              formData.confirmPassword &&
              formData.password !== formData.confirmPassword
                ? "border-red-500 focus:ring-red-500"
                : ""
            }`}
          />
        </div>
      </div>

      {/* Location Section */}
      <div className="space-y-3">
        <Label htmlFor="address" className="text-sm font-bold text-slate-700">
          Full Office Address *
        </Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          placeholder="123 Real Estate Plaza"
          required
          className="h-12 border-gray-300 focus:ring-2 focus:ring-blue-900 focus:outline-none"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label htmlFor="city" className="text-sm font-bold text-slate-700">
            City
          </Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            className="h-12 border-gray-300 focus:ring-2 focus:ring-blue-900 focus:outline-none"
          />
        </div>
        <div className="space-y-3">
          <Label
            htmlFor="postcode"
            className="text-sm font-bold text-slate-700"
          >
            Postcode
          </Label>
          <Input
            id="postcode"
            value={formData.postcode}
            onChange={(e) => handleInputChange("postcode", e.target.value)}
            className="h-12 border-gray-300 focus:ring-2 focus:ring-blue-900 focus:outline-none"
          />
        </div>
      </div>

      {/* Description & Logo */}
      <div className="space-y-3">
        <Label
          htmlFor="description"
          className="text-sm font-bold text-slate-700"
        >
          Agency Description
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Tell us what makes your agency stand out..."
          rows={4}
          className="border-gray-300 focus:ring-2 focus:ring-blue-900 focus:outline-none resize-none"
        />
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-bold text-slate-700">Agency Logo</Label>
        <div className="flex items-center gap-6 p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <input
            id="logo"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden focus:outline-none"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("logo")?.click()}
            className="h-12 px-6 border-gray-300 hover:border-white-600 hover:text-white bg-white hover:bg-blue-800 transition-all"
          >
            <Upload className="w-5 h-5 mr-3 " />
            Select Logo File
          </Button>
          {formData.logo && (
            <div className="flex items-center gap-3 px-4 py-2 bg-red-50 border border-red-100 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
              <span className="text-sm font-bold text-red-700 truncate max-w-[200px]">
                {formData.logo.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgencyDetailsForm;
