import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Room, RoomFilters as RoomFiltersType } from '@/types/room';
import { spareRoomApi } from '@/services/spareRoomApi';
import RoomCard from '@/components/Rooms/RoomCard';
import RoomFilters from '@/components/Rooms/RoomFilters';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { 
  MapPin,
  DollarSign,
  Filter,
  X,
  Home
} from 'lucide-react';

const Rooms = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Helper to parse filters from URL on initial load
  const parseFiltersFromUrl = (): RoomFiltersType => {
    const f: RoomFiltersType = {};
    
    // Numeric filters
    if (searchParams.get('minRent')) f.min_rent = Number(searchParams.get('minRent'));
    if (searchParams.get('maxRent')) f.max_rent = Number(searchParams.get('maxRent'));
    
    // Array filters
    const types = searchParams.getAll('roomType');
    if (types.length > 0) f.room_type = types;

    // Boolean filters
    if (searchParams.get('furnished') === 'true') f.furnished = true;
    if (searchParams.get('billsIncluded') === 'true') f.bills_included = true;
    
    // Date filter
    if (searchParams.get('availableFrom')) f.available_from = searchParams.get('availableFrom')!;

    // Preferences
    const gender = searchParams.get('gender');
    const smoking = searchParams.get('smoking') === 'true';
    const pets = searchParams.get('pets') === 'true';

    if (gender || smoking || pets) {
      f.preferences = {};
      if (gender) f.preferences.gender = gender as 'male' | 'female' | 'any';
      if (smoking) f.preferences.smoking = true;
      if (pets) f.preferences.pets = true;
    }

    // Location from URL is primarily handled by searchLocation state, 
    // but we check if it's in filter params too
    if (searchParams.get('location')) {
      f.location = searchParams.get('location')!;
    }

    return f;
  };

  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [filters, setFilters] = useState<RoomFiltersType>(parseFiltersFromUrl);
  const [searchLocation, setSearchLocation] = useState(searchParams.get('location') || '');
  const [priceRange, setPriceRange] = useState(searchParams.get('priceRange') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const roomsPerPage = 5;

  // URL Synchronization
  useEffect(() => {
    const params = new URLSearchParams();

    // Core params
    if (searchLocation) params.set('location', searchLocation);
    if (priceRange) params.set('priceRange', priceRange);
    if (currentPage > 1) params.set('page', currentPage.toString());

    // Detailed filters
    if (filters.min_rent) params.set('minRent', filters.min_rent.toString());
    if (filters.max_rent) params.set('maxRent', filters.max_rent.toString());
    if (filters.room_type) filters.room_type.forEach(t => params.append('roomType', t));
    
    if (filters.furnished) params.set('furnished', 'true');
    if (filters.bills_included) params.set('billsIncluded', 'true');
    if (filters.available_from) params.set('availableFrom', filters.available_from);

    // Preferences
    if (filters.preferences?.gender && filters.preferences.gender !== 'any') {
      params.set('gender', filters.preferences.gender);
    }
    if (filters.preferences?.smoking) params.set('smoking', 'true');
    if (filters.preferences?.pets) params.set('pets', 'true');

    setSearchParams(params, { replace: true });
  }, [filters, searchLocation, priceRange, currentPage, setSearchParams]);

  // Load rooms from API
  useEffect(() => {
    const loadRooms = async () => {
      setLoading(true);
      try {
        const response = await spareRoomApi.getSpareRooms();
        // Convert SpareRoomData to Room format if needed
        const convertedRooms = (response || [])
          .filter(room => room && room.id) // Filter out invalid rooms
          .map(room => ({
            id: typeof room.id === 'string' ? room.id : String(room.id || ''),
            title: room.title || '',
            description: room.description || '',
            rent: room.rent || 0,
            deposit: room.deposit || 0,
            available_from: room.available_from || new Date().toISOString().split('T')[0],
            property_address: room.property_address || '',
            room_type: room.room_type || 'single',
            size_sqft: room.size_sqft || 0,
            furnished: room.furnished ?? false,
            bills_included: room.bills_included ?? false,
            internet_included: room.internet_included ?? false,
            parking_available: room.parking_available ?? false,
            garden_access: room.garden_access ?? false,
            images: room.images && room.images.length > 0 ? room.images : ['/placeholder.svg'],
            landlord_name: room.contact_name || 'Contact',
            landlord_email: room.contact_email || '',
            landlord_phone: room.contact_phone || '',
            preferences: room.preferences || {
              gender: 'any',
              age_range: '18-50',
              profession: ['Any'],
              smoking: false,
              pets: false
            },
            house_rules: room.house_rules || [],
            current_housemates: room.current_housemates || 0,
            total_housemates: room.total_housemates || 1,
            nearest_station: room.nearest_station || '',
            transport_links: room.transport_links || [],
            created_at: room.created_at || new Date().toISOString(),
            updated_at: room.updated_at || new Date().toISOString()
          }));
        setRooms(convertedRooms);
        setTotalCount(convertedRooms.length);
      } catch (error) {
        console.error('Error loading rooms:', error);
        setRooms([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  // Apply filters and pagination
  useEffect(() => {
    let filtered = rooms;

    // Location filter
    if (searchLocation || filters.location) {
      const searchTerm = (searchLocation || filters.location || '').toLowerCase();
      filtered = filtered.filter(room => 
        room.property_address.toLowerCase().includes(searchTerm) ||
        room.transport_links.some(link => link.toLowerCase().includes(searchTerm))
      );
    }

    // Price range filter from dropdown
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(p => p.replace('+', '').replace('£', '').replace(',', ''));
      const minPrice = parseInt(min);
      const maxPrice = max ? parseInt(max) : undefined;
      
      filtered = filtered.filter(room => {
        if (maxPrice) {
          return room.rent >= minPrice && room.rent <= maxPrice;
        } else {
          return room.rent >= minPrice;
        }
      });
    }

    // Price range filter from advanced filters
    if (filters.min_rent) {
      filtered = filtered.filter(room => room.rent >= filters.min_rent!);
    }
    if (filters.max_rent) {
      filtered = filtered.filter(room => room.rent <= filters.max_rent!);
    }

    // Room type filter
    if (filters.room_type && filters.room_type.length > 0) {
      filtered = filtered.filter(room => filters.room_type!.includes(room.room_type));
    }

    // Furnished filter
    if (filters.furnished === true) {
      filtered = filtered.filter(room => room.furnished);
    }

    // Bills included filter
    if (filters.bills_included === true) {
      filtered = filtered.filter(room => room.bills_included);
    }

    // Available from filter
    if (filters.available_from) {
      filtered = filtered.filter(room => 
        new Date(room.available_from) >= new Date(filters.available_from!)
      );
    }

    // Preference filters
    if (filters.preferences?.gender && filters.preferences.gender !== 'any') {
      filtered = filtered.filter(room => 
        !room.preferences.gender || 
        room.preferences.gender === 'any' || 
        room.preferences.gender === filters.preferences!.gender
      );
    }

    if (filters.preferences?.smoking === true) {
      filtered = filtered.filter(room => room.preferences.smoking !== false);
    }

    if (filters.preferences?.pets === true) {
      filtered = filtered.filter(room => room.preferences.pets !== false);
    }

    // Update total count and pages
    setTotalCount(filtered.length);
    setTotalPages(Math.ceil(filtered.length / roomsPerPage));

    // Apply pagination
    const startIndex = (currentPage - 1) * roomsPerPage;
    const endIndex = startIndex + roomsPerPage;
    setFilteredRooms(filtered.slice(startIndex, endIndex));

  }, [rooms, filters, searchLocation, priceRange, currentPage]);

  const handleFiltersChange = (newFilters: RoomFiltersType) => {
    setFilters(newFilters);
    // Sync location if set inside detailed filters
    if (newFilters.location) {
      setSearchLocation(newFilters.location);
    }
    setCurrentPage(1);
  };

  const removeFilter = (filterKey: string) => {
    const newFilters = { ...filters };
    if (filterKey === 'location') {
      setSearchLocation('');
      delete newFilters.location;
    } else if (filterKey === 'price') {
      setPriceRange('');
    } else if (filterKey.startsWith('preferences.')) {
      const prefKey = filterKey.split('.')[1];
      if (newFilters.preferences) {
        newFilters.preferences = { ...newFilters.preferences };
        delete newFilters.preferences[prefKey as keyof typeof newFilters.preferences];
      }
    } else {
      delete newFilters[filterKey as keyof RoomFiltersType];
    }
    setFilters(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
    setSearchLocation('');
    setPriceRange('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const getActiveFilters = () => {
    const activeFilters: Array<{ key: string; label: string }> = [];

    if (searchLocation || filters.location) {
      activeFilters.push({
        key: 'location',
        label: `Location: ${searchLocation || filters.location}`
      });
    }

    if (priceRange) {
      const [min, max] = priceRange.split('-').map(p => p.replace('+', '').replace('£', '').replace(',', ''));
      const maxLabel = max ? ` - £${parseInt(max).toLocaleString()}` : '+';
      activeFilters.push({
        key: 'price',
        label: `£${parseInt(min).toLocaleString()}${maxLabel}`
      });
    } else if (filters.min_rent || filters.max_rent) {
      const min = filters.min_rent || 0;
      const max = filters.max_rent || '∞';
      activeFilters.push({
        key: 'rent',
        label: `£${min} - £${max}`
      });
    }

    if (filters.room_type && filters.room_type.length > 0) {
      activeFilters.push({
        key: 'room_type',
        label: `Type: ${filters.room_type.join(', ')}`
      });
    }

    if (filters.furnished) {
      activeFilters.push({
        key: 'furnished',
        label: 'Furnished'
      });
    }

    if (filters.bills_included) {
      activeFilters.push({
        key: 'bills_included',
        label: 'Bills included'
      });
    }

    if (filters.available_from) {
      activeFilters.push({
        key: 'available_from',
        label: `Available from: ${new Date(filters.available_from).toLocaleDateString()}`
      });
    }

    return activeFilters;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
        </div>
      </Layout>
    );
  }

  const activeFilters = getActiveFilters();

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          {/* Two-column header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-blue-900 mb-2">
                Rooms for Rent
              </h1>
              <p className="text-gray-600">
                Find your perfect room in a shared house
              </p>
            </div>
            <div className="text-sm font-medium text-blue-900">
              {totalCount} room{totalCount !== 1 ? 's' : ''} found
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            {/* Top row */}
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              {/* Search input */}
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Enter location, neighborhood, or transport links..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              {/* Price dropdown */}
              <div className="w-full lg:w-48">
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="h-12">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                      <SelectValue placeholder="Price Range" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-400">£0 - £400</SelectItem>
                    <SelectItem value="400-600">£400 - £600</SelectItem>
                    <SelectItem value="600-800">£600 - £800</SelectItem>
                    <SelectItem value="800-1000">£800 - £1,000</SelectItem>
                    <SelectItem value="1000+">£1,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filters button */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 px-6 flex items-center gap-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
              >
                <Filter className="w-4 h-4" />
                More Filters
              </Button>
            </div>

            {/* Filter pills */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <Badge
                    key={filter.key}
                    variant="secondary"
                    className="bg-blue-50 text-blue-900 px-3 py-1 flex items-center gap-2 border border-blue-200"
                  >
                    {filter.label}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-600"
                      onClick={() => removeFilter(filter.key)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Advanced filters panel */}
          {showFilters && (
            <div className="mb-8">
              <RoomFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClose={() => setShowFilters(false)}
              />
            </div>
          )}

          {/* Room Cards - Single Column */}
          <div className="space-y-6 mb-8">
            {filteredRooms.map((room) => (
              <div key={room.id} className="w-full">
                <RoomCard room={room} />
              </div>
            ))}
          </div>

          {/* Empty state */}
          {filteredRooms.length === 0 && !loading && (
            <div className="text-center py-12">
              <Home className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">No rooms found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search criteria
              </p>
              <Button
                onClick={clearAllFilters}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Clear all filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={handlePreviousPage}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={handleNextPage}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Rooms;