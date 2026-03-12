import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Property } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bed, Bath, Star, Heart, Trash2, Square } from 'lucide-react';
import { useSavedProperties } from '@/contexts/SavedPropertiesContext';

interface PropertyCardProps {
  property: Property;
  showDeleteOnly?: boolean;
  showSaleDetails?: boolean;
}

const PropertyCard = ({ property, showDeleteOnly = false, showSaleDetails = false }: PropertyCardProps) => {
  const { isPropertySaved, addSavedProperty, removeSavedProperty } = useSavedProperties();
  const isSaved = isPropertySaved(property.id);
  const [imageError, setImageError] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSaved) {
      removeSavedProperty(property.id);
    } else {
      addSavedProperty(property);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
  const imageUrl = imageError ? fallbackImage : (property.images?.[0] || fallbackImage);

  // Add validation for image URL
  useEffect(() => {
    if (property.images?.[0] && !imageError) {
      // Pre-check if image exists to avoid 404s in console
      const img = new Image();
      img.onload = () => {
        // Image loaded successfully
      };
      img.onerror = () => {
        console.log('Property image not found on backend, using fallback for property:', property.id);
        setImageError(true);
      };
      img.src = property.images[0];
    }
  }, [property.images, property.id, imageError]);

  // Generate mock rating for demonstration
  const rating = 4.5;
  // Calculate deterministic review count so it doesn't jump around on page refresh
  const reviewCount = property.id ? (String(property.id).length * 3 + 12) % 50 + 10 : 25;

  return (
    <Card className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 w-full flex flex-col">
      {/* Image with overlays */}
      <div className="relative w-full h-52 overflow-hidden flex-shrink-0">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />

        {/* Status badges - top left */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {/* Removed Math.random() so badges don't change on refresh */}
          {/* Note: You can link these to actual data if you have it: property.isNew, property.isReduced */}
          
          {showSaleDetails && property.tenure && (
            <Badge className="bg-white/90 text-gray-800 text-xs">
              {property.tenure === 'freehold' ? 'Freehold' : 'Leasehold'}
            </Badge>
          )}
        </div>

        {/* Heart / delete button - top right */}
        <div className="absolute top-3 right-3">
          <Button
            variant="ghost"
            size="sm"
            className={`p-2 h-8 w-8 rounded-full backdrop-blur-sm transition-colors ${
              showDeleteOnly
                ? 'bg-red-600 text-white hover:bg-red-700'
                : isSaved
                ? 'bg-white/90 text-red-600 hover:bg-white'
                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-600'
            }`}
            onClick={handleToggle}
          >
            {showDeleteOnly ? (
              <Trash2 className="w-4 h-4" />
            ) : (
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            )}
          </Button>
        </div>

        {/* Price overlay - bottom left */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-white text-gray-900 font-bold text-sm px-2.5 py-1 rounded-md shadow">
            £{property.price.toLocaleString()}
            {property.listingType === 'rent' && (
              <span className="font-normal text-gray-500 text-xs"> /mo</span>
            )}
          </span>
        </div>
      </div>

      {/* Card body */}
      <CardContent className="p-4 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-bold text-gray-900 text-base line-clamp-1 mb-1">
          {property.title}
        </h3>

        {/* Address */}
        <p className="text-gray-500 text-sm mb-2 line-clamp-1">
          {property.address?.street}, {property.address?.city}
        </p>

        {/* Property type */}
        <p className="text-blue-600 text-sm font-medium capitalize mb-2">{property.type}</p>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">{reviewCount} reviews</span>
        </div>

        {/* Amenities */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{property.bedrooms} beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span>{property.bathrooms} baths</span>
          </div>
          {property.propertySize && (
            <div className="flex items-center gap-1">
              <Square className="w-4 h-4" />
              <span>{property.propertySize} sqft</span>
            </div>
          )}
        </div>

        {/* View Details button */}
        <div className="mt-auto">
          <Link to={`/property/${property.id}`} className="block">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;