import { Room } from '@/types/room';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, Users, Bath, Star, Heart, Trash2 } from 'lucide-react';
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
    <Card className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 w-full flex flex-col">
      {/* Image with overlays */}
      <div className="relative w-full h-52 overflow-hidden flex-shrink-0">
        <img
          src={imageUrl}
          alt={room.title}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />

        {/* Navigation arrows */}
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

        {/* Status badges - top left */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {room.bills_included && (
            <Badge className="bg-green-600 text-white text-xs font-bold uppercase">Bills Inc.</Badge>
          )}
          {room.furnished && (
            <Badge className="bg-red-600 text-white text-xs font-bold uppercase">Furnished</Badge>
          )}
        </div>

        {/* Heart / delete button - top right */}
        <div className="absolute top-3 right-3">
          <Button
            variant="ghost"
            size="sm"
            className={`p-2 h-8 w-8 rounded-full backdrop-blur-sm transition-colors ${
              showDeleteOnly || isFavorited
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-600'
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

        {/* Price overlay - bottom left */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-white text-gray-900 font-bold text-sm px-2.5 py-1 rounded-md shadow">
            £{room.rent.toLocaleString()}
            <span className="font-normal text-gray-500 text-xs"> /mo</span>
          </span>
        </div>
      </div>

      {/* Card body */}
      <CardContent className="p-4 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-bold text-gray-900 text-base line-clamp-1 mb-1">
          {room.title}
        </h3>

        {/* Address */}
        <p className="text-gray-500 text-sm mb-2 line-clamp-1">{room.property_address}</p>

        {/* Room type */}
        <p className="text-blue-600 text-sm font-medium capitalize mb-2">{formatRoomType(room.room_type)}</p>

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

        {/* Room details row */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatAvailableFrom(room.available_from)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{room.current_housemates}/{room.total_housemates}</span>
          </div>
          {room.size_sqft > 0 && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{room.size_sqft} sqft</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-auto flex gap-2">
          <Link to={`/rooms/${room.id}`} className="flex-1">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              View Details
            </Button>
          </Link>
          <Button
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
            onClick={handleEmailLandlord}
          >
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomCard;