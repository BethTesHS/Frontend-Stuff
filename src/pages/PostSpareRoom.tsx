import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';
import { profileApi, propertyApi } from '@/services/api';
import { spareRoomApi } from '@/services/spareRoomApi';
import { 
  Upload, 
  X, 
  Plus,
  Home,
  Users,
  Calendar,
  DollarSign,
  Building,
  ArrowLeft,
  Check,
  ChevronsUpDown,
  Loader2
} from 'lucide-react';
import type { SpareRoomFormData, UserProperty } from '@/types/spare-room';
import { PropertySection } from '@/components/SpareRoom/SpareRoomFormComponents.tsx/PropertySection';
import { RoomDetailsSection } from '@/components/SpareRoom/SpareRoomFormComponents.tsx/RoomDetails';
import { RulesAndTransportSection } from '@/components/SpareRoom/SpareRoomFormComponents.tsx/RulesAndTrasport';
import { ImageUploadSection } from '@/components/SpareRoom/SpareRoomFormComponents.tsx/ImageUploadSection';
import { ContactSection } from '@/components/SpareRoom/SpareRoomFormComponents.tsx/ContactInfo';
import { HousemateInfoSection } from '@/components/SpareRoom/SpareRoomFormComponents.tsx/HouseMateInformation';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PostSpareRoomModalProps {
  isOpen: boolean; 
  onClose: () => void;
}

const PostSpareRoom = ({ isOpen, onClose }: PostSpareRoomModalProps ) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Temporarily bypass auth guard for testing
  const user = {
    id: "test-123",
    role: "tenant",
    firstName: "Test",
    lastName: "User",
    email: "test@test.com",
  };
  const hasAccess = true;
  const authLoading = false;

  const [formData, setFormData] = useState<SpareRoomFormData>({
    title: "",
    description: "",
    rent: "",
    deposit: "",
    available_from: "",
    room_type: "",
    size_sqft: "",
    furnished: false,
    bills_included: false,
    internet_included: false,
    parking_available: false,
    garden_access: false,
    use_existing_property: false,
    selected_property_id: "",
    property_address: "",
    property_type: "",
    postcode: "",
    preferences: {
      gender: "",
      age_range: "",
      profession: [],
      smoking: false,
      pets: false,
    },
    house_rules: [],
    current_housemates: "",
    total_housemates: "",
    nearest_station: "",
    transport_links: [],
    contact_name: user?.firstName + " " + user?.lastName || "",
    contact_email: user?.email || "",
    contact_phone: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [userProperties, setUserProperties] = useState<UserProperty[]>([]);
  const [newRule, setNewRule] = useState("");
  const [newTransportLink, setNewTransportLink] = useState("");
  const [newProfession, setNewProfession] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [openPropertyCombobox, setOpenPropertyCombobox] = useState(false);
  const [agentDetailsFetched, setAgentDetailsFetched] = useState(false);

  useEffect(() => {
    if (user && !agentDetailsFetched) {
      if (user.role === "agent" || user.role === "owner") {
        fetchUserProperties();
      } else if (user.role === "tenant") {
        fetchTenantProperty();
      }
      fetchAgentDetails();
    }
  }, [user, agentDetailsFetched]);

  const fetchAgentDetails = async () => {
    if (agentDetailsFetched) return;

    try {
      setAgentDetailsFetched(true);
      const response = await profileApi.getProfile();
      if (response.success && response.data?.profile) {
        const profile = response.data.profile;
        const userData = response.data.user;

        // Update contact information with agent/user details
        setFormData((prev) => ({
          ...prev,
          contact_name:
            `${userData.first_name} ${userData.last_name}` || prev.contact_name,
          contact_email: userData.email || prev.contact_email,
          contact_phone: profile.phone || userData.phone || prev.contact_phone,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch agent details:", error);
      setAgentDetailsFetched(false); // Allow retry on error
    }
  };

  const fetchUserProperties = async () => {
    setLoadingProperties(true);
    try {
      const response = await propertyApi.getMyProperties({ per_page: 50 });
      if (response.success && response.data?.properties) {
        const properties: UserProperty[] = response.data.properties.map(
          (prop: any) => ({
            id: prop.id.toString(),
            title: prop.title || `${prop.property_type} Property`,
            address:
              prop.full_address ||
              `${prop.street || ""} ${prop.city || ""}`.trim(),
            postcode: prop.postcode || "",
            property_type: prop.property_type || "Property",
            bedrooms: prop.bedrooms || 0,
            bathrooms: prop.bathrooms || 0,
          }),
        );
        setUserProperties(properties);
      } else {
        // Fallback to mock data for development
        const mockProperties: UserProperty[] = [
          {
            id: "1",
            title: "Modern 3-bed House",
            address: "123 Oak Street, London",
            postcode: "SW1A 1AA",
            property_type: "House",
            bedrooms: 3,
            bathrooms: 2,
          },
          {
            id: "2",
            title: "Victorian Flat",
            address: "456 Pine Avenue, Manchester",
            postcode: "M1 1AA",
            property_type: "Flat",
            bedrooms: 2,
            bathrooms: 1,
          },
        ];
        setUserProperties(mockProperties);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      // Fallback to mock data
      const mockProperties: UserProperty[] = [
        {
          id: "1",
          title: "Modern 3-bed House",
          address: "123 Oak Street, London",
          postcode: "SW1A 1AA",
          property_type: "House",
          bedrooms: 3,
          bathrooms: 2,
        },
      ];
      setUserProperties(mockProperties);
      toast({
        title: "Notice",
        description:
          "Using sample properties. Connect to backend for your actual properties.",
        variant: "default",
      });
    } finally {
      setLoadingProperties(false);
    }
  };

  const fetchTenantProperty = async () => {
    setLoadingProperties(true);
    try {
      // Mock API call for tenant's current residence - replace with actual API
      const tenantProperty: UserProperty = {
        id: "tenant-1",
        title: "Current Residence",
        address: "789 Maple Road, Birmingham",
        postcode: "B1 1AA",
        property_type: "House",
        bedrooms: 4,
        bathrooms: 2,
      };
      setUserProperties([tenantProperty]);
      // Auto-select for tenants since they can only post for their current residence
      setFormData((prev) => ({
        ...prev,
        use_existing_property: true,
        selected_property_id: tenantProperty.id,
      }));
      handlePropertySelect(tenantProperty.id);
    } catch (error) {
      console.error("Failed to fetch tenant property:", error);
      toast({
        title: "Error",
        description: "Failed to load your current residence details",
        variant: "destructive",
      });
    } finally {
      setLoadingProperties(false);
    }
  };

  const handleInputChange = (field: keyof SpareRoomFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePreferenceChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value,
      },
    }));
  };

  const handlePropertySelect = (propertyId: string) => {
    const selectedProperty = userProperties.find((p) => p.id === propertyId);
    if (selectedProperty) {
      setFormData((prev) => ({
        ...prev,
        selected_property_id: propertyId,
        property_address: selectedProperty.address,
        property_type: selectedProperty.property_type.toLowerCase(),
        postcode: selectedProperty.postcode,
      }));
    }
  };

  const addHouseRule = () => {
    if (newRule.trim()) {
      setFormData((prev) => ({
        ...prev,
        house_rules: [...prev.house_rules, newRule.trim()],
      }));
      setNewRule("");
    }
  };

  const removeHouseRule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      house_rules: prev.house_rules.filter((_, i) => i !== index),
    }));
  };

  const addTransportLink = () => {
    if (newTransportLink.trim()) {
      setFormData((prev) => ({
        ...prev,
        transport_links: [...prev.transport_links, newTransportLink.trim()],
      }));
      setNewTransportLink("");
    }
  };

  const removeTransportLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      transport_links: prev.transport_links.filter((_, i) => i !== index),
    }));
  };

  const addProfession = () => {
    if (newProfession.trim()) {
      setFormData((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          profession: [...prev.preferences.profession, newProfession.trim()],
        },
      }));
      setNewProfession("");
    }
  };

  const removeProfession = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        profession: prev.preferences.profession.filter((_, i) => i !== index),
      },
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files].slice(0, 10)); // Max 10 images
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.property_address || !formData.postcode) {
        toast({
          title: "Missing Information",
          description: "Please provide property address and postcode.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Create data object with only the fields needed by the backend
      const submitData: any = {
        title: formData.title,
        description: formData.description,
        rent: parseFloat(formData.rent) || 0,
        deposit: parseFloat(formData.deposit) || 0,
        available_from: formData.available_from,
        room_type: formData.room_type,
        size_sqft: parseFloat(formData.size_sqft) || undefined,
        furnished: formData.furnished,
        bills_included: formData.bills_included,
        internet_included: formData.internet_included,
        parking_available: formData.parking_available,
        garden_access: formData.garden_access,
        property_address: formData.property_address,
        property_type: formData.property_type,
        postcode: formData.postcode,
        preferences: formData.preferences,
        house_rules: formData.house_rules,
        current_housemates: parseInt(formData.current_housemates) || 0,
        total_housemates: parseInt(formData.total_housemates) || 1,
        nearest_station: formData.nearest_station,
        transport_links: formData.transport_links,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        posted_by_role: user?.role || "agent",
        posted_by_id: user?.id || "",
        status: "active",
      };

      if (formData.use_existing_property && formData.selected_property_id) {
        submitData.property_id = formData.selected_property_id;
      }

      console.log("Submitting spare room:", submitData);

      // Use the actual API to create the spare room
      const response = await spareRoomApi.createSpareRoom(submitData, images);

      toast({
        title: "Spare Room Posted Successfully!",
        description:
          "Your spare room listing is now live and available for potential housemates to view.",
      });

      // Navigate back to dashboard
      onClose();
    } catch (error) {
      console.error("Error posting spare room:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to post spare room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (!hasAccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <Button onClick={() => navigate("/login")}>Sign In</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const isTenant = user?.role === "tenant";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !isSubmitting && !open && onClose()}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none bg-white dark:bg-slate-950">
        {/* Header - Fixed */}
        <DialogHeader className="p-6 border-b sticky top-0 z-50 bg-white dark:bg-slate-950 dark:border-slate-800">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center transition-colors">
              <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                Post Spare Room
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {user.role === "tenant"
                  ? "List a room in your current residence"
                  : "Create a new spare room listing"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white dark:bg-slate-950">
          <form onSubmit={handleSubmit} className="space-y-10">
            <PropertySection
              formData={formData}
              isTenant={user.role === "tenant"}
              userProperties={userProperties}
              loadingProperties={loadingProperties}
              openPropertyCombobox={openPropertyCombobox}
              setOpenPropertyCombobox={setOpenPropertyCombobox}
              handleInputChange={handleInputChange}
              handlePropertySelect={handlePropertySelect}
            />

            <RoomDetailsSection
              formData={formData}
              handleInputChange={handleInputChange}
            />

            <HousemateInfoSection
              formData={formData}
              newProfession={newProfession}
              setNewProfession={setNewProfession}
              addProfession={addProfession}
              removeProfession={removeProfession}
              handleInputChange={handleInputChange}
              handlePreferenceChange={handlePreferenceChange}
            />

            <RulesAndTransportSection
              formData={formData}
              newRule={newRule}
              setNewRule={setNewRule}
              addHouseRule={addHouseRule}
              removeHouseRule={removeHouseRule}
              newTransportLink={newTransportLink}
              setNewTransportLink={setNewTransportLink}
              addTransportLink={addTransportLink}
              removeTransportLink={removeTransportLink}
              handleInputChange={handleInputChange}
            />

            <ImageUploadSection
              images={images}
              handleImageUpload={handleImageUpload}
              removeImage={removeImage}
            />

            <ContactSection
              formData={formData}
              handleInputChange={handleInputChange}
            />

            {/* Sticky Action Footer inside form */}
            <div className="pt-4 bottom-0 bg-white dark:bg-slate-950 border-t dark:border-slate-800 pb-6 mt-6">
              <div className="flex flex-col items-center gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-lg py-6 text-lg font-semibold transition-all duration-200 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="animate-spin h-5 w-5" />
                      <span>Posting Room...</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Post Spare Room Listing
                    </div>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="w-3/4 sm:w-1/2 py-4 border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-600 dark:text-slate-400 hover:bg-slate-150 dark:hover:bg-slate-900 font-medium transition-all"
                >
                  Cancel & Exit
                </Button>

                <p className="text-[11px] text-muted-foreground">
                  Your listing will be visible to potential housemates
                  immediately after posting.
                </p>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostSpareRoom;