import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, MapPin, Bed, Bath, DollarSign, Edit, AlertTriangle, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PropertyToggle } from '@/components/Properties/PropertyToggle';
import { propertyApi } from '@/services/api';
import { toast } from 'sonner';

export const PropertyManagementList = () => {
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="overflow-hidden animate-pulse">
            <div className="h-48 bg-muted"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed border-2 bg-white/50 dark:bg-slate-900/50 border-gray-200 dark:border-slate-800 shadow-none">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Building className="w-10 h-10 text-blue-600 dark:text-blue-400 opacity-80" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-foreground">
          No Properties Listed
        </h3>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          You haven't added any properties to your portfolio yet. Start by
          listing your first property.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative h-48 cursor-pointer" onClick={() => navigate(`/property/${property.id}`)}>
            <img
              src={property.images?.[0]?.image_url || property.primary_image_url || '/placeholder.svg'}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <Badge className="absolute top-2 right-2">{property.listing_type}</Badge>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold truncate mb-1">{property.title}</h3>
            <p className="text-sm text-muted-foreground flex items-center mb-3">
              <MapPin className="w-3 h-3 mr-1" /> {property.location}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
              <span className="flex items-center"><Bed className="w-3 h-3 mr-1" />{property.bedrooms}</span>
              <span className="flex items-center"><Bath className="w-3 h-3 mr-1" />{property.bathrooms}</span>
              <span className="font-bold text-primary text-sm ml-auto">${property.price?.toLocaleString()}</span>
            </div>

            <PropertyToggle
              propertyId={property.id}
              currentStatus={property.status}
              onStatusChange={(newStatus) => handleStatusChange(property.id, newStatus)}
            />

            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/edit-property/${property.id}`)}>
                <Edit className="w-4 h-4 mr-1" /> Edit
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-red-500 hover:bg-red-50" onClick={() => {/* Delete logic */}}>
                <AlertTriangle className="w-4 h-4 mr-1" /> Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};