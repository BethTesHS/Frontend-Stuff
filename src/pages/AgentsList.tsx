
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ArrowLeft, Search, MapPin, Star, Phone, Mail, Globe, Award, Calendar, Users } from 'lucide-react';

// Enhanced mock agent data with more details
const availableAgents = [
  {
    id: 1,
    name: 'Sarah Johnson',
    company: 'Premier Properties',
    specialization: 'Residential Sales & New Homes',
    location: 'Central London',
    rating: 4.9,
    reviews: 127,
    description: 'Specializing in luxury properties and new developments with over 8 years of experience in Central London\'s competitive market.',
    type: 'estate',
    email: 'sarah.johnson@example.com',
    phone: '+44 20 7123 4567',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&face=true',
    experience: '8 years',
    officeAddress: '123 Oxford Street, London W1D 2HX',
    recentSales: 45,
    serviceAreas: 'Mayfair, Marylebone, Fitzrovia',
    availability: 'Available',
    aboutMe: 'Passionate about helping clients find their dream homes in London\'s most prestigious areas.'
  },
  {
    id: 2,
    name: 'Michael Chen',
    company: 'Chen Properties',
    specialization: 'Lettings & Property Management',
    location: 'North London',
    rating: 4.8,
    reviews: 89,
    description: 'Expert in rental properties and tenant management across North London boroughs with comprehensive property management services.',
    type: 'letting',
    email: 'michael.chen@example.com',
    phone: '+44 20 7234 5678',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&face=true',
    experience: '6 years',
    officeAddress: '456 Camden High Street, London NW1 7JH',
    recentSales: 67,
    serviceAreas: 'Camden, Islington, Hampstead',
    availability: 'Busy',
    aboutMe: 'Dedicated to providing seamless lettings experience for both landlords and tenants.'
  },
  {
    id: 3,
    name: 'Emma Thompson',
    company: 'Thompson Estates',
    specialization: 'Commercial & Residential Sales',
    location: 'South London',
    rating: 4.9,
    reviews: 156,
    description: 'Award-winning agent with expertise in both commercial and residential markets, known for exceptional client service and market knowledge.',
    type: 'estate',
    email: 'emma.thompson@example.com',
    phone: '+44 20 7345 6789',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&face=true',
    experience: '12 years',
    officeAddress: '789 Clapham High Street, London SW4 7DB',
    recentSales: 89,
    serviceAreas: 'Clapham, Battersea, Wandsworth',
    availability: 'Available',
    aboutMe: 'Award-winning agent committed to delivering exceptional results in both commercial and residential sectors.'
  },
  {
    id: 4,
    name: 'James Wilson',
    company: 'Wilson Commercial',
    specialization: 'Commercial Properties',
    location: 'East London',
    rating: 4.7,
    reviews: 98,
    description: 'Commercial property specialist with focus on office spaces and retail properties, serving the growing East London business district.',
    type: 'estate',
    email: 'james.wilson@example.com',
    phone: '+44 20 7456 7890',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&face=true',
    experience: '10 years',
    officeAddress: '321 Canary Wharf, London E14 5AB',
    recentSales: 34,
    serviceAreas: 'Canary Wharf, Shoreditch, Stratford',
    availability: 'Available',
    aboutMe: 'Specialist in commercial real estate with deep understanding of East London\'s business landscape.'
  },
  {
    id: 5,
    name: 'Lisa Parker',
    company: 'Parker & Associates',
    specialization: 'Student & Short-term Lettings',
    location: 'West London',
    rating: 4.6,
    reviews: 73,
    description: 'Specialist in student accommodation and short-term rental properties, providing tailored solutions for diverse client needs.',
    type: 'letting',
    email: 'lisa.parker@example.com',
    phone: '+44 20 7567 8901',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&face=true',
    experience: '5 years',
    officeAddress: '654 Notting Hill Gate, London W11 3JE',
    recentSales: 52,
    serviceAreas: 'Notting Hill, Kensington, Paddington',
    availability: 'Available',
    aboutMe: 'Passionate about helping students and professionals find perfect short-term accommodation solutions.'
  }
];

const AgentsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get initial search parameters from URL
  const initialLocation = searchParams.get('location') || '';
  const initialAgentName = searchParams.get('agentName') || '';
  const initialAgentType = searchParams.get('agentType') || 'both';
  const initialRadius = searchParams.get('radius') || '';
  
  // State for search filters
  const [location, setLocation] = useState(initialLocation);
  const [agentName, setAgentName] = useState(initialAgentName);
  const [agentType, setAgentType] = useState(initialAgentType);
  const [radius, setRadius] = useState(initialRadius);
  const [sortBy, setSortBy] = useState('rating');
  const [currentPage, setCurrentPage] = useState(1);
  const agentsPerPage = 4;

  // Filter and sort agents based on search criteria
  const filteredAndSortedAgents = useMemo(() => {
    let filtered = availableAgents.filter(agent => {
      const matchesName = !agentName || 
        agent.name.toLowerCase().includes(agentName.toLowerCase());
      
      const matchesLocation = !location || 
        agent.location.toLowerCase().includes(location.toLowerCase()) ||
        agent.serviceAreas.toLowerCase().includes(location.toLowerCase());
      
      const matchesType = agentType === 'both' || agent.type === agentType;
      
      return matchesName && matchesLocation && matchesType;
    });

    // Sort agents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'experience':
          return parseInt(b.experience) - parseInt(a.experience);
        case 'reviews':
          return b.reviews - a.reviews;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [agentName, location, agentType, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedAgents.length / agentsPerPage);
  const startIndex = (currentPage - 1) * agentsPerPage;
  const endIndex = startIndex + agentsPerPage;
  const currentAgents = filteredAndSortedAgents.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [agentName, location, agentType, sortBy]);

  const handleSearch = () => {
    // Update URL parameters when searching
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (agentName) params.set('agentName', agentName);
    if (agentType && agentType !== 'both') params.set('agentType', agentType);
    if (radius) params.set('radius', radius);
    
    setSearchParams(params);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available':
        return 'text-green-600 bg-green-50';
      case 'Busy':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Modern Header */}
        <div className="bg-background/95 backdrop-blur-sm border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/find-agent')}
                  className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Search
                </Button>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Property Agents
                  </h1>
                  <p className="text-muted-foreground text-lg mt-1">
                    {filteredAndSortedAgents.length} agent{filteredAndSortedAgents.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Modern Search Bar */}
          <Card className="mb-8 shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div>
                  <Input
                    placeholder="Location or postcode"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Agent name"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div>
                  <Select value={agentType} onValueChange={setAgentType}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Both</SelectItem>
                      <SelectItem value="estate">Sales</SelectItem>
                      <SelectItem value="letting">Lettings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={radius} onValueChange={setRadius}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Search radius" />
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
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="experience">Experience</SelectItem>
                      <SelectItem value="reviews">Reviews</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSearch} className="w-full h-12 text-base">
                  <Search className="w-5 h-5 mr-2" />
                  Refine Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Agents Grid */}
          {filteredAndSortedAgents.length === 0 ? (
            <Card className="shadow-lg border-0">
              <CardContent className="p-12 text-center">
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  No agents found
                </h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  Try adjusting your search criteria to find more agents.
                </p>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/find-agent')}
                >
                  Modify Search
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {currentAgents.map((agent) => (
                  <Card key={agent.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden bg-card">
                    <CardContent className="p-0">
                      {/* Modern Agent Header */}
                      <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8">
                        <div className="flex items-start space-x-6">
                          <div className="relative">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-primary/20 shadow-lg flex-shrink-0 group-hover:ring-primary/40 transition-all duration-300">
                              <img 
                                src={agent.image} 
                                alt={agent.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-200">
                                  {agent.name}
                                </h3>
                                <p className="text-sm text-muted-foreground font-medium">
                                  {agent.specialization}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(agent.availability)}`}>
                                {agent.availability}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {agent.location}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {agent.experience}
                              </div>
                            </div>

                            <div className="flex items-center space-x-6">
                              <div className="flex items-center">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-4 h-4 ${i < Math.floor(agent.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                </div>
                                <span className="text-sm font-medium text-foreground ml-2">
                                  {agent.rating} ({agent.reviews})
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Users className="w-4 h-4 mr-1" />
                                {agent.recentSales} sales
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Modern Agent Details */}
                      <div className="p-8 space-y-6">
                        <p className="text-muted-foreground leading-relaxed">
                          {agent.aboutMe}
                        </p>

                        {/* Compact Info Grid */}
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-3">Service Areas</h4>
                            <p className="text-sm text-muted-foreground">{agent.serviceAreas}</p>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">Company</h4>
                            <p className="text-sm text-muted-foreground">{agent.company}</p>
                          </div>
                        </div>

                        {/* Modern Contact Actions */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => window.location.href = `tel:${agent.phone}`}
                            className="flex-1 min-w-[120px]"
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Call
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `mailto:${agent.email}`}
                            className="flex-1 min-w-[120px]"
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Email
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/public-agent-profile?id=${agent.id}`)}
                            className="flex-1 min-w-[120px]"
                          >
                            <Globe className="w-4 h-4 mr-2" />
                            Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Modern Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      
                      {[...Array(totalPages)].map((_, index) => (
                        <PaginationItem key={index + 1}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(index + 1);
                            }}
                            isActive={currentPage === index + 1}
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AgentsList;
