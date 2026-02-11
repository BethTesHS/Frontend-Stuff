import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Phone,
  Mail,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { agencyViewingsApi, Viewing as ApiViewing } from '@/services/agencyApi';

interface Viewing extends Omit<ApiViewing, 'viewing_date' | 'viewing_time' | 'duration_minutes'> {
  propertyTitle?: string;
  propertyAddress?: string;
  agentName?: string;
  agentAvatar?: string;
  date: Date;
  time: string;
  duration: number;
  propertyImage?: string;
}

export function AgencyViewings() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewType, setViewType] = useState<'calendar' | 'list'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const itemsPerPage = 3;

  const [newViewing, setNewViewing] = useState({
    propertyTitle: '',
    propertyAddress: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    agentName: '',
    date: new Date(),
    time: '',
    duration: 30,
    notes: ''
  });

  // Fetch viewings from backend
  useEffect(() => {
    fetchViewings();
  }, [filterStatus]);

  const fetchViewings = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }

      const response = await agencyViewingsApi.getAll(params);

      // Transform API data to match component interface
      const transformedViewings: Viewing[] = (response.viewings || []).map((v: ApiViewing) => ({
        ...v,
        propertyTitle: v.property_id, // You may need to fetch property details separately
        propertyAddress: '',
        agentName: v.agent_id,
        date: new Date(v.viewing_date),
        time: v.viewing_time,
        duration: v.duration_minutes || 30,
        clientName: v.client_name,
        clientEmail: v.client_email,
        clientPhone: v.client_phone,
      }));

      setViewings(transformedViewings);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch viewings');
      console.error('Error fetching viewings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredViewings = viewings.filter(viewing => {
    const matchesSearch = (viewing.propertyTitle && viewing.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         viewing.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (viewing.agentName && viewing.agentName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || viewing.status === filterStatus;
    const matchesDate = !selectedDate || viewing.date.toDateString() === selectedDate.toDateString();
    
    return matchesSearch && matchesStatus && (viewType === 'list' || matchesDate);
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredViewings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedViewings = filteredViewings.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleFiltersChange = () => {
    setCurrentPage(1);
  };

  const handleAddViewing = async () => {
    if (!newViewing.propertyTitle || !newViewing.clientName || !newViewing.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await agencyViewingsApi.create({
        property_id: newViewing.propertyTitle, // Should be property ID
        client_name: newViewing.clientName,
        client_email: newViewing.clientEmail,
        client_phone: newViewing.clientPhone,
        viewing_date: format(newViewing.date, 'yyyy-MM-dd'),
        viewing_time: newViewing.time,
        duration_minutes: newViewing.duration,
        notes: newViewing.notes,
      });

      await fetchViewings();
      setNewViewing({
        propertyTitle: '',
        propertyAddress: '',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        agentName: '',
        date: new Date(),
        time: '',
        duration: 30,
        notes: ''
      });
      setIsAddDialogOpen(false);
      toast.success('Viewing scheduled successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule viewing');
      console.error('Error scheduling viewing:', error);
    }
  };

  const updateViewingStatus = async (viewingId: string, status: Viewing['status']) => {
    try {
      await agencyViewingsApi.updateStatus(viewingId, status);
      await fetchViewings();
      toast.success(`Viewing ${status}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update viewing status');
      console.error('Error updating viewing status:', error);
    }
  };

  const deleteViewing = (viewingId: string) => {
    setViewings(viewings.filter(viewing => viewing.id !== viewingId));
    toast.success('Viewing deleted');
  };

  const getStatusColor = (status: Viewing['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'confirmed': return 'bg-green-500';
      case 'completed': return 'bg-purple-500';
      case 'cancelled': return 'bg-red-500';
      case 'no-show': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: Viewing['status']) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'no-show': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const stats = {
    total: viewings.length,
    today: viewings.filter(v => v.date.toDateString() === new Date().toDateString()).length,
    upcoming: viewings.filter(v => v.date >= new Date() && v.status !== 'completed').length,
    completed: viewings.filter(v => v.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Viewings</h1>
          <p className="text-muted-foreground">Manage property viewings and appointments</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Button 
              variant={viewType === 'list' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewType('list')}
            >
              List
            </Button>
            <Button 
              variant={viewType === 'calendar' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewType('calendar')}
            >
              Calendar
            </Button>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Viewing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule New Viewing</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="propertyTitle">Property Title</Label>
                  <Input
                    id="propertyTitle"
                    value={newViewing.propertyTitle}
                    onChange={(e) => setNewViewing({...newViewing, propertyTitle: e.target.value})}
                    placeholder="Enter property title"
                  />
                </div>
                <div>
                  <Label htmlFor="propertyAddress">Property Address</Label>
                  <Input
                    id="propertyAddress"
                    value={newViewing.propertyAddress}
                    onChange={(e) => setNewViewing({...newViewing, propertyAddress: e.target.value})}
                    placeholder="Enter property address"
                  />
                </div>
                <div>
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={newViewing.clientName}
                    onChange={(e) => setNewViewing({...newViewing, clientName: e.target.value})}
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail">Client Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={newViewing.clientEmail}
                    onChange={(e) => setNewViewing({...newViewing, clientEmail: e.target.value})}
                    placeholder="Enter client email"
                  />
                </div>
                <div>
                  <Label htmlFor="agentName">Assigned Agent</Label>
                  <Input
                    id="agentName"
                    value={newViewing.agentName}
                    onChange={(e) => setNewViewing({...newViewing, agentName: e.target.value})}
                    placeholder="Enter agent name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newViewing.time}
                      onChange={(e) => setNewViewing({...newViewing, time: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (min)</Label>
                    <Select value={newViewing.duration.toString()} onValueChange={(value) => setNewViewing({...newViewing, duration: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                        <SelectItem value="60">60 min</SelectItem>
                        <SelectItem value="90">90 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddViewing}>
                    Schedule
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Viewings</p>
                <p className="text-xl font-semibold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-xl font-semibold">{stats.today}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-xl font-semibold">{stats.upcoming}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-xl font-semibold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {viewType === 'calendar' ? (
        // Calendar View
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                Viewings for {selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredViewings.length > 0 ? (
                <div className="space-y-4">
                  {filteredViewings
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((viewing) => (
                    <div key={viewing.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{viewing.time}</span>
                          <Badge className={getStatusColor(viewing.status)}>
                            {viewing.status}
                          </Badge>
                        </div>
                        <h4 className="font-medium">{viewing.propertyTitle}</h4>
                        <p className="text-sm text-muted-foreground">
                          Client: {viewing.clientName} | Agent: {viewing.agentName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No viewings scheduled for this date
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        // List View
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search viewings..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleFiltersChange();
                }}
                className="pl-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={(value) => {
              setFilterStatus(value);
              handleFiltersChange();
            }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Viewings List */}
          <div className="space-y-4">
            {paginatedViewings.map((viewing) => (
              <Card key={viewing.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(viewing.status)} variant="secondary">
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(viewing.status)}
                            <span>{viewing.status}</span>
                          </div>
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {format(viewing.date, 'PPP')} at {viewing.time}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-1" />
                          {viewing.duration} min
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-lg">{viewing.propertyTitle}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {viewing.propertyAddress}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Client Information</h4>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <User className="w-4 h-4 mr-2 text-muted-foreground" />
                              {viewing.clientName}
                            </div>
                            <div className="flex items-center text-sm">
                              <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                              {viewing.clientEmail}
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                              {viewing.clientPhone}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Assigned Agent</h4>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={viewing.agentAvatar} />
                              <AvatarFallback className="text-xs">
                                {viewing.agentName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{viewing.agentName}</span>
                          </div>
                        </div>
                      </div>

                      {viewing.notes && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm">{viewing.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      {viewing.status === 'scheduled' && (
                        <Button size="sm" onClick={() => updateViewingStatus(viewing.id, 'confirmed')}>
                          Confirm
                        </Button>
                      )}
                      {viewing.status === 'confirmed' && (
                        <Button size="sm" onClick={() => updateViewingStatus(viewing.id, 'completed')}>
                          Complete
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteViewing(viewing.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {filteredViewings.length > itemsPerPage && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {filteredViewings.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No viewings found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your filters.' 
                    : 'Get started by scheduling your first viewing.'
                  }
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Viewing
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}