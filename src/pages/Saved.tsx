
import { useState } from 'react';
import { useSavedProperties } from '@/contexts/SavedPropertiesContext';
import Layout from '@/components/Layout/Layout';
import PropertyFilters from '@/components/Properties/PropertyFilters';
import PropertyCard from '@/components/Properties/PropertyCard';
import { SearchFilters } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { MapPin, DollarSign, Filter, X, Bookmark, SortAsc, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const Saved = () => {
  const { savedProperties } = useSavedProperties();
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 5;

  // Filter saved properties based on filters
  const filteredProperties = savedProperties.filter(property => {
    if (searchLocation && !property.address.city.toLowerCase().includes(searchLocation.toLowerCase()) && 
        !property.address.street.toLowerCase().includes(searchLocation.toLowerCase())) {
      return false;
    }
    if (filters.location && !property.address.city.toLowerCase().includes(filters.location.toLowerCase()) && 
        !property.address.street.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.minPrice && property.price < filters.minPrice) return false;
    if (filters.maxPrice && property.price > filters.maxPrice) return false;
    if (filters.bedrooms && property.bedrooms < filters.bedrooms) return false;
    if (filters.propertyType && filters.propertyType.length > 0 && !filters.propertyType.includes(property.type)) return false;
    if (filters.listingType && property.listingType !== filters.listingType) return false;
    
    // Price range filter
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(p => p.replace('+', ''));
      const minPrice = parseInt(min);
      const maxPrice = max ? parseInt(max) : Infinity;
      if (property.price < minPrice || property.price > maxPrice) return false;
    }
    
    return true;
  });

  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'bedrooms':
        return b.bedrooms - a.bedrooms;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const totalCount = sortedProperties.length;
  const totalPages = Math.ceil(totalCount / propertiesPerPage);
  
  // Get properties for current page
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const properties = sortedProperties.slice(startIndex, startIndex + propertiesPerPage);

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
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

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-blue-900 mb-2">
                Saved Properties
              </h1>
              <p className="text-gray-600">
                Keep track of your favorite properties and never lose sight of your dream home.
              </p>
            </div>
            <div className="text-sm font-medium text-blue-900">
              {totalCount} properties saved
            </div>
          </div>

          {savedProperties.length > 0 ? (
            <>
              {/* Filter Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex flex-col lg:flex-row gap-4 mb-4">
                  {/* Search input */}
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    <Input
                      placeholder="Search your saved properties by location..."
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
                        <SelectItem value="0-300000">£0 - £300,000</SelectItem>
                        <SelectItem value="300000-500000">£300,000 - £500,000</SelectItem>
                        <SelectItem value="500000-750000">£500,000 - £750,000</SelectItem>
                        <SelectItem value="750000-1000000">£750,000 - £1,000,000</SelectItem>
                        <SelectItem value="1000000+">£1,000,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full lg:w-48">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-12">
                        <div className="flex items-center">
                          <SortAsc className="w-4 h-4 mr-2 text-gray-400" />
                          <SelectValue placeholder="Sort By" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="bedrooms">Most Bedrooms</SelectItem>
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
                {(Object.keys(filters).length > 0 || priceRange || searchLocation) && (
                  <div className="flex flex-wrap gap-2">
                    {searchLocation && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-50 text-blue-900 px-3 py-1 flex items-center gap-2 border border-blue-200"
                      >
                        <MapPin className="w-3 h-3" />
                        Location: {searchLocation}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-red-600"
                          onClick={() => setSearchLocation('')}
                        />
                      </Badge>
                    )}
                    {priceRange && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-50 text-blue-900 px-3 py-1 flex items-center gap-2 border border-blue-200"
                      >
                        <DollarSign className="w-3 h-3" />
                        Price: £{priceRange.replace('-', ' - £').replace('+', '+')}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-red-600"
                          onClick={() => setPriceRange('')}
                        />
                      </Badge>
                    )}
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
                {properties.map((property) => (
                  <div key={property.id} className="w-full">
                    <PropertyCard
                      property={property}
                      showDeleteOnly={true}
                      showSaleDetails={property.listingType === 'sale'}
                    />
                  </div>
                ))}
              </div>

              {/* Empty filtered state */}
              {properties.length === 0 && totalCount === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">No properties match your filters.</p>
                  <p className="text-gray-500">Try adjusting your search criteria to see more saved properties.</p>
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
            </>
          ) : (
            // Empty state when no properties are saved
            <div className="text-center py-20">
              <div className="max-w-lg mx-auto">
                <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-6" />

                <h3 className="text-2xl font-bold text-gray-900 mb-4">No saved properties yet</h3>
                <p className="text-gray-600 mb-8">
                  Start browsing our collection of properties and save your favorites to create your personal wishlist.
                </p>

                <Link to="/properties">
                  <Button className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 flex items-center gap-2 mx-auto">
                    <Home className="w-5 h-5" />
                    Browse Properties
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Saved;
