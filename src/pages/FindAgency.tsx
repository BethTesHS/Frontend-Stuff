import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { 
  Search, MapPin, Star, Users, Home, Building2, 
  Handshake, Mail, Globe, PlusCircle, Sliders, X, 
  AlertCircle, ExternalLink, Send
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from '@/components/ui/card';
import { useLoading } from '@/contexts/LoadingContext';
import { agencyApi } from '@/services/agencyApi';

// --- TYPES ---
interface Agency {
  id: string;
  name: string;
  slug: string;
  location: string;
  rating: number;
  reviews?: number;
  agents_count: number;
  properties_count: number;
  established_year: string;
  specializations: string[];
  description: string;
  contact: {
    email: string;
    phone: string;
  };
}

interface SearchConfiguration {
  query: string;
  city: string;
  specialty: string;
}

const FindAgency = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLoading:loading, setLoading } = useLoading();
  const isLoadingRef = useRef(false);
  const [searchConfig, setSearchConfig] = useState<SearchConfiguration>(() => ({
    query: searchParams.get('query') || '',
    city: searchParams.get('city') || 'All cities',
    specialty: searchParams.get('specialty') || 'All specialties',
  }));

  const [inputs, setInputs] = useState<SearchConfiguration>(searchConfig);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const itemsPerPage = 6;

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchConfig.query) params.set('query', searchConfig.query);
    if (searchConfig.city !== 'All cities') params.set('city', searchConfig.city);
    if (searchConfig.specialty !== 'All specialties') params.set('specialty', searchConfig.specialty);
    setSearchParams(params, { replace: true });
  }, [searchConfig, setSearchParams]);

  useEffect(() => {
    const fetchData = async () => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      setLoading(true);
      setError('');

      try {
        // Preparation for future API: agencyApi.searchAgencies(searchConfig)
        const mockData: Agency[] = [
          {
            id: '1',
            name: "Skyline Properties",
            slug: "skyline-props",
            location: "London, UK",
            rating: 4.8,
            reviews: 120,
            agents_count: 24,
            properties_count: 142,
            established_year: "2012",
            specializations: ["Residential", "Luxury"],
            description: "London's premier agency for high-rise luxury living.",
            contact: { email: "contact@skyline.com", phone: "+44 20 7946 0198" }
          },
          {
            id: '2',
            name: "Golden Gate Realty",
            slug: "golden-gate",
            location: "Manchester, UK",
            rating: 4.9,
            reviews: 85,
            agents_count: 12,
            properties_count: 85,
            established_year: "2015",
            specializations: ["Commercial", "Investment"],
            description: "Expert guidance in the competitive Northern market.",
            contact: { email: "info@goldengate.com", phone: "+44 161 496 0122" }
          }
        ];
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setAgencies(mockData);
      } catch (err) {
        console.error("Failed to fetch agencies:", err);
        setError("Unable to load agencies. Please try again later.");
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    };

    fetchData();
  }, [searchConfig, setLoading]);

  const filteredAgencies = useMemo(() => {
    return agencies.filter(agency => {
      const searchTerm = searchConfig.query.toLowerCase();
      const matchesSearch = !searchTerm || 
        agency.name.toLowerCase().includes(searchTerm) ||
        agency.location.toLowerCase().includes(searchTerm);
      
      const matchesCity = searchConfig.city === 'All cities' || agency.location.includes(searchConfig.city);
      const matchesSpecialty = searchConfig.specialty === 'All specialties' || 
                               agency.specializations.includes(searchConfig.specialty);
      
      return matchesSearch && matchesCity && matchesSpecialty;
    });
  }, [agencies, searchConfig]);

  const stats = useMemo(() => {
    const totalAgents = agencies.reduce((sum, a) => sum + (a.agents_count || 0), 0);
    const totalListings = agencies.reduce((sum, a) => sum + (a.properties_count || 0), 0);
    const avgRating = agencies.length 
      ? (agencies.reduce((sum, a) => sum + a.rating, 0) / agencies.length).toFixed(1) 
      : "0.0";
    return { totalAgents, totalListings, avgRating };
  }, [agencies]);

  const displayedAgencies = filteredAgencies.slice(0, currentPage * itemsPerPage);

  const handleSearchClick = () => {
    setSearchConfig(inputs);
    setCurrentPage(1);
  };

  const handleVisitAgency = (slug: string) => {
    navigate(`/agency/${slug}`);
  };

  return (
    <Layout showFooter={true}>
      <div className="bg-gray-50 min-h-screen pb-20">
        
        {/* TOP VISUAL / HERO */}
        <div className="max-w-7xl mx-auto pt-4 sm:pt-6 px-4">
          <div className="relative h-[220px] sm:h-[280px] rounded-[30px] sm:rounded-[40px] overflow-hidden shadow-2xl cursor-pointer group transition-all duration-500 border-2 sm:border-4 border-white">
            <img 
              src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070" 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000" 
              alt="Cityscape" 
            />
            <div className="absolute inset-0 bg-blue-900/30 group-hover:bg-blue-900/40 transition-colors duration-300" />
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3 sm:gap-4 w-[90%] sm:w-full">
              <div className="bg-white/15 backdrop-blur-xl px-6 sm:px-8 py-3 sm:py-4 rounded-[24px] sm:rounded-[30px] border border-white/20 text-white flex flex-col items-center gap-1.5 sm:gap-2 shadow-2xl group-hover:bg-blue-900/50 transition-all">
                <div className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg font-black tracking-tight text-center">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 animate-bounce" /> 
                  London / Near You
                </div>
                <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[2px] sm:tracking-[4px] opacity-90 text-red-100">Click to explore map</div>
              </div>
            </div>

            <div className="absolute top-4 sm:top-6 left-4 sm:left-8 bg-white/90 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-900" />
            </div>
          </div>
        </div>

        {/* HEADER & SEARCH SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12">
            <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-0">
                    <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-red-900" />
                    <h2 className="text-xl sm:text-2xl font-black text-blue-900 tracking-tight">Find an Agency</h2>
                </div>
                <div className="flex items-start sm:items-center gap-3 bg-slate-50 border-l-4 border-orange-500 py-3 px-4 sm:px-6 rounded-r-xl sm:rounded-r-2xl w-full sm:w-fit mt-3">
                  <Handshake className="text-slate-700 h-5 w-5 shrink-0 mt-0.5 sm:mt-0" />
                  <p className="text-slate-600 font-medium text-xs sm:text-sm leading-relaxed">
                      Discover trusted real estate agencies and connect with professional agents near you.
                  </p>
                </div>
            </div>

            {/* MAIN SEARCH INPUT */}
            <div className="relative max-w-2xl mb-8 sm:mb-10">
                <div className="relative group">
                <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <Input 
                    value={inputs.query}
                    onChange={(e) => setInputs({...inputs, query: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                    placeholder="Agency name, city, or specialty..." 
                    className="h-14 sm:h-16 pl-11 sm:pl-14 pr-[100px] sm:pr-32 rounded-full border-slate-200 bg-white sm:bg-slate-50 text-slate-700 text-sm sm:text-lg shadow-sm sm:shadow-inner focus-visible:ring-orange-500 focus-visible:bg-white transition-all"
                />
                <Button 
                    onClick={handleSearchClick}
                    className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 h-11 sm:h-12 px-4 sm:px-8 rounded-full bg-blue-900 hover:bg-blue-800 text-white font-bold gap-2 transition-all shadow-md"
                >
                    <Search className="h-4 w-4" /> <span className="hidden sm:inline">Search</span>
                </Button>
                </div>
            </div>

            {/* PILL STATS BAR - 2x2 Grid on Mobile, Flex on Desktop */}
            <div className="grid grid-cols-2 lg:flex items-center justify-center lg:justify-between gap-4 sm:gap-6 py-5 px-5 sm:px-10 bg-white border border-slate-100 rounded-[28px] lg:rounded-full shadow-sm mb-8 sm:mb-10">
                {[
                    { label: 'AGENCIES', val: '156', icon: <Building2 className="text-red-900 h-5 w-5 sm:h-6 sm:w-6" />, bg: 'bg-red-50' },
                    { label: 'AGENTS', val: '1,284', icon: <Users className="text-red-900 h-5 w-5 sm:h-6 sm:w-6" />, bg: 'bg-red-50' },
                    { label: 'LISTINGS', val: '3,542', icon: <Home className="text-red-900 h-5 w-5 sm:h-6 sm:w-6" />, bg: 'bg-red-50' },
                    { label: 'AVG RATING', val: '4.8', icon: <Star className="text-red-900 fill-red-900 h-5 w-5 sm:h-6 sm:w-6" />, bg: 'bg-red-50' },
                ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 sm:gap-4">
                    <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full ${s.bg} flex items-center justify-center shrink-0`}>{s.icon}</div>
                    <div>
                      <div className="text-lg sm:text-xl font-black text-slate-900 leading-none">{s.val}</div>
                      <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">{s.label}</div>
                    </div>
                </div>
                ))}
            </div>

            {/* DROPDOWN FILTERS ROW - Responsive Grid */}
            <div className="grid grid-cols-2 lg:flex lg:flex-wrap items-end gap-3 sm:gap-6 mb-10 sm:mb-12">
                <div className="space-y-1.5 col-span-1 lg:w-auto">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 ml-1">
                      <MapPin className="h-3 w-3" /> City
                  </label>
                  <select 
                      value={inputs.city}
                      onChange={(e) => setInputs({...inputs, city: e.target.value})}
                      className="h-11 sm:h-12 w-full px-3 sm:px-4 pr-8 rounded-xl sm:rounded-2xl border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500 lg:min-w-[160px] appearance-none shadow-sm"
                  >
                      <option>All cities</option>
                      <option>New York</option>
                      <option>London</option>
                  </select>
                </div>

                <div className="space-y-1.5 col-span-1 lg:w-auto">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 ml-1">
                      <Sliders className="h-3 w-3" /> Specialty
                  </label>
                  <select 
                      value={inputs.specialty}
                      onChange={(e) => setInputs({...inputs, specialty: e.target.value})}
                      className="h-11 sm:h-12 w-full px-3 sm:px-4 pr-8 rounded-xl sm:rounded-2xl border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500 lg:min-w-[160px] appearance-none shadow-sm"
                  >
                      <option>All specialties</option>
                      <option>Residential</option>
                      <option>Commercial</option>
                      <option>Luxury</option>
                  </select>
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1 lg:w-auto">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 ml-1">
                      <Star className="h-3 w-3" /> Min. Rating
                  </label>
                  <select className="h-11 sm:h-12 w-full px-3 sm:px-4 pr-8 rounded-xl sm:rounded-2xl border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500 lg:min-w-[140px] appearance-none shadow-sm">
                      <option>Any rating</option>
                      <option>4.5+</option>
                      <option>4.0+</option>
                  </select>
                </div>

                <Button 
                    onClick={handleSearchClick}
                    className="col-span-2 sm:col-span-1 lg:w-auto h-11 sm:h-12 w-full px-6 sm:px-8 rounded-xl sm:rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-bold gap-2 lg:ml-auto shadow-lg shadow-blue-100 mt-2 lg:mt-0"
                >
                    <div className="rotate-180"><Sliders className="h-4 w-4" /></div> Update results
                </Button>
            </div>
        </section>

        {/* AGENCIES NEAR YOU SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-red-900" />
              <h2 className="text-xl sm:text-2xl font-black text-blue-900 tracking-tight">Agencies near you</h2>
            </div>
            <Badge className="bg-blue-50 text-blue-900 rounded-lg px-3 py-1 border-none font-bold text-xs self-start sm:self-auto">
              {filteredAgencies.length} agencies
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayedAgencies.map((agency) => (
              <Card key={agency.id} className="rounded-[24px] sm:rounded-[28px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 bg-white group flex flex-col h-full">
                {/* CARD IMAGE & ESTABLISHED BADGE */}
                <div className="h-40 sm:h-48 relative overflow-hidden shrink-0">
                  <img 
                    src={`https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=400&i=${agency.id}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    alt={agency.name} 
                  />
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/95 backdrop-blur-sm text-blue-900 text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold shadow-md flex items-center gap-1.5 border border-slate-100">
                    <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-800" /> Est. {agency.established_year}
                  </div>
                </div>

                <CardContent className="p-5 sm:p-7 flex flex-col flex-1">
                  {/* TITLE & RATING */}
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-blue-900 truncate">
                      {agency.name}
                    </h3>
                    <div className="flex items-center gap-1 text-red-800 font-bold text-xs mt-1 shrink-0 bg-red-50 px-2 py-0.5 rounded-md">
                      <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-red-800" /> {agency.rating}
                    </div>
                  </div>
                  
                  {/* LOCATION */}
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold mb-3 sm:mb-4">
                    <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-900" /> {agency.location}
                  </div>

                  {/* SUBDOMAIN LINK */}
                  <div className="w-fit bg-slate-50 border border-dashed border-slate-200 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold text-slate-500 flex items-center gap-2 mb-4 sm:mb-5">
                    <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-800" /> <span className="truncate max-w-[150px] sm:max-w-none">{agency.slug}.yourdomain.com</span>
                  </div>

                  {/* AGENT/LISTING STATS */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6 pt-4 border-t border-slate-50 text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                      <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-900" /> {agency.agents_count} agents
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                      <Home className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-900" /> {agency.properties_count} listings
                    </div>
                  </div>

                  {/* QUOTE BLOCK */}
                  <div className="bg-blue-50/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-5 sm:mb-6 relative border-l-4 border-red-900 mt-auto">
                     <p className="text-[11px] sm:text-xs text-blue-900/80 leading-relaxed italic font-medium">
                       "{agency.description}"
                     </p>
                  </div>

                  {/* ACTIONS */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-auto">
                    <Button 
                      onClick={() => handleVisitAgency(agency.slug)}
                      variant="outline" 
                      className="w-full rounded-xl sm:rounded-full border-blue-900 text-blue-900 font-black hover:bg-blue-900 hover:text-white h-10 sm:h-11 gap-1.5 sm:gap-2 transition-all shadow-sm text-xs sm:text-sm"
                    >
                      <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Visit
                    </Button>
                    <Button 
                      onClick={() => setSelectedAgency(agency)}
                      className="w-full rounded-xl sm:rounded-full bg-slate-100 hover:bg-slate-200 text-blue-900 font-black border-none h-10 sm:h-11 gap-1.5 sm:gap-2 shadow-none transition-all text-xs sm:text-sm"
                    >
                      <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* NO RESULTS DISPLAY */}
          {displayedAgencies.length === 0 && !loading && (
            <div className="text-center py-12 sm:py-20 bg-white rounded-[24px] sm:rounded-[40px] shadow-sm border border-dashed border-slate-200 px-4">
              <Building2 className="h-12 w-12 sm:h-16 sm:w-16 text-slate-200 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-blue-900">No agencies found</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Try adjusting your filters or location.</p>
            </div>
          )}

          {/* LOAD MORE BUTTON */}
          {displayedAgencies.length < filteredAgencies.length && (
            <div className="flex justify-center mt-8 sm:mt-12">
              <Button 
                onClick={() => setCurrentPage(p => p + 1)} 
                variant="outline" 
                className="rounded-xl sm:rounded-full px-8 sm:px-10 h-12 sm:h-14 font-black border-slate-200 text-blue-900 bg-white hover:bg-slate-50 gap-2 sm:gap-3 shadow-md w-full sm:w-auto text-sm sm:text-base"
              >
                <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-900" /> Load more agencies
              </Button>
            </div>
          )}
        </section>

        {/* CONTACT MODAL */}
        {selectedAgency && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-900/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-[24px] sm:rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
              <div className="p-5 sm:p-8 border-b-4 border-red-900 flex justify-between items-center bg-gray-50 shrink-0">
                <h2 className="text-lg sm:text-2xl font-black text-blue-900 flex items-center gap-2 sm:gap-3">
                  <Mail className="text-red-900 h-5 w-5 sm:h-6 sm:w-6" /> Contact Agency
                </h2>
                <button 
                  onClick={() => setSelectedAgency(null)}
                  className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="text-gray-400 h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
              <div className="p-5 sm:p-8 overflow-y-auto">
                <div className="mb-6 sm:mb-8 p-4 bg-blue-50 rounded-xl sm:rounded-2xl">
                  <h3 className="font-bold text-blue-900 text-base sm:text-lg uppercase">{selectedAgency.name}</h3>
                  <p className="text-xs sm:text-sm text-blue-700/60 font-medium flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" /> {selectedAgency.location}
                  </p>
                </div>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Message Sent!'); setSelectedAgency(null); }}>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase ml-1 sm:ml-2">Full Name</label>
                    <Input placeholder="Enter your name" className="rounded-xl h-11 sm:h-12 bg-gray-50 border-gray-100 focus:ring-red-900 text-sm" required />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase ml-1 sm:ml-2">Email Address</label>
                    <Input type="email" placeholder="email@example.com" className="rounded-xl h-11 sm:h-12 bg-gray-50 border-gray-100 focus:ring-red-900 text-sm" required />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase ml-1 sm:ml-2">Your Message</label>
                    <textarea 
                      className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-100 h-28 sm:h-32 text-sm outline-none focus:ring-2 focus:ring-red-900 transition-all resize-none" 
                      placeholder="I am interested in viewing properties or listing my home with your agency..." 
                      required 
                    />
                  </div>
                  <Button className="w-full h-12 sm:h-14 bg-blue-900 hover:bg-blue-800 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-lg shadow-blue-100 flex gap-2 mt-2">
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" /> Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FindAgency;