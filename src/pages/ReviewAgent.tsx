
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ReviewAgent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const agentId = searchParams.get('agentId');
  const complaintId = searchParams.get('complaintId');
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock agent data - in a real app, this would be fetched based on agentId
  const agentData = {
    name: "Sarah Johnson",
    company: "Premium Properties Ltd",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&face=true"
  };

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating: number) => {
    setHoveredRating(starRating);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (reviewText.trim().length < 10) {
      toast({
        title: "Review Too Short",
        description: "Please provide a review with at least 10 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback! Your review has been submitted successfully.",
      });
      setIsSubmitting(false);
      navigate('/tenant-dashboard');
    }, 1500);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/tenant-dashboard')}
            className="mb-6 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card className="bg-white shadow-lg">
            <CardHeader className="text-center border-b">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Leave a Review
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Share your experience with your property agent
              </p>
            </CardHeader>
            
            <CardContent className="p-8">
              {/* Agent Info */}
              <div className="flex items-center space-x-4 mb-8 p-4 bg-gray-50 rounded-lg">
                <img 
                  src={agentData.image} 
                  alt={agentData.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{agentData.name}</h3>
                  <p className="text-gray-600">{agentData.company}</p>
                </div>
              </div>

              {/* Star Rating */}
              <div className="space-y-2 mb-6">
                <Label className="text-lg font-medium">Rate your experience</Label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => handleStarHover(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          star <= (hoveredRating || rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-gray-600">
                    You rated: {rating} star{rating !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Review Text */}
              <div className="space-y-2 mb-8">
                <Label htmlFor="review" className="text-lg font-medium">
                  Write your review
                </Label>
                <Textarea
                  id="review"
                  placeholder="Share details about your experience with this agent. How was their communication, professionalism, and service quality?"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                <p className="text-sm text-gray-500">
                  {reviewText.length}/500 characters
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <Button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || rating === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/tenant-dashboard')}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ReviewAgent;
