import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bed, 
  Bath, 
  MapPin, 
  DollarSign, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Calendar,
  Users,
  Home
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { spareRoomApi } from "@/services/spareRoomApi";

interface SpareRoom {
  id: number;
  title: string;
  description: string;
  rent: number;
  deposit: number;
  available_from: string;
  property_address: string;
  room_type: string;
  size_sqft?: number;
  furnished: boolean;
  bills_included: boolean;
  internet_included: boolean;
  parking_available: boolean;
  garden_access: boolean;
  preferences?: {
    gender?: string;
    age_range?: string;
    profession: string[];
    smoking: boolean;
    pets: boolean;
  };
  house_rules: string[];
  current_housemates: number;
  total_housemates: number;
  nearest_station?: string;
  transport_links: string[];
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  status?: 'active' | 'inactive' | 'rented';
  created_at: string;
  updated_at: string;
  images?: string[];
}

interface SpareRoomListingsProps {
  userRole: 'agent' | 'owner' | 'tenant';
}

export function SpareRoomListings({ userRole }: SpareRoomListingsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [spareRooms, setSpareRooms] = useState<SpareRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpareRooms();
  }, []);

  const fetchSpareRooms = async () => {
    try {
      setLoading(true);
      const response = await spareRoomApi.getSpareRooms(user?.id);
      setSpareRooms(response || []);
    } catch (error) {
      console.error("Error fetching spare rooms:", error);
      toast.error("Failed to load spare room listings");
      setSpareRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/post-spare-room?edit=${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this spare room listing? This action cannot be undone.")) {
      return;
    }

    try {
      await spareRoomApi.deleteSpareRoom(id);
      setSpareRooms(spareRooms.filter(room => room.id !== id));
      toast.success("Spare room listing deleted successfully");
    } catch (error) {
      console.error("Error deleting spare room:", error);
      toast.error("Failed to delete spare room listing");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rented': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleTitle = () => {
    switch (userRole) {
      case 'agent': return 'Agent Spare Room Listings';
      case 'owner': return 'My Spare Room Listings';
      case 'tenant': return 'My Spare Room Listing';
      default: return 'Spare Room Listings';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{getRoleTitle()}</h2>
          <p className="text-muted-foreground">
            Manage your spare room listings and bookings
          </p>
        </div>
        <Button 
          onClick={() => navigate('/post-spare-room')}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Post New Room
        </Button>
      </div>

      {spareRooms.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Spare Rooms Listed</h3>
            <p className="text-muted-foreground mb-4">
              You haven't posted any spare room listings yet.
            </p>
            <Button 
              onClick={() => navigate('/post-spare-room')}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post Your First Room
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {spareRooms.map((room) => (
            <Card key={room.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{room.room_type}</CardTitle>
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(room.status)}
                      >
                        {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{room.property_address}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      £{room.rent}
                    </div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">{room.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>£{room.deposit} deposit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Available {new Date(room.available_from).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span>{room.furnished ? 'Furnished' : 'Unfurnished'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{room.bills_included ? 'Bills included' : 'Bills excluded'}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Posted on {new Date(room.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(room.id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(room.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}