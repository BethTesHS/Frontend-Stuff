import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  X, 
  Plus,
  Home,
  Users,
  Calendar,
  DollarSign
} from 'lucide-react';

const ListRoom = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rent: '',
    deposit: '',
    available_from: '',
    property_address: '',
    room_type: '',
    size_sqft: '',
    furnished: false,
    bills_included: false,
    internet_included: false,
    parking_available: false,
    garden_access: false,
    landlord_name: '',
    landlord_email: '',
    landlord_phone: '',
    preferences: {
      gender: '',
      age_range: '',
      profession: [] as string[],
      smoking: false,
      pets: false
    },
    house_rules: [] as string[],
    current_housemates: '',
    total_housemates: '',
    nearest_station: '',
    transport_links: [] as string[]
  });

  const [images, setImages] = useState<File[]>([]);
  const [newRule, setNewRule] = useState('');
  const [newTransportLink, setNewTransportLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Room Listed Successfully!",
        description: "Your room listing has been created and is now live.",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        rent: '',
        deposit: '',
        available_from: '',
        property_address: '',
        room_type: '',
        size_sqft: '',
        furnished: false,
        bills_included: false,
        internet_included: false,
        parking_available: false,
        garden_access: false,
        landlord_name: '',
        landlord_email: '',
        landlord_phone: '',
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
        transport_links: []
      });
      setImages([]);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create room listing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">List Your Room</h1>
        <p className="text-muted-foreground">
          Create a listing for your spare room and find the perfect housemate
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Room Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Cozy double room in Victorian house"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your room, the property, and what makes it special..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="property_address">Property Address *</Label>
              <Input
                id="property_address"
                value={formData.property_address}
                onChange={(e) => handleInputChange('property_address', e.target.value)}
                placeholder="Full address including postcode"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Room Details */}
        <Card>
          <CardHeader>
            <CardTitle>Room Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="room_type">Room Type *</Label>
                <Select
                  value={formData.room_type}
                  onValueChange={(value) => handleInputChange('room_type', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Room</SelectItem>
                    <SelectItem value="double">Double Room</SelectItem>
                    <SelectItem value="ensuite">Ensuite Room</SelectItem>
                    <SelectItem value="studio">Studio Room</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="size_sqft">Room Size (sq ft)</Label>
                <Input
                  id="size_sqft"
                  type="number"
                  value={formData.size_sqft}
                  onChange={(e) => handleInputChange('size_sqft', e.target.value)}
                  placeholder="e.g., 120"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                <Label htmlFor="bills_included">Bills included</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="internet_included"
                  checked={formData.internet_included}
                  onCheckedChange={(checked) => handleInputChange('internet_included', checked)}
                />
                <Label htmlFor="internet_included">Internet included</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="parking_available"
                  checked={formData.parking_available}
                  onCheckedChange={(checked) => handleInputChange('parking_available', checked)}
                />
                <Label htmlFor="parking_available">Parking available</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="garden_access"
                  checked={formData.garden_access}
                  onCheckedChange={(checked) => handleInputChange('garden_access', checked)}
                />
                <Label htmlFor="garden_access">Garden access</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing & Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="rent">Monthly Rent (£) *</Label>
                <Input
                  id="rent"
                  type="number"
                  value={formData.rent}
                  onChange={(e) => handleInputChange('rent', e.target.value)}
                  placeholder="e.g., 650"
                  required
                />
              </div>

              <div>
                <Label htmlFor="deposit">Deposit (£) *</Label>
                <Input
                  id="deposit"
                  type="number"
                  value={formData.deposit}
                  onChange={(e) => handleInputChange('deposit', e.target.value)}
                  placeholder="e.g., 650"
                  required
                />
              </div>

              <div>
                <Label htmlFor="available_from">Available From *</Label>
                <Input
                  id="available_from"
                  type="date"
                  value={formData.available_from}
                  onChange={(e) => handleInputChange('available_from', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload room photos (max 10 images)
                </p>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="max-w-xs mx-auto"
                />
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="px-8">
            {isSubmitting ? 'Creating Listing...' : 'Create Room Listing'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ListRoom;