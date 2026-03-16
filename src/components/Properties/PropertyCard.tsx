import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Property } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bed, Bath, Star, Heart, Trash2, Square, CheckCircle2 } from 'lucide-react';
import { useSavedProperties } from '@/contexts/SavedPropertiesContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface PropertyCardProps {
  property: Property;
  showDeleteOnly?: boolean;
  showSaleDetails?: boolean;
}

const MOCK_REVIEWS = [
  { id: 1, author: "Sarah Jenkins", rating: 5, date: "2 weeks ago", comment: "Absolutely loved this property. The natural light is amazing and the neighborhood is very quiet. The local amenities are just a short walk away.", initials: "SJ", verified: true },
  { id: 2, author: "Michael Chen", rating: 4, date: "1 month ago", comment: "Great location, close to transit. The bathroom could use a minor update but overall a very solid and comfortable place to live.", initials: "MC", verified: true },
  { id: 3, author: "Emma Watson", rating: 5, date: "3 months ago", comment: "The agent was very helpful and the property matches the pictures perfectly. Moving in was a breeze. Highly recommend!", initials: "EW", verified: true },
  { id: 4, author: "David Thompson", rating: 4, date: "5 months ago", comment: "Spacious rooms and good amenities. Parking can be a bit tight on weekends, but the overall value for the area is excellent.", initials: "DT", verified: false },
];

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

  const handleImageError = () => setImageError(true);

  const fallbackImage = 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
  const imageUrl = imageError ? fallbackImage : (property.images?.[0] || fallbackImage);

  useEffect(() => {
    if (property.images?.[0] && !imageError) {
      const img = new Image();
      img.onload = () => {};
      img.onerror = () => {
        console.log('Property image not found, using fallback');
        setImageError(true);
      };
      img.src = property.images[0];
    }
  }, [property.images, property.id, imageError]);

  const rating = 4.8;
  const reviewCount = property.id ? (String(property.id).length * 3 + 12) % 50 + 10 : 25;

  return (
    <Card className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 w-full flex flex-col group">
      <div className="relative w-full h-52 overflow-hidden flex-shrink-0">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={handleImageError}
        />
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap z-10">
          {property.listingType && (
            <Badge className="bg-white text-gray-800 hover:bg-white text-xs capitalize font-semibold shadow-md">
              For {property.listingType === 'rent' ? 'Rent' : 'Sale'}
            </Badge>
          )}
          {showSaleDetails && property.tenure && (
            <Badge className="bg-white text-gray-800 hover:bg-white text-xs capitalize font-semibold shadow-md">
              {property.tenure === 'freehold' ? 'Freehold' : 'Leasehold'}
            </Badge>
          )}
        </div>
        <div className="absolute top-3 right-3 z-10">
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
            {showDeleteOnly ? <Trash2 className="w-4 h-4" /> : <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />}
          </Button>
        </div>
        <div className="absolute bottom-3 left-3 z-10">
          <span className="bg-white text-gray-900 font-bold text-sm px-2.5 py-1 rounded-md shadow">
            £{property.price.toLocaleString()}
            {property.listingType === 'rent' && <span className="font-normal text-gray-500 text-xs"> /mo</span>}
          </span>
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-base line-clamp-1 mb-1">{property.title}</h3>
        <p className="text-gray-500 text-sm mb-2 line-clamp-1">{property.address?.street}, {property.address?.city}</p>
        <p className="text-blue-600 text-sm font-medium capitalize mb-2">{property.type}</p>

        {/* Scrollable White Review Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <div className="flex items-center gap-1.5 mb-3 w-fit cursor-pointer group/review">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-3.5 h-3.5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-xs text-gray-500 transition-colors group-hover/review:text-blue-600 group-hover/review:underline">
                {reviewCount} reviews
              </span>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] bg-white text-gray-900 flex flex-col rounded-2xl p-0 overflow-hidden shadow-2xl border-0">
            <div className="p-6 pb-4 border-b border-gray-100 bg-gray-50/50">
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    Reviews
                    <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border border-yellow-200 shadow-sm px-2 py-0.5">
                      <Star className="w-3.5 h-3.5 fill-current mr-1" />{rating}
                    </Badge>
                  </DialogTitle>
                </div>
                <DialogDescription className="text-gray-500 mt-2">See what people have to say about {property.title}</DialogDescription>
              </DialogHeader>
            </div>
            
            {/* Native Scroll Area */}
            <div className="flex-1 overflow-y-auto max-h-[60vh] p-6 space-y-6 bg-white">
              {MOCK_REVIEWS.map(review => (
                <div key={review.id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-gray-200">
                        <AvatarFallback className="bg-blue-50 text-blue-700 font-bold text-sm">{review.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                          {review.author}
                          {review.verified && (
                            <span className="flex items-center text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{review.date}</div>
                      </div>
                    </div>
                    <div className="flex bg-gray-50 px-2 py-1 rounded-lg">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">"{review.comment}"</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1"><Bed className="w-4 h-4" /><span>{property.bedrooms} beds</span></div>
          <div className="flex items-center gap-1"><Bath className="w-4 h-4" /><span>{property.bathrooms} baths</span></div>
          {property.propertySize && <div className="flex items-center gap-1"><Square className="w-4 h-4" /><span>{property.propertySize} sqft</span></div>}
        </div>

        <div className="mt-auto">
          <Link to={`/property/${property.id}`} className="block">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all duration-300 hover:shadow-md">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;