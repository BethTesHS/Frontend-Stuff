// src/components/Home/HeroSection.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Search, MapPin } from 'lucide-react';
import { spareRoomApi } from '@/services/spareRoomApi';
import { postcodeApi } from '@/services/postcodeApi';

interface PlatformStats {
  total_active_listings: number;
  total_agents_available: number;
  total_happy_families: number;
  success_rate_percentage: number;
}

const HeroSection = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [listingType, setListingType] = useState('rent');
  const [stats, setStats] = useState<PlatformStats>({
    total_active_listings: 0,
    total_agents_available: 0,
    total_happy_families: 0,
    success_rate_percentage: 0,
  });

  const [suggestions, setSuggestions] = useState<Array<{ value: string; label: string; type: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await spareRoomApi.getPlatformStats();
        if (data) {
          setStats({
            total_active_listings: data.total_active_listings,
            total_agents_available: data.total_agents_available,
            total_happy_families: data.total_happy_families,
            success_rate_percentage: data.success_rate_percentage,
          });
        }
      } catch (error) {
        console.error('Failed to fetch platform stats:', error);
      }
    };
    fetchStats();
  }, []);

  const fetchSuggestions = useCallback(async (searchText: string) => {
    if (searchText.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const postcodeAreaPattern = /^[A-Z]{1,2}[0-9A-Z]{0,3}$/i;
      const isPostcodeFormat = postcodeAreaPattern.test(searchText.trim().replace(/\s/g, ''));

      const results: Array<{ value: string; label: string; type: string }> = [];

      if (isPostcodeFormat) {
        const data = await postcodeApi.autocomplete(searchText);
        if (data.success && data.data) {
          data.data.forEach((pc: string) => results.push({ value: pc, label: pc, type: 'postcode' }));
        }
      }

      const locData = await postcodeApi.locationsAutocomplete(searchText);
      if (locData.success && locData.data) {
        locData.data.forEach((loc: string) => results.push({ value: loc, label: loc, type: 'location' }));
      }

      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  useEffect(() => {
    if (autocompleteTimeoutRef.current) clearTimeout(autocompleteTimeoutRef.current);
    if (location.length >= 2) {
      autocompleteTimeoutRef.current = setTimeout(() => fetchSuggestions(location), 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    return () => { if (autocompleteTimeoutRef.current) clearTimeout(autocompleteTimeoutRef.current); };
  }, [location, fetchSuggestions]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (priceRange) params.set('priceRange', priceRange);
    params.set('listingType', listingType);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <>
      {/* HERO */}
      <section className="relative">
        <div
          className="h-[500px] bg-cover bg-center flex items-center justify-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`
          }}
        >
          <div className="text-center px-4 w-full max-w-5xl z-10 relative">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-4">
              Welcome to Homed
            </h1>
            <p className="text-xl md:text-2xl text-white mb-10">
              Your Trusted Partner in UK Property Search
            </p>

            {/* SEARCH BAR */}
            <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl sm:rounded-full p-4 sm:p-2 shadow-2xl flex flex-col sm:flex-row items-center gap-3 sm:gap-0 border border-white/20 transition-all">

              {/* Input Section */}
              <div className="w-full flex-1 flex items-center sm:px-4 min-w-0 relative">
                <Search className="w-5 h-5 text-gray-400 mr-2 hidden sm:block shrink-0" />
                <div className="flex-1 w-full relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { setShowSuggestions(false); handleSearch(); }
                      if (e.key === 'Escape') setShowSuggestions(false);
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    placeholder="Postcode, City, or Neighborhood"
                    autoComplete="off"
                    className="w-full bg-transparent border border-gray-200 rounded-full shadow-none text-gray-800 text-sm sm:text-base placeholder:text-gray-400 px-4 h-12 outline-none focus:ring-1 focus:ring-gray-200"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto text-left">
                      {suggestions.map((s, i) => (
                        <button
                          key={`${s.type}-${s.value}-${i}`}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => { setLocation(s.value); setShowSuggestions(false); }}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2 text-sm border-b last:border-b-0"
                        >
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="text-gray-800">{s.label}</span>
                          <span className="ml-auto text-xs text-gray-400 capitalize">{s.type}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Filters & Button Section */}
              <div className="w-full sm:w-auto flex items-center gap-3 sm:gap-0 shrink-0 sm:border-l sm:border-gray-200 mt-1 sm:mt-0">

                {/* Price Filter */}
                <div className="flex-1 sm:flex-none">
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="w-full sm:w-40 min-w-max whitespace-nowrap h-12 border border-gray-200 sm:border-0 rounded-full sm:rounded-none shadow-none focus:ring-1 focus:ring-gray-200 sm:focus:ring-0 focus:ring-offset-0 text-gray-700 bg-transparent text-xs sm:text-sm font-medium outline-none [&>span]:line-clamp-none [&>span]:w-full [&>span]:text-center px-4">
                      <SelectValue placeholder="Any Price" />
                    </SelectTrigger>
                    <SelectContent className="text-xs sm:text-sm min-w-max">
                      <SelectItem value="any" className="text-xs sm:text-sm">Any Price</SelectItem>
                      <SelectItem value="0-500" className="text-xs sm:text-sm">£0 - £500</SelectItem>
                      <SelectItem value="500-1000" className="text-xs sm:text-sm">£500 - £1,000</SelectItem>
                      <SelectItem value="1000-2000" className="text-xs sm:text-sm">£1,000 - £2,000</SelectItem>
                      <SelectItem value="2000+" className="text-xs sm:text-sm">£2,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  className="bg-red-600 hover:bg-red-700 text-white h-12 px-6 sm:px-8 rounded-full font-bold transition-all flex items-center justify-center shrink-0 shadow-md sm:shadow-none sm:ml-1"
                >
                  <Search className="w-4 h-4 mr-2 shrink-0" />
                  <span className="inline text-sm sm:text-base">Search</span>
                </button>
              </div>
            </div>

            <div className="mt-8 text-white text-sm flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 font-medium">
              <span className="flex items-center bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <CheckCircle className="w-4 h-4 mr-2 text-green-400" /> Over {stats.total_active_listings}+ Properties
              </span>
              <span className="flex items-center bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <CheckCircle className="w-4 h-4 mr-2 text-green-400" /> Expert Agents Available
              </span>
              <span className="flex items-center bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <CheckCircle className="w-4 h-4 mr-2 text-green-400" /> Personalized Service
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
