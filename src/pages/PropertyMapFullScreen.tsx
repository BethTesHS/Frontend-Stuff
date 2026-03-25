import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropertyMap from '@/components/Properties/PropertyMap';
import { propertyApi } from '@/services/api';
import { usePostcodeLookup } from '@/hooks/usePostcodeLookup';
import { Property } from '@/types';

const PropertyMapFullScreen = () => {
  const { id } = useParams();
  const location = useLocation();
  const { lookupPostcode } = usePostcodeLookup();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // read optional query params passed from PropertyDetails
    const search = new URLSearchParams(location.search);
    const passedPid = search.get('property_id');
    const passedPostcode = search.get('postcode');

    // if no id and no passed postcode, nothing to do
    if (!id && !passedPostcode) return;

    setLoading(true);
    const load = async () => {
      try {
        // If a postcode was passed, prefer using it to resolve coordinates quickly
        if (passedPostcode) {
          const lookup = await lookupPostcode(passedPostcode);
          if (lookup && lookup.latitude && lookup.longitude) {
            // construct minimal property object anchored by postcode coords
            const minimal: any = {
              id: passedPid || id,
              address: { postcode: passedPostcode, city: lookup.city || '', street: lookup.street || '' },
              latitude: lookup.latitude,
              longitude: lookup.longitude,
              coordinates: { lat: lookup.latitude, lng: lookup.longitude }
            };

            // if we also have a numeric id, attempt to fetch full property and merge
            let fetched: any = null;
            let numericId: number | null = null;
            const tryId = passedPid || id;
            if (tryId) {
              if (/^prop_/.test(String(tryId))) {
                const parts = String(tryId).split('_');
                const maybe = Number(parts[1]);
                if (!isNaN(maybe)) numericId = maybe;
              } else {
                const maybe = Number(tryId);
                if (!isNaN(maybe)) numericId = maybe;
              }
            }

            if (numericId !== null) {
              const response = await propertyApi.getProperty(numericId as number);
              if (response && response.success && response.data && response.data.property) {
                fetched = response.data.property;
              }
            }

            // merge fetched details over minimal (so postcode coords preserved if fetched lacks them)
            const merged = fetched ? { ...minimal, ...fetched, address: { ...(minimal.address || {}), ...(fetched.address || {}) } } : minimal;
            setProperty(merged as any);
            setLoading(false);
            return;
          }
        }

        // fallback: try numeric id path
        let numericId: number | null = null;
        if (id) {
          if (/^prop_/.test(id)) {
            const parts = id.split('_');
            const maybe = Number(parts[1]);
            if (!isNaN(maybe)) numericId = maybe;
          } else {
            const maybe = Number(id);
            if (!isNaN(maybe)) numericId = maybe;
          }
        }

        if (numericId === null && passedPid) {
          if (/^prop_/.test(passedPid)) {
            const parts = passedPid.split('_');
            const maybe = Number(parts[1]);
            if (!isNaN(maybe)) numericId = maybe;
          } else {
            const maybe = Number(passedPid);
            if (!isNaN(maybe)) numericId = maybe;
          }
        }

        if (numericId === null) {
          setProperty(null);
          setLoading(false);
          return;
        }

        const response = await propertyApi.getProperty(numericId as number);
        if (response && response.success && response.data && response.data.property) {
          const p = response.data.property;
          
          // Ensure we don't stringify Address objects
          const rawAddress = p.address;
          const isAddressObj = typeof rawAddress === 'object' && rawAddress !== null;

          setProperty({
            ...p,
            listingType: p.listing_type || p.listingType,
            address: {
              street: p.street || (isAddressObj ? rawAddress.street : rawAddress) || '',
              city: p.city || (isAddressObj ? rawAddress.city : '') || '',
              postcode: p.postcode || (isAddressObj ? rawAddress.postcode : '') || '',
              county: p.county || (isAddressObj ? rawAddress.county : '') || '',
              coordinates: p.coordinates || (isAddressObj ? rawAddress.coordinates : undefined)
            }
          } as any);
        } else {
          setProperty(null);
        }
      } catch (err) {
        console.error('PropertyMapFullScreen: failed to load property', err);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    load();
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

  // Robust extraction of coordinates safely parsed to numbers
  const lat = property.latitude || property.address?.coordinates?.lat || (property as any).coordinates?.lat;
  const lng = property.longitude || property.address?.coordinates?.lng || (property as any).coordinates?.lng;

  const parsedLat = lat ? Number(lat) : undefined;
  const parsedLng = lng ? Number(lng) : undefined;
  const hasValidCoords = parsedLat !== undefined && parsedLng !== undefined && !isNaN(parsedLat) && !isNaN(parsedLng) && parsedLat !== 0;

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
        center={hasValidCoords ? [parsedLat, parsedLng] : undefined}
        zoom={16}
        height="h-screen"
      />
    </div>
  );
};

export default PropertyMapFullScreen;