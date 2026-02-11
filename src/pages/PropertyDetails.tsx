import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import PriceHistoryCard from '@/components/Properties/PriceHistoryCard';
import ScheduleViewingDialog from '@/components/Schedule/ScheduleViewingDialog';
import {
  MapPin,
  Bed,
  Bath,
  Home,
  Star,
  Heart,
  Calendar,
  Phone,
  Mail,
  Building2,
  Zap,
  Car,
  Ruler,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  MessageCircle
} from 'lucide-react';
import { Property, PropertyHistory } from '@/types';
import SharePropertyPopover from '@/components/Properties/SharePropertyPopover';
import BrochureRequestDialog from '@/components/Properties/BrochureRequestDialog';
import { propertyApi, findAgentApi } from '@/services/api';
import PropertyMap from '@/components/Properties/PropertyMap';
import { useAuth } from '@/contexts/AuthContext';
import MessageDialog from '@/components/Messages/MessageDialog';

// Agent type - matching the one from FindAgent page
type Agent = {
  id: number;
  name: string;
  specialization: string;
  location: string;
  rating: number;
  reviews: number;
  description: string;
  type: 'estate' | 'letting';
  phone?: string;
  email?: string;
  company?: string;
  agency?: string;
  experience?: string;
  years_experience?: number;
  office_address?: string;
  service_areas?: string;
  profile_picture?: string;
  profile_picture_url?: string;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
};

const PropertyDetails = () => {
  const { id: propertyId } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [propertyHistory, setPropertyHistory] = useState<PropertyHistory[]>([]);
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [localLoading, setLocalLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;


    if (!propertyId) return;

    const loadPropertyData = async () => {
      try {
        setLocalLoading(true);
        
        // Fetch property details, history, and images in parallel
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const [propertyResponse, historyResponse, imagesResponse] = await Promise.allSettled([
          propertyApi.getProperty(parseInt(propertyId)),
          fetch(`${API_BASE_URL}/api/properties/${propertyId}/history`).then(res => res.ok ? res.json() : { data: [] }),
          fetch(`${API_BASE_URL}/api/properties/${propertyId}/images`).then(res => res.ok ? res.json() : { data: { images: [] } })
        ]);

        // Handle property data
        if (propertyResponse.status === 'fulfilled' && propertyResponse.value.success) {
          const propertyData = propertyResponse.value.data.property;
          setProperty(propertyData);
          
          // Use images directly from property data if available
          if (propertyData.images && propertyData.images.length > 0) {
            // Fix image URLs by removing /api prefix and ensuring HTTPS
            const fixedImageUrls = propertyData.images.map((url: string) => {
              let fixedUrl = url.replace('/api/properties/images/', '/properties/images/');
              // Ensure HTTPS protocol to avoid mixed content warnings
              if (fixedUrl.startsWith('http://')) {
                fixedUrl = fixedUrl.replace('http://', 'https://');
              }
              return fixedUrl;
            });
            setPropertyImages(fixedImageUrls);
          }
          
          // Fetch full agent details if agent ID is available
          if (propertyData.agent && propertyData.agent.id) {
            loadAgentDetails(propertyData.agent.id);
          }
        } else {
          setProperty(null);
        }

        // Handle history data
        if (historyResponse.status === 'fulfilled') {
          setPropertyHistory(historyResponse.value.data?.history || []);
        }

      } catch (error) {
        console.error('PropertyDetails: Error loading property data:', error);
        setProperty(null);
      } finally {
        setLocalLoading(false);
      }
    };

    loadPropertyData();
  }, [propertyId]);

  const loadAgentDetails = async (agentId: number) => {
    try {
      setAgentLoading(true);
      console.log('Loading agent details for ID:', agentId);
      
      const response = await findAgentApi.getAgentDetails(agentId);
      
      if (response.success && response.data) {
        setAgent(response.data.agent);
        console.log('Agent details loaded:', response.data.agent);
      } else {
        console.error('Failed to load agent details:', response.error);
      }
    } catch (error) {
      console.error('Error loading agent details:', error);
    } finally {
      setAgentLoading(false);
    }
  };

  const handleEmailAgent = () => {
    if (property && agent) {
      const params = new URLSearchParams({
        propertyId: property.id,
        agentName: agent.name,
        propertyTitle: property.title
      });
      navigate(`/contact-agent?${params.toString()}`);
    }
  };

  const handleCallAgent = () => {
    if (agent && agent.phone) {
      const confirmed = window.confirm(`Do you want to call ${agent.name} at ${agent.phone}?`);
      if (confirmed) {
        window.location.href = `tel:${agent.phone.replace(/\s+/g, '')}`;
      }
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/properties');
    }
  };

  console.log('PropertyDetails: propertyId from URL:', propertyId);

  if (localLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
            <p className="text-gray-600 mb-4">
              The property with ID "{propertyId}" doesn't exist in our database.
            </p>
            <Button onClick={handleBack} className="mr-4">
              Go Back
            </Button>
            <Button variant="outline" onClick={() => navigate('/properties')}>
              Browse Properties
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  console.log('PropertyDetails: Rendering property:', property.title);

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % propertyImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
  };

  return (
    <Layout>
      <div className="py-8">
        {/* Back Button */}
        <div className="mb-6 px-4 sm:px-6 lg:px-8">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900 p-0 h-auto font-normal"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Single Grid Layout - 2/3 main content, 1/3 sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-start px-4 sm:px-6 lg:px-8">
          {/* Main Content Section - Takes 2/3 on large screens */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Images */}
            <div className="relative">
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-200">
                {propertyImages.length > 0 ? (
                  <img
                    src={propertyImages[currentImageIndex]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Building2 className="w-16 h-16" />
                  </div>
                )}
                {propertyImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white text-black p-2 rounded-full border border-gray-200 shadow-lg hover:bg-gray-100 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white text-black p-2 rounded-full border border-gray-200 shadow-lg hover:bg-gray-100 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              {propertyImages.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {propertyImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full ${
                        index === currentImageIndex ? 'bg-primary-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Property Header */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{property.address.street}, {property.address.city}, {property.address.postcode}</span>
                </div>
                <div className="text-3xl font-bold text-primary-600 mb-4">
                  £{property.price.toLocaleString()}
                  {property.listingType === 'rent' && <span className="text-lg font-normal text-gray-600">/month</span>}
                </div>
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={handleLikeToggle}
                className={`ml-4 ${isLiked ? 'bg-red-50 border-red-200 text-red-600' : ''}`}
              >
                <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Saved' : 'Save'}
              </Button>
            </div>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="flex items-center">
                    <Bed className="w-5 h-5 mr-2 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Bedrooms</div>
                      <div className="font-semibold">{property.bedrooms}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Bath className="w-5 h-5 mr-2 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Bathrooms</div>
                      <div className="font-semibold">{property.bathrooms}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Home className="w-5 h-5 mr-2 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Reception Rooms</div>
                      <div className="font-semibold">{property.receptions}</div>
                    </div>
                  </div>
                  {property.propertySize && (
                    <div className="flex items-center">
                      <Ruler className="w-5 h-5 mr-2 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">Size</div>
                        <div className="font-semibold">{property.propertySize} sqft</div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Property Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Property Type:</span>
                        <span className="capitalize">{property.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tenure:</span>
                        <span className="capitalize">{property.tenure}</span>
                      </div>
                      {property.yearBuilt && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Year Built:</span>
                          <span>{property.yearBuilt}</span>
                        </div>
                      )}
                      {property.energyRating && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Energy Rating:</span>
                          <Badge variant="outline">{property.energyRating}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Additional Details</h4>
                    <div className="space-y-2 text-sm">
                      {property.councilTaxBand && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Council Tax Band:</span>
                          <span>{property.councilTaxBand}</span>
                        </div>
                      )}
                      {property.landSize && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Land Size:</span>
                          <span>{property.landSize} m²</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Listing Type:</span>
                        <span className="capitalize">For {property.listingType}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </CardContent>
            </Card>

            {/* Property Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Property Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Listed:</span>
                    <span>{new Date(property.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated:</span>
                    <span>{new Date(property.updatedAt).toLocaleDateString()}</span>
                  </div>
                  {property.passportRating && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Passport Rating:</span>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 mr-1 text-yellow-400 fill-current" />
                        <span>{property.passportRating}/10</span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <Badge className="bg-green-100 text-green-800 capitalize">
                      {property.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* MAP SECTION */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Location & Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-gray-600 text-sm">
                    {property.address.street}, {property.address.city}, {property.address.postcode}
                  </p>
                </div>
                
                {/* Check if property has coordinates */}
                {(property.latitude && property.longitude) ? (
                  <PropertyMap
                    properties={[property]}
                    center={[property.latitude, property.longitude]}
                    zoom={16}
                    height="h-[400px]"
                  />
                ) : property.address?.coordinates?.lat && property.address?.coordinates?.lng ? (
                  <PropertyMap
                    properties={[property]}
                    center={[property.address.coordinates.lat, property.address.coordinates.lng]}
                    zoom={16}
                    height="h-[400px]"
                  />
                ) : (
                  <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">
                      Map coordinates not available for this property
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Location: {property.address.postcode}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Price History - Now always shows for all properties */}
            <PriceHistoryCard
              propertyHistory={propertyHistory}
              currentPrice={property.price}
              address={`${property.address.street}, ${property.address.city}`}
              listingType={property.listingType}
            />
          </div>

          {/* Sidebar - Takes 1/3 on large screens */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)]">
              <div className="overflow-y-auto lg:max-h-[calc(100vh-4rem)]">
                <div className="pr-2">
                  {/* Flex container for cards */}
                  <div className="flex flex-col gap-6">
                    {/* Agent Contact - Enhanced with full agent details */}
                    {agent ? (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Building2 className="w-5 h-5 mr-2" />
                            Contact Agent
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {agentLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-semibold text-lg">{agent.name}</div>
                                  <div className="text-gray-600">{agent.agency || agent.company}</div>
                                  <div className="text-sm text-gray-500">{agent.specialization}</div>
                                  {agent.location && (
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                      <MapPin className="w-3 h-3 mr-1" />
                                      {agent.location}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                  {agent.rating > 0 ? (
                                    <span>{agent.rating} ({agent.reviews})</span>
                                  ) : (
                                    <span className="text-gray-400">New</span>
                                  )}
                                </div>
                              </div>
                               
                              {agent.experience && (
                                <p className="text-xs text-gray-500">
                                  Experience: {agent.experience} years
                                </p>
                              )}
                              
                              <div className="space-y-3">
                                <Button className="w-full" onClick={handleCallAgent}>
                                  <Phone className="w-4 h-4 mr-2" />
                                  Call Agent
                                </Button>
                                <Button variant="outline" className="w-full" onClick={handleEmailAgent}>
                                  <Mail className="w-4 h-4 mr-2" />
                                  Email Agent
                                </Button>
                              </div>
                              <div className="text-sm text-gray-600">
                                <div className="flex items-center mb-1">
                                  <Phone className="w-4 h-4 mr-2" />
                                  {agent.phone}
                                </div>
                                <div className="flex items-center">
                                  <Mail className="w-4 h-4 mr-2" />
                                  {agent.email}
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Building2 className="w-5 h-5 mr-2" />
                            Contact Agent
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-8">
                            <p className="text-gray-500">No agent assigned to this property</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Quick Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {property && (
                          <ScheduleViewingDialog
                            propertyId={parseInt(property.id)}
                            propertyTitle={property.title}
                            propertyAddress={property.address ? `${property.address.street}, ${property.address.city} ${property.address.postcode}`.trim() : undefined}
                          >
                            <Button variant="outline" className="w-full">
                              <Calendar className="w-4 h-4 mr-2" />
                              Schedule Viewing
                            </Button>
                          </ScheduleViewingDialog>
                        )}
                        {agent && property && (
                          <MessageDialog
                            recipientId={agent.id.toString()}
                            recipientName={agent.name}
                            recipientType="agent"
                            propertyId={property.id}
                            propertyTitle={property.title}
                          >
                            <Button variant="outline" className="w-full">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Message Agent
                            </Button>
                          </MessageDialog>
                        )}
                        <BrochureRequestDialog property={property as Property}>
                          <Button variant="outline" className="w-full">
                            Request Brochure
                          </Button>
                        </BrochureRequestDialog>
                        <SharePropertyPopover property={property as Property}>
                          <Button variant="outline" className="w-full">
                            Share Property
                          </Button>
                        </SharePropertyPopover>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyDetails;
