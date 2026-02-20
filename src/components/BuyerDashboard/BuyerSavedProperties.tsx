// src/components/BuyerDashboard/BuyerSavedProperties.tsx
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { buyerApi } from '@/services/buyerApi';

export const BuyerSavedProperties = () => {
  const navigate = useNavigate();
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedProperties = async () => {
      try {
        setLoading(true);
        const response = await buyerApi.getSavedProperties({ page: 1, per_page: 100 });
        if (response.success && response.data) {
          setSavedProperties(response.data.properties || []);
        }
      } catch (error) {
        console.error('Error fetching saved properties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedProperties();
  }, []);

  const handleUnsave = async (propertyId: number) => {
    try {
      await buyerApi.unsaveProperty(propertyId);
      setSavedProperties(prev => prev.filter(p => p.property_id !== propertyId));
    } catch (error) {
      console.error('Error unsaving property:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-2">Saved Properties</h2>
        <p className="text-sm text-muted-foreground">Properties you've saved for later</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : savedProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProperties.map((saved: any) => (
            <Card key={saved.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {saved.property?.primary_image_url && (
                <img
                  src={saved.property.primary_image_url}
                  alt={saved.property.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{saved.property?.title || 'Property'}</h3>
                  <button
                    onClick={() => handleUnsave(saved.property_id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Heart className="fill-current" size={20} />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{saved.property?.address}</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mb-3">
                  £{saved.property?.price?.toLocaleString() || 'N/A'}
                </p>
                <div className="flex gap-3 text-sm text-muted-foreground mb-3">
                  <span>{saved.property?.bedrooms} beds</span>
                  <span>{saved.property?.bathrooms} baths</span>
                  <span>{saved.property?.property_type}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/property/${saved.property_id}`)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Saved Properties</h3>
          <p className="text-muted-foreground mb-4">You haven't saved any properties yet</p>
          <Button onClick={() => navigate('/properties')} className="bg-emerald-600 hover:bg-emerald-700">
            Browse Properties
          </Button>
        </Card>
      )}
    </div>
  );
};