
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Star, X, MapPin, Calendar, User } from 'lucide-react';
import { Complaint } from '@/types';

interface ComplaintResolutionNotificationProps {
  complaint: Complaint;
  agentName: string;
  agentImage?: string;
  onClose: () => void;
  onSubmitReview: (rating: number, review: string) => void;
}

export const ComplaintResolutionNotification = ({
  complaint,
  agentName,
  agentImage,
  onClose,
  onSubmitReview
}: ComplaintResolutionNotificationProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    
    // TODO: Replace with actual API call to submit review
    // await submitAgentReview({
    //   agentId: complaint.agentId,
    //   complaintId: complaint.id,
    //   rating,
    //   review,
    //   tenantId: currentUser.id
    // });
    
    // Simulate API call
    setTimeout(() => {
      onSubmitReview(rating, review);
      setIsSubmitting(false);
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-green-50">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">
                  Complaint Resolved! 🎉
                </h2>
                <p className="text-gray-700 mt-1">Your maintenance request has been completed</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Complaint Details */}
        <div className="p-6 border-b border-white/20">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  RESOLVED
                </Badge>
                <span className="font-semibold text-gray-800">
                  Ticket #{complaint.ticketNumber}
                </span>
              </div>
            </div>

            <h3 className="font-bold text-lg text-gray-900 mb-2">{complaint.issueType}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{complaint.houseNumber}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Submitted: {formatDate(complaint.createdAt)}</span>
              </div>
              {complaint.closedAt && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Resolved: {formatDate(complaint.closedAt)}</span>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-700 text-sm">{complaint.description}</p>
            </div>
          </div>
        </div>

        {/* Agent Rating Section */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              {agentImage && (
                <img 
                  src={agentImage} 
                  alt={agentName}
                  className="w-16 h-16 rounded-full object-cover shadow-lg"
                />
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-800">Rate Your Experience</h3>
                <p className="text-gray-600 flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  with {agentName}
                </p>
              </div>
            </div>

            {/* Star Rating */}
            <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Review Text */}
            <div className="space-y-4">
              <Textarea
                placeholder="Share your experience with the agent and the resolution process... (optional)"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="min-h-[100px] bg-white/50 backdrop-blur-sm border-white/30"
                rows={4}
              />

              <div className="flex space-x-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20"
                >
                  Skip for Now
                </Button>
                <Button
                  onClick={handleSubmitReview}
                  disabled={rating === 0 || isSubmitting}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white shadow-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4" />
                      <span>Submit Review</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
