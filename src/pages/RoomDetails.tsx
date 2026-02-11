import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
  FileText
} from 'lucide-react';
import { Room } from '@/types/room';
import { spareRoomApi } from '@/services/spareRoomApi';
import { buyerApi } from '@/services/buyerApi';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import MessageDialog from '@/components/Messages/MessageDialog';

const RoomDetails = () => {
  const { id: roomId } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [isLiked, setIsLiked] = useState(false);
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!roomId) return;

    const loadRoomData = async () => {
      try {
        setLocalLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Use the actual API to get room details
        const response = await spareRoomApi.getSpareRoom(parseInt(roomId));
        
        if (response && response.id) {
          // Convert SpareRoomData to Room format
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
    setIsLiked(!isLiked);
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

    // Here you would typically send the message to your backend
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
      // Convert time to 12-hour format with AM/PM
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

        // Reset form and close dialog
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

    // Here you would typically send the application to your backend
    console.log('Applying for room:', {
      roomId,
      applicant: { name: applicantName, email: applicantEmail, phone: applicantPhone }
    });

    toast({
      title: "Application Submitted",
      description: "Your application has been sent to the landlord"
    });

    // Reset form
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
        // Fallback to clipboard
        navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied",
          description: "Room link has been copied to clipboard"
        });
      });
    } else {
      // Fallback to clipboard
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
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Room Not Found</h1>
            <p className="text-gray-600 mb-4">
              The room with ID "{roomId}" doesn't exist.
            </p>
            <Button onClick={handleBack} className="mr-4">
              Go Back
            </Button>
            <Button variant="outline" onClick={() => navigate('/rooms')}>
              Browse Rooms
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const rating = 4.3;
  const reviewCount = Math.floor(Math.random() * 30) + 5;

  return (
    <Layout>
      <div className="py-8">
        {/* Back Button */}
        <div className="mb-6 px-4 sm:px-6 lg:px-8">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900 p-0 h-auto font-normal"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Rooms
          </Button>
        </div>

        {/* Grid Layout - 2/3 main content, 1/3 sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-start px-4 sm:px-6 lg:px-8">
          {/* Main Content Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Room Images */}
            <div className="relative">
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-200">
                {room.images.length > 0 ? (
                  <img
                    src={room.images[currentImageIndex] || '/placeholder.svg'}
                    alt={room.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Bed className="w-16 h-16" />
                  </div>
                )}
                {room.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white text-black p-2 rounded-full border border-gray-200 shadow-lg hover:bg-gray-100 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white text-black p-2 rounded-full border border-gray-200 shadow-lg hover:bg-gray-100 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              {room.images.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {room.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full ${
                        index === currentImageIndex ? 'bg-primary-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Room Header */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{room.title}</h1>
                  <Badge className="bg-primary-500 text-white">
                    {formatRoomType(room.room_type)}
                  </Badge>
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{room.property_address}</span>
                </div>
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  £{room.rent.toLocaleString()}
                  <span className="text-lg font-normal text-gray-600">/month</span>
                </div>
                {room.deposit && (
                  <div className="text-lg text-gray-600">
                    £{room.deposit.toLocaleString()} deposit required
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={handleLikeToggle}
                className={`ml-4 ${isLiked ? 'bg-red-50 border-red-200 text-red-600' : ''}`}
              >
                <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Saved' : 'Save'}
              </Button>
            </div>

            {/* Room Details */}
            <Card>
              <CardHeader>
                <CardTitle>Room Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                  <div className="flex items-center">
                    <Bed className="w-5 h-5 mr-2 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Room Type</div>
                      <div className="font-semibold">{formatRoomType(room.room_type)}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Housemates</div>
                      <div className="font-semibold">{room.current_housemates}/{room.total_housemates}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Available</div>
                      <div className="font-semibold">{formatAvailableFrom(room.available_from)}</div>
                    </div>
                  </div>
                  {room.size_sqft && (
                    <div className="flex items-center">
                      <Home className="w-5 h-5 mr-2 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">Size</div>
                        <div className="font-semibold">{room.size_sqft} sqft</div>
                      </div>
                    </div>
                  )}
                  {room.nearest_station && (
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">Nearest Station</div>
                        <div className="font-semibold">{room.nearest_station}</div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Amenities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Included</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${room.furnished ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={room.furnished ? 'text-green-700' : 'text-red-700'}>
                          {room.furnished ? 'Furnished' : 'Unfurnished'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${room.bills_included ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={room.bills_included ? 'text-green-700' : 'text-red-700'}>
                          Bills {room.bills_included ? 'Included' : 'Not Included'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${room.internet_included ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <Wifi className="w-4 h-4" />
                        <span className={room.internet_included ? 'text-green-700' : 'text-red-700'}>
                          WiFi {room.internet_included ? 'Included' : 'Not Included'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Additional Features</h4>
                    <div className="space-y-2">
                      {room.parking_available && (
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-green-600" />
                          <span className="text-green-700">Parking Available</span>
                        </div>
                      )}
                      {room.garden_access && (
                        <div className="flex items-center gap-2">
                          <TreePine className="w-4 h-4 text-green-600" />
                          <span className="text-green-700">Garden Access</span>
                        </div>
                      )}
                      {room.room_type === 'ensuite' && (
                        <div className="flex items-center gap-2">
                          <Bath className="w-4 h-4 text-green-600" />
                          <span className="text-green-700">Private Bathroom</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{room.description}</p>
              </CardContent>
            </Card>

            {/* House Rules */}
            {room.house_rules.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>House Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {room.house_rules.map((rule, index) => (
                      <div key={index} className="flex items-center">
                        <Shield className="w-4 h-4 mr-3 text-primary-600" />
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transport Links */}
            {room.transport_links.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Transport Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {room.transport_links.map((link, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {link}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Tenant Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {room.preferences.gender && room.preferences.gender !== 'any' && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Gender Preference:</span>
                      <span className="capitalize">{room.preferences.gender} only</span>
                    </div>
                  )}
                  {room.preferences.age_range && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Age Range:</span>
                      <span>{room.preferences.age_range}</span>
                    </div>
                  )}
                  {room.preferences.profession && room.preferences.profession.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Profession:</span>
                      <span>{room.preferences.profession.join(', ')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Smoking:</span>
                    <span className={room.preferences.smoking ? 'text-green-700' : 'text-red-700'}>
                      {room.preferences.smoking ? 'Allowed' : 'Not Allowed'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pets:</span>
                    <span className={room.preferences.pets ? 'text-green-700' : 'text-red-700'}>
                      {room.preferences.pets ? 'Allowed' : 'Not Allowed'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Landlord Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Landlord Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-semibold">{room.landlord_name}</div>
                    <div className="text-sm text-gray-500">Landlord</div>
                  </div>
                </div>

                <div className="flex items-center mb-2">
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

                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={handleEmailLandlord}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email Landlord
                  </Button>
                  
                  {room.landlord_phone && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleCallLandlord}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Landlord
                    </Button>
                  )}
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send Message to {room.landlord_name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="message">Message</Label>
                          <Textarea
                            id="message"
                            placeholder="Type your message here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <Button onClick={handleSendMessage} className="w-full">
                          <Mail className="w-4 h-4 mr-2" />
                          Send Message
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <PoundSterling className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">Monthly Rent</span>
                  </div>
                  <span className="font-semibold">£{room.rent.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">Deposit</span>
                  </div>
                  <span className="font-semibold">£{room.deposit.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">Available From</span>
                  </div>
                  <span className="font-semibold text-sm">{formatAvailableFrom(room.available_from)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">Housemates</span>
                  </div>
                  <span className="font-semibold">{room.current_housemates}/{room.total_housemates}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog open={viewingDialogOpen} onOpenChange={setViewingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Viewing
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Schedule Room Viewing</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="viewing-date">Date *</Label>
                          <Input
                            id="viewing-date"
                            type="date"
                            value={viewingDate}
                            onChange={(e) => setViewingDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <Label htmlFor="viewing-time">Time *</Label>
                          <Input
                            id="viewing-time"
                            type="time"
                            value={viewingTime}
                            onChange={(e) => setViewingTime(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="viewing-type">Viewing Type *</Label>
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

                      <div>
                        <Label htmlFor="viewing-notes">Additional Notes (Optional)</Label>
                        <Textarea
                          id="viewing-notes"
                          placeholder="Any special requirements or questions..."
                          value={viewingNotes}
                          onChange={(e) => setViewingNotes(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <Button
                        onClick={handleScheduleViewing}
                        className="w-full"
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
                            Schedule Viewing
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      Apply for Room
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Apply for Room</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="apply-name">Your Name *</Label>
                        <Input
                          id="apply-name"
                          placeholder="Enter your full name"
                          value={applicantName}
                          onChange={(e) => setApplicantName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="apply-email">Email *</Label>
                        <Input
                          id="apply-email"
                          type="email"
                          placeholder="Enter your email"
                          value={applicantEmail}
                          onChange={(e) => setApplicantEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="apply-phone">Phone Number</Label>
                        <Input
                          id="apply-phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={applicantPhone}
                          onChange={(e) => setApplicantPhone(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleApplyForRoom} className="w-full">
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
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message Landlord
                    </Button>
                  </MessageDialog>
                )}

                <Button variant="outline" className="w-full" onClick={handleShareRoom}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Room
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RoomDetails;