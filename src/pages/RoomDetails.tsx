import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MapPin, 
  Bed, 
  Bath, 
  Home, 
  Star, 
  Heart, 
  Calendar,
  Phone,
  Mail,
  Users,
  Wifi,
  Car,
  TreePine,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Clock,
  PoundSterling,
  User,
  Shield,
  MessageCircle,
  Share2,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { Room } from '@/types/room';
import { Property } from '@/types';
import { spareRoomApi } from '@/services/spareRoomApi';
import { buyerApi } from '@/services/buyerApi';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import MessageDialog from '@/components/Messages/MessageDialog';
import IntelligenceReportModal from '@/components/Properties/IntelligenceReportModal';
import { useSavedProperties } from '@/contexts/SavedPropertiesContext';

// Mock Reviews Data
const MOCK_REVIEWS = [
  { id: 1, author: "Sarah Jenkins", rating: 5, date: "2 weeks ago", comment: "Absolutely loved this room. The natural light is amazing and the housemates are very quiet. The local amenities are just a short walk away. The landlord was also extremely helpful.", initials: "SJ", verified: true },
  { id: 2, author: "Michael Chen", rating: 4, date: "1 month ago", comment: "Great location, close to transit. The shared bathroom could use a minor update but overall a very solid and comfortable place to live. Would highly recommend to young professionals.", initials: "MC", verified: true },
  { id: 3, author: "Emma Watson", rating: 5, date: "3 months ago", comment: "The landlord was very helpful and the room matches the pictures perfectly. Moving in was a breeze. Highly recommend!", initials: "EW", verified: true },
  { id: 4, author: "David Thompson", rating: 4, date: "5 months ago", comment: "Spacious room and good amenities. Parking can be a bit tight on weekends, but the overall value for the area is excellent.", initials: "DT", verified: false },
  { id: 5, author: "Jessica Davis", rating: 5, date: "6 months ago", comment: "One of the best places I've stayed in. The housemates are friendly and the property management is highly responsive.", initials: "JD", verified: true }
];

const RoomDetails = () => {
  const { id: roomId } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [localLoading, setLocalLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [viewingDate, setViewingDate] = useState('');
  const [viewingTime, setViewingTime] = useState('');
  const [viewingType, setViewingType] = useState<'in_person' | 'virtual' | 'video_call'>('in_person');
  const [viewingNotes, setViewingNotes] = useState('');
  const [isSchedulingViewing, setIsSchedulingViewing] = useState(false);
  const [viewingDialogOpen, setViewingDialogOpen] = useState(false);
  const [showIntelligenceReport, setShowIntelligenceReport] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const { isRoomSaved, addSavedRoom, removeSavedRoom } = useSavedProperties();
  const isSaved = room ? isRoomSaved(room.id) : false;

  useEffect(() => {
    if (!roomId) return;

    const loadRoomData = async () => {
      try {
        setLocalLoading(true);
        
        const response = await spareRoomApi.getSpareRoom(parseInt(roomId));
        
        if (response && response.id) {
          const convertedRoom: Room = {
            id: typeof response.id === 'string' ? response.id : String(response.id),
            title: response.title || '',
            description: response.description || '',
            rent: response.rent || 0,
            deposit: response.deposit || 0,
            available_from: response.available_from || new Date().toISOString().split('T')[0],
            property_address: response.property_address || '',
            room_type: response.room_type || 'single',
            size_sqft: response.size_sqft || 0,
            furnished: response.furnished ?? false,
            bills_included: response.bills_included ?? false,
            internet_included: response.internet_included ?? false,
            parking_available: response.parking_available ?? false,
            garden_access: response.garden_access ?? false,
            images: response.images && response.images.length > 0 ? response.images : ['/placeholder.svg'],
            landlord_name: response.contact_name || 'Contact',
            landlord_email: response.contact_email || '',
            landlord_phone: response.contact_phone || '',
            preferences: response.preferences || {
              gender: 'any',
              age_range: '18-50',
              profession: ['Any'],
              smoking: false,
              pets: false
            },
            house_rules: response.house_rules || [],
            current_housemates: response.current_housemates || 0,
            total_housemates: response.total_housemates || 1,
            nearest_station: response.nearest_station || '',
            transport_links: response.transport_links || [],
            created_at: response.created_at || new Date().toISOString(),
            updated_at: response.updated_at || new Date().toISOString()
          };
          setRoom(convertedRoom);
        } else {
          setRoom(null);
        }
        
      } catch (error) {
        console.error('RoomDetails: Error loading room data:', error);
        setRoom(null);
      } finally {
        setLocalLoading(false);
      }
    };

    loadRoomData();
  }, [roomId]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/rooms');
    }
  };

  const handleLikeToggle = () => {
    if (!room) return;
    
    if (isSaved) {
      removeSavedRoom(room.id);
    } else {
      addSavedRoom(room);
    }
  };

  const nextImage = () => {
    if (room) {
      setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
    }
  };

  const prevImage = () => {
    if (room) {
      setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
    }
  };

  const handleCallLandlord = () => {
    if (room && room.landlord_phone) {
      const confirmed = window.confirm(`Do you want to call ${room.landlord_name} at ${room.landlord_phone}?`);
      if (confirmed) {
        window.location.href = `tel:${room.landlord_phone.replace(/\s+/g, '')}`;
      }
    }
  };

  const handleEmailLandlord = () => {
    if (room) {
      const subject = `Inquiry about ${room.title}`;
      const body = `Hi ${room.landlord_name},\n\nI'm interested in the room listing: ${room.title}\nLocation: ${room.property_address}\nRent: £${room.rent}/month\n\nCould you please provide more details?\n\nBest regards`;
      window.location.href = `mailto:${room.landlord_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive"
      });
      return;
    }

    console.log('Sending message:', { message, roomId, landlord: room?.landlord_email });
    
    toast({
      title: "Message Sent",
      description: "Your message has been sent to the landlord"
    });
    
    setMessage('');
  };

  const handleScheduleViewing = async () => {
    if (!viewingDate || !viewingTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!roomId) {
      toast({
        title: "Error",
        description: "Room ID not found",
        variant: "destructive"
      });
      return;
    }

    setIsSchedulingViewing(true);

    try {
      const [hours, minutes] = viewingTime.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      const formattedTime = `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;

      const response = await buyerApi.scheduleSpareRoomViewing({
        spare_room_id: parseInt(roomId),
        viewing_date: viewingDate,
        viewing_time: formattedTime,
        viewing_type: viewingType,
        notes: viewingNotes || undefined
      });
      
      if (response.success) {
      toast({
        title: "Viewing Scheduled!",
        description: "Your viewing request has been submitted. The property owner will be notified."
      });

      setViewingDate('');
      setViewingTime('');
      setViewingType('in_person');
      setViewingNotes('');
      setViewingDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to schedule viewing",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error scheduling viewing:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while scheduling the viewing",
        variant: "destructive"
      });
    } finally {
      setIsSchedulingViewing(false);
    }
  };

  const handleApplyForRoom = () => {
    if (!applicantName || !applicantEmail) {
      toast({
        title: "Error",
        description: "Please fill in your name and email",
        variant: "destructive"
      });
      return;
    }

    console.log('Applying for room:', {
      roomId,
      applicant: { name: applicantName, email: applicantEmail, phone: applicantPhone }
    });

    toast({
      title: "Application Submitted",
      description: "Your application has been sent to the landlord"
    });

    setApplicantName('');
    setApplicantEmail('');
    setApplicantPhone('');
  };

  const handleShareRoom = () => {
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: room?.title || 'Room Listing',
        text: `Check out this room: ${room?.title} - £${room?.rent}/month`,
        url: url,
      }).then(() => {
        toast({
          title: "Shared Successfully",
          description: "Room listing has been shared"
        });
      }).catch(() => {
        navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied",
          description: "Room link has been copied to clipboard"
        });
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied",
        description: "Room link has been copied to clipboard"
      });
    }
  };

  const formatAvailableFrom = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatRoomType = (type: string) => {
    const types: { [key: string]: string } = {
      'single': 'Single Room',
      'double': 'Double Room',
      'ensuite': 'Ensuite Room',
      'studio': 'Studio Room'
    };
    return types[type] || type;
  };

  const getPropertyFormatForReport = (): Property | null => {
    if (!room) return null;

    const addressParts = room.property_address.split(',').map(p => p.trim());
    let street = room.property_address;
    let city = '';
    let postcode = '';

    if (addressParts.length >= 3) {
      street = addressParts.slice(0, addressParts.length - 2).join(', ');
      city = addressParts[addressParts.length - 2];
      postcode = addressParts[addressParts.length - 1];
    } else if (addressParts.length === 2) {
      street = addressParts[0];
      city = addressParts[1];
    }

    return {
      id: room.id,
      title: room.title,
      description: room.description,
      price: room.rent,
      listingType: 'rent',
      status: 'available',
      type: room.room_type,
      tenure: 'leasehold',
      bedrooms: room.total_housemates || 1,
      bathrooms: 1,
      receptions: 1,
      propertySize: room.size_sqft,
      address: {
        street,
        city,
        postcode,
      },
      features: room.house_rules || [],
      images: room.images,
      createdAt: room.created_at,
      updatedAt: room.updated_at,
    } as unknown as Property;
  };

  if (localLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!room) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-800">Room Not Found</h1>
            <p className="text-gray-600">
              The room with ID "{roomId}" doesn't exist.
            </p>
            <div className="flex justify-center space-x-4 pt-4">
              <Button onClick={handleBack} className="shadow-sm hover:shadow-md transition-all duration-300">
                Go Back
              </Button>
              <Button variant="outline" onClick={() => navigate('/rooms')} className="hover:bg-gray-50 transition-colors duration-300">
                Browse Rooms
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const roomRating = 4.8;
  const roomReviewCount = 24;

  return (
    <Layout>
      <div className="py-8 max-w-7xl mx-auto">
        {/* Top Back Button */}
        <div className="mb-4 px-4 sm:px-6 lg:px-8">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="text-gray-600 hover:text-primary-700 hover:bg-primary-50 px-3 py-2 rounded-full transition-all duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Rooms
          </Button>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-start px-4 sm:px-6 lg:px-8">
          {/* Left Column (Images & Core Content) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header Content moved to Left Column so Right Sidebar can go higher */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{room.title}</h1>
                <Badge className="bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-sm px-3 py-1 text-sm rounded-full">
                  {formatRoomType(room.room_type)}
                </Badge>
              </div>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="w-5 h-5 mr-1.5 text-primary-600" />
                <span className="text-lg">{room.property_address}</span>
              </div>

              {/* Clickable Reviews Trigger */}
              <Dialog>
                <DialogTrigger asChild>
                  <div className="flex items-center gap-1.5 mb-4 w-fit cursor-pointer group/review p-1.5 -ml-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= roomRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-600 transition-colors group-hover/review:text-primary-600 group-hover/review:underline">
                      {roomRating} ({roomReviewCount} reviews)
                    </span>
                  </div>
                </DialogTrigger>
                {/* FORCED WHITE BACKGROUND DIALOG CONTENT */}
                <DialogContent className="sm:max-w-[650px] bg-white text-gray-900 p-0 overflow-hidden rounded-2xl border-0 shadow-2xl flex flex-col">
                  {/* Modal Header */}
                  <div className="bg-gray-50/80 p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <DialogTitle className="text-2xl font-extrabold text-gray-900">Room Reviews</DialogTitle>
                      <DialogDescription className="text-gray-500 mt-1">Real feedback from past viewers and tenants.</DialogDescription>
                    </div>
                    <div className="flex flex-col items-end bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                      <div className="text-3xl font-black text-gray-900 flex items-center gap-2">
                        {roomRating}
                      </div>
                      <div className="flex text-yellow-400 mt-1 gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-4 h-4 ${star <= roomRating ? 'fill-current' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <div className="text-xs font-medium text-gray-400 mt-1">{roomReviewCount} total reviews</div>
                    </div>
                  </div>
                  
                  {/* SCROLLABLE WHITE CONTENT AREA */}
                  <div className="flex-1 overflow-y-auto max-h-[60vh] bg-white p-6 space-y-6">
                    {MOCK_REVIEWS.map(review => (
                      <div key={review.id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-11 h-11 border border-gray-200">
                              <AvatarFallback className="bg-primary-50 text-primary-700 font-bold">
                                {review.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                {review.author}
                                {review.verified && (
                                  <span className="flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Verified
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">{review.date}</div>
                            </div>
                          </div>
                          <div className="flex gap-0.5 bg-gray-50 px-2 py-1 rounded-lg">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed pr-4">"{review.comment}"</p>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex flex-col mb-2">
                <div className="text-4xl font-bold text-primary-700 drop-shadow-sm mt-2">
                  £{room.rent.toLocaleString()}
                  <span className="text-xl font-medium text-gray-500 ml-1">/month</span>
                </div>
                {room.deposit > 0 && (
                  <div className="text-md text-gray-500 mt-1 font-medium">
                    £{room.deposit.toLocaleString()} deposit required
                  </div>
                )}
              </div>
            </div>

            {/* Room Image Container with Save Button Overlaid */}
            <div className="relative w-full group">
              <div className="aspect-video rounded-2xl overflow-hidden bg-gray-200 shadow-md transition-shadow duration-300 group-hover:shadow-xl">
                {room.images.length > 0 ? (
                  <img
                    src={room.images[currentImageIndex] || '/placeholder.svg'}
                    alt={room.title}
                    className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                    <Bed className="w-16 h-16 opacity-50" />
                  </div>
                )}
                {room.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/95 text-gray-800 p-2.5 rounded-full border border-gray-200 shadow-lg hover:bg-white hover:scale-110 hover:text-primary-600 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/95 text-gray-800 p-2.5 rounded-full border border-gray-200 shadow-lg hover:bg-white hover:scale-110 hover:text-primary-600 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Save Button Absolute positioned top right */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLikeToggle}
                className={`absolute top-4 right-4 z-10 backdrop-blur-md shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 rounded-xl px-5 py-5 font-semibold ${
                  isSaved 
                  ? 'bg-white/95 border-red-100 text-red-600 hover:bg-white' 
                  : 'bg-white/80 border-transparent text-gray-800 hover:text-red-600 hover:bg-white'
                }`}
              >
                <Heart className={`w-5 h-5 mr-2 transition-all duration-300 ${isSaved ? 'fill-current text-red-600 scale-110' : ''}`} />
                {isSaved ? 'Saved' : 'Save'}
              </Button>

              {room.images.length > 1 && (
                <div className="flex justify-center mt-5 space-x-2.5">
                  {room.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                        index === currentImageIndex ? 'bg-primary-600 shadow-sm w-6' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-50 pb-4">
                <CardTitle className="text-xl">Description</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 bg-white">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{room.description}</p>
              </CardContent>
            </Card>

            {/* Amenities & Features */}
            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-50 pb-4">
                <CardTitle className="text-xl">Amenities & Features</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-sm tracking-wide uppercase text-gray-400 mb-3">Included</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className={`w-2.5 h-2.5 rounded-full ${room.furnished ? 'bg-green-500 shadow-sm' : 'bg-red-400'}`}></div>
                        <span className={`font-medium ${room.furnished ? 'text-gray-900' : 'text-gray-500'}`}>
                          {room.furnished ? 'Furnished' : 'Unfurnished'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className={`w-2.5 h-2.5 rounded-full ${room.bills_included ? 'bg-green-500 shadow-sm' : 'bg-red-400'}`}></div>
                        <span className={`font-medium ${room.bills_included ? 'text-gray-900' : 'text-gray-500'}`}>
                          Bills {room.bills_included ? 'Included' : 'Not Included'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className={`w-2.5 h-2.5 rounded-full ${room.internet_included ? 'bg-green-500 shadow-sm' : 'bg-red-400'}`}></div>
                        <Wifi className={`w-4 h-4 ${room.internet_included ? 'text-gray-900' : 'text-gray-400'}`} />
                        <span className={`font-medium ${room.internet_included ? 'text-gray-900' : 'text-gray-500'}`}>
                          WiFi {room.internet_included ? 'Included' : 'Not Included'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm tracking-wide uppercase text-gray-400 mb-3">Additional Features</h4>
                    <div className="space-y-2">
                      {room.parking_available && (
                        <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                          <Car className="w-5 h-5 text-primary-600" />
                          <span className="font-medium text-gray-900">Parking Available</span>
                        </div>
                      )}
                      {room.garden_access && (
                        <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                          <TreePine className="w-5 h-5 text-primary-600" />
                          <span className="font-medium text-gray-900">Garden Access</span>
                        </div>
                      )}
                      {room.room_type === 'ensuite' && (
                        <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                          <Bath className="w-5 h-5 text-primary-600" />
                          <span className="font-medium text-gray-900">Private Bathroom</span>
                        </div>
                      )}
                      {!room.parking_available && !room.garden_access && room.room_type !== 'ensuite' && (
                         <div className="p-2 text-gray-500 italic text-sm">No additional features listed.</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* House Rules */}
            {room.house_rules.length > 0 && (
              <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden">
                <CardHeader className="bg-white border-b border-gray-50 pb-4">
                  <CardTitle className="text-xl">House Rules</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 bg-white">
                  <div className="space-y-3">
                    {room.house_rules.map((rule, index) => (
                      <div key={index} className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                        <Shield className="w-4.5 h-4.5 mr-3 text-primary-500 group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-gray-800 font-medium">{rule}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tenant Preferences */}
            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-50 pb-4">
                <CardTitle className="text-xl">Tenant Preferences</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                  {room.preferences.gender && room.preferences.gender !== 'any' && (
                    <div className="flex justify-between items-center p-2.5 hover:bg-gray-50 rounded-lg transition-colors text-sm">
                      <span className="text-gray-500 font-medium">Gender Preference</span>
                      <span className="capitalize font-semibold text-gray-900">{room.preferences.gender} only</span>
                    </div>
                  )}
                  {room.preferences.age_range && (
                    <div className="flex justify-between items-center p-2.5 hover:bg-gray-50 rounded-lg transition-colors text-sm">
                      <span className="text-gray-500 font-medium">Age Range</span>
                      <span className="font-semibold text-gray-900">{room.preferences.age_range}</span>
                    </div>
                  )}
                  {room.preferences.profession && room.preferences.profession.length > 0 && (
                    <div className="flex justify-between items-center p-2.5 hover:bg-gray-50 rounded-lg transition-colors text-sm">
                      <span className="text-gray-500 font-medium">Profession</span>
                      <span className="font-semibold text-gray-900">{room.preferences.profession.join(', ')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-2.5 hover:bg-gray-50 rounded-lg transition-colors text-sm">
                    <span className="text-gray-500 font-medium">Smoking</span>
                    <Badge variant="outline" className={`shadow-sm px-2.5 font-bold ${room.preferences.smoking ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      {room.preferences.smoking ? 'Allowed' : 'Not Allowed'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-2.5 hover:bg-gray-50 rounded-lg transition-colors text-sm">
                    <span className="text-gray-500 font-medium">Pets</span>
                    <Badge variant="outline" className={`shadow-sm px-2.5 font-bold ${room.preferences.pets ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      {room.preferences.pets ? 'Allowed' : 'Not Allowed'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transport Links */}
            {room.transport_links.length > 0 && (
              <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden">
                <CardHeader className="bg-white border-b border-gray-50 pb-4">
                  <CardTitle className="text-xl">Transport Links</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 bg-white">
                  <div className="flex flex-wrap gap-2.5">
                    {room.transport_links.map((link, index) => (
                      <Badge key={index} variant="secondary" className="text-sm px-3 py-1.5 bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors cursor-default shadow-sm">
                        {link}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

          {/* Right Sidebar - Now rising to the top alongside the header */}
          <div className="lg:col-span-1">
            <div className="flex flex-col gap-6 sticky top-8">
              
              {/* Comprehensive Room Details Card */}
              <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden">
                <CardHeader className="bg-white border-b border-gray-50 pb-4">
                  <CardTitle className="text-xl">Room Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 bg-white">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 group">
                      <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow text-primary-600 mr-3 transition-shadow duration-200">
                        <Bed className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Room Type</div>
                        <div className="font-bold text-gray-900 leading-none">{formatRoomType(room.room_type).split(' ')[0]}</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 group">
                      <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow text-primary-600 mr-3 transition-shadow duration-200">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Housemates</div>
                        <div className="font-bold text-gray-900 leading-none">{room.current_housemates}/{room.total_housemates}</div>
                      </div>
                    </div>
                    {room.size_sqft && (
                      <div className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 group">
                        <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow text-primary-600 mr-3 transition-shadow duration-200">
                          <Home className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Size</div>
                          <div className="font-bold text-gray-900 leading-none">{room.size_sqft} <span className="text-xs font-normal text-gray-500">sqft</span></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="my-5 bg-gray-100" />

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-sm tracking-wide uppercase text-gray-400 mb-3">Key Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                          <span className="text-gray-500 flex items-center"><PoundSterling className="w-4 h-4 mr-2" /> Monthly Rent</span>
                          <span className="font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded">£{room.rent.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                          <span className="text-gray-500 flex items-center"><Shield className="w-4 h-4 mr-2" /> Deposit</span>
                          <span className="font-semibold text-gray-900">£{room.deposit.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                          <span className="text-gray-500 flex items-center"><Clock className="w-4 h-4 mr-2" /> Available</span>
                          <span className="font-semibold text-gray-900">{formatAvailableFrom(room.available_from)}</span>
                        </div>
                        {room.nearest_station && (
                          <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                            <span className="text-gray-500 flex items-center"><MapPin className="w-4 h-4 mr-2" /> Nearest Station</span>
                            <span className="font-semibold text-gray-900">{room.nearest_station}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Landlord Contact */}
              <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 transform origin-left transition-transform duration-300 scale-y-0 group-hover:scale-y-100"></div>
                <CardHeader className="bg-white border-b border-gray-50 pb-4">
                  <CardTitle className="text-lg">Landlord Contact</CardTitle>
                </CardHeader>
                <CardContent className="pt-5 bg-white space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center border border-primary-100">
                        <User className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{room.landlord_name}</div>
                        <div className="text-xs font-medium text-gray-500">Property Landlord</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Button 
                      className="w-full shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 bg-primary-600 hover:bg-primary-700 h-11" 
                      onClick={handleEmailLandlord}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email Landlord
                    </Button>
                    
                    {room.landlord_phone && (
                      <Button 
                        variant="outline" 
                        className="w-full hover:bg-gray-50 hover:text-primary-700 transition-colors duration-300 h-11 border-gray-200 shadow-sm"
                        onClick={handleCallLandlord}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Landlord
                      </Button>
                    )}
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full hover:bg-gray-50 hover:text-primary-700 transition-colors duration-300 h-11 border-gray-200 shadow-sm">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Quick Message
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-2xl">
                        <DialogHeader>
                          <DialogTitle>Send Message to {room.landlord_name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div>
                            <Label htmlFor="message" className="text-gray-600">Your Message</Label>
                            <Textarea
                              id="message"
                              placeholder="I am interested in this room and would like to..."
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              rows={5}
                              className="mt-2 resize-none"
                            />
                          </div>
                          <Button onClick={handleSendMessage} className="w-full h-11">
                            <Mail className="w-4 h-4 mr-2" />
                            Send Message
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden bg-white">
                <CardHeader className="border-b border-gray-50 pb-4">
                  <CardTitle className="text-xl">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-5">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-11 border-blue-100 text-blue-700 bg-blue-50/50 hover:bg-blue-100 hover:border-blue-200 hover:text-blue-800 transition-all duration-300 shadow-sm"
                    onClick={() => setShowIntelligenceReport(true)}
                  >
                    <FileText className="w-4.5 h-4.5 mr-3" />
                    View Intelligence Report
                  </Button>
                  
                  <Dialog open={viewingDialogOpen} onOpenChange={setViewingDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start h-11 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-300 border-gray-200 shadow-sm">
                        <Calendar className="w-4.5 h-4.5 mr-3 text-gray-500" />
                        Schedule Viewing
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-2xl">
                      <DialogHeader>
                        <DialogTitle>Schedule Room Viewing</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-5 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="viewing-date">Date <span className="text-red-500">*</span></Label>
                            <Input
                              id="viewing-date"
                              type="date"
                              value={viewingDate}
                              onChange={(e) => setViewingDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="viewing-time">Time <span className="text-red-500">*</span></Label>
                            <Input
                              id="viewing-time"
                              type="time"
                              value={viewingTime}
                              onChange={(e) => setViewingTime(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="viewing-type">Viewing Type <span className="text-red-500">*</span></Label>
                          <Select value={viewingType} onValueChange={(value: any) => setViewingType(value)}>
                            <SelectTrigger id="viewing-type">
                              <SelectValue placeholder="Select viewing type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="in_person">In-Person Viewing</SelectItem>
                              <SelectItem value="virtual">Virtual Tour</SelectItem>
                              <SelectItem value="video_call">Video Call</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="viewing-notes">Additional Notes (Optional)</Label>
                          <Textarea
                            id="viewing-notes"
                            placeholder="Any special requirements or questions..."
                            value={viewingNotes}
                            onChange={(e) => setViewingNotes(e.target.value)}
                            rows={3}
                            className="resize-none"
                          />
                        </div>

                        <Button
                          onClick={handleScheduleViewing}
                          className="w-full h-11"
                          disabled={isSchedulingViewing || !viewingDate || !viewingTime}
                        >
                          {isSchedulingViewing ? (
                            <>
                              <Clock className="w-4 h-4 mr-2 animate-spin" />
                              Scheduling...
                            </>
                          ) : (
                            <>
                              <Calendar className="w-4 h-4 mr-2" />
                              Confirm Schedule
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start h-11 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-300 border-gray-200 shadow-sm">
                        <FileText className="w-4.5 h-4.5 mr-3 text-gray-500" />
                        Apply for Room
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-2xl">
                      <DialogHeader>
                        <DialogTitle>Apply for Room</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="apply-name">Your Name <span className="text-red-500">*</span></Label>
                          <Input
                            id="apply-name"
                            placeholder="Enter your full name"
                            value={applicantName}
                            onChange={(e) => setApplicantName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="apply-email">Email <span className="text-red-500">*</span></Label>
                          <Input
                            id="apply-email"
                            type="email"
                            placeholder="Enter your email"
                            value={applicantEmail}
                            onChange={(e) => setApplicantEmail(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="apply-phone">Phone Number</Label>
                          <Input
                            id="apply-phone"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={applicantPhone}
                            onChange={(e) => setApplicantPhone(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleApplyForRoom} className="w-full h-11 mt-2">
                          <FileText className="w-4 h-4 mr-2" />
                          Submit Application
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {room && room.landlord_id && (
                    <MessageDialog
                      recipientId={room.landlord_id}
                      recipientName={room.landlord_name}
                      recipientType="landlord"
                      roomId={room.id}
                      roomTitle={room.title}
                    >
                      <Button variant="outline" className="w-full justify-start h-11 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-300 border-gray-200 shadow-sm">
                        <MessageCircle className="w-4.5 h-4.5 mr-3 text-gray-500" />
                        Message Landlord
                      </Button>
                    </MessageDialog>
                  )}

                  <Button variant="outline" className="w-full justify-start h-11 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-300 border-gray-200 shadow-sm" onClick={handleShareRoom}>
                    <Share2 className="w-4.5 h-4.5 mr-3 text-gray-500" />
                    Share Room
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {room && (
        <IntelligenceReportModal
          property={getPropertyFormatForReport() as Property}
          entityType="room"
          open={showIntelligenceReport}
          onOpenChange={setShowIntelligenceReport}
        />
      )}
    </Layout>
  );
};

export default RoomDetails;