
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, MapPin, Calendar, CheckCircle } from 'lucide-react';
import { Complaint } from '@/types';
import { ComplaintStatusBadge } from './ComplaintStatusBadge';

interface ComplaintCardProps {
  complaint: Complaint;
}

export const ComplaintCard = ({ complaint }: ComplaintCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDays = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <ComplaintStatusBadge status={complaint.status} />
            <div>
              <CardTitle className="text-lg">
                Ticket #{complaint.ticketNumber}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {complaint.issueType}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Property and Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{complaint.houseNumber}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4 flex-shrink-0" />
            <span>{complaint.tenantEmail}</span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2 text-sm">Description</h4>
          <p className="text-gray-700 text-sm leading-relaxed">{complaint.description}</p>
        </div>

        {/* Timeline and Status */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>Submitted: {formatDate(complaint.createdAt)}</span>
            </div>
            {complaint.status === 'closed' && complaint.closedAt && (
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>Resolved: {formatDate(complaint.closedAt)}</span>
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-500">
            {complaint.status === 'closed' && complaint.resolutionDays 
              ? `Resolved in ${complaint.resolutionDays} days`
              : `${calculateDays(complaint.createdAt)} days ago`
            }
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              complaint.status === 'open' ? 'bg-red-500' : 'bg-gray-300'
            }`}></div>
            <span className="text-xs text-gray-500">Open</span>
          </div>
          <div className="flex-1 h-px bg-gray-200"></div>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              complaint.status === 'in_progress' ? 'bg-yellow-500' : 
              complaint.status === 'closed' ? 'bg-gray-300' : 'bg-gray-200'
            }`}></div>
            <span className="text-xs text-gray-500">In Progress</span>
          </div>
          <div className="flex-1 h-px bg-gray-200"></div>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              complaint.status === 'closed' ? 'bg-green-500' : 'bg-gray-200'
            }`}></div>
            <span className="text-xs text-gray-500">Resolved</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
