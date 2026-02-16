import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import PropertyFilters from '@/components/Properties/PropertyFilters';
import PropertyCard from '@/components/Properties/PropertyCard';
import { SearchFilters, Property } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { MapPin, Filter, X, PoundSterlingIcon } from 'lucide-react';
import { propertyApi } from '@/services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const listingType = searchParams.get('listingType') || searchParams.get('type') === 'rent' ? 'rent' : 'sale';
  
  // Helper to parse filters from URL on initial load
  const parseFiltersFromUrl = (): SearchFilters => {
    const f: SearchFilters = {};
    if (searchParams.get('minPrice')) f.minPrice = Number(searchParams.get('minPrice'));
    if (searchParams.get('maxPrice')) f.maxPrice = Number(searchParams.get('maxPrice'));
    if (searchParams.get('bedrooms')) f.bedrooms = Number(searchParams.get('bedrooms'));
    if (searchParams.get('passportRating')) f.passportRating = Number(searchParams.get('passportRating'));
    
    const types = searchParams.getAll('propertyType');
    if (types.length > 0) f.propertyType = types;
    
    const typeParam = searchParams.get('type') || searchParams.get('listingType');
    if (typeParam === 'sale' || typeParam === 'rent') f.listingType = typeParam;

    return f;
  };

  // Core state
  const [filters, setFilters] = useState<SearchFilters>(parseFiltersFromUrl);
  const [showFilters, setShowFilters] = useState(false);
  
  // SEPARATED: Input vs Search
  const initialLocation = searchParams.get('location') || '';
  const [inputValue, setInputValue] = useState(initialLocation); // What user types
  const [searchLocation, setSearchLocation] = useState(initialLocation); // What filters properties
  
  const [priceRange, setPriceRange] = useState(searchParams.get('priceRange') || '');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [propertiesPerPage, setPropertiesPerPage] = useState(Number(searchParams.get('per_page')) || 10);
  
  // Autocomplete state
  const [suggestions, setSuggestions] = useState<Array<{value: string, label: string, type: string}>>([]); 
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  // Refs
  const autocompleteTimeoutRef = useRef<NodeJS.Timeout>();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ==================== URL SYNCHRONIZATION ====================
  // Update URL whenever search state changes
  useEffect(() => {
    const params = new URLSearchParams();
    
    // Core parameters
    const effectiveType = filters.listingType || listingType;
    if (effectiveType) params.set('type', effectiveType);
    
    if (searchLocation) params.set('location', searchLocation);
    if (priceRange) params.set('priceRange', priceRange);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (propertiesPerPage !== 10) params.set('per_page', propertiesPerPage.toString());

    // Detailed filters
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms.toString());
    if (filters.passportRating) params.set('passportRating', filters.passportRating.toString());
    
    if (filters.propertyType) {
      const types = Array.isArray(filters.propertyType) ? filters.propertyType : [filters.propertyType];
      types.forEach(t => params.append('propertyType', t));
    }

    setSearchParams(params, { replace: true });
  }, [filters, searchLocation, priceRange, currentPage, propertiesPerPage, listingType, setSearchParams]);

  // ==================== AUTOCOMPLETE LOGIC ====================
  const fetchAutocompleteSuggestions = useCallback(async (searchText: string) => {
    if (searchText.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    setIsLoadingSuggestions(true);
    
    try {
      // UK postcode pattern detection
      const postcodePattern = /^[A-Z]{1,2}[0-9R][0-9A-Z]?/i;
      const isPostcodeFormat = postcodePattern.test(searchText.replace(/\s/g, ''));
      
      let results: Array<{value: string, label: string, type: string}> = [];
      
      if (isPostcodeFormat) {
        // POSTCODE SEARCH
        const response = await fetch(`${API_BASE_URL}/api/postcodes/autocomplete?partial=${searchText.replace(/\s/g, '')}`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          results = data.data.map((pc: string) => ({
            value: pc,
            label: `${pc}`,
            type: 'postcode'
          }));
        }
      } else {
        // LOCATION SEARCH (from your database)
        const response = await fetch(`${API_BASE_URL}/api/postcodes/locations/autocomplete?query=${searchText}`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          results = data.data.map((location: string) => ({
            value: location,
            label: `${location}`,
            type: 'location'
          }));
        }
      }
      
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      
    } catch (error) {
      console.error('Autocomplete failed:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // Debounced autocomplete trigger - ONLY for suggestions, NOT search
  useEffect(() => {
    if (autocompleteTimeoutRef.current) {
      clearTimeout(autocompleteTimeoutRef.current);
    }

    if (inputValue.length >= 2) {
      autocompleteTimeoutRef.current = setTimeout(() => {
        fetchAutocompleteSuggestions(inputValue);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (autocompleteTimeoutRef.current) {
        clearTimeout(autocompleteTimeoutRef.current);
      }
    };
  }, [inputValue, fetchAutocompleteSuggestions]);

    // AUTO-SEARCH: Update searchLocation after user stops typing
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      // Only trigger search if input has changed AND is not empty
      if (inputValue !== searchLocation) {
        setSearchLocation(inputValue);
        setCurrentPage(1);
      }
    }, 800); // 800ms delay - adjust if want faster/slower

    return () => clearTimeout(searchTimeout);
  }, [inputValue, searchLocation]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((selected: {value: string, label: string, type: string}) => {
    setInputValue(selected.value);
    setSearchLocation(selected.value); // THIS triggers the property search
    setSuggestions([]);
    setShowSuggestions(false);
    setCurrentPage(1);
    
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Handle Enter key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchLocation(inputValue); // Apply the search
      setSuggestions([]);
      setShowSuggestions(false);
      setCurrentPage(1);
    }
  }, [inputValue]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const searchContainer = searchInputRef.current?.parentElement;
      
      if (searchContainer && !searchContainer.contains(target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==================== PROPERTY SEARCH LOGIC ====================
  // This ONLY triggers when searchLocation changes (not inputValue)
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        
        const propertyTypeArray = Array.isArray(filters.propertyType) ? filters.propertyType : 
                                 filters.propertyType ? [filters.propertyType] : undefined;

        let minPriceFromRange, maxPriceFromRange;
        if (priceRange) {
          const [min, max] = priceRange.split('-').map(p => p.replace('+', '').replace('£', '').replace(',', ''));
          minPriceFromRange = parseInt(min);
          maxPriceFromRange = max ? parseInt(max) : undefined;
        }

        const searchParams = {
          page: currentPage,
          per_page: propertiesPerPage,
          listing_type: filters.listingType || (listingType === 'sale' || listingType === 'rent' ? listingType : undefined),
          location: searchLocation || undefined,
          property_type: propertyTypeArray,
          min_price: filters.minPrice || minPriceFromRange || undefined,
          max_price: filters.maxPrice || maxPriceFromRange || undefined,
          bedrooms: filters.bedrooms || undefined,
          passport_rating: filters.passportRating || undefined,
          status: 'active', // Only show active (public) properties
        };

        const response = await propertyApi.getProperties(searchParams);
        
        if (response.success && response.data && response.data.properties) {
          const transformedProperties = response.data.properties.map((property: any) => ({
            ...property,
            address: {
              street: property.street || '',
              city: property.city || '',
              postcode: property.postcode || '',
              county: property.county || '',
              coordinates: property.coordinates
            },
            // Transform image URLs to match PropertyDetails page logic and ensure HTTPS
            images: property.images && property.images.length > 0
              ? property.images.map((url: string) => {
                  let fixedUrl = url.replace('/api/properties/images/', '/properties/images/');
                  // Ensure HTTPS protocol to avoid mixed content warnings
                  if (fixedUrl.startsWith('http://')) {
                    fixedUrl = fixedUrl.replace('http://', 'https://');
                  }
                  return fixedUrl;
                })
              : (property.primary_image_url
                  ? [(() => {
                      let fixedUrl = property.primary_image_url.replace('/api/properties/images/', '/properties/images/');
                      if (fixedUrl.startsWith('http://')) {
                        fixedUrl = fixedUrl.replace('http://', 'https://');
                      }
                      return fixedUrl;
                    })()]
                  : []),
            listingType: property.listing_type,
            type: property.property_type,
            features: property.features || [],
            id: property.id?.toString() || Math.random().toString(),
          }));

          setProperties(transformedProperties);
          setTotalCount(response.data.pagination?.total || 0);
          setTotalPages(response.data.pagination?.pages || 1);
        } else {
          setProperties([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        setProperties([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [currentPage, listingType, searchLocation, priceRange, filters, propertiesPerPage]);
  
  // ==================== EVENT HANDLERS ====================
  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    // If the filters component set a location, update our main location state too
    if (newFilters.location) {
      setSearchLocation(newFilters.location);
      setInputValue(newFilters.location);
    }
    setCurrentPage(1);
  };

  const removeFilter = (filterKey: string) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey as keyof SearchFilters];
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePropertiesPerPageChange = (value: string) => {
    setPropertiesPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setInputValue('');
    setSearchLocation('');
    setPriceRange('');
    setCurrentPage(1);
  };

  // ==================== RENDER ====================
  if (loading && properties.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-blue-900 mb-2">
                {filters.listingType === 'rent' || (!filters.listingType && listingType === 'rent') 
                  ? 'Properties for Rent' 
                  : 'Houses for Sale'}
              </h1>
              <p className="text-gray-600">
                {filters.listingType === 'rent' || (!filters.listingType && listingType === 'rent')
                  ? 'Find your perfect rental property'
                  : 'Find your perfect home to buy with detailed property information'
                }
              </p>
            </div>
            <div className="text-sm font-medium text-blue-900">
              {totalCount} properties found
            </div>
          </div>
        
          {/* Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              {/* Search input with autocomplete */}
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                <Input
                  ref={searchInputRef}
                  placeholder="Please enter location or postcode (press Enter to search)"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => {
                    if (suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  className="pl-10 h-12 pr-10"
                  autoComplete="off"
                />
                {isLoadingSuggestions && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <div className="animate-spin h-4 w-4 border-2 border-gray-300 rounded-full border-t-red-600"></div>
                  </div>
                )}
  
                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto mt-1">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={`${suggestion.type}-${suggestion.value}-${index}`}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-3 text-red-600" />
                            <span className="font-medium text-gray-900">{suggestion.value}</span>
                          </div>
                          <span className="text-xs text-gray-500 capitalize">{suggestion.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price dropdown */}
              <div className="w-full lg:w-48">
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="h-12">
                    <div className="flex items-center">
                      <PoundSterlingIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <SelectValue placeholder="Price Range" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-300000">£0 - £300,000</SelectItem>
                    <SelectItem value="300000-500000">£300,000 - £500,000</SelectItem>
                    <SelectItem value="500000-750000">£500,000 - £750,000</SelectItem>
                    <SelectItem value="750000-1000000">£750,000 - £1,000,000</SelectItem>
                    <SelectItem value="1000000+">£1,000,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                
              <div className="w-full lg:w-40">
                <Select value={propertiesPerPage.toString()} onValueChange={handlePropertiesPerPageChange}>
                  <SelectTrigger className="h-12">
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-2">View:</span>
                      <SelectValue>{propertiesPerPage} Per Page</SelectValue>
                    </div>
                  </SelectTrigger> 
                  <SelectContent>
                    <SelectItem value="5">5 Per Page</SelectItem>
                    <SelectItem value="15">15 Per Page</SelectItem>
                    <SelectItem value="25">25 Per Page</SelectItem>
                    <SelectItem value="50">50 Per Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filters button */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-12 px-6 flex items-center gap-2 border-blue-900 ${showFilters ? 'bg-blue-900 text-white' : 'text-blue-900'} hover:bg-blue-900 hover:text-white`}
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'More Filters'}
              </Button>
            </div>
      
            {/* Filter pills */}
            {Object.keys(filters).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => (
                  value && (
                    <Badge
                      key={key}
                      variant="secondary"
                      className="bg-blue-50 text-blue-900 px-3 py-1 flex items-center gap-2 border border-blue-200"
                    >
                      {key}: {String(value)}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-600"
                        onClick={() => removeFilter(key)}
                      />
                    </Badge>
                  )
                ))}
              </div>
            )}
          </div>

          {/* Advanced filters panel */}
          {showFilters && (
            <div className="mb-8">
              <PropertyFilters filters={filters} onFiltersChange={handleFiltersChange} />
            </div>
          )}

          {/* Property Cards */}
          <div className="space-y-6 mb-8">
            {properties.map((property: Property) => (
              <div key={property.id} className="w-full">
                <PropertyCard 
                  property={property} 
                  showSaleDetails={filters.listingType === 'sale' || (!filters.listingType && listingType === 'sale')} 
                />
              </div>
            ))}
          </div>

          {/* Empty state */}
          {properties.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No properties found matching your criteria.</p>
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              >
                Clear All Filters
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
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
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
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
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

export default Properties;