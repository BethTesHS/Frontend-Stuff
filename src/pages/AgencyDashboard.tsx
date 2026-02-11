import React, { useState, useEffect } from 'react';
// Removed Card imports - using glass morphism divs instead
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAgency } from '@/contexts/AgencyContext';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AgencyLayout from '@/components/Layout/AgencyLayout';
import { AgencyAgents } from '@/components/Agency/AgencyAgents';
import { AgencyMessages } from '@/components/Agency/AgencyMessages';
import { AgencyProperties } from '@/components/Agency/AgencyProperties';
import { AgencySettings } from '@/components/Agency/AgencySettings';
import { AgencyViewings } from '@/components/Agency/AgencyViewings';
import { AgencyAnalytics } from '@/components/Agency/AgencyAnalytics';
import { AgencyTenants } from '@/components/Agency/AgencyTenants';
import { AgencyReports } from '@/components/Agency/AgencyReports';
import {
  Building2,
  Users,
  Star,
  TrendingUp,
  MessageSquare,
  Calendar,
  Plus,
  UserPlus,
  FileText,
  Activity,
  Zap
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  agencyAnalyticsApi,
  agencyAgentsApi,
  agencyPropertiesApi,
  agencyViewingsApi,
  type DashboardAnalytics
} from '@/services/agencyApi';

const AgencyDashboard = () => {
  const { agency, isAgencyMode, loading, error } = useAgency();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardAnalytics | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Handle URL routing for different sections
  useEffect(() => {
    const path = location.pathname;
    if (path === '/agents') setActiveTab('agents');
    else if (path === '/messages') setActiveTab('messages');
    else if (path === '/properties') setActiveTab('properties');
    else if (path === '/viewings') setActiveTab('viewings');
    else if (path === '/analytics') setActiveTab('analytics');
    else if (path === '/reports') setActiveTab('reports');
    else if (path === '/tenants') setActiveTab('tenants');
    else if (path === '/settings') setActiveTab('settings');
    else setActiveTab('dashboard');
  }, [location.pathname]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAgencyMode || !agency) return;

      setDashboardLoading(true);
      setDashboardError(null);

      try {
        const analytics = await agencyAnalyticsApi.getDashboard('30d');
        setDashboardData(analytics);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setDashboardError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboardData();
  }, [agency, isAgencyMode]);

  const handleTabChange = (tab: string) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !isAgencyMode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertDescription>
            {error || 'This page is only accessible from an agency subdomain.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertDescription>
            Agency not found. Please check the URL and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const agencyStats = {
    totalProperties: dashboardData?.total_properties || 0,
    totalAgents: dashboardData?.total_agents || 0,
    totalViewings: dashboardData?.total_viewings || 0,
    totalTenants: dashboardData?.total_tenants || 0,
    totalRevenue: dashboardData?.total_revenue || 0,
    period: dashboardData?.period || '30d'
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'agents':
        return <AgencyAgents />;
      case 'messages':
        return <AgencyMessages />;
      case 'properties':
        return <AgencyProperties />;
      case 'viewings':
        return <AgencyViewings />;
      case 'analytics':
        return <AgencyAnalytics />;
      case 'reports':
        return <AgencyReports />;
      case 'tenants':
        return <AgencyTenants />;
      case 'settings':
        return <AgencySettings />;
      default:
        return (
          <div className="space-y-6">
            {dashboardError && (
              <Alert variant="destructive">
                <AlertDescription>{dashboardError}</AlertDescription>
              </Alert>
            )}

            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 border border-primary/10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Welcome back to {agency?.name}
                  </h1>
                  <p className="text-muted-foreground text-base">
                    Here's what's happening with your agency today
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleTabChange('viewings')}
                    className="rounded-xl shadow-sm hover:shadow"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Viewing
                  </Button>
                  <Button
                    onClick={() => handleTabChange('properties')}
                    className="rounded-xl shadow-sm hover:shadow-md"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Property
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {dashboardLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="glass-card p-6 rounded-xl">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-8 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="glass-stat-card p-6 bg-gradient-to-br from-card to-card/50 rounded-xl">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-3 mb-3">
                    <h3 className="text-sm font-semibold text-muted-foreground">Total Properties</h3>
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-1">{agencyStats.totalProperties}</div>
                    <p className="text-sm text-muted-foreground">
                      Properties managed
                    </p>
                  </div>
                </div>

                <div className="glass-stat-card p-6 bg-gradient-to-br from-card to-card/50 rounded-xl">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-3 mb-3">
                    <h3 className="text-sm font-semibold text-muted-foreground">Active Agents</h3>
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-1">{agencyStats.totalAgents}</div>
                    <p className="text-sm text-muted-foreground">
                      Team members
                    </p>
                  </div>
                </div>

                <div className="glass-stat-card p-6 bg-gradient-to-br from-card to-card/50 rounded-xl">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-3 mb-3">
                    <h3 className="text-sm font-semibold text-muted-foreground">Total Viewings</h3>
                    <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-1">{agencyStats.totalViewings}</div>
                    <p className="text-sm text-muted-foreground">
                      Last {agencyStats.period}
                    </p>
                  </div>
                </div>

                <div className="glass-stat-card p-6 bg-gradient-to-br from-card to-card/50 rounded-xl">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-3 mb-3">
                    <h3 className="text-sm font-semibold text-muted-foreground">Total Revenue</h3>
                    <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-1">
                      £{agencyStats.totalRevenue.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Last {agencyStats.period}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activity & Quick Actions */}
            <div className="grid md:grid-cols-2 gap-5">
              <div className="glass-card p-6 rounded-xl">
                <div className="pb-4 mb-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    Recent Activity
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">New property viewing booked</p>
                      <p className="text-xs text-muted-foreground mt-0.5">3 Bed House in Kensington</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">Today</Badge>
                  </div>
                  <div className="flex items-start justify-between gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Agent added new listing</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Sarah Wilson - 2 Bed Flat</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">Yesterday</Badge>
                  </div>
                  <div className="flex items-start justify-between gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Property sold</p>
                      <p className="text-xs text-muted-foreground mt-0.5">4 Bed House - £2.1M</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">2 days ago</Badge>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-xl">
                <div className="pb-4 mb-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    Quick Actions
                  </h3>
                </div>
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start h-11 rounded-lg shadow-sm hover:shadow"
                    variant="outline"
                    onClick={() => handleTabChange('properties')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Property
                  </Button>
                  <Button
                    className="w-full justify-start h-11 rounded-lg shadow-sm hover:shadow"
                    variant="outline"
                    onClick={() => handleTabChange('agents')}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Agent
                  </Button>
                  <Button className="w-full justify-start h-11 rounded-lg shadow-sm hover:shadow" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Viewing
                  </Button>
                  <Button className="w-full justify-start h-11 rounded-lg shadow-sm hover:shadow" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </div>
              </div>
            </div>

            {/* Performance Overview */}
            <div className="grid md:grid-cols-3 gap-5">
              <div className="glass-card p-6 rounded-xl bg-gradient-to-br from-card to-card/50">
                <div className="mb-4">
                  <h3 className="text-base font-semibold">This Month</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors">
                    <span className="text-sm text-muted-foreground">Properties Sold</span>
                    <span className="font-bold text-lg">12</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors">
                    <span className="text-sm text-muted-foreground">New Listings</span>
                    <span className="font-bold text-lg">8</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors">
                    <span className="text-sm text-muted-foreground">Viewings Booked</span>
                    <span className="font-bold text-lg">45</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-xl bg-gradient-to-br from-card to-card/50">
                <div className="mb-4">
                  <h3 className="text-base font-semibold">Top Performing Agent</h3>
                </div>
                <div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center ring-2 ring-primary/20">
                      <span className="text-base font-bold text-primary-foreground">JS</span>
                    </div>
                    <div>
                      <p className="font-semibold text-base">John Smith</p>
                      <p className="text-sm text-muted-foreground">5 sales this month</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-xl bg-gradient-to-br from-card to-card/50">
                <div className="mb-4">
                  <h3 className="text-base font-semibold">Revenue Goal</h3>
                </div>
                <div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Target</span>
                      <span className="font-bold text-base">£50,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Achieved</span>
                      <span className="font-bold text-base text-green-600 dark:text-green-400">£45,000</span>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-primary to-blue-600 h-3 rounded-full w-[90%] transition-all duration-500"></div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center font-medium">90% of monthly target</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <AgencyLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {renderContent()}
    </AgencyLayout>
  );
};

export default AgencyDashboard;