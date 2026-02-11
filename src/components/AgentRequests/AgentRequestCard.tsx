
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building, 
  MapPin, 
  DollarSign,
  User,
  Phone,
  Mail,
  Check,
  X,
  Bed,
  Bath
} from 'lucide-react';

interface AgentRequest {
  id: number;
  propertyTitle: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  price: string;
  location: string;
  ownerName: string;
  requestDate: string;
  description: string;
}

interface AgentRequestCardProps {
  request: AgentRequest;
  onAccept: (requestId: number, agentDetails: { name: string; email: string; phone: string; message?: string }) => void;
  onReject: (requestId: number) => void;
}

const AgentRequestCard = ({ request, onAccept, onReject }: AgentRequestCardProps) => {
  const [showAcceptForm, setShowAcceptForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agentDetails, setAgentDetails] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentDetails.name || !agentDetails.email || !agentDetails.phone) {
      return;
    }

    setLoading(true);
    try {
      await onAccept(request.id, agentDetails);
      setShowAcceptForm(false);
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await onReject(request.id);
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-800">Property Management Request</h4>
              <p className="text-sm text-gray-600">From {request.ownerName}</p>
            </div>
          </div>
          <span className="text-xs text-gray-500 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            {request.requestDate}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Property Details */}
        <div className="mb-6">
          <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Building className="w-4 h-4 mr-2 text-emerald-600" />
            Property Details
          </h5>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <strong className="text-gray-700 mr-2">Title:</strong>
                <span className="text-gray-600">{request.propertyTitle}</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 text-emerald-600 mr-1" />
                <strong className="text-gray-700 mr-2">Price:</strong>
                <span className="text-gray-600">£{request.price}</span>
              </div>
              <div className="flex items-center">
                <strong className="text-gray-700 mr-2">Type:</strong>
                <span className="text-gray-600">{request.propertyType}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-emerald-600 mr-1" />
                <strong className="text-gray-700 mr-2">Location:</strong>
                <span className="text-gray-600">{request.location}</span>
              </div>
              <div className="flex items-center">
                <Bed className="w-4 h-4 text-emerald-600 mr-1" />
                <strong className="text-gray-700 mr-2">Bedrooms:</strong>
                <span className="text-gray-600">{request.bedrooms}</span>
              </div>
              <div className="flex items-center">
                <Bath className="w-4 h-4 text-emerald-600 mr-1" />
                <strong className="text-gray-700 mr-2">Bathrooms:</strong>
                <span className="text-gray-600">{request.bathrooms}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {request.description && (
          <div className="mb-6">
            <h5 className="font-semibold text-gray-800 mb-2">Additional Notes</h5>
            <p className="text-gray-600 text-sm bg-white/10 backdrop-blur-sm rounded-xl p-3">
              {request.description}
            </p>
          </div>
        )}

        {/* Accept Form */}
        {showAcceptForm ? (
          <form onSubmit={handleAccept} className="space-y-4 mb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <h5 className="font-semibold text-gray-800 mb-4 flex items-center">
                <User className="w-4 h-4 mr-2 text-emerald-600" />
                Your Contact Details
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`name-${request.id}`} className="text-gray-700 font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id={`name-${request.id}`}
                    value={agentDetails.name}
                    onChange={(e) => setAgentDetails({ ...agentDetails, name: e.target.value })}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`email-${request.id}`} className="text-gray-700 font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id={`email-${request.id}`}
                    type="email"
                    value={agentDetails.email}
                    onChange={(e) => setAgentDetails({ ...agentDetails, email: e.target.value })}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 mt-1"
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor={`phone-${request.id}`} className="text-gray-700 font-medium">
                  Phone Number *
                </Label>
                <Input
                  id={`phone-${request.id}`}
                  type="tel"
                  value={agentDetails.phone}
                  onChange={(e) => setAgentDetails({ ...agentDetails, phone: e.target.value })}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 mt-1"
                  required
                />
              </div>
              <div className="mt-4">
                <Label htmlFor={`message-${request.id}`} className="text-gray-700 font-medium">
                  Message to Owner (Optional)
                </Label>
                <Textarea
                  id={`message-${request.id}`}
                  value={agentDetails.message}
                  onChange={(e) => setAgentDetails({ ...agentDetails, message: e.target.value })}
                  placeholder="Introduce yourself and explain how you'll help..."
                  className="bg-white/10 backdrop-blur-sm border border-white/20 mt-1"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading || !agentDetails.name || !agentDetails.email || !agentDetails.phone}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Check className="w-4 h-4 mr-2" />
                {loading ? 'Processing...' : 'Confirm & Accept'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAcceptForm(false)}
                className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex gap-3">
            <Button
              onClick={() => setShowAcceptForm(true)}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Check className="w-4 h-4 mr-2" />
              Accept Request
            </Button>
            <Button
              onClick={handleReject}
              disabled={loading}
              variant="outline"
              className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            >
              <X className="w-4 h-4 mr-2" />
              Decline
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentRequestCard;
