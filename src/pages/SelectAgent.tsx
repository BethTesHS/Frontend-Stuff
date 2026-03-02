import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  X,
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface SelectAgentProps {
  propertyData: any;
  onBack: () => void;
}

const SelectAgent = ({ propertyData, onBack }: SelectAgentProps) => {
  const [loading, setLoading] = useState(false);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [agents, setAgents] = useState<any[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedAgentName, setConfirmedAgentName] = useState('');
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [agentTypeFilter, setAgentTypeFilter] = useState<'both' | 'estate' | 'letting'>('both');
  const [locationFilter, setLocationFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  // Fetch agents from API
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setAgentsLoading(true);
        const response = await findAgentApi.searchAgents({
          agentName: searchQuery || undefined,
          agentType: agentTypeFilter !== 'both' ? agentTypeFilter : undefined,
          location: locationFilter !== 'all' ? locationFilter : undefined,
          per_page: 50 
        });
        
        if (response.success && response.data) {
          setAgents(response.data.agents || []);
        } else {
          toast.error('Failed to load agents.');
        }
      } catch (error) {
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
      const matchesSearch = searchQuery === '' || 
        agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.location?.toLowerCase().includes(searchQuery.toLowerCase());

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
      
      // Simulate API call to link property to agent
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setConfirmedAgentName(agent?.name || 'Agent');
      setShowConfirmation(true);
    } catch (error) {
      toast.error('Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    onBack();
  };

  if (loading || agentsLoading) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-muted-foreground animate-pulse">Finding professional agents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Top Navigation & Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="hover:bg-slate-100 dark:hover:bg-slate-800 -ml-2 text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Properties
        </Button>
        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-800">
           <Building className="w-4 h-4 text-blue-600" />
           <div className="text-left">
             <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none">Assigning Agent For</p>
             <p className="text-sm font-bold truncate max-w-[250px]">{propertyData?.title}</p>
           </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, specialization, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={agentTypeFilter} onValueChange={(value: any) => setAgentTypeFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Agent Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="both">All Types</SelectItem>
              <SelectItem value="estate">Estate Agents</SelectItem>
              <SelectItem value="letting">Letting Agents</SelectItem>
            </SelectContent>
          </Select>

          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Min Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Rating</SelectItem>
              <SelectItem value="4.5">4.5+ Stars</SelectItem>
              <SelectItem value="4.0">4.0+ Stars</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">
            {filteredAgents.length} professional agents found
          </span>
          {hasActiveFilters && (
            <Button variant="link" size="sm" onClick={clearFilters} className="h-auto p-0 text-blue-600">
              <X className="w-3 h-3 mr-1" /> Clear all filters
            </Button>
          )}
        </div>
      </div>

      {/* Agents Grid */}
      {filteredAgents.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">No agents found</h3>
          <p className="text-sm text-muted-foreground mb-6">Try adjusting your filters or search terms.</p>
          <Button onClick={clearFilters} variant="outline" size="sm">Reset Filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <div key={agent.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-md transition-all">
              <div className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  <img 
                    src={agent.image} 
                    alt={agent.name}
                    className="w-14 h-14 rounded-lg object-cover bg-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{agent.name}</h3>
                    <p className="text-xs text-blue-600 font-semibold mb-1 truncate">{agent.specialization}</p>
                    <div className="flex items-center text-[11px] text-muted-foreground">
                      <MapPin className="w-3 h-3 mr-1" /> {agent.location}
                    </div>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-current mr-1" />
                  <span className="text-xs font-bold">{agent.rating || 'N/A'}</span>
                  <span className="text-[10px] text-muted-foreground ml-1">({agent.reviews || 0} reviews)</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">
                  {agent.description}
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={() => handleSendRequest(agent.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 shadow-sm"
                    disabled={loading}
                  >
                    <Send className="w-3.5 h-3.5 mr-2" /> Send Request
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs h-9 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    View Agent Profile
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Agent Request Confirmation Dialog */}
      <AgentRequestConfirmation
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        agentName={confirmedAgentName}
        propertyTitle={propertyData?.title}
        onConfirm={handleConfirmationClose}
      />
    </div>
  );
};

export default SelectAgent;