import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  User,
  FileText,
  Clock,
  MessageCircle,
  LogOut,
} from "lucide-react";

interface ExternalTenantSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
}

const ExternalTenantSidebar = ({ activeTab, setActiveTab, user }: ExternalTenantSidebarProps) => {
  const { state } = useSidebar();
  const navigate = useNavigate();

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, color: "text-blue-500" },
    { id: "calendar", label: "Calendar", icon: Clock, color: "text-indigo-500" },
    { id: "complaints", label: "Complaints", icon: FileText, color: "text-orange-500" },
    { id: "history", label: "History", icon: Clock, color: "text-purple-500" },
    { id: "messages", label: "Messages", icon: MessageCircle, color: "text-pink-500" },
    { id: "spare-rooms", label: "My Spare Room", icon: Home, color: "text-emerald-500" },
    { id: "profile", label: "Profile", icon: User, color: "text-green-500" },
  ];

  return (
    <Sidebar variant="inset" className="border-r border-border/60">
      <SidebarHeader className="bg-gradient-to-b from-background via-muted/20 to-muted/40">
        <div className="flex items-center gap-3 px-2 py-4">
          <div className="size-8 text-primary drop-shadow-sm">
            <Home className="w-6 h-6" />
          </div>
          {state === "expanded" && (
            <h1 className="text-foreground text-lg font-bold leading-normal tracking-tight">
              Tenancy Hub
            </h1>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-b from-background via-muted/20 to-muted/40">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          onClick={() => setActiveTab(item.id)}
          isActive={activeTab === item.id}
          className="w-full"
        >
          <item.icon className={`w-5 h-5 flex-shrink-0 ${
            activeTab === item.id ? "text-primary-foreground" : `${item.color}`
          }`} />
          {state === "expanded" && (
            <span className="text-sm font-medium">
              {item.label}
            </span>
          )}
        </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-gradient-to-b from-background via-muted/20 to-muted/40">
        <div className="flex flex-col gap-4 p-4">
          {state === "expanded" && (
            <Button
              onClick={() => navigate("/login")}
              variant="destructive"
              className="bg-gradient-to-r from-destructive to-destructive/90 hover:from-destructive/90 hover:to-destructive/80 text-destructive-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          )}
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-muted/60 to-muted/40 border border-border/40 shadow-sm">
            <div className="bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-full size-8 flex items-center justify-center border border-primary/20">
              <User className="w-4 h-4 text-primary" />
            </div>
            {state === "expanded" && (
              <div className="flex flex-col">
                <p className="text-foreground text-xs font-semibold leading-tight">
                  {user?.name || "External Tenant"}
                </p>
                <p className="text-muted-foreground text-xs font-normal leading-tight">
                  Verified Tenant
                </p>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            className="w-full bg-gradient-to-r from-muted/40 to-muted/20 hover:from-muted/60 hover:to-muted/40 border-border/60 shadow-sm hover:shadow-md transition-all duration-300"
            onClick={() => navigate('/')}
          >
            <Home className="w-4 h-4 mr-2" />
            {state === "expanded" && "Back to Homepage"}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default ExternalTenantSidebar;