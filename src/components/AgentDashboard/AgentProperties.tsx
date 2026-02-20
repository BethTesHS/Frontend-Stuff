// src/components/AgentDashboard/AgentProperties.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, MapPin, Bed, Bath, DollarSign, Edit, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PropertyToggle } from '@/components/Properties/PropertyToggle';
import { propertyApi } from '@/services/api';
import { toast } from 'sonner';

export const AgentProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await propertyApi.getMyProperties({ page: 1, per_page: 10 });
        if (response.success && response.data) {
          setProperties(response.data.properties);
        }
      } catch (error: any) {
        console.error('Error fetching properties:', error);
        toast.error("Failed to load properties");
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const handleStatusChange = (propertyId: string, newStatus: string) => {
    setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, status: newStatus } : p));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">My Properties</h2>
          <p className="text-sm text-muted-foreground">Manage your property listings</p>
        </div>
        <Button onClick={() => navigate('/list-property')} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="animate-pulse">
                <div className="h-48 bg-muted"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property: any) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 cursor-pointer" onClick={() => navigate(`/property/${property.id}`)}>
                {property.images && property.images.length > 0 ? (
                  <img
                    src={typeof property.images[0] === 'string' ? property.images[0] : property.images[0]?.image_url || property.primary_image_url || '/placeholder.svg'}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Building className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                  {property.listing_type}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-2 truncate cursor-pointer" onClick={() => navigate(`/property/${property.id}`)}>{property.title}</h3>
                <p className="text-sm text-muted-foreground mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {property.location}
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span className="flex items-center"><Bed className="w-4 h-4 mr-1" />{property.bedrooms} beds</span>
                  <span className="flex items-center"><Bath className="w-4 h-4 mr-1" />{property.bathrooms} baths</span>
                </div>
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary flex items-center">
                      <DollarSign className="w-4 h-4" />{property.price?.toLocaleString()}
                    </span>
                    <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>{property.status}</Badge>
                  </div>
                  <PropertyToggle
                    propertyId={property.id}
                    currentStatus={property.status}
                    onStatusChange={(newStatus) => handleStatusChange(property.id, newStatus)}
                  />
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                  <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); navigate(`/edit-property/${property.id}`); }}>
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to delete "${property.title}"?`)) toast.success(`${property.title} has been deleted.`);
                  }}>
                    <AlertTriangle className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Properties Listed</h3>
          <p className="text-muted-foreground mb-4">Start by adding your first property listing</p>
          <Button onClick={() => navigate('/list-property')} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> Add Property
          </Button>
        </Card>
      )}
    </div>
  );
};