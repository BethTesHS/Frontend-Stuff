
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { propertyApi } from '@/services/api';
import { 
  Building, 
  User, 
  CheckCircle, 
  Users,
  ArrowRight,
  Sparkles,
  Star,
  DollarSign,
  Shield,
  Clock,
  Camera,
  Zap,
  Trophy,
  Heart,
  Target
} from 'lucide-react';

const PropertyListingChoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  
  // Get property data from previous page
  const propertyData = location.state?.propertyData;

  if (!propertyData) {
    navigate('/list-property');
    return null;
  }

  const handleSelfManagement = async () => {
    setLoading(true);
    try {
      // Create FormData for multipart/form-data encoding
      const formData = new FormData();
      
      // Add required form fields
      formData.append('title', propertyData.title);
      formData.append('description', propertyData.description);
      formData.append('price', propertyData.price.toString());
      formData.append('bedrooms', propertyData.bedrooms.toString());
      formData.append('bathrooms', propertyData.bathrooms.toString());
      formData.append('receptions', propertyData.receptions.toString());
      formData.append('propertyType', propertyData.propertyType);
      formData.append('listingType', propertyData.listingType);
      formData.append('street', propertyData.street);
      formData.append('city', propertyData.city);
      formData.append('postcode', propertyData.postcode);
      formData.append('county', propertyData.county);
      
      // Add optional fields only if they have values
      if (propertyData.tenure) formData.append('tenure', propertyData.tenure);
      if (propertyData.propertySize) formData.append('property_size', propertyData.propertySize.toString());
      if (propertyData.landSize) formData.append('land_size', propertyData.landSize.toString());
      if (propertyData.energyRating) formData.append('energy_rating', propertyData.energyRating);
      if (propertyData.councilTaxBand) formData.append('council_tax_band', propertyData.councilTaxBand);
      if (propertyData.yearBuilt) formData.append('year_built', propertyData.yearBuilt.toString());
      
      // Add features as JSON string if any selected
      if (propertyData.features && propertyData.features.length > 0) {
        formData.append('features', JSON.stringify(propertyData.features));
      }

      // Add images using the 'images' field name
      if (propertyData.propertyImages) {
        propertyData.propertyImages.forEach((image) => {
          formData.append('images', image);
        });
      }

      // Add documents using the 'documents' field name if any
      if (propertyData.documents) {
        propertyData.documents.forEach((doc) => {
          formData.append('documents', doc);
        });
      }

      // Add management type
      formData.append('management_type', 'self');

      // Submit to API
      const response = await propertyApi.createProperty(formData);
      
      if (response.success) {
        toast.success('Property listed successfully for self-management!');
        navigate('/owner-dashboard', { 
          state: { 
            message: 'Property listed successfully!',
            refresh: true
          }
        });
      } else {
        throw new Error(response.error || 'Failed to create property listing');
      }
    } catch (error: any) {
      console.error('Error listing property:', error);
      toast.error(error.message || 'Failed to list property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAgent = () => {
    navigate('/select-agent', { state: { propertyData } });
  };

  if (loading) {
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Modern Header Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full px-6 py-3 mb-8">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-medium text-gray-700">Property Listing</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight">
              How would you like to list your property?
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Choose the perfect approach for your property listing. Whether you prefer hands-on control or professional expertise, we've got you covered.
            </p>

            {/* Property Summary - Minimalist Design */}
            <div className="bg-white/30 backdrop-blur-lg border border-white/40 rounded-3xl p-8 mb-16 max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Building className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-6">{propertyData.title}</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-blue-600">£{propertyData.price}</div>
                  <div className="text-sm text-gray-600">Price</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-purple-600">{propertyData.propertyType}</div>
                  <div className="text-sm text-gray-600">Type</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-emerald-600">{propertyData.bedrooms}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-teal-600">{propertyData.city}</div>
                  <div className="text-sm text-gray-600">Location</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-indigo-600">{propertyData.listingType}</div>
                  <div className="text-sm text-gray-600">Listing</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-rose-600">Ready</div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
              </div>
            </div>
          </div>

          {/* Two Clear Options - Modern Card Design */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            
            {/* Self-Service Listing */}
            <div className="group relative transform transition-all duration-500 hover:scale-105">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-50 transition duration-500"></div>
              
              {/* Main Card */}
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-8 lg:p-10 hover:bg-white/90 transition-all duration-500 hover:shadow-2xl">
                
                {/* Header with Icon */}
                <div className="text-center mb-8">
                  <div className="relative mx-auto w-20 h-20 mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>
                    <div className="relative w-full h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                      <Zap className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                    Self-Service Listing
                  </h3>
                  
                  <p className="text-lg text-gray-600 leading-relaxed max-w-sm mx-auto">
                    Take complete control and save on costs with our powerful DIY tools
                  </p>
                </div>

                {/* Feature Benefits */}
                <div className="space-y-5 mb-10">
                  {[
                    { icon: DollarSign, text: 'Zero commission fees - Keep 100% of your rental income' },
                    { icon: Target, text: 'Full control over pricing, tenant selection, and communications' },
                    { icon: Clock, text: 'List instantly with our streamlined process' },
                    { icon: Camera, text: 'Professional listing tools and photo enhancement' }
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-4 group/item">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                        <benefit.icon className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-gray-700 font-medium leading-relaxed">{benefit.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button 
                  onClick={handleSelfManagement}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-5 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group/btn"
                >
                  <Zap className="w-5 h-5 mr-2 group-hover/btn:animate-pulse" />
                  Start Self-Service Listing
                  <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
                
                <p className="text-center text-sm text-gray-500 mt-4">
                  Perfect for experienced landlords
                </p>
              </div>
            </div>

            {/* Agent-Assisted Listing */}
            <div className="group relative transform transition-all duration-500 hover:scale-105">
              {/* Most Popular Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center space-x-2">
                  <Star className="w-4 h-4 fill-current" />
                  <span>Most Popular</span>
                </div>
              </div>
              
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-60 transition duration-500"></div>
              
              {/* Main Card */}
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-8 lg:p-10 hover:bg-white/90 transition-all duration-500 hover:shadow-2xl pt-12">
                
                {/* Header with Icon */}
                <div className="text-center mb-8">
                  <div className="relative mx-auto w-20 h-20 mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl transform -rotate-3 group-hover:-rotate-6 transition-transform duration-500"></div>
                    <div className="relative w-full h-full bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl">
                      <Trophy className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    Agent-Assisted Listing
                  </h3>
                  
                  <p className="text-lg text-gray-600 leading-relaxed max-w-sm mx-auto">
                    Professional expertise and full-service support for maximum results
                  </p>
                </div>

                {/* Feature Benefits */}
                <div className="space-y-5 mb-10">
                  {[
                    { icon: Shield, text: 'Professional marketing strategy and premium listing placement' },
                    { icon: Users, text: 'Expert tenant screening and comprehensive background checks' },
                    { icon: Heart, text: 'Stress-free experience with dedicated property management' },
                    { icon: Star, text: 'Higher rental yields through market expertise and optimization' }
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-4 group/item">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                        <benefit.icon className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="text-gray-700 font-medium leading-relaxed">{benefit.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button 
                  onClick={handleRequestAgent}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white py-5 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group/btn"
                >
                  <Trophy className="w-5 h-5 mr-2 group-hover/btn:animate-bounce" />
                  Get Professional Agent
                  <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
                
                <p className="text-center text-sm text-gray-500 mt-4">
                  Recommended for first-time landlords
                </p>
              </div>
            </div>
          </div>

          {/* Compare Options CTA */}
          <div className="text-center mt-16">
            <div className="bg-white/30 backdrop-blur-lg border border-white/40 rounded-2xl p-8 max-w-2xl mx-auto">
              <h4 className="text-xl font-bold text-gray-800 mb-4">Still undecided?</h4>
              <p className="text-gray-600 mb-6">
                Our team can help you choose the best option for your specific situation and property type.
              </p>
              <Button 
                variant="outline" 
                className="bg-white/50 border-gray-300 text-gray-700 hover:bg-white/70 px-8 py-3 rounded-xl font-medium"
                onClick={() => navigate('/contact')}
              >
                Compare Options & Get Help
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyListingChoice;
