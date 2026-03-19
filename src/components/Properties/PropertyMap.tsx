import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { Property } from '@/types';

// CRITICAL: This CSS import fixes the "map not generating/loading tiles" issue
import 'leaflet/dist/leaflet.css';

// --- EXACT PINPOINT ICON ---
const exactPinpointIcon = L.divIcon({
  className: 'bg-transparent border-none',
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="#dc2626" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.3));">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
      <circle cx="12" cy="10" r="3" fill="white"></circle>
    </svg>
  `,
  iconSize: [36, 36],       
  iconAnchor: [18, 36],     // Anchors the very bottom tip
  popupAnchor: [0, -36],    
});

// Helper component to auto-center the map when coordinates load or change
const ChangeView = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== 0 && center[1] !== 0) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
};

// --- ASYNC POSTCODE MARKER ---
// This component resolves the postcode to coordinates before rendering the pin
const PropertyMarker = ({ property }: { property: Property }) => {
  const navigate = useNavigate();
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    const resolveLocation = async () => {
      const postcode = property.address?.postcode || (property as any).postcode;

      // 1. Try UK Postcode lookup first
      if (postcode) {
        try {
          const cleanPostcode = postcode.replace(/\s+/g, '');
          const res = await fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}`);
          const data = await res.json();

          if (data.status === 200 && data.result) {
            setPosition([data.result.latitude, data.result.longitude]);
            return; // Success!
          }
        } catch (err) {
          console.warn("Postcode API lookup failed for:", postcode);
        }
      }

      // 2. Fallback to existing coordinates (for international properties like Kenya)
      const lat = property.latitude || property.address?.coordinates?.lat || (property as any).coordinates?.lat;
      const lng = property.longitude || property.address?.coordinates?.lng || (property as any).coordinates?.lng;

      if (lat && lng) {
        setPosition([lat, lng]);
      }
    };

    resolveLocation();
  }, [property]);

  if (!position) return null;

  return (
    <Marker position={position} icon={exactPinpointIcon}>
      <Popup className="property-popup rounded-xl">
        <div 
          className="p-1 cursor-pointer w-48"
          onClick={() => navigate(`/property/${property.id}`)}
        >
          <img 
            src={(property as any).primary_image_url || property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'} 
            alt={property.title} 
            className="w-full h-24 object-cover rounded-lg mb-2"
          />
          <h4 className="font-bold text-blue-900 text-sm truncate">{property.title}</h4>
          <p className="text-gray-500 text-xs truncate mb-2">{property.address?.street || property.address?.city}</p>
          <div className="font-black text-red-600">£{property.price?.toLocaleString()}</div>
        </div>
      </Popup>
    </Marker>
  );
};

interface PropertyMapProps {
  properties: Property[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ 
  properties, 
  center, 
  zoom = 15, 
  height = "h-[400px]" 
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.5074, -0.1278]); // Default London

  useEffect(() => {
    if (center && center[0] !== 0) {
      setMapCenter(center);
      return;
    }

    // Auto-center map based on the first property's postcode
    if (properties.length > 0) {
      const p = properties[0];
      const postcode = p.address?.postcode || (p as any).postcode;

      const fallbackCoordinates = () => {
        const lat = p.latitude || p.address?.coordinates?.lat || (p as any).coordinates?.lat;
        const lng = p.longitude || p.address?.coordinates?.lng || (p as any).coordinates?.lng;
        if (lat && lng) setMapCenter([lat, lng]);
      };

      if (postcode) {
        const cleanPostcode = postcode.replace(/\s+/g, '');
        fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}`)
          .then(res => res.json())
          .then(data => {
            if (data.status === 200 && data.result) {
              setMapCenter([data.result.latitude, data.result.longitude]);
            } else {
              fallbackCoordinates();
            }
          })
          .catch(fallbackCoordinates);
      } else {
        fallbackCoordinates();
      }
    }
  }, [center, properties]);

  return (
    <div className={`w-full ${height} relative z-0 rounded-xl overflow-hidden`}>
      <MapContainer 
        center={mapCenter} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        {/* Modern, clean Map Tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        <ChangeView center={mapCenter} zoom={zoom} />

        {/* Render the intelligent postcode markers */}
        {properties.map((property) => (
          <PropertyMarker key={property.id} property={property} />
        ))}

      </MapContainer>
    </div>
  );
};

export default PropertyMap;