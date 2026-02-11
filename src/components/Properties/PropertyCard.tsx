
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Property } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Home, Star, Heart, Trash2, Square, Calendar, Zap, FileText } from 'lucide-react';
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
  const reviewCount = Math.floor(Math.random() * 50) + 10;

  return (
    <Card className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-100 flex flex-col lg:flex-row w-full">
      {/* Image section - responsive width */}
      <div className="relative w-full lg:w-96 h-64 lg:h-auto flex-shrink-0 overflow-hidden">
        <img 
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        
        {/* Status badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge className="bg-primary-500 text-white">
            For {property.listingType === 'sale' ? 'Sale' : 'Rent'}
          </Badge>
          {showSaleDetails && (
            <Badge variant="secondary" className="bg-white/90 text-gray-800">
              {property.tenure === 'freehold' ? 'Freehold' : 'Leasehold'}
            </Badge>
          )}
          {Math.random() > 0.7 && (
            <Badge className="bg-green-600 text-white">New</Badge>
          )}
          {Math.random() > 0.8 && (
            <Badge className="bg-red-600 text-white">Reduced</Badge>
          )}
        </div>

        {/* Favorite heart button */}
        <div className="absolute top-3 right-3">
          <Button
            variant="ghost"
            size="sm"
            className={`p-2 h-8 w-8 rounded-full backdrop-blur-sm transition-colors ${
              showDeleteOnly || isSaved 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
            onClick={handleToggle}
          >
            {showDeleteOnly || isSaved ? (
              <Trash2 className="w-4 h-4" />
            ) : (
              <Heart className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Price label */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="text-lg font-bold text-gray-900">
              £{property.price.toLocaleString()}
              {property.listingType === 'rent' && (
                <span className="text-sm font-normal text-gray-600">/month</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Text section - flex-1 to take remaining space */}
      <CardContent className="p-6 flex flex-col flex-1">
        {/* Property title */}
        <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2">
          {property.title}
        </h3>

        {/* Address */}
        <div className="flex items-center mb-3">
          <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600">
            {property.address.street}, {property.address.city}, {property.address.postcode}
          </span>
        </div>

        {/* Property type */}
        <div className="mb-4">
          <span className="text-primary-600 font-medium capitalize">
            {property.type}
          </span>
        </div>

        {/* Rating stars with review count */}
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">
            {rating} ({reviewCount} reviews)
          </span>
        </div>

        {/* Amenities row */}
        <div className="flex items-center justify-between mb-4 text-gray-600">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <Bed className="w-5 h-5 mr-2" />
              <span>{property.bedrooms} bed</span>
            </div>
            <div className="flex items-center">
              <Bath className="w-5 h-5 mr-2" />
              <span>{property.bathrooms} bath</span>
            </div>
            {showSaleDetails && property.propertySize && (
              <div className="flex items-center">
                <Square className="w-5 h-5 mr-2" />
                <span>{property.propertySize} sqft</span>
              </div>
            )}
          </div>
        </div>

        {/* Sale-specific details */}
        {showSaleDetails && (
          <div className="flex items-center space-x-4 mb-6 text-gray-500 text-sm">
            {property.energyRating && (
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-1" />
                <span>EPC: {property.energyRating}</span>
              </div>
            )}
            {property.councilTaxBand && (
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                <span>Tax: {property.councilTaxBand}</span>
              </div>
            )}
            {property.yearBuilt && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{property.yearBuilt}</span>
              </div>
            )}
          </div>
        )}

        {/* Property description */}
        <p className="text-gray-600 mb-6 line-clamp-2">
          {property.description}
        </p>

        {/* "View Details" button - margin-top auto pushes it to bottom */}
        <div className="mt-auto">
          <Link to={`/property/${property.id}`} className="block">
            <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
