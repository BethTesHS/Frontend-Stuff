
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CheckCircle, FileText } from 'lucide-react';

interface ComplaintStatusBadgeProps {
  status: string;
}

export const ComplaintStatusBadge = ({ status }: ComplaintStatusBadgeProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="w-5 h-5" />;
      case 'in_progress':
        return <Clock className="w-5 h-5" />;
      case 'closed':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`p-2 rounded-lg ${
        status === 'open' ? 'bg-red-50' : 
        status === 'in_progress' ? 'bg-yellow-50' : 'bg-green-50'
      }`}>
        {getStatusIcon(status)}
      </div>
      <Badge className={`${getStatusColor(status)} border`}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    </div>
  );
};
