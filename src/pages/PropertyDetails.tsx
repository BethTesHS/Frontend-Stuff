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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Ruler,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  MessageCircle,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { Property, PropertyHistory } from '@/types';
import SharePropertyPopover from '@/components/Properties/SharePropertyPopover';
import BrochureRequestDialog from '@/components/Properties/BrochureRequestDialog';
import IntelligenceReportModal from '@/components/Properties/IntelligenceReportModal';
import PropertyMap from '@/components/Properties/PropertyMap';
import { useAuth } from '@/contexts/AuthContext';
import MessageDialog from '@/components/Messages/MessageDialog';
import { useSavedProperties } from '@/contexts/SavedPropertiesContext';

import { propertyApi, impressionApi } from '@/services/api';

// Agent type
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

// Mock Reviews Data
const MOCK_REVIEWS = [
  { id: 1, author: "Sarah Jenkins", rating: 5, date: "2 weeks ago", comment: "Absolutely loved this property. The natural light is amazing and the neighborhood is very quiet. The local amenities are just a short walk away. The agent was also extremely helpful throughout the viewing.", initials: "SJ", verified: true },
  { id: 2, author: "Michael Chen", rating: 4, date: "1 month ago", comment: "Great location, close to transit. The bathroom could use a minor update but overall a very solid and comfortable place to live. Would highly recommend to young professionals.", initials: "MC", verified: true },
  { id: 3, author: "Emma Watson", rating: 5, date: "3 months ago", comment: "The agent was very helpful and the property matches the pictures perfectly. Moving in was a breeze. Highly recommend!", initials: "EW", verified: true },
  { id: 4, author: "David Thompson", rating: 4, date: "5 months ago", comment: "Spacious rooms and good amenities. Parking can be a bit tight on weekends, but the overall value for the area is excellent.", initials: "DT", verified: false },
  { id: 5, author: "Jessica Davis", rating: 5, date: "6 months ago", comment: "One of the best places I've stayed in. The property management is highly responsive to any inquiries.", initials: "JD", verified: true }
];

const PropertyDetails = () => {
  const { id: propertyId } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [propertyHistory, setPropertyHistory] = useState<PropertyHistory[]>([]);
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [localLoading, setLocalLoading] = useState(true);
  const [showIntelligenceReport, setShowIntelligenceReport] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { isPropertySaved, addSavedProperty, removeSavedProperty } = useSavedProperties();
  const isSaved = property ? isPropertySaved(property.id) : false;

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (!propertyId) return;

    const loadPropertyData = async () => {
      try {
        setLocalLoading(true);
        // parse numeric id where possible (support 'prop_123' and '123')
        let numericId: number | null = null;
        if (/^prop_/.test(propertyId)) {
          const parts = propertyId.split('_');
          const maybe = Number(parts[1]);
          if (!isNaN(maybe)) numericId = maybe;
        } else {
          const maybe = Number(propertyId);
          if (!isNaN(maybe)) numericId = maybe;
        }


        // If we could parse a numeric id, prefer that. Otherwise pass the raw id (string) to the API.
        const idToFetch = numericId !== null ? (numericId as number) : propertyId;
        const response = await propertyApi.getProperty(idToFetch);

        if (response && response.success && response.data && response.data.property) {
          const p = response.data.property;

          const transformedProperty: any = {
            id: p.id?.toString() || String(numericId),
            // Ensure `property_id` exists for places that expect it (map link, saved lists, etc.)
            property_id: (p.property_id !== undefined && p.property_id !== null)
              ? String(p.property_id)
              : (p.id !== undefined && p.id !== null) ? String(p.id) : String(numericId),
            title: p.title || p.name || '',
            description: p.description || '',
            price: p.price || p.monthly_rent || 0,
            listingType: p.listing_type || p.listingType || 'sale',
            type: p.property_type || p.type,
            bedrooms: p.bedrooms || 0,
            bathrooms: p.bathrooms || 0,
            receptions: p.reception_rooms || p.receptions || 0,
            passportRating: p.passport_rating || p.passportRating,
            status: p.status || 'available',
            features: p.features || [],
            address: {
              street: p.street || p.address || '',
              city: p.city || p.address?.city || '',
              postcode: p.postcode || p.address?.postcode || '',
              county: p.county || p.address?.county || '',
              coordinates: p.coordinates || p.address?.coordinates
            },
            createdAt: p.created_at || new Date().toISOString(),
            updatedAt: p.updated_at || new Date().toISOString(),
            tenure: p.tenure || 'Freehold',
            propertySize: p.property_size || p.propertySize,
            energyRating: p.energy_rating || p.energyRating,
            yearBuilt: p.year_built || p.yearBuilt,
            councilTaxBand: p.council_tax_band || p.councilTaxBand,
            agent: p.agent || p.agent_id || null
          };

          setProperty(transformedProperty);

          // Record impression (best-effort, non-blocking)
          const pubId = transformedProperty.property_id || transformedProperty.id;
          if (pubId) {
            // Use a stable session key stored in sessionStorage so repeated
            // page refreshes by the same browser tab count as one session.
            let sessionKey = sessionStorage.getItem('hm_session_key');
            if (!sessionKey) {
              sessionKey = Math.random().toString(36).slice(2) + Date.now().toString(36);
              sessionStorage.setItem('hm_session_key', sessionKey);
            }
            impressionApi.record(String(pubId), sessionKey);
          }

          // images
          const imagesToUse = Array.isArray(p.images) && p.images.length > 0
            ? p.images
            : p.primary_image_url ? [p.primary_image_url] : [];

          setPropertyImages(imagesToUse.map((url: string) => url.startsWith('http') ? url : `${location.origin}${url}`));

          // If the property response contains agent id, try to load agent details (fallback to mock loader)
          const agentId = (p.agent && p.agent.id) || p.agent_id || (p.agent && typeof p.agent === 'number' ? p.agent : null);
          if (agentId) loadAgentDetails(Number(agentId));

          // If the API provided history or price events use them, otherwise create minimal history
          if (p.history && Array.isArray(p.history)) {
            setPropertyHistory(p.history as any);
          } else {
            setPropertyHistory([
              { id: 1, property_id: p.id, date: new Date().toISOString(), event_type: 'Listed', price: p.price }
            ] as any);
          }
        } else {
          setProperty(null);
        }
      } catch (error) {
        console.error('PropertyDetails: Error loading mock property data:', error);
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
      // Simulate network delay for agent fetch
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Set Mock Agent
      setAgent({
        id: agentId,
        name: "Eleanor Rigby",
        specialization: "Luxury Residential",
        location: property?.address?.city || "London, UK",
        rating: 4.9,
        reviews: 142,
        description: "Expert in matching clients with their perfect homes.",
        type: 'estate',
        phone: "+44 20 7946 0888",
        email: "eleanor.r@homed.co.uk",
        agency: "Homed Premier Agents",
        is_featured: true
      });
    } catch (error) {
      console.error('Error loading mock agent details:', error);
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

  const handleLikeToggle = () => {
    if (!property) return;
    
    if (isSaved) {
      removeSavedProperty(property.id);
    } else {
      addSavedProperty(property);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % propertyImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
  };

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
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-800">Property Not Found</h1>
            <p className="text-gray-600">
              The property with ID "{propertyId}" doesn't exist in our database.
            </p>
            <div className="flex justify-center space-x-4 pt-4">
              <Button onClick={handleBack} className="shadow-sm hover:shadow-md transition-all duration-300">
                Go Back
              </Button>
              <Button variant="outline" onClick={() => navigate('/properties')} className="hover:bg-gray-50 transition-colors duration-300">
                Browse Properties
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const displayListingType = (property.listingType?.toLowerCase() === 'sell' || property.listingType?.toLowerCase() === 'buy')
    ? 'sale'
    : property.listingType;

  // Mock property review stats
  const propertyRating = 4.8;
  const propertyReviewCount = 24;

  return (
    <Layout>
      <div className="py-8 max-w-7xl mx-auto">
        {/* Top Back Button */}
        <div className="mb-4 px-4 sm:px-6 lg:px-8">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="text-gray-600 hover:text-primary-700 hover:bg-primary-50 px-3 py-2 rounded-full transition-all duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Properties
          </Button>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-start px-4 sm:px-6 lg:px-8">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header Content */}
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">{property.title}</h1>
              
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="w-5 h-5 mr-1.5 text-primary-600" />
                <span className="text-lg">{property.address.street}, {property.address.city}, {property.address.postcode}</span>
              </div>

              {/* Clickable Reviews Trigger */}
              <Dialog>
                <DialogTrigger asChild>
                  <div className="flex items-center gap-1.5 mb-5 w-fit cursor-pointer group/review p-1.5 -ml-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= propertyRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-600 transition-colors group-hover/review:text-primary-600 group-hover/review:underline">
                      {propertyRating} ({propertyReviewCount} reviews)
                    </span>
                  </div>
                </DialogTrigger>
                {/* FORCED WHITE BACKGROUND DIALOG CONTENT */}
                <DialogContent className="sm:max-w-[650px] bg-white text-gray-900 p-0 overflow-hidden rounded-2xl border-0 shadow-2xl flex flex-col">
                  {/* Modal Header */}
                  <div className="bg-gray-50/80 p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <DialogTitle className="text-2xl font-extrabold text-gray-900">Property Reviews</DialogTitle>
                      <DialogDescription className="text-gray-500 mt-1">Real feedback from past viewers and residents.</DialogDescription>
                    </div>
                    <div className="flex flex-col items-end bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                      <div className="text-3xl font-black text-gray-900 flex items-center gap-2">
                        {propertyRating}
                      </div>
                      <div className="flex text-yellow-400 mt-1 gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-4 h-4 ${star <= propertyRating ? 'fill-current' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <div className="text-xs font-medium text-gray-400 mt-1">{propertyReviewCount} total reviews</div>
                    </div>
                  </div>
                  
                  {/* SCROLLABLE WHITE CONTENT AREA */}
                  <div className="flex-1 overflow-y-auto max-h-[60vh] bg-white p-6 space-y-6">
                    {MOCK_REVIEWS.map(review => (
                      <div key={review.id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-11 h-11 border border-gray-200">
                              <AvatarFallback className="bg-primary-50 text-primary-700 font-bold">
                                {review.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                {review.author}
                                {review.verified && (
                                  <span className="flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Verified
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">{review.date}</div>
                            </div>
                          </div>
                          <div className="flex gap-0.5 bg-gray-50 px-2 py-1 rounded-lg">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed pr-4">"{review.comment}"</p>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              <div className="text-4xl font-bold text-primary-700 drop-shadow-sm mt-2">
                £{property.price.toLocaleString()}
                {property.listingType === 'rent' && <span className="text-xl font-medium text-gray-500 ml-1">/month</span>}
              </div>
            </div>

            {/* Property Image Container with Save Button Overlaid */}
            <div className="relative w-full group">
              <div className="aspect-video rounded-2xl overflow-hidden bg-gray-200 shadow-md transition-shadow duration-300 group-hover:shadow-xl">
                {propertyImages.length > 0 ? (
                  <img
                    src={propertyImages[currentImageIndex]}
                    alt={property.title}
                    className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                    <Building2 className="w-16 h-16 opacity-50" />
                  </div>
                )}
                {propertyImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/95 text-gray-800 p-2.5 rounded-full border border-gray-200 shadow-lg hover:bg-white hover:scale-110 hover:text-primary-600 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/95 text-gray-800 p-2.5 rounded-full border border-gray-200 shadow-lg hover:bg-white hover:scale-110 hover:text-primary-600 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Save Button Absolute positioned top right */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLikeToggle}
                className={`absolute top-4 right-4 z-10 backdrop-blur-md shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 rounded-xl px-5 py-5 font-semibold ${
                  isSaved 
                  ? 'bg-white/95 border-red-100 text-red-600 hover:bg-white' 
                  : 'bg-white/80 border-transparent text-gray-800 hover:text-red-600 hover:bg-white'
                }`}
              >
                <Heart className={`w-5 h-5 mr-2 transition-all duration-300 ${isSaved ? 'fill-current text-red-600 scale-110' : ''}`} />
                {isSaved ? 'Saved' : 'Save'}
              </Button>

              {propertyImages.length > 1 && (
                <div className="flex justify-center mt-5 space-x-2.5">
                  {propertyImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                        index === currentImageIndex ? 'bg-primary-600 shadow-sm w-6' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-50 pb-4">
                <CardTitle className="text-xl">Description</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 bg-white">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
              </CardContent>
            </Card>

            {/* Property Summary */}
            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-50 pb-4">
                <CardTitle className="text-xl">Property Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <div className="flex justify-between items-center p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <span className="text-gray-500 font-medium">Listed</span>
                    <span className="text-gray-900 font-semibold">{new Date(property.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <span className="text-gray-500 font-medium">Last Updated</span>
                    <span className="text-gray-900 font-semibold">{new Date(property.updatedAt).toLocaleDateString()}</span>
                  </div>
                  {property.passportRating && (
                    <div className="flex justify-between items-center p-2.5 rounded-lg hover:bg-yellow-50 transition-colors duration-200">
                      <span className="text-gray-500 font-medium">Passport Rating</span>
                      <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-md">
                        <Star className="w-3.5 h-3.5 mr-1.5 text-yellow-500 fill-current" />
                        <span className="text-yellow-700 font-bold">{property.passportRating}/10</span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <span className="text-gray-500 font-medium">Status</span>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors capitalize px-3 py-1 shadow-none">
                      {property.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-50 pb-4">
                <CardTitle className="text-xl">Key Features</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-700 p-3 rounded-xl hover:bg-primary-50 hover:text-primary-900 transition-colors duration-300 cursor-default group">
                      <div className="w-2.5 h-2.5 bg-primary-500 rounded-full mr-3 flex-shrink-0 group-hover:scale-125 transition-transform duration-300 shadow-sm"></div>
                      <span className="font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* MAP SECTION */}
            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-50 pb-4">
                <CardTitle className="flex items-center text-xl">
                  <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                  Location & Map
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 bg-white">
                <div className="mb-5 p-3 bg-gray-50 rounded-lg inline-block">
                  <p className="text-gray-700 font-medium text-sm flex items-center">
                    {property.address.street}, {property.address.city}, <span className="ml-1 text-primary-700">{property.address.postcode}</span>
                  </p>
                </div>
                
                <div 
                  className="rounded-xl overflow-hidden shadow-inner border border-gray-100 relative group cursor-pointer"
                  onClick={() => navigate(`/property/${property.property_id}/map`)}
                >
                  {/* Click interception overlay */}
                  <div className="absolute inset-0 z-[1000] bg-black/5 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <div className="bg-blue-900 text-white px-5 py-2.5 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 shadow-xl flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
                      View Full Map
                    </div>
                  </div>

                  {/* Clean PropertyMap call relies on built-in logic */}
                  <PropertyMap
                    properties={[property]}
                    zoom={16}
                    height="h-[350px]"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="hover:shadow-md transition-shadow duration-300 rounded-2xl">
              <PriceHistoryCard
                propertyHistory={propertyHistory}
                currentPrice={property.price}
                address={`${property.address.street}, ${property.address.city}`}
                listingType={property.listingType}
              />
            </div>

          </div>

          {/* Right Sidebar - Now rising to the top alongside the header */}
          <div className="lg:col-span-1">
            <div className="flex flex-col gap-6 sticky top-8">
              
              <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden">
                <CardHeader className="bg-white border-b border-gray-50 pb-4">
                  <CardTitle className="text-xl">Property Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 bg-white">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 group">
                      <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow text-primary-600 mr-3 transition-shadow duration-200">
                        <Bed className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Bedrooms</div>
                        <div className="font-bold text-gray-900 leading-none">{property.bedrooms}</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 group">
                      <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow text-primary-600 mr-3 transition-shadow duration-200">
                        <Bath className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Bathrooms</div>
                        <div className="font-bold text-gray-900 leading-none">{property.bathrooms}</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 group">
                      <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow text-primary-600 mr-3 transition-shadow duration-200">
                        <Home className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Reception</div>
                        <div className="font-bold text-gray-900 leading-none">{property.receptions}</div>
                      </div>
                    </div>
                    {property.propertySize && (
                      <div className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 group">
                        <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow text-primary-600 mr-3 transition-shadow duration-200">
                          <Ruler className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Size</div>
                          <div className="font-bold text-gray-900 leading-none">{property.propertySize} <span className="text-xs font-normal text-gray-500">sqft</span></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="my-5 bg-gray-100" />

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-sm tracking-wide uppercase text-gray-400 mb-3">Property Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                          <span className="text-gray-500">Property Type</span>
                          <span className="capitalize font-semibold text-gray-900">{property.type}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                          <span className="text-gray-500">Tenure</span>
                          <span className="capitalize font-semibold text-gray-900">{property.tenure}</span>
                        </div>
                        {property.yearBuilt && (
                          <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                            <span className="text-gray-500">Year Built</span>
                            <span className="font-semibold text-gray-900">{property.yearBuilt}</span>
                          </div>
                        )}
                        {property.energyRating && (
                          <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                            <span className="text-gray-500">Energy Rating</span>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-bold px-2.5 shadow-sm">{property.energyRating}</Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm tracking-wide uppercase text-gray-400 mb-3">Additional Details</h4>
                      <div className="space-y-1 text-sm">
                        {property.councilTaxBand && (
                          <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                            <span className="text-gray-500">Council Tax Band</span>
                            <span className="font-semibold text-gray-900">{property.councilTaxBand}</span>
                          </div>
                        )}
                        {property.landSize && (
                          <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                            <span className="text-gray-500">Land Size</span>
                            <span className="font-semibold text-gray-900">{property.landSize} m²</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                          <span className="text-gray-500">Listing Type</span>
                          <span className="capitalize font-semibold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded">For {displayListingType}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Agent Contact */}
              {agent ? (
                <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden relative group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 transform origin-left transition-transform duration-300 scale-y-0 group-hover:scale-y-100"></div>
                  <CardHeader className="bg-white border-b border-gray-50 pb-4">
                    <CardTitle className="flex items-center text-lg">
                      <Building2 className="w-5 h-5 mr-2 text-primary-600" />
                      Contact Agent
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 bg-white">
                    {agentLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-3">
                            <div className="font-bold text-lg text-gray-900 leading-tight">{agent.name}</div>
                            <div className="text-gray-600 font-medium text-sm mt-1">{agent.agency || agent.company}</div>
                            <div className="text-xs text-gray-50 mt-1.5 bg-gray-600 inline-block px-2 py-1 rounded">{agent.specialization}</div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center text-sm font-bold text-gray-900 bg-yellow-50 px-2 py-1 rounded-md mb-1 border border-yellow-100">
                              <Star className="w-3.5 h-3.5 text-yellow-500 mr-1.5 fill-current" />
                              {agent.rating > 0 ? (
                                <span>{agent.rating} <span className="text-gray-500 font-normal text-xs ml-0.5">({agent.reviews})</span></span>
                              ) : (
                                <span className="text-gray-500">New</span>
                              )}
                            </div>
                            {agent.location && (
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <MapPin className="w-3 h-3 mr-1" />
                                {agent.location}
                              </div>
                            )}
                          </div>
                        </div>
                          
                        <div className="space-y-3 pt-2">
                          <Button className="w-full shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 bg-primary-600 hover:bg-primary-700 h-11 text-md" onClick={handleCallAgent}>
                            <Phone className="w-4 h-4 mr-2" />
                            Call Agent
                          </Button>
                          <Button variant="outline" className="w-full hover:bg-gray-50 hover:text-primary-700 transition-colors duration-300 h-11 border-gray-200 shadow-sm" onClick={handleEmailAgent}>
                            <Mail className="w-4 h-4 mr-2" />
                            Email Agent
                          </Button>
                        </div>
                        
                        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl space-y-2 border border-gray-100">
                          <div className="flex items-center hover:text-gray-900 transition-colors duration-200">
                            <Phone className="w-3.5 h-3.5 mr-2.5 text-gray-500" />
                            {agent.phone}
                          </div>
                          <div className="flex items-center hover:text-gray-900 transition-colors duration-200">
                            <Mail className="w-3.5 h-3.5 mr-2.5 text-gray-500" />
                            {agent.email}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border border-gray-100 rounded-2xl shadow-sm">
                  <CardHeader className="bg-white border-b border-gray-50 pb-4">
                    <CardTitle className="flex items-center text-lg">
                      <Building2 className="w-5 h-5 mr-2 text-gray-400" />
                      Contact Agent
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="bg-white">
                    <div className="text-center py-10 bg-gray-50 rounded-xl mt-4 border border-gray-100 border-dashed">
                      <p className="text-gray-500 font-medium">No agent assigned to this property</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden bg-white">
                <CardHeader className="border-b border-gray-50 pb-4">
                  <CardTitle className="text-xl">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-5">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-11 border-blue-100 text-blue-700 bg-blue-50/50 hover:bg-blue-100 hover:border-blue-200 hover:text-blue-800 transition-all duration-300 shadow-sm"
                    onClick={() => setShowIntelligenceReport(true)}
                  >
                    <FileText className="w-4.5 h-4.5 mr-3" />
                    View Intelligence Report
                  </Button>

                  {property && (
                    <ScheduleViewingDialog
                      propertyId={parseInt(property.id)}
                      propertyTitle={property.title}
                      propertyAddress={property.address ? `${property.address.street}, ${property.address.city} ${property.address.postcode}`.trim() : undefined}
                    >
                      <Button variant="outline" className="w-full justify-start h-11 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-300 border-gray-200 shadow-sm">
                        <Calendar className="w-4.5 h-4.5 mr-3 text-gray-500" />
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
                      <Button variant="outline" className="w-full justify-start h-11 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-300 border-gray-200 shadow-sm">
                        <MessageCircle className="w-4.5 h-4.5 mr-3 text-gray-500" />
                        Message Agent
                      </Button>
                    </MessageDialog>
                  )}
                  <BrochureRequestDialog property={property as Property}>
                    <Button variant="outline" className="w-full justify-start h-11 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-300 border-gray-200 shadow-sm">
                      <FileText className="w-4.5 h-4.5 mr-3 text-gray-500" />
                      Request Brochure
                    </Button>
                  </BrochureRequestDialog>
                  <SharePropertyPopover property={property as Property}>
                    <Button variant="outline" className="w-full justify-start h-11 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-300 border-gray-200 shadow-sm">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-gray-500"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                      Share Property
                    </Button>
                  </SharePropertyPopover>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <IntelligenceReportModal
        property={property}
        open={showIntelligenceReport}
        onOpenChange={setShowIntelligenceReport}
      />
    </Layout>
  );
};

export default PropertyDetails;