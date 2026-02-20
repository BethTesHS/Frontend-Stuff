import { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import { useTheme } from '@/contexts/ThemeContext';
import { AdminSidebar } from '@/components/AdminDashboard/AdminSidebar';
import { Shield, Moon, Sun, Menu, ChevronLeft, ChevronRight, Bell } from 'lucide-react';

// Extracted Sub-Components
import { AdminOverview } from '@/components/AdminDashboard/AdminOverview';
import { AdminUsers } from '@/components/AdminDashboard/AdminUsers';
import { AdminVerifications } from '@/components/AdminDashboard/AdminVerifications';
import { AdminMessages } from '@/components/AdminDashboard/AdminMessages';
import { AdminSupport } from '@/components/AdminDashboard/AdminSupport';
import AdminTask from '@/components/AdminDashboard/AdminTask';

const AdminDashboard = () => {
  const { isAdminAuthenticated, loading: authLoading } = useAdminGuard();
  const { theme, toggleTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadStats();
    }
  }, [isAdminAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Shield className="w-8 h-8 text-gray-600 dark:text-gray-400 animate-pulse" />
          </div>
          <p className="text-gray-800 dark:text-gray-100 text-lg font-semibold">Verifying admin access...</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 dark:border-gray-400 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) return null;

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const { adminApi } = await import('@/services/adminApi');
      const response = await adminApi.getStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    flushSync(() => {
      setActiveTab(tab);
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview": 
        return <AdminOverview stats={stats} statsLoading={statsLoading} />;
      case "users": 
        return <AdminUsers />;
      case "verifications": 
        return <AdminVerifications />;
      case "messages": 
        return <AdminMessages />;
      case "tasks": return <AdminTask />;
      case "support": 
        return <AdminSupport stats={stats} />;
      default: 
        return <AdminOverview stats={stats} statsLoading={statsLoading} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left: Menu buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Menu size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {sidebarCollapsed ? (
                    <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
                  )}
                </button>
                <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Shield size={24} />
                  Admin Dashboard
                </h1>
              </div>

              {/* Right: Theme toggle and notifications */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? (
                    <Sun size={20} className="text-yellow-500" />
                  ) : (
                    <Moon size={20} className="text-gray-600" />
                  )}
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative transition-colors">
                  <Bell size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;