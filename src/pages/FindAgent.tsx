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

// Agent type definition
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

// Define the shape of our search parameters
interface SearchConfiguration {
  location: string;
  agentName: string;
  radius: string;
  agentType: string;
}

const FindAgent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  
  // 1. Committed Search Config - The Source of Truth for URL and Fetching
  // We initialize this strictly from the URL parameters so deep links work immediately.
  const [searchConfig, setSearchConfig] = useState<SearchConfiguration>(() => ({
    location: searchParams.get('location') || '',
    agentName: searchParams.get('agentName') || '',
    radius: searchParams.get('radius') || '',
    agentType: searchParams.get('agentType') || searchParams.get('type') || 'both',
  }));

  // 2. Input State - What the user is currently typing/selecting
  // Initialized from the config so the form is populated correctly on load.
  const [inputs, setInputs] = useState<SearchConfiguration>(searchConfig);

  // Data states
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Ref to track if a request is in flight
  const isLoadingRef = useRef(false);

  // --- EFFECT 1: URL SYNCHRONIZATION ---
  // Whenever the active search config changes, update the URL.
  // This allows users to bookmark or share the URL after filtering.
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchConfig.location) params.set('location', searchConfig.location);
    if (searchConfig.agentName) params.set('agentName', searchConfig.agentName);
    if (searchConfig.radius) params.set('radius', searchConfig.radius);
    if (searchConfig.agentType && searchConfig.agentType !== 'both') params.set('agentType', searchConfig.agentType);
    
    setSearchParams(params, { replace: true });
  }, [searchConfig, setSearchParams]);

  // --- EFFECT 2: DATA FETCHING ---
  // Whenever the active search config changes, fetch the appropriate data.
  useEffect(() => {
    const fetchData = async () => {
      // Check if we are in "default" state (no active filters)
      const isDefault = !searchConfig.location && !searchConfig.agentName && !searchConfig.radius && searchConfig.agentType === 'both';

      if (isDefault) {
        await loadFeaturedAgents();
      } else {
        await performSearch(searchConfig);
      }
    };

    fetchData();
  }, [searchConfig]);

  // API Call: Load Featured Agents
  const loadFeaturedAgents = async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setLoading(true);
    setError('');

    try {
      const response = await findAgentApi.getFeaturedAgents(3);
      if (response.success && response.data) {
        setAgents(response.data.agents);
      } else {
        setAgents([]);
      }
    } catch (err) {
      console.error('Error loading featured agents:', err);
      setAgents([]);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  // API Call: Perform Search
  const performSearch = async (config: SearchConfiguration) => {
    setIsSearching(true);
    setLoading(true);
    setError('');

    try {
      const response = await findAgentApi.searchAgents({
        location: config.location,
        agentName: config.agentName,
        agentType: config.agentType as 'both' | 'estate' | 'letting',
        radius: config.radius as any,
        page: 1,
        per_page: 12
      });

      if (response.success && response.data) {
        setAgents(response.data.agents);
        if (response.data.agents.length === 0) {
          setError('No agents found matching your criteria. Try adjusting your search filters.');
        }
      } else {
        throw new Error(response.error || 'Search failed');
      }
    } catch (err) {
      console.error('Error searching agents:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setAgents([]);
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  // --- EVENT HANDLERS ---

  const handleSearchClick = () => {
    // Committing the inputs to the searchConfig triggers the useEffects
    // which update the URL and fetch the data.
    setSearchConfig(inputs);
  };

  const handleClearSearch = () => {
    const emptyConfig = {
      location: '',
      agentName: '',
      radius: '',
      agentType: 'both'
    };
    setInputs(emptyConfig);
    setSearchConfig(emptyConfig);
    setError('');
  };

  const updateInput = (key: keyof SearchConfiguration, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  // Navigation handlers
  const handleStartSearch = () => navigate('/agents');
  const handleViewProfile = (agent: Agent) => navigate(`/public-agent-profile?id=${agent.id}`);
  const handleContactAgent = (agent: Agent) => navigate(`/contact-agent?agentName=${encodeURIComponent(agent.name)}&agentId=${agent.id}&propertyTitle=General+Inquiry`);

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
                {/* Location Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location
                  </label>
                  <Input 
                    placeholder="Enter postcode or area" 
                    value={inputs.location}
                    onChange={(e) => updateInput('location', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                  />
                </div>

                {/* Agent Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Name (Optional)
                  </label>
                  <Input 
                    placeholder="Agent or agency name" 
                    value={inputs.agentName}
                    onChange={(e) => updateInput('agentName', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                  />
                </div>

                {/* Radius Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Radius
                  </label>
                  <Select 
                    value={inputs.radius} 
                    onValueChange={(value) => updateInput('radius', value)}
                  >
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

                {/* Agent Type Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Type
                  </label>
                  <Select 
                    value={inputs.agentType} 
                    onValueChange={(value) => updateInput('agentType', value)}
                  >
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
                  onClick={handleSearchClick}
                  disabled={isSearching}
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isSearching ? 'Searching...' : 'Search Agents'}
                </Button>
                
                {/* Clear Button - shown if form or results are active */}
                {(inputs.location || inputs.agentName || inputs.radius || inputs.agentType !== 'both' || 
                  searchConfig.location || searchConfig.agentName || searchConfig.radius || searchConfig.agentType !== 'both') && (
                  <Button 
                    variant="outline" 
                    onClick={handleClearSearch}
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

      {/* Agents List Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {searchConfig.location || searchConfig.agentName || searchConfig.radius || searchConfig.agentType !== 'both' 
              ? 'Search Results' 
              : 'Featured Agents'}
          </h2>
          
          {agents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
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
                {searchConfig.location || searchConfig.agentName || searchConfig.radius || searchConfig.agentType !== 'both'
                  ? 'No agents found' 
                  : 'No featured agents available'
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {searchConfig.location || searchConfig.agentName || searchConfig.radius || searchConfig.agentType !== 'both'
                  ? 'Try adjusting your search criteria to find more agents.'
                  : 'Check back later for featured agents in your area.'
                }
              </p>
              {(searchConfig.location || searchConfig.agentName || searchConfig.radius || searchConfig.agentType !== 'both') && (
                <Button variant="outline" onClick={handleClearSearch}>
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