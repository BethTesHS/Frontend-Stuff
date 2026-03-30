// src/pages/PropertyMapFullScreen.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import PropertyMap from '@/components/Properties/PropertyMap';
import { propertyApi } from '@/services/api';
import { Property } from '@/types';

const PropertyMapFullScreen = () => {
  // Extract propertyId instead of id
  // const { id: propertyId } = useParams<{ propertyId: string }>();
  const { id: propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        if (!propertyId) return;
        setLoading(true);
        
        // Parse ID safely
        let numericId: number | null = null;
        if (/^prop_/.test(propertyId)) {
          const parts = propertyId.split('_');
          numericId = Number(parts[1]);
        } else {
          numericId = Number(propertyId);
        }

        const idToFetch = !isNaN(numericId as number) && numericId !== null ? numericId : propertyId;
        const response = await propertyApi.getProperty(idToFetch);
        
        if (response?.data?.property) {
           const p = response.data.property;
           setProperty({
             ...p,
             title: p.title || p.name || '',
             address: {
               street: p.street || p.address?.street || '',
               city: p.city || p.address?.city || '',
               postcode: p.postcode || p.address?.postcode || '',
               coordinates: p.coordinates || p.address?.coordinates
             }
           });
        }
      } catch (error) {
        console.error('Failed to fetch property details for map:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]); // Depend on propertyId

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-4" />
        <p className="text-gray-500 font-medium">Loading map data...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center space-y-4 bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-800">Property location not found</h2>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-100">
      {/* Floating Header Overlay */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-3">
        <Button 
          variant="secondary" 
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full shadow-lg bg-white hover:bg-gray-50 text-gray-700 h-10 w-10 border border-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="bg-white px-4 py-2.5 rounded-full shadow-lg border border-gray-100">
          <h1 className="font-semibold text-sm text-gray-800 line-clamp-1 max-w-[200px] sm:max-w-[400px]">
            {property.title || 'Property Location'}
          </h1>
        </div>
      </div>

      {/* The Full Screen Map */}
      <PropertyMap properties={[property]} zoom={16} height="h-screen" />
    </div>
  );
};

export default PropertyMapFullScreen;