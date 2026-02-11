import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, MapPin, Star, Award, Users, Calendar, Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { findAgentApi } from '@/services/api';
import { toast } from 'sonner';

// Backend API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://homedapp1.azurewebsites.net/api';
// Extract base URL without /api suffix for image URLs
const BASE_URL = API_BASE_URL.replace('/api', '');

const PublicAgentProfile = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const agentId = searchParams.get('id');
  const [agent, setAgent] = useState<any>(null);
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());

  // Mock agent data - in a real app, this would come from an API
  const mockAgentData = {
    1: {
      id: 1,
      name: 'Sarah Johnson',
      company: 'Premier Properties Ltd',
      specialization: 'Residential Sales & New Homes',
      location: 'Central London',
      rating: 4.9,
      reviews: 127,
      phone: '+44 20 1234 5678',
      email: 'sarah@premierproperties.com',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&face=true',
      bio: 'With over 8 years of experience in the London property market, Sarah specializes in luxury residential sales and new development projects. She has successfully helped over 200 families find their dream homes and has consistently been a top performer in her field.',
      experience: '8+ years',
      achievements: [
        'Top Sales Agent 2023',
        'Customer Service Excellence Award',
        'New Homes Specialist Certification'
      ],
      officeAddress: '123 Oxford Street, London W1D 2HX',
      serviceAreas: 'Mayfair, Marylebone, Fitzrovia',
      coordinates: [-0.1419, 51.5154], // London coordinates
      reviewsData: {
        totalReviews: 127,
        averageRating: 4.9,
        ratingBreakdown: {
          5: 98,
          4: 21,
          3: 6,
          2: 1,
          1: 1
        },
        recentReviews: [
          {
            id: 1,
            reviewerName: 'Emma Thompson',
            rating: 5,
            date: '2024-01-15',
            comment: 'Sarah was absolutely fantastic throughout our house buying journey. Her knowledge of the Central London market is exceptional, and she went above and beyond to help us find our dream home. Highly professional and always responsive to our questions.'
          },
          {
            id: 2,
            reviewerName: 'James Mitchell',
            rating: 5,
            date: '2024-01-08',
            comment: 'Excellent service from Sarah! She understood exactly what we were looking for and presented us with perfect options. The entire process was smooth and stress-free thanks to her expertise.'
          },
          {
            id: 3,
            reviewerName: 'Lisa Chen',
            rating: 4,
            date: '2023-12-22',
            comment: 'Sarah helped us sell our property quickly and at a great price. Her marketing strategy was spot-on and she kept us informed every step of the way. Would definitely recommend her services.'
          },
          {
            id: 4,
            reviewerName: 'David Williams',
            rating: 5,
            date: '2023-12-18',
            comment: 'Outstanding agent! Sarah\'s attention to detail and market knowledge made our property purchase seamless. She negotiated a great deal for us and was always available when we needed her.'
          },
          {
            id: 5,
            reviewerName: 'Sophie Anderson',
            rating: 5,
            date: '2023-12-10',
            comment: 'Professional, knowledgeable, and incredibly helpful. Sarah made what could have been a stressful process very manageable. Her expertise in new homes was invaluable to us as first-time buyers.'
          }
        ]
      }
    },
    2: {
      id: 2,
      name: 'Michael Chen',
      company: 'Urban Lettings Ltd',
      specialization: 'Lettings & Property Management',
      location: 'North London',
      rating: 4.8,
      reviews: 89,
      phone: '+44 20 9876 5432',
      email: 'michael@urbanlettings.com',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&face=true',
      bio: 'Michael is an expert in rental properties and tenant management across North London boroughs. With 6 years of experience, he has built a reputation for finding perfect rental matches and providing exceptional property management services.',
      experience: '6+ years',
      achievements: [
        'Lettings Expert of the Year 2023',
        'Property Management Excellence',
        'Tenant Satisfaction Award'
      ],
      officeAddress: '456 Camden High Street, London NW1 7JR',
      serviceAreas: 'Camden, King\'s Cross, Islington',
      coordinates: [-0.1426, 51.5390], // Camden coordinates
      reviewsData: {
        totalReviews: 89,
        averageRating: 4.8,
        ratingBreakdown: {
          5: 67,
          4: 18,
          3: 3,
          2: 1,
          1: 0
        },
        recentReviews: [
          {
            id: 1,
            reviewerName: 'Rachel Green',
            rating: 5,
            date: '2024-01-10',
            comment: 'Michael found us the perfect rental property in exactly the area we wanted. His understanding of the North London market is excellent and he made the whole process very smooth.'
          },
          {
            id: 2,
            reviewerName: 'Tom Baker',
            rating: 5,
            date: '2024-01-03',
            comment: 'Great property management service! Michael is always quick to respond to any issues and handles everything professionally. Highly recommend for landlords.'
          },
          {
            id: 3,
            reviewerName: 'Anna Rodriguez',
            rating: 4,
            date: '2023-12-28',
            comment: 'Helpful and knowledgeable agent. Michael helped us navigate the rental market and found us a great property within our budget.'
          }
        ]
      }
    }
  };

  useEffect(() => {
    const fetchAgentDetails = async () => {
      if (agentId) {
        try {
          const numericId = parseInt(agentId, 10);
          if (isNaN(numericId)) {
            toast.error('Invalid agent ID');
            return;
          }
          
          const response = await findAgentApi.getAgentDetails(numericId);
          console.log('Agent API response:', response);
          if (response.success && response.data?.agent) {
            console.log('Agent profile_picture_url:', response.data.agent.profile_picture_url);
            setAgent(response.data.agent);
          } else {
            toast.error('Agent not found');
          }
        } catch (error) {
          console.error('Error fetching agent details:', error);
          toast.error('Failed to load agent details');
          // Fallback to mock data for development
          const numericId = parseInt(agentId, 10);
          if (numericId in mockAgentData) {
            setAgent(mockAgentData[numericId as keyof typeof mockAgentData]);
          }
        }
      }
    };

    fetchAgentDetails();
  }, [agentId]);

  const handleEmailAgent = () => {
    if (agent) {
      const params = new URLSearchParams({
        agentName: agent.name,
        propertyTitle: `General Enquiry - ${agent.specialization}`
      });
      navigate(`/contact-agent?${params.toString()}`);
    }
  };

  const handleCallAgent = () => {
    if (agent && agent.phone) {
      const confirmed = window.confirm(`Do you want to call ${agent.name} at ${agent.phone}?`);
      if (confirmed) {
        window.location.href = `tel:${agent.phone.replace(/\s+/g, '')}`;
      }
    }
  };

  const toggleReviewExpansion = (reviewId: number) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const truncateText = (text: string, limit: number = 150) => {
    if (text.length <= limit) return text;
    return text.substring(0, limit) + '...';
  };

  if (!agent) {
    return (
      <Layout>
        <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Agent Not Found</h1>
            <Button onClick={() => navigate('/find-agent')}>
              Back to Find Agent
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const renderStarRating = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} text-yellow-400 fill-current`} />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} text-yellow-400 fill-current opacity-50`} />
        );
      } else {
        stars.push(
          <Star key={i} className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} text-gray-300`} />
        );
      }
    }
    return stars;
  };

  return (
    <Layout>
      <div className="w-full py-8">
        {/* Header */}
        <div className="mb-6 px-4 sm:px-6 lg:px-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/find-agent')}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Find Agent
          </Button>
        </div>

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-8">
            {/* Office Location Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Office Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <MapPin className="w-12 h-12 mx-auto text-primary-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {agent.company}
                  </h3>
                  <p className="text-gray-600 mb-2">{agent.officeAddress}</p>
                  <p className="text-sm text-gray-500">Service Areas: {agent.serviceAreas}</p>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Interactive map integration would be implemented here using Mapbox or Google Maps API</p>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Reviews ({agent?.rating_stats?.total_reviews || agent?.reviewsData?.totalReviews || agent?.reviews || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Rating Overview */}
                {agent?.rating_stats || agent?.reviewsData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900 mb-2">{agent?.rating_stats?.average_rating || agent?.reviewsData?.averageRating || agent?.rating || 0}</div>
                      <div className="flex items-center justify-center mb-2">
                        {renderStarRating(agent?.rating_stats?.average_rating || agent?.reviewsData?.averageRating || agent?.rating || 0, 'md')}
                      </div>
                      <p className="text-gray-600">Based on {agent?.rating_stats?.total_reviews || agent?.reviewsData?.totalReviews || agent?.reviews || 0} reviews</p>
                    </div>
                    
                    <div className="space-y-2">
                      {(agent?.rating_stats?.rating_breakdown || agent?.reviewsData?.ratingBreakdown) && 
                        Object.entries(agent?.rating_stats?.rating_breakdown || agent?.reviewsData?.ratingBreakdown || {})
                          .filter(([_, count]) => Number(count) > 0)
                          .sort(([a], [b]) => parseInt(b) - parseInt(a))
                          .map(([rating, count]) => (
                            <div key={rating} className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600 w-8">{rating}★</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-400 h-2 rounded-full" 
                                  style={{ width: `${(Number(count) / (agent?.rating_stats?.total_reviews || agent?.reviewsData?.totalReviews || 1)) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 w-8">{String(count)}</span>
                            </div>
                          ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl font-bold text-gray-900 mb-2">{agent?.rating || 0}</div>
                    <div className="flex items-center justify-center mb-2">
                      {renderStarRating(agent?.rating || 0, 'md')}
                    </div>
                    <p className="text-gray-600">Based on {agent?.reviews || 0} reviews</p>
                  </div>
                )}

                {/* Individual Reviews with ScrollArea */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Recent Reviews</h4>
                  <ScrollArea className="h-96 pr-4">
                    <div className="space-y-4">
                      {(agent?.recent_reviews || agent?.reviewsData?.recentReviews || []).map((review: any) => {
                        const isExpanded = expandedReviews.has(review.id);
                        const shouldTruncate = review.comment.length > 150;
                        const displayText = isExpanded || !shouldTruncate 
                          ? review.comment 
                          : truncateText(review.comment);

                        return (
                          <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium text-gray-900">{review.reviewerName || review.reviewer_name || 'Anonymous'}</p>
                                <div className="flex items-center space-x-2">
                                  <div className="flex">
                                    {renderStarRating(review.rating)}
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {new Date(review.date || review.created_at).toLocaleDateString('en-GB', { 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-600 leading-relaxed mb-2">{displayText}</p>
                            {shouldTruncate && (
                              <button
                                onClick={() => toggleReviewExpansion(review.id)}
                                className="flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                              >
                                {isExpanded ? (
                                  <>
                                    <span>Read less</span>
                                    <ChevronUp className="w-3 h-3 ml-1" />
                                  </>
                                ) : (
                                  <>
                                    <span>Read more</span>
                                    <ChevronDown className="w-3 h-3 ml-1" />
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })}
                      {(!agent?.recent_reviews?.length && !agent?.reviewsData?.recentReviews?.length) && (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No reviews available yet.</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agent Card Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                {/* Agent Photo */}
                <div className="text-center mb-6">
                  <img 
                    src={
                      agent.profile_picture_url 
                        ? `${BASE_URL}${agent.profile_picture_url}` 
                        : agent.image || `https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&face=true`
                    } 
                    alt={agent.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    onError={(e) => {
                      console.log('Image failed to load, using fallback');
                      e.currentTarget.src = `https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&face=true`;
                    }}
                  />
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{agent.name}</h2>
                  <p className="text-sm text-gray-600 mb-2">{agent.specialization || agent.specialties}</p>
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{agent.rating || 0}</span>
                    <span className="text-sm text-gray-500">({agent.reviews || 0} reviews)</span>
                  </div>
                  {/* Phone Number */}
                  {agent.phone && (
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-2">
                      <Phone className="w-3 h-3" />
                      <span>{agent.phone}</span>
                    </div>
                  )}
                </div>

                {/* Contact Buttons */}
                <div className="space-y-3 mb-6">
                  <Button className="w-full flex items-center justify-center space-x-2" onClick={handleEmailAgent}>
                    <Mail className="w-4 h-4" />
                    <span>Email Agent</span>
                  </Button>
                  <Button variant="outline" className="w-full flex items-center justify-center space-x-2" onClick={handleCallAgent}>
                    <Phone className="w-4 h-4" />
                    <span>Call Agent</span>
                  </Button>
                </div>

                {/* About Section */}
                {(agent.bio || agent.description) && (
                  <div className="mb-6">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">About</p>
                    <div className="text-sm text-gray-600 leading-relaxed">
                      {agent.bio || agent.description}
                    </div>
                  </div>
                )}

                {/* Agent Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{agent.location}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{agent.experience} experience</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Service Areas</p>
                    <p className="text-sm text-gray-600">{agent.serviceAreas}</p>
                  </div>
                </div>

                {/* Achievements */}
                <div className="mb-6">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Achievements</p>
                  <div className="space-y-2">
                    {(agent?.achievements || []).map((achievement: string, index: number) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <Award className="w-3 h-3 mr-2 text-yellow-500 flex-shrink-0" />
                        <span className="leading-tight">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Company Info */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Works at</p>
                  <p className="font-medium text-gray-900">{agent.company}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PublicAgentProfile;
