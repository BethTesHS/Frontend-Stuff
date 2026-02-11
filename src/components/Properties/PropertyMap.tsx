import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '@/types';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PropertyMapProps {
  properties: Property[];
  center?: [number, number];
  zoom?: number;
  onBoundsChange?: (bounds: any) => void;
  selectedPostcode?: {
    lat: number;
    lng: number;
    postcode: string;
  };
  height?: string;
}

// Component to handle map updates
const MapUpdater: React.FC<{ center?: [number, number]; zoom?: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);
  
  return null;
};

const PropertyMap: React.FC<PropertyMapProps> = ({ 
  properties, 
  center = [51.505, -0.09],
  zoom = 13,
  onBoundsChange,
  selectedPostcode,
  height = 'h-96'
}) => {
  const mapRef = useRef<any>(null);
  
  // Get OS Maps API key from environment
  const OS_MAPS_API_KEY = import.meta.env.VITE_OS_MAPS_API_KEY;

  // Create custom property marker icon
  const createPropertyIcon = (price: number, listingType: string) => {
    const priceText = `£${price.toLocaleString()}`;
    const bgColor = listingType === 'rent' ? '#10B981' : '#3B82F6';
    
    return L.divIcon({
      className: 'custom-property-marker',
      html: `
        <div style="
          background: white;
          border: 2px solid ${bgColor};
          border-radius: 8px;
          padding: 4px 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          font-size: 12px;
          font-weight: 600;
          color: ${bgColor};
          white-space: nowrap;
          text-align: center;
        ">
          ${priceText}
        </div>
      `,
      iconSize: [80, 30],
      iconAnchor: [40, 30],
    });
  };

  const handleBoundsChange = () => {
    if (mapRef.current && onBoundsChange) {
      const map = mapRef.current;
      const bounds = map.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      });
    }
  };

  // Use selected postcode coordinates if available
  const mapCenter = selectedPostcode ? [selectedPostcode.lat, selectedPostcode.lng] as [number, number] : center;
  const mapZoom = selectedPostcode ? 15 : zoom;

  return (
    <div className={`w-full ${height} relative rounded-lg overflow-hidden border border-gray-200 shadow-md`}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full"
        ref={mapRef}
        whenReady={handleBoundsChange}
        scrollWheelZoom={true}
      >
        {/* OS Maps Tile Layer - Road style */}
        <TileLayer
          url={`https://api.os.uk/maps/raster/v1/zxy/Road_3857/{z}/{x}/{y}.png?key=${OS_MAPS_API_KEY}`}
          attribution='&copy; <a href="https://www.ordnancesurvey.co.uk/">Ordnance Survey</a>'
          maxZoom={20}
        />
        
        {/* Map updater for postcode changes */}
        <MapUpdater center={mapCenter} zoom={mapZoom} />
        
        {/* Property Markers */}
        {properties.map((property) => {
          const lat = property.latitude || property.address?.coordinates?.lat;
          const lng = property.longitude || property.address?.coordinates?.lng;
          
          if (!lat || !lng) {
            console.warn(`Property ${property.id} has no coordinates`);
            return null;
          }
          
          return (
            <Marker
              key={property.id}
              position={[lat, lng]}
              icon={createPropertyIcon(property.price, property.listingType || property.type || 'sale')}
            >
              <Popup className="custom-popup" maxWidth={300}>
                <div className="p-2">
                  <div className="mb-2">
                    {property.images && property.images.length > 0 && (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-24 object-cover rounded mb-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2 text-gray-900">{property.title}</h3>
                  <p className="text-blue-600 font-bold text-lg">£{property.price.toLocaleString()}</p>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <span>{property.bedrooms} bed</span>
                    <span className="mx-2">•</span>
                    <span>{property.bathrooms} bath</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {property.address?.city}, {property.address?.postcode}
                  </p>
                  <a 
                    href={`/property/${property.id}`}
                    className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors w-full block text-center font-medium"
                  >
                    View Details
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Selected Postcode Marker */}
        {selectedPostcode && (
          <Marker 
            position={[selectedPostcode.lat, selectedPostcode.lng]}
            icon={L.divIcon({
              className: 'custom-search-marker',
              html: `
                <div style="
                  background: #EF4444;
                  border: 3px solid white;
                  border-radius: 50%;
                  width: 20px;
                  height: 20px;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                "></div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          >
            <Popup>
              <div className="text-center p-2">
                <h3 className="font-semibold">Search Location</h3>
                <p className="text-sm text-gray-600">{selectedPostcode.postcode}</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* No properties message */}
        {properties.length === 0 && !selectedPostcode && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded shadow z-[1000]">
            <p className="text-sm text-gray-600">No properties to display on map</p>
          </div>
        )}
      </MapContainer>

      {/* Minimize attribution styling */}
      <style>{`
        .leaflet-control-attribution {
          font-size: 8px !important;
          background: rgba(255, 255, 255, 0.7) !important;
          padding: 2px 5px !important;
          opacity: 0.7;
          border-radius: 3px;
        }
        .leaflet-control-attribution:hover {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};

export default PropertyMap;