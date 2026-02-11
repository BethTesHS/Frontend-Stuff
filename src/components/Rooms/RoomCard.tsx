import { Room } from '@/types/room';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Users,
  Wifi,
  Car,
  TreePine,
  Bath,
  Star,
  Heart,
  Trash2
} from 'lucide-react';
import { useState } from 'react';

interface RoomCardProps {
  room: Room;
  showDeleteOnly?: boolean;
}

const RoomCard = ({ room, showDeleteOnly = false }: RoomCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === room.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? room.images.length - 1 : prev - 1
    );
  };

  const formatRoomType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatAvailableFrom = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleEmailLandlord = () => {
    const subject = `Inquiry about ${room.title}`;
    const body = `Hi ${room.landlord_name},\n\nI'm interested in the room listing: ${room.title}\nLocation: ${room.property_address}\nRent: £${room.rent}/month\n\nCould you please provide more details?\n\nBest regards`;
    window.location.href = `mailto:${room.landlord_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const fallbackImage = '/placeholder.svg';
  const imageUrl = imageError ? fallbackImage : (room.images[currentImageIndex] || fallbackImage);

  // Generate mock rating for demonstration
  const rating = 4.3;
  const reviewCount = Math.floor(Math.random() * 30) + 5;

  return (
    <Card className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-100 flex flex-col lg:flex-row w-full">
      {/* Image section - responsive width */}
      <div className="relative w-full lg:w-96 h-64 lg:h-auto flex-shrink-0 overflow-hidden">
        <img 
          src={imageUrl}
          alt={room.title}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />

        {/* Navigation arrows for multiple images */}
        {room.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
            >
              ←
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
            >
              →
            </button>
          </>
        )}
        
        {/* Status badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge className="bg-primary-500 text-white">
            {formatRoomType(room.room_type)}
          </Badge>
          {room.bills_included && (
            <Badge className="bg-green-600 text-white">Bills Inc.</Badge>
          )}
          {room.furnished && (
            <Badge className="bg-blue-600 text-white">Furnished</Badge>
          )}
        </div>

        {/* Favorite heart button */}
        <div className="absolute top-3 right-3">
          <Button
            variant="ghost"
            size="sm"
            className={`p-2 h-8 w-8 rounded-full backdrop-blur-sm transition-colors ${
              showDeleteOnly || isFavorited 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
            onClick={handleToggleFavorite}
          >
            {showDeleteOnly || isFavorited ? (
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
              £{room.rent.toLocaleString()}
              <span className="text-sm font-normal text-gray-600">/month</span>
            </div>
            {room.deposit && (
              <div className="text-xs text-gray-500">
                £{room.deposit.toLocaleString()} deposit
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Text section - flex-1 to take remaining space */}
      <CardContent className="p-6 flex flex-col flex-1">
        {/* Room title */}
        <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2">
          {room.title}
        </h3>

        {/* Address */}
        <div className="flex items-center mb-3">
          <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600 line-clamp-1">
            {room.property_address}
          </span>
        </div>

        {/* Landlord */}
        <div className="mb-4">
          <span className="text-primary-600 font-medium">
            By {room.landlord_name}
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

        {/* Room details */}
        <div className="flex items-center justify-between mb-4 text-gray-600">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="text-sm">Available {formatAvailableFrom(room.available_from)}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span className="text-sm">{room.current_housemates}/{room.total_housemates} housemates</span>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {room.internet_included && (
            <Badge variant="secondary">
              <Wifi className="w-3 h-3 mr-1" />
              WiFi
            </Badge>
          )}
          {room.parking_available && (
            <Badge variant="secondary">
              <Car className="w-3 h-3 mr-1" />
              Parking
            </Badge>
          )}
          {room.garden_access && (
            <Badge variant="secondary">
              <TreePine className="w-3 h-3 mr-1" />
              Garden
            </Badge>
          )}
          {room.room_type === 'ensuite' && (
            <Badge variant="secondary">
              <Bath className="w-3 h-3 mr-1" />
              Ensuite
            </Badge>
          )}
          {room.size_sqft && (
            <Badge variant="secondary">
              {room.size_sqft} sqft
            </Badge>
          )}
        </div>

        {/* Room description */}
        <p className="text-gray-600 mb-6 line-clamp-2">
          {room.description}
        </p>

        {/* Buttons - margin-top auto pushes them to bottom */}
        <div className="mt-auto flex gap-2">
          <Link to={`/rooms/${room.id}`} className="flex-1">
            <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white">
              View Details
            </Button>
          </Link>
          <Button variant="outline" onClick={handleEmailLandlord}>
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomCard;