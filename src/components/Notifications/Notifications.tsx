// src/components/Notifications/Notifications.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCheck, Trash2, Mail, AlertCircle, Info, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { NotificationItem } from "./NotificationDropdown";

// Using the same mock baseline; replace with API fetches or Context as needed
const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "New Message",
    message: "You have a new message from the property agent regarding your viewing.",
    type: "message",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "2",
    title: "Profile Verification Complete",
    message: "Your submitted documents have been verified successfully.",
    type: "system",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: "3",
    title: "Upcoming Event",
    message: "You have a scheduled viewing tomorrow at 10:00 AM.",
    type: "event",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "4",
    title: "Maintenance Alert",
    message: "Scheduled maintenance will occur on the platform this Sunday.",
    type: "alert",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  }
];

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "message": return <Mail className="h-5 w-5 text-primary" />;
      case "alert": return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "event": return <Calendar className="h-5 w-5 text-amber-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const renderNotificationList = (filteredNotifications: NotificationItem[]) => {
    if (filteredNotifications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border mt-4">
          <Bell className="h-12 w-12 mb-4 opacity-20" />
          <h3 className="text-lg font-medium text-foreground">You're all caught up!</h3>
          <p className="text-sm mt-1">There are no notifications to display right now.</p>
        </div>
      );
    }

    return (
      <ScrollArea className="h-[60vh] pr-4 mt-4">
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                notification.isRead 
                  ? "bg-card border-border hover:bg-muted/30" 
                  : "bg-primary/5 border-primary/20 shadow-sm"
              }`}
            >
              <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${notification.isRead ? 'bg-muted' : 'bg-background shadow-sm'}`}>
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <h4 className={`text-base font-semibold truncate ${notification.isRead ? 'text-foreground/80' : 'text-foreground'}`}>
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <Badge className="bg-primary hover:bg-primary border-none h-5 px-1.5 text-[10px] shrink-0">NEW</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed ${notification.isRead ? 'text-muted-foreground' : 'text-foreground/90'}`}>
                  {notification.message}
                </p>
                
                <div className="flex items-center gap-3 pt-2">
                  {!notification.isRead && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-xs font-medium text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <CheckCheck className="h-3.5 w-3.5 mr-1" />
                      Mark as read
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(notification.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs rounded-full px-2 h-6">
                {unreadCount} unread
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your platform alerts and updates.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="h-9">
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-9 text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      <Card className="bg-card border-border shadow-sm flex-1 flex flex-col overflow-hidden">
        <CardContent className="p-0 sm:p-6 flex-1 flex flex-col min-h-0">
          <Tabs defaultValue="all" className="w-full flex-1 flex flex-col h-full">
            <TabsList className="w-full sm:w-auto self-start bg-muted/50 border border-border p-1">
              <TabsTrigger value="all" className="flex-1 sm:flex-none px-6">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-1 sm:flex-none px-6 relative">
                Unread
                {unreadCount > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-[10px] rounded-full px-1.5 py-0.5 font-bold">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="flex-1 mt-0 outline-none">
              {renderNotificationList(notifications)}
            </TabsContent>
            
            <TabsContent value="unread" className="flex-1 mt-0 outline-none">
              {renderNotificationList(notifications.filter(n => !n.isRead))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}