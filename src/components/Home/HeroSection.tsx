import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PostcodeInput } from '@/components/ui/postcode-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Search } from 'lucide-react';
import { spareRoomApi } from '@/services/spareRoomApi';

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
  const [propertyType, setPropertyType] = useState('');
  const [listingType, setListingType] = useState('rent');
  const [stats, setStats] = useState<PlatformStats>({
    total_active_listings: 0,
    total_agents_available: 0,
    total_happy_families: 0,
    success_rate_percentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (priceRange) params.set('priceRange', priceRange);
    if (propertyType) params.set('type', propertyType);

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
          <div className="text-center px-4 max-w-4xl z-10 relative">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-4">
              Welcome to Homed
            </h1>
            <p className="text-xl md:text-2xl text-white mb-8">
              Your Trusted Partner in UK Property Search
            </p>

            <div className="flex flex-col sm:flex-row w-full max-w-2xl mx-auto bg-white rounded-lg overflow-hidden shadow-xl">
              <div className="flex-grow p-2">
                <PostcodeInput
                  value={location}
                  onChange={setLocation}
                  onAddressFound={(address) => {
                    setLocation(address.city);
                  }}
                  placeholder="Search by City, Neighborhood or Postcode"
                  className="w-full h-full px-4 py-3 focus:outline-none text-gray-700"
                />
              </div>
              <div className="flex">
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="border-l px-4 py-3 focus:outline-none text-gray-700 bg-gray-50">
                    <SelectValue placeholder="Any Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-500">£0 - £500</SelectItem>
                    <SelectItem value="500-1000">£500 - £1,000</SelectItem>
                    <SelectItem value="1000-2000">£1,000 - £2,000</SelectItem>
                    <SelectItem value="2000+">£2,000+</SelectItem>
                  </SelectContent>
                </Select>
                <button
                  onClick={handleSearch}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-medium transition-colors"
                >
                  <Search className="w-4 h-4 mr-2 inline" />
                  Search
                </button>
              </div>
            </div>

            <div className="mt-6 text-white text-sm">
              <span className="mr-4">
                <CheckCircle className="w-4 h-4 mr-1 inline" /> Over {stats.total_active_listings}+ Properties
              </span>
              <span className="mr-4">
                <CheckCircle className="w-4 h-4 mr-1 inline" /> Expert Agents Available
              </span>
              <span>
                <CheckCircle className="w-4 h-4 mr-1 inline" /> Personalized Service
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;