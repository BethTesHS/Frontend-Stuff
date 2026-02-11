import React from 'react';
import { useAgency } from '@/contexts/AgencyContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { 
  Home, 
  Building2, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut,
  Bell,
  BarChart3,
  Calendar,
  FileText,
  UserCheck
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface AgencyLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const AgencySidebar = ({ activeTab, onTabChange }: { activeTab?: string; onTabChange?: (tab: string) => void }) => {
  const { agency } = useAgency();

  const navigationItems = [
    { icon: Home, label: 'Dashboard', value: 'dashboard' },
    { icon: Building2, label: 'Properties', value: 'properties' },
    { icon: Users, label: 'Agents', value: 'agents' },
    { icon: MessageSquare, label: 'Messages', value: 'messages' },
    { icon: Calendar, label: 'Viewings', value: 'viewings' },
    { icon: BarChart3, label: 'Analytics', value: 'analytics' },
    { icon: FileText, label: 'Reports', value: 'reports' },
    { icon: UserCheck, label: 'Tenants', value: 'tenants' },
  ];

  const navigate = useNavigate();

  const handleTabClick = (value: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    const agencyParam = urlParams.get('agency');

    let routePath = '/dashboard';
    if (value === 'properties') routePath = '/properties';
    else if (value === 'agents') routePath = '/agents';
    else if (value === 'messages') routePath = '/messages';
    else if (value === 'viewings') routePath = '/viewings';
    else if (value === 'analytics') routePath = '/analytics';
    else if (value === 'reports') routePath = '/reports';
    else if (value === 'tenants') routePath = '/tenants';
    else if (value === 'settings') routePath = '/settings';

    const newPath = agencyParam ? `${routePath}?agency=${agencyParam}` : routePath;
    navigate(newPath);

    if (onTabChange) {
      onTabChange(value);
    }
  };

  const isActive = (value: string) => activeTab === value;
  const getNavCls = (itemValue: string) =>
    isActive(itemValue)
      ? "bg-primary text-primary-foreground shadow-sm font-medium"
      : "hover:bg-accent hover:text-accent-foreground transition-colors";

  return (
    <Sidebar className="border-r border-border/50 bg-card/50 backdrop-blur-sm" collapsible="icon">
      <SidebarContent className="py-2">
        {/* Agency Branding */}
        <div className="px-3 py-4 mb-2">
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            {agency?.logo ? (
              <div className="relative">
                <img
                  src={agency.logo}
                  alt={`${agency.name} logo`}
                  className="h-10 w-10 rounded-xl object-cover ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all"
                />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                <span className="text-base font-bold text-primary-foreground">
                  {agency?.name?.charAt(0) || 'A'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                {agency?.name || 'Agency Portal'}
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                {agency?.slug}.homed.com
              </p>
            </div>
          </Link>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    onClick={() => handleTabClick(item.value)}
                    className={`${getNavCls(item.value)} rounded-lg py-2.5`}
                    isActive={isActive(item.value)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="flex-1" />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="px-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleTabClick('settings')}
                  className={`${getNavCls('settings')} rounded-lg py-2.5`}
                  isActive={isActive('settings')}
                >
                  <Settings className="h-5 w-5" />
                  <span className="text-sm">Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Homepage Button */}
        <div className="px-2 py-2">
          <Button
            variant="outline"
            className="w-full bg-muted/40 hover:bg-muted/60 border-border/60 shadow-sm hover:shadow-md transition-all duration-300"
            onClick={() => navigate('/')}
          >
            <Home className="h-4 w-4 mr-2" />
            <span className="text-sm">Back to Homepage</span>
          </Button>
        </div>

        {/* Agency Info Footer */}
        <div className="mt-2 px-3 py-3 border-t border-border/50">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

const AgencyLayout: React.FC<AgencyLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { agency } = useAgency();
  const navigate = useNavigate();

  // Get user data from localStorage
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        console.log('AgencyLayout: Retrieved user data:', parsed);
        return parsed;
      }
    } catch (error) {
      console.error('AgencyLayout: Error parsing user data:', error);
    }
    return null;
  };

  const user = getUserData();

  const handleNavigation = (tab: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    const agencyParam = urlParams.get('agency');

    let routePath = '/dashboard';
    if (tab === 'properties') routePath = '/properties';
    else if (tab === 'agents') routePath = '/agents';
    else if (tab === 'messages') routePath = '/messages';
    else if (tab === 'viewings') routePath = '/viewings';
    else if (tab === 'analytics') routePath = '/analytics';
    else if (tab === 'reports') routePath = '/reports';
    else if (tab === 'tenants') routePath = '/tenants';
    else if (tab === 'settings') routePath = '/settings';

    const newPath = agencyParam ? `${routePath}?agency=${agencyParam}` : routePath;
    navigate(newPath);
  };

  const handleLogout = () => {
    // Clear agency authentication
    localStorage.removeItem('agencyToken');
    localStorage.removeItem('agencyData');
    localStorage.removeItem('user');

    console.log('AgencyLayout: Cleared all auth data, logging out');

    // Preserve agency parameter for re-login
    const urlParams = new URLSearchParams(window.location.search);
    const agencyParam = urlParams.get('agency');
    const loginUrl = agencyParam ? `/login?agency=${agencyParam}` : '/login';

    navigate(loginUrl);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-muted/10 to-muted/30">
        <AgencySidebar activeTab={activeTab} onTabChange={onTabChange} />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 bg-card/80 backdrop-blur-md border-b border-border/50 shadow-sm sticky top-0 z-50">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="hover:bg-accent rounded-lg transition-colors" />
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {agency?.name || 'Agency'} Dashboard
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Welcome back{user?.name ? `, ${user.name}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative rounded-lg hover:bg-accent">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-4 w-4 bg-destructive text-destructive-foreground rounded-full text-[10px] flex items-center justify-center font-semibold">
                    3
                  </span>
                </Button>

                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 rounded-lg px-3 hover:bg-accent">
                      <Avatar className="h-7 w-7 mr-2 ring-2 ring-primary/20">
                        <AvatarImage
                          src={agency?.logo || ""}
                          alt="Agency logo"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-primary-foreground font-bold text-xs">
                          {agency?.name?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium hidden md:block">
                        {agency?.name || 'Agency'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none">
                          {user?.name || agency?.name || 'Agency'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email || agency?.contact?.email || `admin@${agency?.slug || 'agency'}.com`}
                        </p>
                        {user?.role && (
                          <p className="text-xs leading-none text-primary font-medium mt-1">
                            {user.role === 'agency_admin' ? 'Agency Admin' : user.role}
                          </p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleNavigation('settings')}
                      className="cursor-pointer"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
            <div className="flex justify-between items-center px-6 py-3">
              <div className="text-xs text-muted-foreground">
                © 2024 {agency?.name || 'Agency'}. All rights reserved.
              </div>
              <div className="text-xs text-muted-foreground">
                Powered by <span className="text-primary font-semibold">Homed</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AgencyLayout;