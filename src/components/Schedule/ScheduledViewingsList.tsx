
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { buyerApi, BuyerViewing } from '@/services/buyerApi';
import { toast } from 'sonner';

interface ScheduledViewingsListProps {
  onUpdateStatus?: (viewingId: number, status: string) => void;
  refreshTrigger?: number;
}

const ScheduledViewingsList = ({ onUpdateStatus, refreshTrigger }: ScheduledViewingsListProps) => {
  const [viewings, setViewings] = useState<BuyerViewing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchViewings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await buyerApi.getViewings({ per_page: 50 });
      if (response.success && response.data?.viewings) {
        setViewings(response.data.viewings);
      } else {
        setError('Failed to load viewings');
      }
    } catch (err: any) {
      console.error('Error fetching viewings:', err);
      setError(err.message || 'Failed to load viewings');
      toast.error('Failed to load viewings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchViewings();
  }, [refreshTrigger]);

  const handleCancelViewing = async (viewingId: number) => {
    try {
      const response = await buyerApi.cancelViewing(viewingId);
      if (response.success) {
        toast.success('Viewing cancelled successfully');
        fetchViewings();
        if (onUpdateStatus) {
          onUpdateStatus(viewingId, 'cancelled');
        }
      } else {
        toast.error(response.error || 'Failed to cancel viewing');
      }
    } catch (err: any) {
      console.error('Error cancelling viewing:', err);
      toast.error(err.message || 'Failed to cancel viewing');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const upcomingViewings = viewings.filter(v => v.status === 'pending' || v.status === 'confirmed');
  const pastViewings = viewings.filter(v => v.status === 'completed' || v.status === 'cancelled');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600">Loading viewings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Viewings */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
              <Calendar className="w-6 h-6 mr-3 text-blue-500" />
              Upcoming Viewings
              {upcomingViewings.length > 0 && (
                <Badge className="ml-3 bg-blue-100 text-blue-700 hover:bg-blue-200">
                  {upcomingViewings.length}
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchViewings}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {upcomingViewings.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No upcoming viewings scheduled</p>
              <p className="text-sm text-gray-400 mt-1">New viewing requests will appear here</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="divide-y divide-gray-100">
                {upcomingViewings.map((viewing) => (
                  <div key={viewing.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between space-x-4">
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {viewing.property?.title || 'Property Viewing'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Scheduled on {new Date(viewing.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {getStatusBadge(viewing.status)}
                        </div>

                        {/* Property Info */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex items-start space-x-3">
                            <MapPin className="w-5 h-5 text-emerald-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {viewing.property?.address || 'Address not available'}
                              </p>
                              {viewing.property?.city && viewing.property?.postcode && (
                                <p className="text-sm text-gray-500">
                                  {viewing.property.city}, {viewing.property.postcode}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Viewing Details */}
                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 text-blue-500 mr-2" />
                              <span className="text-sm font-medium text-gray-700">
                                {viewing.viewing_date}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-blue-500 mr-2" />
                              <span className="text-sm font-medium text-gray-700">
                                {viewing.viewing_time}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {viewing.viewing_type === 'in_person' ? 'In-Person' :
                               viewing.viewing_type === 'virtual' ? 'Virtual Tour' : 'Video Call'}
                            </Badge>
                          </div>
                        </div>

                        {/* Agent Contact Info */}
                        {viewing.agent_id && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <p className="text-xs text-gray-500 mb-2">Agent Contact</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {viewing.property && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="w-4 h-4 mr-2 text-green-500" />
                                  Contact via property listing
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {viewing.notes && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <div className="flex items-start space-x-2">
                              <AlertCircle className="w-4 h-4 text-gray-500 mt-0.5" />
                              <p className="text-sm text-gray-600">{viewing.notes}</p>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {(viewing.status === 'pending' || viewing.status === 'confirmed') && (
                          <div className="flex justify-end space-x-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelViewing(viewing.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancel Viewing
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Past Viewings */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <Clock className="w-6 h-6 mr-3 text-gray-500" />
            Past Viewings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pastViewings.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No past viewings</p>
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="divide-y divide-gray-100">
                {pastViewings.map((viewing) => (
                  <div key={viewing.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {viewing.property?.title || 'Property Viewing'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {viewing.property?.address || 'Address not available'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {viewing.viewing_date} at {viewing.viewing_time}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(viewing.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduledViewingsList;
