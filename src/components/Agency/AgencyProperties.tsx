import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Plus,
  Search,
  MapPin,
  Bed,
  Bath,
  Car,
  Eye,
  Heart,
  Edit,
  MoreVertical,
  Building2,
  TrendingUp,
  Calendar,
  Star,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { agencyPropertiesApi, Property as ApiProperty } from '@/services/agencyApi';

interface Property extends ApiProperty {
  propertyType?: string;
  views?: number;
  likes?: number;
  dateAdded?: Date;
  rating?: number;
  reviews?: number;
  agent?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export function AgencyProperties() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);

  // Fetch properties from backend
  useEffect(() => {
    fetchProperties();
  }, [filterType, filterStatus]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: 100,
      };

      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }

      if (filterType !== 'all') {
        params.type = filterType;
      }

      const response = await agencyPropertiesApi.getAll(params);
      setProperties(response.properties || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch properties');
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const formatPrice = (price: number, type: 'buy' | 'rent') => {
    if (type === 'buy') {
      return `£${(price / 1000000).toFixed(1)}M`;
    } else {
      return `£${price.toLocaleString()}/month`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'sold': return 'bg-blue-500';
      case 'rented': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'pending': return 'secondary';
      case 'sold': return 'secondary';
      case 'rented': return 'secondary';
      default: return 'secondary';
    }
  };

  const stats = {
    total: properties.length,
    active: properties.filter(p => p.status === 'available').length,
    pending: properties.filter(p => p.status === 'pending').length,
    sold: properties.filter(p => p.status === 'sold' || p.status === 'rented').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Properties</h1>
          <p className="text-muted-foreground">Manage your property listings</p>
        </div>
        
        <Button onClick={() => navigate('/list-property')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Properties</p>
                <p className="text-xl font-semibold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Listings</p>
                <p className="text-xl font-semibold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-semibold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Sold/Rented</p>
                <p className="text-xl font-semibold">{stats.sold}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="buy">For Sale</SelectItem>
            <SelectItem value="rent">For Rent</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="rented">Rented</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img 
                src={property.images[0] || '/placeholder-property.jpg'} 
                alt={property.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge className={getStatusColor(property.status)} variant={getStatusVariant(property.status)}>
                  {property.status}
                </Badge>
                <Badge variant="outline" className="bg-white/90">
                  {property.type === 'buy' ? 'For Sale' : 'For Rent'}
                </Badge>
              </div>
              <div className="absolute top-3 right-3">
                <Button variant="ghost" size="sm" className="bg-white/90">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg leading-tight mb-1">
                    {property.title}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.address}
                  </div>
                </div>

                <div className="text-xl font-bold text-primary">
                  {formatPrice(property.price, property.type)}
                </div>

                {/* Property Details */}
                {property.property_type !== 'commercial' && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {property.bedrooms && property.bedrooms > 0 && (
                      <div className="flex items-center">
                        <Bed className="w-4 h-4 mr-1" />
                        {property.bedrooms}
                      </div>
                    )}
                    {property.bathrooms && property.bathrooms > 0 && (
                      <div className="flex items-center">
                        <Bath className="w-4 h-4 mr-1" />
                        {property.bathrooms}
                      </div>
                    )}
                    {property.parking && property.parking > 0 && (
                      <div className="flex items-center">
                        <Car className="w-4 h-4 mr-1" />
                        {property.parking}
                      </div>
                    )}
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  {property.sqft.toLocaleString()} sqft
                </div>

                {/* Agent Info */}
                <div className="flex items-center justify-between pt-2 border-t">
                  {property.agent && (
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={property.agent.avatar} />
                        <AvatarFallback className="text-xs">
                          {property.agent.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {property.agent.name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 text-sm text-muted-foreground ml-auto">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{property.views || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{property.likes || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                ? 'Try adjusting your filters.' 
                : 'Get started by adding your first property.'
              }
            </p>
            {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
              <Button onClick={() => navigate('/list-property')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}