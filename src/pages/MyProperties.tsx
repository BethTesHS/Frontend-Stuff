import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building, 
  Edit, 
  Eye, 
  MapPin, 
  Bed, 
  Bath, 
  Home,
  DollarSign,
  Plus,
  Calendar,
  Search,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { propertyApi } from '@/services/api';
import { toast } from 'sonner';
import { PropertyToggle } from '@/components/Properties/PropertyToggle';

// Backend API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://homedapp1.azurewebsites.net/api';
// Extract base URL without /api suffix for image URLs
const BASE_URL = API_BASE_URL.replace('/api', '');

interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  listing_type: string;
  street: string;
  city: string;
  postcode: string;
  county?: string;
  status: string;
  created_at: string;
  updated_at: string;
  primary_image_url?: string;
  image_count?: number;
  square_footage?: number;
  land_size?: number;
  year_built?: number;
  features?: string[];
}

const MyProperties = () => {
  const navigate = useNavigate();
  const { loading: authLoading, hasAccess, user } = useAuthGuard(['owner', 'agent'], false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Property>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 4;

  // Fetch user's properties
  useEffect(() => {
    const fetchMyProperties = async () => {
      if (!user || !hasAccess) return;
      
      try {
        setLoading(true);
        const response = await propertyApi.getMyProperties({
          page: 1,
          per_page: 50, // Get all properties for now
          status: statusFilter !== 'all' ? statusFilter : undefined
        });
        
        if (response.success && response.data) {
          setProperties(response.data.properties);
        } else {
          toast.error('Failed to load properties');
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast.error('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    fetchMyProperties();
  }, [user, hasAccess, statusFilter]);

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property);
    setEditFormData({
      title: property.title,
      description: property.description,
      price: property.price,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      street: property.street,
      city: property.city,
      postcode: property.postcode,
    });
    setEditDialogOpen(true);
  };

  const handleSaveProperty = async () => {
    if (!selectedProperty) return;

    try {
      const response = await propertyApi.updateProperty(selectedProperty.id, editFormData);

      if (response.success && response.data) {
        // Update the property in the list
        setProperties(prev => prev.map(p =>
          p.id === selectedProperty.id
            ? { ...p, ...response.data.property }
            : p
        ));
        setEditDialogOpen(false);
        setSelectedProperty(null);
        toast.success('Property updated successfully');
      } else {
        toast.error(response.error || 'Failed to update property');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update property');
    }
  };

  const handleStatusChange = (propertyId: number, newStatus: string) => {
    setProperties(prev =>
      prev.map(p => p.id === propertyId ? { ...p, status: newStatus } : p)
    );
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = searchTerm === '' || 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.postcode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const endIndex = startIndex + propertiesPerPage;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
        <div className="px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/agent-dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  My Properties
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage your property listings and track their performance
                </p>
              </div>
            </div>
            <Link to="/list-property">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add New Property
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/20 backdrop-blur-sm border border-white/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">{properties.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/20 backdrop-blur-sm border border-white/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">
                  {properties.filter(p => p.status === 'active').length}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/20 backdrop-blur-sm border border-white/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Draft Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">
                  {properties.filter(p => p.status === 'draft').length}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/20 backdrop-blur-sm border border-white/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Sold/Rented</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">
                  {properties.filter(p => p.status === 'sold' || p.status === 'rented').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Properties List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No properties found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start by adding your first property listing'
                }
              </p>
              <Link to="/list-property">
                <Button>Add Your First Property</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-6">
                {currentProperties.map((property) => (
                <Card key={property.id} className="bg-white/20 backdrop-blur-sm border border-white/30 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Property Image */}
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                         {property.primary_image_url ? (
                          <img 
                            src={`${BASE_URL}${property.primary_image_url}`} 
                            alt={property.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                         ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home className="w-8 h-8 text-gray-400" />
                          </div>
                         )}
                      </div>

                      {/* Property Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-2 mb-2">
                          <div className="flex items-start justify-between">
                            <h3 className="text-lg font-semibold text-gray-800 truncate">
                              {property.title}
                            </h3>
                            <Badge
                              variant={property.status === 'active' ? 'default' : 'secondary'}
                              className="ml-2"
                            >
                              {property.status}
                            </Badge>
                          </div>
                          <PropertyToggle
                            propertyId={property.id.toString()}
                            currentStatus={property.status}
                            onStatusChange={(newStatus) => handleStatusChange(property.id, newStatus)}
                          />
                        </div>

                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">
                            {property.street}, {property.city} {property.postcode}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Bed className="w-4 h-4 mr-1" />
                            {property.bedrooms} bed
                          </div>
                          <div className="flex items-center">
                            <Bath className="w-4 h-4 mr-1" />
                            {property.bathrooms} bath
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            £{property.price.toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(property.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        {property.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {property.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProperty(property)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Link to={`/property/${property.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-4">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredProperties.length)} of {filteredProperties.length} properties
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Edit Property Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Property</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (£)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={editFormData.price || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={editFormData.bedrooms || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, bedrooms: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={editFormData.street || ''}
                  readOnly
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={editFormData.city || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input
                    id="postcode"
                    value={editFormData.postcode || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, postcode: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProperty}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default MyProperties;