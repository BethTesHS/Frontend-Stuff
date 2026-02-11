import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { AgentRequestConfirmation } from '@/components/AgentRequest/AgentRequestConfirmation';
import { findAgentApi } from '@/services/api';
import { 
  Building, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Send,
  Search,
  Filter,
  X
} from 'lucide-react';

const SelectAgent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedAgentName, setConfirmedAgentName] = useState('');
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [agentTypeFilter, setAgentTypeFilter] = useState<'both' | 'estate' | 'letting'>('both');
  const [locationFilter, setLocationFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  
  const propertyData = location.state?.propertyData;

  if (!propertyData) {
    navigate('/list-property');
    return null;
  }

  // Fetch agents from API
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setAgentsLoading(true);
        const response = await findAgentApi.searchAgents({
          agentName: searchQuery || undefined,
          agentType: agentTypeFilter !== 'both' ? agentTypeFilter : undefined,
          location: locationFilter !== 'all' ? locationFilter : undefined,
          per_page: 50 // Get more agents for better selection
        });
        
        if (response.success && response.data) {
          setAgents(response.data.agents || []);
        } else {
          console.error('Failed to fetch agents:', response.error);
          toast.error('Failed to load agents. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
        toast.error('Failed to load agents. Please try again.');
      } finally {
        setAgentsLoading(false);
      }
    };

    fetchAgents();
  }, [searchQuery, agentTypeFilter, locationFilter]);

  // Filter agents based on search and filters
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      // Search query filter (additional client-side filtering)
      const matchesSearch = searchQuery === '' || 
        agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.location?.toLowerCase().includes(searchQuery.toLowerCase());

      // Rating filter (client-side only as API doesn't support this)
      const matchesRating = ratingFilter === 'all' || 
        (ratingFilter === '4.5' && (agent.rating || 0) >= 4.5) ||
        (ratingFilter === '4.0' && (agent.rating || 0) >= 4.0);

      return matchesSearch && matchesRating;
    });
  }, [agents, searchQuery, ratingFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setAgentTypeFilter('both');
    setLocationFilter('all');
    setRatingFilter('all');
  };

  const hasActiveFilters = searchQuery !== '' || agentTypeFilter !== 'both' || locationFilter !== 'all' || ratingFilter !== 'all';

  const handleSendRequest = async (agentId: number) => {
    setLoading(true);
    try {
      const agent = agents.find(a => a.id === agentId);
      
      // TODO: Replace with actual API call to send agent request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Agent request sent:', { agentId, propertyData, agent });
      
      // Show confirmation dialog instead of toast and immediate navigation
      setConfirmedAgentName(agent?.name || 'Agent');
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error sending agent request:', error);
      toast.error('Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    navigate('/owner-dashboard', { 
      state: { 
        message: 'Property listed and agent request sent!',
        agentRequest: { agentName: confirmedAgentName }
      } 
    });
  };

  if (loading || agentsLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 relative overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl p-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
                    Select an Agent
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Choose a professional agent to manage your property: {propertyData.title}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-8">
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Search Bar */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search agents by name, specialization, or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/50 border-white/30 focus:bg-white/70"
                    />
                  </div>
                </div>

                {/* Agent Type Filter */}
                <div>
                  <Select value={agentTypeFilter} onValueChange={(value) => setAgentTypeFilter(value as 'both' | 'estate' | 'letting')}>
                    <SelectTrigger className="bg-white/50 border-white/30 focus:bg-white/70">
                      <SelectValue placeholder="Agent Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="both">All Types</SelectItem>
                      <SelectItem value="estate">Estate Agents</SelectItem>
                      <SelectItem value="letting">Letting Agents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating Filter */}
                <div>
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger className="bg-white/50 border-white/30 focus:bg-white/70">
                      <SelectValue placeholder="Min Rating" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="all">Any Rating</SelectItem>
                      <SelectItem value="4.5">4.5+ Stars</SelectItem>
                      <SelectItem value="4.0">4.0+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results Info and Clear Filters */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} found
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Available Agents */}
          {filteredAgents.length === 0 ? (
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl p-12 text-center">
              <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No agents found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or filters to find more agents.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => (
                <div key={agent.id} className="bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 hover:-translate-y-2">
                  <div className="p-6">
                    {/* Agent Image and Basic Info */}
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg">
                        <img 
                          src={agent.image} 
                          alt={agent.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{agent.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{agent.specialization}</p>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          {agent.location}
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-700 ml-1">
                          {agent.rating || 'N/A'} ({agent.reviews || 0} reviews)
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {agent.description}
                    </p>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {agent.email || 'Email not provided'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {agent.phone || 'Phone not provided'}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Button
                        onClick={() => handleSendRequest(agent.id)}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        disabled={loading}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Request
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/public-agent-profile?id=${agent.id}`)}
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
                      >
                        View Full Profile
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agent Request Confirmation Dialog */}
        <AgentRequestConfirmation
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          agentName={confirmedAgentName}
          propertyTitle={propertyData.title}
          onConfirm={handleConfirmationClose}
        />
      </div>
    </Layout>
  );
};

export default SelectAgent;
