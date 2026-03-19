import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropertyMap from '@/components/Properties/PropertyMap';
import { mockPropertiesResponse } from '@/utils/mockProperties';
import { Property } from '@/types';

const PropertyMapFullScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    
    // Format ID to handle both '101' and 'prop_101'
    const normalizedId = id.startsWith('prop_') ? id : `prop_${id}`;
    
    // Find property in mock data
    const mockProp = mockPropertiesResponse.data.properties.find(
      p => p.id === normalizedId || p.id === id
    );

    if (mockProp) {
      setProperty({
        ...mockProp,
        listingType: mockProp.listing_type,
        address: {
          street: mockProp.street,
          city: mockProp.city,
          postcode: mockProp.postcode,
          county: mockProp.county,
          coordinates: mockProp.coordinates
        }
      } as any);
    }
    
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 space-y-4">
        <h2 className="text-xl font-bold text-blue-900">Property Location Not Found</h2>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    );
  }

  // Robust extraction of coordinates
  const lat = property.latitude || property.address?.coordinates?.lat || (property as any).coordinates?.lat;
  const lng = property.longitude || property.address?.coordinates?.lng || (property as any).coordinates?.lng;

  return (
    <div className="relative w-full h-screen bg-gray-100 overflow-hidden">
      
      {/* Floating Back Button */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-[2000]">
        <Button
          onClick={() => navigate(-1)}
          className="shadow-2xl hover:shadow-xl rounded-full px-5 sm:px-6 h-12 bg-white text-blue-900 hover:bg-gray-50 hover:text-blue-700 font-bold border border-gray-100 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back to Property</span>
        </Button>
      </div>
      
      {/* Map filling the entire screen */}
      <PropertyMap
        properties={[property]}
        center={lat && lng ? [lat, lng] : undefined}
        zoom={16}
        height="h-screen"
      />
    </div>
  );
};

export default PropertyMapFullScreen;