import { Room } from '@/types/room';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, Users, Bath, Star, Heart, Trash2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
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

interface RoomCardProps {
  room: Room;
  showDeleteOnly?: boolean;
}

const MOCK_REVIEWS = [
  { id: 1, author: "Sarah Jenkins", rating: 5, date: "2 weeks ago", comment: "Absolutely loved this room. The natural light is amazing and the housemates are very quiet. The local amenities are just a short walk away.", initials: "SJ", verified: true },
  { id: 2, author: "Michael Chen", rating: 4, date: "1 month ago", comment: "Great location, close to transit. The shared bathroom could use a minor update but overall a very solid and comfortable place to live.", initials: "MC", verified: true },
  { id: 3, author: "Emma Watson", rating: 5, date: "3 months ago", comment: "The landlord was very helpful and the room matches the pictures perfectly. Moving in was a breeze. Highly recommend!", initials: "EW", verified: true },
];

const RoomCard = ({ room, showDeleteOnly = false }: RoomCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  
  const { isRoomSaved, addSavedRoom, removeSavedRoom } = useSavedProperties();
  const isSaved = isRoomSaved(room.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaved) removeSavedRoom(room.id);
    else addSavedRoom(room);
  };

  const handleImageError = () => setImageError(true);
  const nextImage = () => setCurrentImageIndex(prev => prev === room.images.length - 1 ? 0 : prev + 1);
  const prevImage = () => setCurrentImageIndex(prev => prev === 0 ? room.images.length - 1 : prev - 1);
  const formatRoomType = (type: string) => type.charAt(0).toUpperCase() + type.slice(1);
  
  const formatAvailableFrom = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const fallbackImage = '/placeholder.svg';
  const imageUrl = imageError ? fallbackImage : (room.images[currentImageIndex] || fallbackImage);

  const rating = 4.7;
  const reviewCount = room.id ? (String(room.id).length * 4 + 10) % 40 + 5 : 18;

  return (
    <Card className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col group h-full">
      <div className="relative h-56 overflow-hidden flex-shrink-0 group/image">
        <img
          src={imageUrl}
          alt={room.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-105"
          onError={handleImageError}
        />
        
        {room.images.length > 1 && (
          <>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevImage(); }} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-md opacity-0 group-hover/image:opacity-100 transition-all duration-200 z-10">
              <span className="sr-only">Previous</span>←
            </button>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextImage(); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-md opacity-0 group-hover/image:opacity-100 transition-all duration-200 z-10">
              <span className="sr-only">Next</span>→
            </button>
          </>
        )}

        <div className="absolute top-3 left-3 flex gap-1.5 z-10">
          {room.bills_included && <Badge className="bg-green-600 text-white text-xs font-bold uppercase shadow-md">Bills Inc.</Badge>}
          {room.furnished && <Badge className="bg-blue-600 text-white text-xs font-bold uppercase shadow-md">Furnished</Badge>}
        </div>

        <div className="absolute top-3 right-3 z-10">
          <Button
            variant="ghost"
            size="sm"
            className={`p-2 h-8 w-8 rounded-full backdrop-blur-sm transition-colors ${showDeleteOnly ? 'bg-red-600 text-white hover:bg-red-700' : isSaved ? 'bg-white/90 text-red-600 hover:bg-white' : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-600'}`}
            onClick={handleToggleFavorite}
          >
            {showDeleteOnly ? <Trash2 className="w-4 h-4" /> : <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />}
          </Button>
        </div>

        <div className="absolute bottom-3 left-3 z-10">
          <span className="bg-white text-gray-900 font-bold text-sm px-2.5 py-1 rounded-md shadow">
            £{room.rent.toLocaleString()} <span className="font-normal text-gray-500 text-xs">/mo</span>
          </span>
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-bold text-gray-900 text-base line-clamp-1 flex-1" title={room.title}>{room.title}</h3>
          <Badge variant="outline" className="bg-gray-50 text-xs whitespace-nowrap">{formatRoomType(room.room_type)}</Badge>
        </div>
        
        <p className="text-gray-500 text-sm mb-3 line-clamp-1">{room.property_address}</p>

        {/* Scrollable White Review Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <div className="flex items-center gap-1.5 mb-4 w-fit cursor-pointer group/review">
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
                    Room Reviews
                    <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border border-yellow-200 shadow-sm px-2 py-0.5">
                      <Star className="w-3.5 h-3.5 fill-current mr-1" />{rating}
                    </Badge>
                  </DialogTitle>
                </div>
                <DialogDescription className="text-gray-500 mt-2">See what previous tenants say about this room.</DialogDescription>
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

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4 mt-auto">
          <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded"><Calendar className="w-3.5 h-3.5 text-gray-400" /><span className="truncate">Avail: {formatAvailableFrom(room.available_from)}</span></div>
          <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded"><Users className="w-3.5 h-3.5 text-gray-400" /><span>{room.current_housemates}/{room.total_housemates} Mates</span></div>
          {room.room_type === 'ensuite' && <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded col-span-2"><Bath className="w-3.5 h-3.5 text-gray-400" /><span>Ensuite Bathroom</span></div>}
        </div>

        <Link to={`/rooms/${room.id}`} className="block mt-2">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all duration-300">View Room</Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default RoomCard;