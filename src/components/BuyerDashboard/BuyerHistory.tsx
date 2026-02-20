// src/components/BuyerDashboard/BuyerHistory.tsx
import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { buyerApi } from '@/services/buyerApi';

export const BuyerHistory = () => {
  const navigate = useNavigate();
  const [viewings, setViewings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await buyerApi.getViewings({ page: 1, per_page: 100 });
        if (response.success && response.data) {
          setViewings(response.data.viewings || []);
        }
      } catch (error) {
        console.error('Error fetching viewings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-2">Viewing History</h2>
        <p className="text-sm text-muted-foreground">All properties you've viewed or requested to view</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : viewings.length > 0 ? (
        <div className="space-y-4">
          {viewings.map((viewing: any) => (
            <Card key={viewing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{viewing.property?.title || 'Property Viewing'}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{viewing.property?.address || 'Location TBD'}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span><span className="font-medium">Date:</span> {new Date(viewing.viewing_date).toLocaleDateString()}</span>
                      <span><span className="font-medium">Time:</span> {viewing.viewing_time}</span>
                      <span><span className="font-medium">Status:</span> {viewing.status}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/property/${viewing.property_id}`)}
                  >
                    View Property
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Eye className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Viewing History</h3>
          <p className="text-muted-foreground mb-4">You haven't requested to view any properties yet</p>
          <Button onClick={() => navigate('/properties')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Browse Properties
          </Button>
        </Card>
      )}
    </div>
  );
};