import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLoading } from '@/contexts/LoadingContext';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MapPin, Users, Phone, Star, ExternalLink, AlertCircle } from 'lucide-react';
import { findAgentApi } from '@/services/api';

// Agent type - using the same structure as the API
type Agent = {
  id: number;
  name: string;
  specialization: string;
  location: string;
  rating: number;
  reviews: number;
  description: string;
  type: 'estate' | 'letting';
  phone?: string;
  email?: string;
  company?: string;
  agency?: string;
  experience?: string;
  years_experience?: number;
  office_address?: string;
  service_areas?: string;
  profile_picture?: string;
  profile_picture_url?: string;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
};

const FindAgent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const agentType = searchParams.get('type');
  
  // Form states
  const [selectedAgentType, setSelectedAgentType] = useState(agentType || 'both');
  const [location, setLocation] = useState('');
  const [agentName, setAgentName] = useState('');
  const [radius, setRadius] = useState('');
  
  // Data states
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  
  const isLoadingRef = useRef(false);

  // Initialize form from URL params
  useEffect(() => {
    if (agentType) {
      setSelectedAgentType(agentType);
    }
    
    // Set other params from URL if they exist
    const locationParam = searchParams.get('location');
    const agentNameParam = searchParams.get('agentName');
    const radiusParam = searchParams.get('radius');
    
    if (locationParam) setLocation(locationParam);
    if (agentNameParam) setAgentName(agentNameParam);
    if (radiusParam) setRadius(radiusParam);
  }, [agentType, searchParams]);

  // Load featured agents on mount
  useEffect(() => {
    loadFeaturedAgents();
  }, []);

  const loadFeaturedAgents = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setLoading(true);
    setError('');

    try {
      console.log('Loading featured agents...');
      const response = await findAgentApi.getFeaturedAgents(3);
      
      if (response.success && response.data) {
        setAgents(response.data.agents);
        console.log('Featured agents loaded:', response.data.agents);
      } else {
        throw new Error(response.error || 'Failed to load featured agents');
      }
    } catch (err) {
      console.error('Error loading featured agents:', err);
      setError(err instanceof Error ? err.message : 'Failed to load agents');
      setAgents([]);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  const performSearch = async (searchParams: {
    location?: string;
    agentName?: string;
    agentType?: string;
    radius?: string;
  }) => {
    setIsSearching(true);
    setError('');

    try {
      console.log('Performing agent search with params:', searchParams);
      
      const response = await findAgentApi.searchAgents({
        location: searchParams.location,
        agentName: searchParams.agentName,
        agentType: searchParams.agentType as 'both' | 'estate' | 'letting' || 'both',
        radius: searchParams.radius as any,
        page: 1,
        per_page: 12
      });

      if (response.success && response.data) {
        setAgents(response.data.agents);
        console.log('Search results:', response.data.agents);
        
        // Show message if no results
        if (response.data.agents.length === 0) {
          setError('No agents found matching your criteria. Try adjusting your search filters.');
        }
      } else {
        throw new Error(response.error || 'Search failed');
      }
    } catch (err) {
      console.error('Error searching agents:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      // Keep existing agents if search fails
    } finally {
      setIsSearching(false);
    }
  };

  const filteredAgents = selectedAgentType === 'both' 
    ? agents 
    : agents.filter(agent => agent.type === selectedAgentType);

  const handleSearch = () => {
    // Update URL with search parameters
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (agentName) params.set('agentName', agentName);
    if (selectedAgentType && selectedAgentType !== 'both') params.set('agentType', selectedAgentType);
    if (radius) params.set('radius', radius);
    
    // Perform the search
    performSearch({
      location,
      agentName,
      agentType: selectedAgentType,
      radius
    });

    // Navigate to update URL (optional - for better UX)
    if (params.toString()) {
      navigate(`/find-agent?${params.toString()}`, { replace: true });
    }
  };

  const handleStartSearch = () => {
    // Navigate to agents list page for the "Start Your Search" button
    navigate('/agents');
  };

  const handleViewProfile = (agent: Agent) => {
    // Navigate to agent profile page
    navigate(`/public-agent-profile?id=${agent.id}`);
  };

  const handleContactAgent = (agent: Agent) => {
    // Navigate to contact page with agent details
    navigate(`/contact-agent?agentName=${encodeURIComponent(agent.name)}&agentId=${agent.id}&propertyTitle=General+Inquiry`);
  };

  const clearSearch = () => {
    setLocation('');
    setAgentName('');
    setRadius('');
    setSelectedAgentType('both');
    setError('');
    loadFeaturedAgents(); // Reload featured agents
    navigate('/find-agent', { replace: true }); // Clear URL params
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-primary-600 bg-clip-text text-transparent">
              Find Estate
            </span>{' '}
            & Letting Agents Near You
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Search and compare local property experts to help you sell or rent your home.
          </p>
        </div>
      </section>

      {/* Search Form Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center">
                <Search className="w-6 h-6 mr-2" />
                Find Your Perfect Agent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location
                  </label>
                  <Input 
                    placeholder="Enter postcode or area" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Name (Optional)
                  </label>
                  <Input 
                    placeholder="Agent or agency name" 
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Radius
                  </label>
                  <Select value={radius} onValueChange={setRadius}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select radius" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="this-area">This area only</SelectItem>
                      <SelectItem value="1-mile">+1 mile</SelectItem>
                      <SelectItem value="3-miles">+3 miles</SelectItem>
                      <SelectItem value="5-miles">+5 miles</SelectItem>
                      <SelectItem value="10-miles">+10 miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Type
                  </label>
                  <Select value={selectedAgentType} onValueChange={setSelectedAgentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Both</SelectItem>
                      <SelectItem value="estate">Sales</SelectItem>
                      <SelectItem value="letting">Lettings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button 
                  className="flex-1" 
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isSearching ? 'Searching...' : 'Search Agents'}
                </Button>
                
                {(location || agentName || radius || selectedAgentType !== 'both') && (
                  <Button 
                    variant="outline" 
                    onClick={clearSearch}
                    disabled={isSearching}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <section className="py-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Search</h3>
              <p className="text-gray-600">
                Enter your location and preferences to find qualified agents in your area.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Compare Agents</h3>
              <p className="text-gray-600">
                Review agent profiles, ratings, and specializations to find the perfect match.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Contact or Book</h3>
              <p className="text-gray-600">
                Get in touch directly or book a free property valuation with your chosen agent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Agents Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {location || agentName || radius || selectedAgentType !== 'both' ? 'Search Results' : 'Featured Agents'}
          </h2>
          
          {filteredAgents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => (
                <Card key={agent.id} className="property-card hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {agent.name}
                        </h3>
                        <p className="text-sm text-gray-600">{agent.specialization}</p>
                        {agent.company && (
                          <p className="text-xs text-gray-500 mt-1">{agent.company}</p>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        {agent.rating > 0 ? (
                          <span>{agent.rating} ({agent.reviews})</span>
                        ) : (
                          <span className="text-gray-400">New</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span>{agent.location}</span>
                    </div>
                    
                    {agent.description && (
                      <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                        {agent.description}
                      </p>
                    )}
                    
                    {agent.experience && (
                      <p className="text-xs text-gray-500 mb-4">
                        Experience: {agent.experience}
                      </p>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleViewProfile(agent)}
                      >
                        View Profile
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={() => handleContactAgent(agent)}
                      >
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !error && !isSearching && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {location || agentName || radius || selectedAgentType !== 'both' 
                  ? 'No agents found' 
                  : 'No featured agents available'
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {location || agentName || radius || selectedAgentType !== 'both'
                  ? 'Try adjusting your search criteria to find more agents.'
                  : 'Check back later for featured agents in your area.'
                }
              </p>
              {(location || agentName || radius || selectedAgentType !== 'both') && (
                <Button variant="outline" onClick={clearSearch}>
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Helpful Resources Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Helpful Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover-lift">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How to Choose an Agent
                </h3>
                <p className="text-gray-600 mb-4">
                  Essential tips for selecting the right estate or letting agent for your needs.
                </p>
                <Button variant="outline" size="sm">
                  Read Guide
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
            <Card className="hover-lift">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Understanding Agent Fees
                </h3>
                <p className="text-gray-600 mb-4">
                  Learn about typical agent commission rates and what services are included.
                </p>
                <Button variant="outline" size="sm">
                  Read Guide
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
            <Card className="hover-lift">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Selling vs Letting
                </h3>
                <p className="text-gray-600 mb-4">
                  Compare the benefits of selling your property versus renting it out.
                </p>
                <Button variant="outline" size="sm">
                  Read Guide
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to find your agent?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Get connected with local property experts today and take the next step in your property journey.
          </p>
          <Button size="lg" variant="secondary" onClick={handleStartSearch}>
            Start Your Search
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default FindAgent;
