// src/components/Notifications/NotificationDropdown.tsx
import { useState } from "react";
import { Bell, Check, Trash2, MessageSquare, AlertCircle, Calendar, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "message" | "alert" | "event" | "system";
  isRead: boolean;
  createdAt: Date | string;
}

// Fallback mock data
const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "New Message",
    message: "You have a new message regarding your inquiry.",
    type: "message",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
  },
  {
    id: "2",
    title: "Status Update",
    message: "Your recent request has been approved.",
    type: "system",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
  },
  {
    id: "3",
    title: "Upcoming Viewing",
    message: "Reminder: Viewing scheduled for tomorrow at 10 AM.",
    type: "event",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  }
];

interface NotificationDropdownProps {
  viewAllRoute?: string; // e.g., "/tenant/notifications" or "notifications"
}

export default function NotificationDropdown({ viewAllRoute = "notifications" }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate(viewAllRoute);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "message": return <MessageSquare className="h-4 w-4 text-primary" />;
      case "alert": return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "event": return <Calendar className="h-4 w-4 text-amber-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-muted">
          <Bell className="h-5 w-5 text-foreground/80" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs border-2 border-background"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 p-0 rounded-xl shadow-lg border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className="h-auto px-2 py-1 text-xs text-primary hover:text-primary/80"
            >
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`flex items-start gap-3 p-4 transition-colors hover:bg-muted/50 border-b border-border/50 last:border-0 ${
                    !notification.isRead ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      setNotifications(notifications.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
                    }
                  }}
                >
                  <div className={`mt-0.5 p-1.5 rounded-full ${!notification.isRead ? 'bg-background shadow-sm' : 'bg-muted'}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0 cursor-pointer">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-medium truncate ${!notification.isRead ? 'text-foreground' : 'text-foreground/80'}`}>
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className={`text-xs line-clamp-2 ${!notification.isRead ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                      {notification.message}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.isRead && (
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-primary hover:bg-primary/10" onClick={(e) => handleMarkAsRead(e, notification.id)}>
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={(e) => handleRemove(e, notification.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-2 border-t border-border bg-card/50 rounded-b-xl">
          <Button 
            variant="outline" 
            className="w-full text-sm font-medium h-9"
            onClick={handleViewAll}
          >
            View All Notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}