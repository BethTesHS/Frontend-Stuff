import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  User as UserIcon, Mail, Phone, MapPin, Home, Bed, Bath,
  Calendar, PoundSterling, User2, Edit2, Save, X, Loader2,
  Building2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { externalTenantApi } from "@/services/api";

interface ExternalTenantProfileData {
  property_address: string;
  postcode: string;
  property_type: string;
  bedrooms: string;
  bathrooms: string;
  landlord_name: string;
  landlord_email: string;
  landlord_phone: string;
  move_in_date: string;
  tenancy_length: string;
  monthly_rent: number | string;
  deposit: number | string;
  additional_info: string;
}

const TENANCY_LABELS: Record<string, string> = {
  "6_months": "6 Months",
  "1_year": "1 Year",
  "2_years": "2 Years",
  "periodic": "Periodic",
  "other": "Other",
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  house: "House",
  flat: "Flat",
  apartment: "Apartment",
  studio: "Studio",
  room: "Room",
  bungalow: "Bungalow",
  maisonette: "Maisonette",
  other: "Other",
};

const emptyProfile: ExternalTenantProfileData = {
  property_address: "",
  postcode: "",
  property_type: "",
  bedrooms: "",
  bathrooms: "",
  landlord_name: "",
  landlord_email: "",
  landlord_phone: "",
  move_in_date: "",
  tenancy_length: "",
  monthly_rent: "",
  deposit: "",
  additional_info: "",
};

export const ExternalTenantProfile = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [profile, setProfile] = useState<ExternalTenantProfileData>(emptyProfile);
  const [formData, setFormData] = useState<ExternalTenantProfileData>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    externalTenantApi
      .getProfile()
      .then((res) => {
        const p = res.data?.external_tenant_profile ?? (res.data as any);
        if (p) {
          const mapped: ExternalTenantProfileData = {
            property_address: p.property_address ?? "",
            postcode: p.postcode ?? "",
            property_type: p.property_type ?? "",
            bedrooms: String(p.bedrooms ?? ""),
            bathrooms: String(p.bathrooms ?? ""),
            landlord_name: p.landlord_name ?? "",
            landlord_email: p.landlord_email ?? "",
            landlord_phone: p.landlord_phone ?? "",
            move_in_date: p.move_in_date ?? "",
            tenancy_length: p.tenancy_length ?? "",
            monthly_rent: p.monthly_rent ?? "",
            deposit: p.deposit ?? "",
            additional_info: p.additional_info ?? "",
          };
          setProfile(mapped);
          setFormData(mapped);
        } else {
          setFetchError("Profile not found.");
        }
      })
      .catch((err) => setFetchError(err.message || "Could not load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = () => {
    setFormData({ ...profile });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({ ...profile });
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      (Object.keys(formData) as (keyof ExternalTenantProfileData)[]).forEach((key) => {
        const val = formData[key];
        if (val !== "" && val !== null && val !== undefined) {
          payload[key] = val;
        }
      });
      if (payload.monthly_rent) payload.monthly_rent = Number(payload.monthly_rent);
      if (payload.deposit) payload.deposit = Number(payload.deposit);

      const res = await externalTenantApi.updateProfile(payload);
      const updated = (res.data as any)?.external_tenant_profile ?? res.data;
      if (updated) {
        const mapped: ExternalTenantProfileData = {
          property_address: updated.property_address ?? formData.property_address,
          postcode: updated.postcode ?? formData.postcode,
          property_type: updated.property_type ?? formData.property_type,
          bedrooms: String(updated.bedrooms ?? formData.bedrooms),
          bathrooms: String(updated.bathrooms ?? formData.bathrooms),
          landlord_name: updated.landlord_name ?? formData.landlord_name,
          landlord_email: updated.landlord_email ?? formData.landlord_email,
          landlord_phone: updated.landlord_phone ?? formData.landlord_phone,
          move_in_date: updated.move_in_date ?? formData.move_in_date,
          tenancy_length: updated.tenancy_length ?? formData.tenancy_length,
          monthly_rent: updated.monthly_rent ?? formData.monthly_rent,
          deposit: updated.deposit ?? formData.deposit,
          additional_info: updated.additional_info ?? formData.additional_info,
        };
        setProfile(mapped);
        setFormData(mapped);
      } else {
        setProfile({ ...formData });
      }
      setIsEditing(false);
      toast({ title: "Profile updated", description: "Your profile has been saved successfully." });
    } catch (err: any) {
      toast({
        title: "Save failed",
        description: err.message || "Could not update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "T";

  const field = (
    label: string,
    name: keyof ExternalTenantProfileData,
    icon: React.ReactNode,
    type: string = "text",
    options?: Record<string, string>
  ) => {
    const displayVal = isEditing ? formData[name] : profile[name];
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          {icon} {label}
        </Label>
        {isEditing ? (
          options ? (
            <select
              name={name}
              value={String(formData[name])}
              onChange={handleChange}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Select…</option>
              {Object.entries(options).map(([val, lbl]) => (
                <option key={val} value={val}>{lbl}</option>
              ))}
            </select>
          ) : (
            <Input name={name} type={type} value={String(formData[name])} onChange={handleChange} />
          )
        ) : (
          <div className="w-full p-2.5 rounded-md border border-border/50 bg-secondary/20 text-sm font-medium min-h-[36px]">
            {options && displayVal
              ? (options[String(displayVal)] ?? displayVal)
              : (displayVal || <span className="text-muted-foreground/60 font-normal">—</span>)}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <p className="text-destructive font-medium">{fetchError}</p>
          <p className="text-sm text-muted-foreground">Please contact support if this persists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-muted/10 p-4 md:p-8 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6 pb-12">

        {/* Personal Info Card */}
        <Card className="shadow-sm border-border/50 overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="w-20 h-20 border-4 border-background shadow-md shrink-0">
                <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <h2 className="text-2xl font-bold text-foreground">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile.property_address
                    ? `${profile.property_address}, ${profile.postcode}`
                    : "No address on file"}
                </p>
              </div>

              <div className="shrink-0">
                {!isEditing ? (
                  <Button onClick={handleEdit} variant="outline" size="sm" className="gap-2">
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving} className="gap-1.5">
                      <X className="w-4 h-4" /> Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Personal details — read-only (from auth) */}
            <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5" /> First Name
                </Label>
                <div className="w-full p-2.5 rounded-md border border-border/50 bg-secondary/20 text-sm font-medium">
                  {user?.firstName || "—"}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5" /> Last Name
                </Label>
                <div className="w-full p-2.5 rounded-md border border-border/50 bg-secondary/20 text-sm font-medium">
                  {user?.lastName || "—"}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email
                </Label>
                <div className="w-full p-2.5 rounded-md border border-border/50 bg-secondary/20 text-sm font-medium">
                  {user?.email || "—"}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone
                </Label>
                <div className="w-full p-2.5 rounded-md border border-border/50 bg-secondary/20 text-sm font-medium">
                  {user?.phone || "—"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Property Details */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4 border-b border-border/50 bg-secondary/10">
              <CardTitle className="text-base flex items-center gap-2">
                <Home className="w-4 h-4 text-primary" /> Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {field("Property Address", "property_address", <MapPin className="w-3.5 h-3.5" />)}
              {field("Postcode", "postcode", <MapPin className="w-3.5 h-3.5" />)}
              {field("Property Type", "property_type", <Building2 className="w-3.5 h-3.5" />, "text", PROPERTY_TYPE_LABELS)}
              <div className="grid grid-cols-2 gap-4">
                {field("Bedrooms", "bedrooms", <Bed className="w-3.5 h-3.5" />, "text", {
                  "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6+": "6+", "studio": "Studio",
                })}
                {field("Bathrooms", "bathrooms", <Bath className="w-3.5 h-3.5" />, "text", {
                  "1": "1", "2": "2", "3": "3", "4": "4", "5+": "5+",
                })}
              </div>
            </CardContent>
          </Card>

          {/* Tenancy Details */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4 border-b border-border/50 bg-secondary/10">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Tenancy Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {field("Move-in Date", "move_in_date", <Calendar className="w-3.5 h-3.5" />, "date")}
              {field("Tenancy Length", "tenancy_length", <Calendar className="w-3.5 h-3.5" />, "text", TENANCY_LABELS)}
              {field("Monthly Rent (£)", "monthly_rent", <PoundSterling className="w-3.5 h-3.5" />, "number")}
              {field("Deposit (£)", "deposit", <PoundSterling className="w-3.5 h-3.5" />, "number")}
            </CardContent>
          </Card>

          {/* Landlord Info */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4 border-b border-border/50 bg-secondary/10">
              <CardTitle className="text-base flex items-center gap-2">
                <User2 className="w-4 h-4 text-primary" /> Landlord / Agent
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {field("Name", "landlord_name", <User2 className="w-3.5 h-3.5" />)}
              {field("Email", "landlord_email", <Mail className="w-3.5 h-3.5" />, "email")}
              {field("Phone", "landlord_phone", <Phone className="w-3.5 h-3.5" />, "tel")}
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4 border-b border-border/50 bg-secondary/10">
              <CardTitle className="text-base flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-primary" /> Additional Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Notes
                </Label>
                {isEditing ? (
                  <textarea
                    name="additional_info"
                    value={formData.additional_info}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  />
                ) : (
                  <div className="w-full p-2.5 rounded-md border border-border/50 bg-secondary/20 text-sm min-h-[90px]">
                    {profile.additional_info || <span className="text-muted-foreground/60">None</span>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default ExternalTenantProfile;
