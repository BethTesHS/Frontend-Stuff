
import { Link } from 'react-router-dom';
import { Bed, Bath, Star } from 'lucide-react';
import { useSavedProperties } from '@/contexts/SavedPropertiesContext';
import { Property } from '@/types';
import { propertyApi } from '@/services/api';
import { useState, useEffect } from 'react';

const FeaturedProperties = () => {
  const { isPropertySaved, addSavedProperty, removeSavedProperty } = useSavedProperties();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true);

        // Try to fetch featured properties first - limit to 4
        const featuredResponse = await propertyApi.getFeaturedProperties(4);

        if (featuredResponse.success && featuredResponse.data && featuredResponse.data.properties.length > 0) {
          // Transform featured properties - take only first 4
          const transformedFeatured = featuredResponse.data.properties.slice(0, 4).map((property: any) => {
            let images = [];
            if (property.images && property.images.length > 0) {
              images = property.images.map((img: any) =>
                typeof img === 'string' ? img : img?.image_url || img?.url || img
              );
            } else if (property.primary_image_url) {
              images = [property.primary_image_url];
            }

            return {
              ...property,
              address: {
                street: property.street || '',
                city: property.city || '',
                postcode: property.postcode || '',
                county: property.county || '',
                coordinates: property.coordinates
              },
              images,
              listingType: property.listing_type,
              type: property.property_type,
              features: property.features || [],
              id: property.id?.toString(),
              passportRating: property.passport_rating,
            };
          });
          
          setProperties(transformedFeatured);
        } else {
          // If no featured properties, fallback to latest properties - limit to 4
          console.log('No featured properties found, fetching latest properties instead');
          const generalResponse = await propertyApi.getProperties({ per_page: 4 });

          if (generalResponse.success && generalResponse.data) {
            // Transform backend property format to frontend format - take only first 4
            const transformedProperties = generalResponse.data.properties.slice(0, 4).map((property: any) => {
              let images = [];
              if (property.images && property.images.length > 0) {
                images = property.images.map((img: any) =>
                  typeof img === 'string' ? img : img?.image_url || img?.url || img
                );
              } else if (property.primary_image_url) {
                images = [property.primary_image_url];
              }

              return {
                ...property,
                address: {
                  street: property.street || '',
                  city: property.city || '',
                  postcode: property.postcode || '',
                  county: property.county || '',
                  coordinates: property.coordinates
                },
                images,
                listingType: property.listing_type,
                type: property.property_type,
                features: property.features || [],
                id: property.id?.toString(),
                passportRating: property.passport_rating,
              };
            });
            
            setProperties(transformedProperties);
          } else {
            throw new Error('No properties found');
          }
        }
      } catch (error) {
        console.error('Error fetching featured properties:', error);
        // Don't set empty array, let error be visible
        throw error;
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  console.log('FeaturedProperties: Current properties:', properties);

  const handleLikeToggle = (property: Property, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isPropertySaved(property.id)) {
      removeSavedProperty(property.id);
    } else {
      addSavedProperty(property);
    }
  };

  const [activeTab, setActiveTab] = useState<'new' | 'featured' | 'open'>('new');

  return (
    <section id="listings" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <h2 className="text-3xl md:text-4xl font-serif text-center mb-4 text-blue-900">
        Featured Home Listings
      </h2>
      <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
        Discover your dream home in the UK's most desirable neighborhoods
      </p>

      {/* Tabs */}
      <div className="flex justify-center mb-10 space-x-2">
        <button
          className={`px-5 py-2 text-sm rounded-lg font-medium ${
            activeTab === 'new'
              ? 'bg-red-700 text-white'
              : 'border border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('new')}
        >
          New Listings
        </button>
        <button
          className={`px-5 py-2 text-sm rounded-lg font-medium ${
            activeTab === 'featured'
              ? 'bg-red-700 text-white'
              : 'border border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('featured')}
        >
          Featured Listings
        </button>
        <button
          className={`px-5 py-2 text-sm rounded-lg font-medium ${
            activeTab === 'open'
              ? 'bg-red-700 text-white'
              : 'border border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('open')}
        >
          Open Houses
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          // Loading skeleton
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="border rounded-lg overflow-hidden bg-white shadow-sm animate-pulse">
              <div className="h-56 bg-gray-300" />
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-300 rounded w-3/4" />
                <div className="h-4 bg-gray-300 rounded w-1/2" />
                <div className="h-4 bg-gray-300 rounded" />
              </div>
            </div>
          ))
        ) : properties.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No properties available at the moment.</p>
          </div>
        ) : (
          properties.slice(0, 4).map((property: Property) => {
            const primaryImage = property.images?.[0] || property.primary_image_url || '/placeholder.svg';
            const isFeatured = property.passportRating >= 8;

            return (
              <Link key={property.id} to={`/property/${property.id}`}>
                <div className="property-card-new border rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="relative">
                    <img
                      src={primaryImage}
                      alt={property.title}
                      className="w-full h-56 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    {isFeatured && (
                      <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded">
                        FEATURED
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-blue-900">{property.address.street}</p>
                    <p className="text-gray-600 text-sm mb-3">
                      {property.address.city}, {property.address.postcode}
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex space-x-4">
                        <span>
                          <Bed className="w-4 h-4 text-gray-500 inline mr-1" />
                          {property.bedrooms} Beds
                        </span>
                        <span>
                          <Bath className="w-4 h-4 text-gray-500 inline mr-1" />
                          {property.bathrooms} Baths
                        </span>
                      </div>
                      <span className="font-bold text-blue-900 text-lg">£{property.price.toLocaleString()}</span>
                    </div>
                    <button className="w-full mt-4 bg-blue-900 hover:bg-blue-800 text-white py-2 rounded text-sm font-medium transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      <div className="text-center mt-12">
        <Link to="/properties">
          <button className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-3 rounded-lg font-medium transition-colors">
            View All Listings →
          </button>
        </Link>
      </div>
    </section>
  );
};

export default FeaturedProperties;
