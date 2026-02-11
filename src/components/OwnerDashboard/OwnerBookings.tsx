import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Search,
  Filter,
  Eye,
  Loader2,
  Plus,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { ownerDashboardApi, PropertyViewing, propertyApi } from '@/services/api';
import { toast } from 'sonner';

interface ViewingFormData {
  property_id: number;
  scheduled_date: string;
  duration_minutes: number;
  viewing_type: 'in_person' | 'virtual' | 'video_call';
  contact_phone: string;
  special_requirements: string;
  notes: string;
}

export function OwnerBookings() {
  const [bookings, setBookings] = useState<PropertyViewing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<PropertyViewing | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<PropertyViewing | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);

  const [formData, setFormData] = useState<ViewingFormData>({
    property_id: 0,
    scheduled_date: '',
    duration_minutes: 30,
    viewing_type: 'in_person',
    contact_phone: '',
    special_requirements: '',
    notes: ''
  });

  // Fetch viewings and properties on component mount
  useEffect(() => {
    fetchViewings();
    fetchProperties();
  }, [statusFilter]);

  const fetchProperties = async () => {
    try {
      const response = await propertyApi.getMyProperties();
      if (response.success && response.data) {
        setProperties(response.data.properties || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchViewings = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await ownerDashboardApi.getViewings(params);
      if (response.success && response.data) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error('Error fetching viewings:', error);
      toast.error('Failed to load viewings');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const propertyTitle = booking.property?.title || '';
    const propertyAddress = booking.property?.address || '';

    const matchesSearch =
      propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      propertyAddress.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (scheduledDate: string) => {
    const dateObj = new Date(scheduledDate);
    return {
      date: format(dateObj, 'dd MMM yyyy'),
      time: format(dateObj, 'HH:mm'),
      dayOfWeek: format(dateObj, 'EEEE')
    };
  };

  const statusCounts = {
    scheduled: bookings.filter(b => b.status === 'scheduled').length,
    confirmed: 0, // API uses 'scheduled' for confirmed viewings
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  // Form handlers
  const resetForm = () => {
    setFormData({
      property_id: 0,
      scheduled_date: '',
      duration_minutes: 30,
      viewing_type: 'in_person',
      contact_phone: '',
      special_requirements: '',
      notes: ''
    });
  };

  const handleCreateViewing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.property_id || !formData.scheduled_date) {
      toast.error('Please select a property and date/time');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await ownerDashboardApi.createViewing({
        property_id: formData.property_id,
        scheduled_date: formData.scheduled_date,
        duration_minutes: formData.duration_minutes,
        viewing_type: formData.viewing_type,
        contact_phone: formData.contact_phone || undefined,
        special_requirements: formData.special_requirements || undefined,
        notes: formData.notes || undefined
      });

      if (response.success) {
        toast.success('Viewing scheduled successfully!');
        setIsCreateModalOpen(false);
        resetForm();
        fetchViewings();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create viewing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditViewing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    try {
      setIsSubmitting(true);
      const response = await ownerDashboardApi.updateViewing(editingBooking.id, {
        scheduled_date: formData.scheduled_date || undefined,
        duration_minutes: formData.duration_minutes,
        viewing_type: formData.viewing_type,
        contact_phone: formData.contact_phone || undefined,
        special_requirements: formData.special_requirements || undefined,
        notes: formData.notes || undefined
      });

      if (response.success) {
        toast.success('Viewing updated successfully!');
        setIsEditModalOpen(false);
        setEditingBooking(null);
        resetForm();
        fetchViewings();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update viewing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteViewing = async (viewingId: number) => {
    if (!confirm('Are you sure you want to cancel this viewing?')) return;

    try {
      const response = await ownerDashboardApi.deleteViewing(viewingId);
      if (response.success) {
        toast.success('Viewing cancelled successfully');
        fetchViewings();
        setSelectedBooking(null);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel viewing');
    }
  };

  const openEditModal = (booking: PropertyViewing) => {
    setEditingBooking(booking);
    setFormData({
      property_id: booking.property_id,
      scheduled_date: booking.scheduled_date,
      duration_minutes: booking.duration_minutes,
      viewing_type: booking.viewing_type,
      contact_phone: booking.contact_phone || '',
      special_requirements: booking.special_requirements || '',
      notes: booking.notes || ''
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Property Viewings</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-600">
            {filteredBookings.length} total bookings
          </Badge>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Viewing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule New Viewing</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateViewing} className="space-y-4">
                <div>
                  <Label htmlFor="property">Property *</Label>
                  <Select
                    value={formData.property_id.toString()}
                    onValueChange={(value) => setFormData({ ...formData, property_id: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          {property.title} - {property.street}, {property.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="scheduled_date">Date & Time *</Label>
                  <Input
                    id="scheduled_date"
                    type="datetime-local"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="15"
                      max="240"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="viewing_type">Viewing Type</Label>
                    <Select
                      value={formData.viewing_type}
                      onValueChange={(value: any) => setFormData({ ...formData, viewing_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_person">In Person</SelectItem>
                        <SelectItem value="virtual">Virtual Tour</SelectItem>
                        <SelectItem value="video_call">Video Call</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    placeholder="+44 7700 900000"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="special_requirements">Special Requirements</Label>
                  <Textarea
                    id="special_requirements"
                    placeholder="Any special requirements or accessibility needs..."
                    value={formData.special_requirements}
                    onChange={(e) => setFormData({ ...formData, special_requirements: e.target.value })}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about the viewing..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      'Schedule Viewing'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-800">{statusCounts.scheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-800">{statusCounts.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-800">{statusCounts.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-800">{statusCounts.cancelled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search bookings..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Viewing Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading viewings...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const dateTime = formatDateTime(booking.scheduled_date);
                return (
                  <div
                    key={booking.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-800">
                            {booking.property?.title || 'Property Viewing'}
                          </h3>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{booking.property?.address || 'Address not available'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <span>Type: {booking.viewing_type.replace('_', ' ')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Duration: {booking.duration_minutes} minutes</span>
                          </div>
                          {booking.contact_phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{booking.contact_phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-800">
                          {dateTime.dayOfWeek}
                        </div>
                        <div className="text-lg font-semibold text-gray-800">
                          {dateTime.date}
                        </div>
                        <div className="text-sm text-gray-600">
                          {dateTime.time}
                        </div>
                      </div>
                    </div>
                    {(booking.notes || booking.special_requirements) && (
                      <div className="mt-3 pt-3 border-t">
                        {booking.notes && (
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Notes:</strong> {booking.notes}
                          </p>
                        )}
                        {booking.special_requirements && (
                          <p className="text-sm text-gray-600">
                            <strong>Special Requirements:</strong> {booking.special_requirements}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredBookings.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No bookings found</h3>
                  <p className="text-gray-500">
                    {searchTerm || statusFilter !== 'all'
                      ? 'Try adjusting your search filters'
                      : 'No property viewings scheduled at the moment'}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Detail Modal/Card */}
      {selectedBooking && (
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Viewing Details</CardTitle>
              <div className="flex items-center gap-2">
                {selectedBooking.status === 'scheduled' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(selectedBooking)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteViewing(selectedBooking.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={() => setSelectedBooking(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Property Information</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Title:</strong> {selectedBooking.property?.title || 'N/A'}</p>
                  <p><strong>Address:</strong> {selectedBooking.property?.address || 'N/A'}</p>
                  {selectedBooking.property?.property_type && (
                    <p><strong>Type:</strong> {selectedBooking.property.property_type}</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Viewing Details</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Date:</strong> {formatDateTime(selectedBooking.scheduled_date).date}</p>
                  <p><strong>Time:</strong> {formatDateTime(selectedBooking.scheduled_date).time}</p>
                  <p><strong>Duration:</strong> {selectedBooking.duration_minutes} minutes</p>
                  <p><strong>Type:</strong> {selectedBooking.viewing_type.replace('_', ' ')}</p>
                  <p><strong>Status:</strong>
                    <Badge className={`ml-2 ${getStatusColor(selectedBooking.status)}`}>
                      {selectedBooking.status}
                    </Badge>
                  </p>
                </div>
              </div>
              {selectedBooking.contact_phone && (
                <div>
                  <h4 className="font-semibold mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{selectedBooking.contact_phone}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {(selectedBooking.notes || selectedBooking.special_requirements) && (
              <div className="mt-6 pt-6 border-t space-y-3">
                {selectedBooking.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Notes</h4>
                    <p className="text-sm text-gray-600">{selectedBooking.notes}</p>
                  </div>
                )}
                {selectedBooking.special_requirements && (
                  <div>
                    <h4 className="font-semibold mb-2">Special Requirements</h4>
                    <p className="text-sm text-gray-600">{selectedBooking.special_requirements}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Viewing Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Viewing</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditViewing} className="space-y-4">
            <div>
              <Label htmlFor="edit_scheduled_date">Date & Time *</Label>
              <Input
                id="edit_scheduled_date"
                type="datetime-local"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_duration">Duration (minutes)</Label>
                <Input
                  id="edit_duration"
                  type="number"
                  min="15"
                  max="240"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="edit_viewing_type">Viewing Type</Label>
                <Select
                  value={formData.viewing_type}
                  onValueChange={(value: any) => setFormData({ ...formData, viewing_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_person">In Person</SelectItem>
                    <SelectItem value="virtual">Virtual Tour</SelectItem>
                    <SelectItem value="video_call">Video Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit_contact_phone">Contact Phone</Label>
              <Input
                id="edit_contact_phone"
                type="tel"
                placeholder="+44 7700 900000"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="edit_special_requirements">Special Requirements</Label>
              <Textarea
                id="edit_special_requirements"
                placeholder="Any special requirements or accessibility needs..."
                value={formData.special_requirements}
                onChange={(e) => setFormData({ ...formData, special_requirements: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="edit_notes">Notes</Label>
              <Textarea
                id="edit_notes"
                placeholder="Additional notes about the viewing..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingBooking(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Viewing'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}