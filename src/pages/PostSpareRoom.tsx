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
  Building2,
  ArrowLeft,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import type { SpareRoomFormData, UserProperty } from '@/types/spare-room';

const PostSpareRoom = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Temporarily bypass auth guard for testing
  const user = { id: 'test-123', role: 'tenant', firstName: 'Test', lastName: 'User', email: 'test@test.com' };
  const hasAccess = true;
  const authLoading = false;

  const [formData, setFormData] = useState<SpareRoomFormData>({
    title: '',
    description: '',
    rent: '',
    deposit: '',
    available_from: '',
    room_type: '',
    size_sqft: '',
    furnished: false,
    bills_included: false,
    internet_included: false,
    parking_available: false,
    garden_access: false,
    use_existing_property: false,
    selected_property_id: '',
    property_address: '',
    property_type: '',
    postcode: '',
    preferences: {
      gender: '',
      age_range: '',
      profession: [],
      smoking: false,
      pets: false
    },
    house_rules: [],
    current_housemates: '',
    total_housemates: '',
    nearest_station: '',
    transport_links: [],
    contact_name: user?.firstName + ' ' + user?.lastName || '',
    contact_email: user?.email || '',
    contact_phone: ''
  });

  const [images, setImages] = useState<File[]>([]);
  const [userProperties, setUserProperties] = useState<UserProperty[]>([]);
  const [newRule, setNewRule] = useState('');
  const [newTransportLink, setNewTransportLink] = useState('');
  const [newProfession, setNewProfession] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [openPropertyCombobox, setOpenPropertyCombobox] = useState(false);
  const [agentDetailsFetched, setAgentDetailsFetched] = useState(false);

  useEffect(() => {
    if (user && !agentDetailsFetched) {
      if (user.role === 'agent' || user.role === 'owner') {
        fetchUserProperties();
      } else if (user.role === 'tenant') {
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
        setFormData(prev => ({
          ...prev,
          contact_name: `${userData.first_name} ${userData.last_name}` || prev.contact_name,
          contact_email: userData.email || prev.contact_email,
          contact_phone: profile.phone || userData.phone || prev.contact_phone
        }));
      }
    } catch (error) {
      console.error('Failed to fetch agent details:', error);
      setAgentDetailsFetched(false); // Allow retry on error
    }
  };

  const fetchUserProperties = async () => {
    setLoadingProperties(true);
    try {
      const response = await propertyApi.getMyProperties({ per_page: 50 });
      if (response.success && response.data?.properties) {
        const properties: UserProperty[] = response.data.properties.map((prop: any) => ({
          id: prop.id.toString(),
          title: prop.title || `${prop.property_type} Property`,
          address: prop.full_address || `${prop.street || ''} ${prop.city || ''}`.trim(),
          postcode: prop.postcode || '',
          property_type: prop.property_type || 'Property',
          bedrooms: prop.bedrooms || 0,
          bathrooms: prop.bathrooms || 0
        }));
        setUserProperties(properties);
      } else {
        // Fallback to mock data for development
        const mockProperties: UserProperty[] = [
          {
            id: '1',
            title: 'Modern 3-bed House',
            address: '123 Oak Street, London',
            postcode: 'SW1A 1AA',
            property_type: 'House',
            bedrooms: 3,
            bathrooms: 2
          },
          {
            id: '2',
            title: 'Victorian Flat',
            address: '456 Pine Avenue, Manchester',
            postcode: 'M1 1AA',
            property_type: 'Flat',
            bedrooms: 2,
            bathrooms: 1
          }
        ];
        setUserProperties(mockProperties);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      // Fallback to mock data
      const mockProperties: UserProperty[] = [
        {
          id: '1',
          title: 'Modern 3-bed House',
          address: '123 Oak Street, London',
          postcode: 'SW1A 1AA',
          property_type: 'House',
          bedrooms: 3,
          bathrooms: 2
        }
      ];
      setUserProperties(mockProperties);
      toast({
        title: "Notice",
        description: "Using sample properties. Connect to backend for your actual properties.",
        variant: "default"
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
        id: 'tenant-1',
        title: 'Current Residence',
        address: '789 Maple Road, Birmingham',
        postcode: 'B1 1AA',
        property_type: 'House',
        bedrooms: 4,
        bathrooms: 2
      };
      setUserProperties([tenantProperty]);
      // Auto-select for tenants since they can only post for their current residence
      setFormData(prev => ({
        ...prev,
        use_existing_property: true,
        selected_property_id: tenantProperty.id
      }));
      handlePropertySelect(tenantProperty.id);
    } catch (error) {
      console.error('Failed to fetch tenant property:', error);
      toast({
        title: "Error",
        description: "Failed to load your current residence details",
        variant: "destructive"
      });
    } finally {
      setLoadingProperties(false);
    }
  };

  const handleInputChange = (field: keyof SpareRoomFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const handlePropertySelect = (propertyId: string) => {
    const selectedProperty = userProperties.find(p => p.id === propertyId);
    if (selectedProperty) {
      setFormData(prev => ({
        ...prev,
        selected_property_id: propertyId,
        property_address: selectedProperty.address,
        property_type: selectedProperty.property_type.toLowerCase(),
        postcode: selectedProperty.postcode
      }));
    }
  };

  const addHouseRule = () => {
    if (newRule.trim()) {
      setFormData(prev => ({
        ...prev,
        house_rules: [...prev.house_rules, newRule.trim()]
      }));
      setNewRule('');
    }
  };

  const removeHouseRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      house_rules: prev.house_rules.filter((_, i) => i !== index)
    }));
  };

  const addTransportLink = () => {
    if (newTransportLink.trim()) {
      setFormData(prev => ({
        ...prev,
        transport_links: [...prev.transport_links, newTransportLink.trim()]
      }));
      setNewTransportLink('');
    }
  };

  const removeTransportLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      transport_links: prev.transport_links.filter((_, i) => i !== index)
    }));
  };

  const addProfession = () => {
    if (newProfession.trim()) {
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          profession: [...prev.preferences.profession, newProfession.trim()]
        }
      }));
      setNewProfession('');
    }
  };

  const removeProfession = (index: number) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        profession: prev.preferences.profession.filter((_, i) => i !== index)
      }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files].slice(0, 10)); // Max 10 images
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.property_address || !formData.postcode) {
        toast({
          title: "Missing Information",
          description: "Please provide property address and postcode.",
          variant: "destructive"
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
        posted_by_role: user?.role || 'agent',
        posted_by_id: user?.id || '',
        status: 'active'
      };

      
      if (formData.use_existing_property && formData.selected_property_id) {
        submitData.property_id = formData.selected_property_id;
      }

      console.log('Submitting spare room:', submitData);

      // Use the actual API to create the spare room
      const response = await spareRoomApi.createSpareRoom(submitData, images);

      toast({
        title: "Spare Room Posted Successfully!",
        description: "Your spare room listing is now live and available for potential housemates to view.",
      });

      // Navigate back to dashboard
      navigate(-1);

    } catch (error) {
      console.error('Error posting spare room:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post spare room. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">Loading...</div>
      </Layout>
    );
  }

  if (!hasAccess) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">You need to be logged in as an agent, landlord, or tenant to post spare rooms.</p>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      </Layout>
    );
  }

  const isTenant = user?.role === 'tenant';

  return (
    <Layout>
      <div className="min-h-screen w-full p-4 md:p-8">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Post Spare Room</h1>
        <p className="text-muted-foreground">
          {isTenant 
            ? "List a spare room in your current residence to find a housemate"
            : "Create a listing for a spare room in one of your properties"
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Property Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isTenant && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use_existing_property"
                  checked={formData.use_existing_property}
                  onCheckedChange={(checked) => handleInputChange('use_existing_property', checked)}
                />
                <Label htmlFor="use_existing_property">
                  Use existing property
                </Label>
              </div>
            )}

            {formData.use_existing_property ? (
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="property_select">Select Property</Label>
                  <Popover open={openPropertyCombobox} onOpenChange={setOpenPropertyCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openPropertyCombobox}
                        className="w-full justify-between"
                      >
                        {formData.selected_property_id
                          ? userProperties.find(property => property.id === formData.selected_property_id)?.title + " - " + userProperties.find(property => property.id === formData.selected_property_id)?.address
                          : "Search properties or type new address..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full min-w-[400px] p-0 bg-popover border shadow-lg z-50">
                      <Command className="bg-popover">
                        <CommandInput placeholder="Search properties or type address..." />
                        <CommandList className="max-h-[200px] overflow-y-auto">
                          <CommandEmpty>
                            <div className="p-2">
                              <p className="text-sm text-muted-foreground mb-2">No properties found.</p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  handleInputChange('use_existing_property', false);
                                  setOpenPropertyCombobox(false);
                                }}
                              >
                                Add New Property Details
                              </Button>
                            </div>
                          </CommandEmpty>
                          <CommandGroup>
                            {userProperties.map((property) => (
                              <CommandItem
                                key={property.id}
                                value={`${property.title} ${property.address}`}
                                onSelect={() => {
                                  handlePropertySelect(property.id);
                                  setOpenPropertyCombobox(false);
                                }}
                                className="cursor-pointer hover:bg-accent"
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    formData.selected_property_id === property.id ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                                <div className="flex-1">
                                  <div className="font-medium">{property.title}</div>
                                  <div className="text-sm text-muted-foreground">{property.address}</div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {loadingProperties && (
                    <p className="text-sm text-muted-foreground mt-1">Loading your properties...</p>
                  )}
                </div>
                
                {formData.selected_property_id && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-medium">Selected Property:</p>
                    <p className="text-sm text-muted-foreground">
                      {userProperties.find(p => p.id === formData.selected_property_id)?.address}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="property_address">Property Address</Label>
                  <Input
                    id="property_address"
                    value={formData.property_address}
                    onChange={(e) => handleInputChange('property_address', e.target.value)}
                    placeholder="Enter full address"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input
                    id="postcode"
                    value={formData.postcode}
                    onChange={(e) => handleInputChange('postcode', e.target.value)}
                    placeholder="SW1A 1AA"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="property_type">Property Type</Label>
                  <Select
                    value={formData.property_type}
                    onValueChange={(value) => handleInputChange('property_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
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

        {/* Room Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Room Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Room Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Spacious double room in friendly house"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the room, house, and area..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="room_type">Room Type</Label>
                <Select
                  value={formData.room_type}
                  onValueChange={(value) => handleInputChange('room_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                    <SelectItem value="ensuite">En-suite</SelectItem>
                    <SelectItem value="master">Master bedroom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="size_sqft">Size (sq ft)</Label>
                <Input
                  id="size_sqft"
                  type="number"
                  value={formData.size_sqft}
                  onChange={(e) => handleInputChange('size_sqft', e.target.value)}
                  placeholder="150"
                />
              </div>

              <div>
                <Label htmlFor="available_from">Available From</Label>
                <Input
                  id="available_from"
                  type="date"
                  value={formData.available_from}
                  onChange={(e) => handleInputChange('available_from', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rent">Monthly Rent (£)</Label>
                <Input
                  id="rent"
                  type="number"
                  value={formData.rent}
                  onChange={(e) => handleInputChange('rent', e.target.value)}
                  placeholder="500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="deposit">Deposit (£)</Label>
                <Input
                  id="deposit"
                  type="number"
                  value={formData.deposit}
                  onChange={(e) => handleInputChange('deposit', e.target.value)}
                  placeholder="500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="furnished"
                  checked={formData.furnished}
                  onCheckedChange={(checked) => handleInputChange('furnished', checked)}
                />
                <Label htmlFor="furnished">Furnished</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bills_included"
                  checked={formData.bills_included}
                  onCheckedChange={(checked) => handleInputChange('bills_included', checked)}
                />
                <Label htmlFor="bills_included">Bills Included</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="internet_included"
                  checked={formData.internet_included}
                  onCheckedChange={(checked) => handleInputChange('internet_included', checked)}
                />
                <Label htmlFor="internet_included">Internet Included</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="parking_available"
                  checked={formData.parking_available}
                  onCheckedChange={(checked) => handleInputChange('parking_available', checked)}
                />
                <Label htmlFor="parking_available">Parking Available</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="garden_access"
                  checked={formData.garden_access}
                  onCheckedChange={(checked) => handleInputChange('garden_access', checked)}
                />
                <Label htmlFor="garden_access">Garden Access</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Housemate Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Housemate Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current_housemates">Current Housemates</Label>
                <Input
                  id="current_housemates"
                  type="number"
                  value={formData.current_housemates}
                  onChange={(e) => handleInputChange('current_housemates', e.target.value)}
                  placeholder="2"
                />
              </div>

              <div>
                <Label htmlFor="total_housemates">Total Housemates (including new)</Label>
                <Input
                  id="total_housemates"
                  type="number"
                  value={formData.total_housemates}
                  onChange={(e) => handleInputChange('total_housemates', e.target.value)}
                  placeholder="3"
                />
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold">Preferred Housemate</Label>
              <div className="mt-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gender_preference">Gender Preference</Label>
                    <Select
                      value={formData.preferences.gender}
                      onValueChange={(value) => handlePreferenceChange('gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="age_range">Age Range</Label>
                    <Select
                      value={formData.preferences.age_range}
                      onValueChange={(value) => handlePreferenceChange('age_range', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="18-25">18-25</SelectItem>
                        <SelectItem value="26-35">26-35</SelectItem>
                        <SelectItem value="36-45">36-45</SelectItem>
                        <SelectItem value="46+">46+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Preferred Professions</Label>
                  <div className="flex gap-2 mt-2 mb-2 flex-wrap">
                    {formData.preferences.profession.map((prof, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {prof}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => removeProfession(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newProfession}
                      onChange={(e) => setNewProfession(e.target.value)}
                      placeholder="e.g., Student, Professional, Creative"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProfession())}
                    />
                    <Button type="button" onClick={addProfession} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smoking_ok"
                      checked={formData.preferences.smoking}
                      onCheckedChange={(checked) => handlePreferenceChange('smoking', checked)}
                    />
                    <Label htmlFor="smoking_ok">Smoking OK</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pets_ok"
                      checked={formData.preferences.pets}
                      onCheckedChange={(checked) => handlePreferenceChange('pets', checked)}
                    />
                    <Label htmlFor="pets_ok">Pets OK</Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* House Rules */}
        <Card>
          <CardHeader>
            <CardTitle>House Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 mt-2 mb-2 flex-wrap">
              {formData.house_rules.map((rule, index) => (
                <Badge key={index} variant="outline" className="gap-1">
                  {rule}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeHouseRule(index)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                placeholder="e.g., No overnight guests, Quiet after 10pm"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHouseRule())}
              />
              <Button type="button" onClick={addHouseRule} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transport Links */}
        <Card>
          <CardHeader>
            <CardTitle>Transport & Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nearest_station">Nearest Station</Label>
              <Input
                id="nearest_station"
                value={formData.nearest_station}
                onChange={(e) => handleInputChange('nearest_station', e.target.value)}
                placeholder="e.g., London Bridge"
              />
            </div>

            <div>
              <Label>Transport Links</Label>
              <div className="flex gap-2 mt-2 mb-2 flex-wrap">
                {formData.transport_links.map((link, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {link}
                    <X 
                      className="w-3 h-4 cursor-pointer" 
                      onClick={() => removeTransportLink(index)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTransportLink}
                  onChange={(e) => setNewTransportLink(e.target.value)}
                  placeholder="e.g., 15 min walk to tube, Bus stop outside"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTransportLink())}
                />
                <Button type="button" onClick={addTransportLink} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Photos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="images">Upload room photos (up to 10)</Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="mt-1"
              />
            </div>
            
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Room photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_name">Contact Name</Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => handleInputChange('contact_name', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="contact_phone">Contact Phone (optional)</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="+44 7XXX XXXXXX"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-32"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Posting...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Post Spare Room
              </>
            )}
          </Button>
         </div>
      </form>
    </div>
    </Layout>
  );
};

export default PostSpareRoom;