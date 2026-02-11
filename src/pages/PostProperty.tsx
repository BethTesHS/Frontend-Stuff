import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { ArrowLeft, Home, MapPin, Building, FileText, Settings, Image, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { propertyApi } from '@/services/api';
import { PostcodeInput } from '@/components/ui/postcode-input';

interface PropertyData {
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  receptions: number;
  propertySize?: number;
  landSize?: number;
  propertyType: 'house' | 'flat' | 'bungalow' | 'maisonette' | 'land';
  listingType: 'sale' | 'rent' | 'both';
  tenure: 'freehold' | 'leasehold';
  street: string;
  city: string;
  postcode: string;
  county: string;
  energyRating?: string;
  councilTaxBand?: string;
  yearBuilt?: number;
  features: string[];
}

const PostProperty = () => {
  const { loading, hasAccess } = useAuthGuard(['agent', 'owner', 'manager']);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [propertyImages, setPropertyImages] = useState<File[]>([]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PropertyData>();
  
  // Watch listing type to determine if sale fields are required
  const listingType = watch('listingType');
  const isSaleRequired = listingType === 'sale' || listingType === 'both';

  const commonFeatures = [
    'Garden', 'Parking', 'Garage', 'Balcony', 'Terrace', 'Fireplace',
    'Central Heating', 'Double Glazing', 'Fitted Kitchen', 'En-suite',
    'Walk-in Closet', 'Utility Room', 'Conservatory', 'Swimming Pool'
  ];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (!hasAccess) {
    return null;
  }

  const handleFeatureChange = (feature: string, checked: boolean) => {
    if (checked) {
      setSelectedFeatures([...selectedFeatures, feature]);
    } else {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
    }
  };

  const onSubmit = async (data: PropertyData) => {
    setSubmitting(true);
    
    // Validate property images
    if (propertyImages.length === 0) {
      toast.error('Please upload at least one property image');
      setSubmitting(false);
      return;
    }
    
    try {
      // Create FormData for property creation with proper field names
      const formData = new FormData();
      
      // Add required property data fields
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('price', data.price.toString());
      formData.append('bedrooms', data.bedrooms.toString());
      formData.append('bathrooms', data.bathrooms.toString());
      formData.append('receptions', data.receptions.toString());
      formData.append('propertyType', data.propertyType);
      formData.append('listingType', data.listingType);
      formData.append('street', data.street);
      formData.append('city', data.city);
      formData.append('postcode', data.postcode);
      formData.append('county', data.county);
      
      // Add optional fields only if they have values
      if (data.tenure) formData.append('tenure', data.tenure);
      if (data.propertySize) formData.append('property_size', data.propertySize.toString());
      if (data.landSize) formData.append('land_size', data.landSize.toString());
      if (data.yearBuilt) formData.append('year_built', data.yearBuilt.toString());
      if (data.energyRating) formData.append('energy_rating', data.energyRating);
      if (data.councilTaxBand) formData.append('council_tax_band', data.councilTaxBand);
      
      // Add features as JSON string
      if (selectedFeatures.length > 0) {
        formData.append('features', JSON.stringify(selectedFeatures));
      }
      
      // Add images - each image as separate form field
      propertyImages.forEach((image, index) => {
        formData.append('images', image);
      });

      console.log('Submitting FormData with fields:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await propertyApi.createProperty(formData);
      
      if (response.success) {
        toast.success('Property posted successfully!');
        navigate('/agent-dashboard');
      } else {
        throw new Error(response.error || 'Failed to create property');
      }
    } catch (error) {
      console.error('Error posting property:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to post property. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast.warning('Only image files are allowed');
    }
    
    setPropertyImages(prev => [...prev, ...imageFiles]);
  };

  const removeImage = (index: number) => {
    setPropertyImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 relative overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-green-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl p-6 sm:p-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/agent-dashboard')}
                className="mb-4 flex items-center text-gray-600 hover:text-gray-900 bg-white/10 backdrop-blur-sm hover:bg-white/20 border-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent mb-2 flex items-center">
                    <Building className="w-8 h-8 mr-3 text-emerald-600" />
                    Post Property
                  </h1>
                  <p className="text-gray-700 text-base sm:text-lg opacity-90">
                    List your property for sale or rent
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-white/20 bg-gradient-to-r from-blue-100/50 to-purple-100/50">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Home className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Property Details</h2>
                  <p className="text-gray-600 mt-1">
                    Provide comprehensive information about the property
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="title" className="text-gray-700 font-medium">Property Title *</Label>
                      <Input
                        id="title"
                        {...register('title', { required: 'Title is required' })}
                        placeholder="e.g., Beautiful 3-bedroom house"
                        className="mt-2 bg-white/20 backdrop-blur-sm border border-white/30 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                      {errors.title && (
                        <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="price" className="text-gray-700 font-medium">Price (£) *</Label>
                      <Input
                        id="price"
                        type="number"
                        {...register('price', { required: 'Price is required' })}
                        placeholder="e.g., 450000"
                        className="mt-2 bg-white/20 backdrop-blur-sm border border-white/30 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                      {errors.price && (
                        <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label htmlFor="description" className="text-gray-700 font-medium">Description *</Label>
                    <Textarea
                      id="description"
                      {...register('description', { required: 'Description is required' })}
                      placeholder="Describe the property features, location benefits, etc..."
                      rows={4}
                      className="mt-2 bg-white/20 backdrop-blur-sm border border-white/30 focus:border-blue-400 focus:ring-blue-400/20 resize-none"
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                    )}
                  </div>
                </div>

                {/* Property Specifications */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-purple-600" />
                    Property Specifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="bedrooms" className="text-gray-700 font-medium">Bedrooms *</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        {...register('bedrooms', { required: 'Bedrooms is required' })}
                        placeholder="e.g., 3"
                        className="mt-2 bg-white/20 backdrop-blur-sm border border-white/30 focus:border-purple-400 focus:ring-purple-400/20"
                      />
                      {errors.bedrooms && (
                        <p className="text-sm text-red-600 mt-1">{errors.bedrooms.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="bathrooms" className="text-gray-700 font-medium">Bathrooms *</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        {...register('bathrooms', { required: 'Bathrooms is required' })}
                        placeholder="e.g., 2"
                        className="mt-2 bg-white/20 backdrop-blur-sm border border-white/30 focus:border-purple-400 focus:ring-purple-400/20"
                      />
                      {errors.bathrooms && (
                        <p className="text-sm text-red-600 mt-1">{errors.bathrooms.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="receptions" className="text-gray-700 font-medium">Reception Rooms *</Label>
                      <Input
                        id="receptions"
                        type="number"
                        {...register('receptions', { required: 'Reception rooms is required' })}
                        placeholder="e.g., 1"
                        className="mt-2 bg-white/20 backdrop-blur-sm border border-white/30 focus:border-purple-400 focus:ring-purple-400/20"
                      />
                      {errors.receptions && (
                        <p className="text-sm text-red-600 mt-1">{errors.receptions.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <Label htmlFor="propertyType" className="text-gray-700 font-medium">Property Type *</Label>
                      <Select onValueChange={(value) => setValue('propertyType', value as any)}>
                        <SelectTrigger className="mt-2 bg-white/20 backdrop-blur-sm border border-white/30 focus:border-purple-400 focus:ring-purple-400/20">
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="flat">Flat</SelectItem>
                          <SelectItem value="bungalow">Bungalow</SelectItem>
                          <SelectItem value="maisonette">Maisonette</SelectItem>
                          <SelectItem value="land">Land</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="listingType" className="text-gray-700 font-medium">Listing Type *</Label>
                      <Select onValueChange={(value) => setValue('listingType', value as any)}>
                        <SelectTrigger className="mt-2 bg-white/20 backdrop-blur-sm border border-white/30 focus:border-purple-400 focus:ring-purple-400/20">
                          <SelectValue placeholder="Select listing type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sale">For Sale</SelectItem>
                          <SelectItem value="rent">For Rent</SelectItem>
                          <SelectItem value="both">Both Sale & Rent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-teal-600" />
                    Address Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="street" className="text-gray-700 font-medium">Street Address *</Label>
                      <Input
                        id="street"
                        {...register('street', { required: 'Street address is required' })}
                        placeholder="e.g., 123 Oak Avenue"
                        className="mt-2 bg-white/20 backdrop-blur-sm border border-white/30 focus:border-teal-400 focus:ring-teal-400/20"
                      />
                      {errors.street && (
                        <p className="text-sm text-red-600 mt-1">{errors.street.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="city" className="text-gray-700 font-medium">City *</Label>
                      <Input
                        id="city"
                        {...register('city', { required: 'City is required' })}
                        placeholder="e.g., Manchester"
                        className="mt-2 bg-white/20 backdrop-blur-sm border border-white/30 focus:border-teal-400 focus:ring-teal-400/20"
                      />
                      {errors.city && (
                        <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <Label htmlFor="county" className="text-gray-700 font-medium">County *</Label>
                      <Input
                        id="county"
                        {...register('county', { required: 'County is required' })}
                        placeholder="e.g., Greater Manchester"
                        className="mt-2 bg-white/20 backdrop-blur-sm border border-white/30 focus:border-teal-400 focus:ring-teal-400/20"
                      />
                      {errors.county && (
                        <p className="text-sm text-red-600 mt-1">{errors.county.message}</p>
                      )}
                    </div>

                    <div>
                      <PostcodeInput
                        value={watch('postcode') || ''}
                        onChange={(value) => setValue('postcode', value)}
                        onAddressFound={(address) => {
                          if (address.street) setValue('street', address.street);
                          setValue('city', address.city);
                          setValue('county', address.county);
                        }}
                        label="Postcode"
                        required
                        error={errors.postcode?.message}
                        className="bg-white/20 backdrop-blur-sm border border-white/30 focus:border-teal-400 focus:ring-teal-400/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="tenure" className="text-gray-700 font-medium">
                        Tenure {isSaleRequired && <span className="text-red-500">*</span>}
                      </Label>
                      <Select onValueChange={(value) => setValue('tenure', value as any)}>
                        <SelectTrigger className="mt-2 bg-white/20 backdrop-blur-sm border border-white/30 focus:border-blue-400 focus:ring-blue-400/20">
                          <SelectValue placeholder="Select tenure" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="freehold">Freehold</SelectItem>
                          <SelectItem value="leasehold">Leasehold</SelectItem>
                        </SelectContent>
                      </Select>
                      {isSaleRequired && !watch('tenure') && (
                        <p className="text-sm text-red-600 mt-1">Tenure is required for sale properties</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="propertySize" className="text-gray-700 font-medium">
                        Property Size (sq ft) {isSaleRequired && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        id="propertySize"
                        type="number"
                        {...register('propertySize', { 
                          required: isSaleRequired ? 'Property size is required for sale properties' : false 
                        })}
                        placeholder="e.g., 1200"
                        className="mt-2 bg-white/20 backdrop-blur-sm border border-white/30 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                      {errors.propertySize && (
                        <p className="text-sm text-red-600 mt-1">{errors.propertySize.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="yearBuilt" className="text-gray-700 font-medium">
                        Year Built {isSaleRequired && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        id="yearBuilt"
                        type="number"
                        {...register('yearBuilt', { 
                          required: isSaleRequired ? 'Year built is required for sale properties' : false 
                        })}
                        placeholder="e.g., 1995"
                        className="mt-2 bg-white/20 backdrop-blur-sm border border-white/30 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                      {errors.yearBuilt && (
                        <p className="text-sm text-red-600 mt-1">{errors.yearBuilt.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div>
                      <Label htmlFor="energyRating" className="text-gray-700 font-medium">
                        Energy Rating {isSaleRequired && <span className="text-red-500">*</span>}
                      </Label>
                      <Select onValueChange={(value) => setValue('energyRating', value)}>
                        <SelectTrigger className="mt-2 bg-white/20 backdrop-blur-sm border border-white/30 focus:border-blue-400 focus:ring-blue-400/20">
                          <SelectValue placeholder="Select energy rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                          <SelectItem value="E">E</SelectItem>
                          <SelectItem value="F">F</SelectItem>
                          <SelectItem value="G">G</SelectItem>
                        </SelectContent>
                      </Select>
                      {isSaleRequired && !watch('energyRating') && (
                        <p className="text-sm text-red-600 mt-1">Energy rating is required for sale properties</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="councilTaxBand" className="text-gray-700 font-medium">
                        Council Tax Band {isSaleRequired && <span className="text-red-500">*</span>}
                      </Label>
                      <Select onValueChange={(value) => setValue('councilTaxBand', value)}>
                        <SelectTrigger className="mt-2 bg-white/20 backdrop-blur-sm border border-white/30 focus:border-blue-400 focus:ring-blue-400/20">
                          <SelectValue placeholder="Select council tax band" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                          <SelectItem value="E">E</SelectItem>
                          <SelectItem value="F">F</SelectItem>
                          <SelectItem value="G">G</SelectItem>
                          <SelectItem value="H">H</SelectItem>
                        </SelectContent>
                      </Select>
                      {isSaleRequired && !watch('councilTaxBand') && (
                        <p className="text-sm text-red-600 mt-1">Council tax band is required for sale properties</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="landSize" className="text-gray-700 font-medium">Land Size (sq ft)</Label>
                      <Input
                        id="landSize"
                        type="number"
                        {...register('landSize')}
                        placeholder="e.g., 500"
                        className="mt-2 bg-white/20 backdrop-blur-sm border border-white/30 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>
                  </div>

                  {/* Sale-specific information notice */}
                  {isSaleRequired && (
                    <div className="bg-blue-100/50 backdrop-blur-sm border border-blue-200/50 rounded-xl p-4 mt-6">
                      <p className="text-sm text-blue-800">
                        <strong>Sale Property Requirements:</strong> Additional details marked with * are required for properties listed for sale to provide buyers with comprehensive information.
                      </p>
                    </div>
                  )}
                </div>

                {/* Property Images Section - Updated */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Image className="w-5 h-5 mr-2 text-green-600" />
                    Property Images *
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Upload high-quality images of your property (minimum 1 image required)
                  </p>
                  
                  <div className="bg-white/10 backdrop-blur-sm border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-green-400 transition-colors">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-xl flex items-center justify-center">
                        <Image className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium mb-2">Upload Property Images</p>
                        <p className="text-gray-500 text-sm mb-4">Drag and drop images here, or click to browse</p>
                        <Input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="property-image-upload"
                        />
                        <Label
                          htmlFor="property-image-upload"
                          className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:from-green-600 hover:to-blue-600 transition-all duration-300 hover:shadow-lg inline-block"
                        >
                          Choose Images
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Images Preview */}
                  {propertyImages.length > 0 && (
                    <div className="space-y-3 mt-4">
                      <p className="text-gray-700 font-medium">Uploaded Images ({propertyImages.length}):</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {propertyImages.map((image, index) => (
                          <div key={index} className="relative bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg overflow-hidden">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Property ${index + 1}`}
                              className="w-full h-24 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeImage(index)}
                                className="text-white hover:text-red-300 hover:bg-red-500/20"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="p-2">
                              <p className="text-gray-700 text-xs font-medium truncate">{image.name}</p>
                              <p className="text-gray-500 text-xs">{(image.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Property Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {commonFeatures.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3">
                        <Checkbox
                          id={feature}
                          checked={selectedFeatures.includes(feature)}
                          onCheckedChange={(checked) => handleFeatureChange(feature, checked as boolean)}
                        />
                        <Label htmlFor={feature} className="text-sm text-gray-700">{feature}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 py-3 text-lg font-semibold" 
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Posting Property...</span>
                    </div>
                  ) : (
                    'Post Property'
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PostProperty;
