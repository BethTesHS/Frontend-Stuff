import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Clock,
  FileText,
  MessageCircle,
  User,
  Settings,
  CheckCircle,
  AlertCircle,
  Search,
  Calendar
} from "lucide-react";

const ExternalTenantHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("all");

  // Mock activity data
  const activities = [
    {
      id: 1,
      type: "complaint",
      title: "Submitted complaint about leaking tap",
      description: "Filed complaint TKT-2024-001 for plumbing issue in main bathroom",
      timestamp: "2024-01-15T10:30:00Z",
      status: "in_progress",
      details: {
        ticketNumber: "TKT-2024-001",
        issueType: "Plumbing",
        urgency: "medium"
      }
    },
    {
      id: 2,
      type: "message",
      title: "Received message from property manager",
      description: "Sarah Johnson sent you a message regarding the heating issue",
      timestamp: "2024-01-14T15:45:00Z",
      status: "unread",
      details: {
        sender: "Sarah Johnson",
        subject: "Heating System Update"
      }
    },
    {
      id: 3,
      type: "complaint",
      title: "Complaint resolved",
      description: "Broken window latch issue has been resolved by maintenance team",
      timestamp: "2024-01-10T09:15:00Z",
      status: "resolved",
      details: {
        ticketNumber: "TKT-2023-045",
        issueType: "Maintenance",
        resolutionTime: "3 days"
      }
    },
    {
      id: 4,
      type: "profile",
      title: "Profile information updated",
      description: "Updated emergency contact information",
      timestamp: "2024-01-08T14:20:00Z",
      status: "completed",
      details: {
        fieldsUpdated: ["Emergency Contact", "Phone Number"]
      }
    },
    {
      id: 5,
      type: "message",
      title: "Sent message to landlord",
      description: "Inquired about the property maintenance schedule",
      timestamp: "2024-01-05T11:30:00Z",
      status: "sent",
      details: {
        recipient: "John Smith",
        subject: "Maintenance Schedule Inquiry"
      }
    },
    {
      id: 6,
      type: "complaint",
      title: "Submitted urgent heating complaint",
      description: "Filed high-priority complaint TKT-2024-002 for heating system failure",
      timestamp: "2024-01-18T08:00:00Z",
      status: "open",
      details: {
        ticketNumber: "TKT-2024-002",
        issueType: "Heating",
        urgency: "high"
      }
    },
    {
      id: 7,
      type: "message",
      title: "Welcome message received",
      description: "Received welcome message with important tenant information",
      timestamp: "2023-12-15T12:00:00Z",
      status: "read",
      details: {
        sender: "Tenancy Management Team",
        subject: "Welcome to Your New Home"
      }
    },
    {
      id: 8,
      type: "profile",
      title: "Account created",
      description: "Your tenant account has been successfully created",
      timestamp: "2023-12-15T10:00:00Z",
      status: "completed",
      details: {
        accountType: "External Tenant"
      }
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "complaint":
        return <FileText className="w-4 h-4" />;
      case "message":
        return <MessageCircle className="w-4 h-4" />;
      case "profile":
        return <User className="w-4 h-4" />;
      case "system":
        return <Settings className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (type: string, status: string) => {
    if (type === "complaint") {
      switch (status) {
        case "open":
          return <Badge variant="destructive" className="bg-destructive/10 text-destructive">Open</Badge>;
        case "in_progress":
          return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
        case "resolved":
          return <Badge variant="secondary" className="bg-success/10 text-success">Resolved</Badge>;
        default:
          return <Badge variant="secondary">{status}</Badge>;
      }
    } else if (type === "message") {
      switch (status) {
        case "unread":
          return <Badge variant="destructive" className="bg-destructive/10 text-destructive">Unread</Badge>;
        case "read":
          return <Badge variant="secondary" className="bg-muted text-muted-foreground">Read</Badge>;
        case "sent":
          return <Badge variant="secondary" className="bg-primary/10 text-primary">Sent</Badge>;
        default:
          return <Badge variant="secondary">{status}</Badge>;
      }
    } else {
      return <Badge variant="secondary" className="bg-success/10 text-success">Completed</Badge>;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "complaint":
        return "border-l-primary bg-primary/5";
      case "message":
        return "border-l-blue-500 bg-blue-50";
      case "profile":
        return "border-l-green-500 bg-green-50";
      case "system":
        return "border-l-purple-500 bg-purple-50";
      default:
        return "border-l-gray-300 bg-gray-50";
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || activity.type === filterType;
    
    let matchesDate = true;
    if (filterDate !== "all") {
      const activityDate = new Date(activity.timestamp);
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (filterDate) {
        case "today":
          matchesDate = diffInDays === 0;
          break;
        case "week":
          matchesDate = diffInDays <= 7;
          break;
        case "month":
          matchesDate = diffInDays <= 30;
          break;
      }
    }
    
    return matchesSearch && matchesType && matchesDate;
  });

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, typeof activities>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Activity History</h2>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Complaints</p>
                <p className="text-2xl font-bold">
                  {activities.filter(a => a.type === 'complaint').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Messages</p>
                <p className="text-2xl font-bold">
                  {activities.filter(a => a.type === 'message').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Resolved Issues</p>
                <p className="text-2xl font-bold">
                  {activities.filter(a => a.type === 'complaint' && a.status === 'resolved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Profile Updates</p>
                <p className="text-2xl font-bold">
                  {activities.filter(a => a.type === 'profile').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Activity Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="complaint">Complaints</SelectItem>
                  <SelectItem value="message">Messages</SelectItem>
                  <SelectItem value="profile">Profile Updates</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <div className="space-y-6">
        {Object.entries(groupedActivities).map(([date, dayActivities]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">{date}</h3>
            </div>
            
            <div className="space-y-3 ml-8">
              {dayActivities.map((activity) => (
                <Card key={activity.id} className={`border-l-4 ${getActivityColor(activity.type)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-current">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(activity.type, activity.status)}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(activity.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Activity Details */}
                    {activity.details && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {Object.entries(activity.details).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium text-muted-foreground">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                              </span>
                              <span className="ml-2 text-foreground">
                                {Array.isArray(value) ? value.join(', ') : value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {filteredActivities.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No activities found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search filters to see more results.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ExternalTenantHistory;