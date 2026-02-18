import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { SavedPropertiesProvider } from '@/contexts/SavedPropertiesContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AgencyProvider, useAgency } from '@/contexts/AgencyContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { migrateFromLocalStorage } from '@/utils/tokenStorage';

import ErrorBoundary from '@/components/ErrorBoundary';

// Migrate any existing auth tokens from localStorage to sessionStorage
migrateFromLocalStorage();
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute';

// Import all pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Properties from '@/pages/Properties';
import PropertyDetails from '@/pages/PropertyDetails';
import Contact from '@/pages/Contact';
import NotFound from '@/pages/NotFound';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminLogin from '@/pages/AdminLogin';
import AgencyDashboard from '@/pages/AgencyDashboard';
import AgencyLogin from '@/pages/AgencyLogin';
import AgencyProfile from '@/pages/AgencyProfile';
import AgencyRegistration from '@/pages/AgencyRegistration';
import AgentComplaints from '@/pages/AgentComplaints';
import AgentDashboard from '@/pages/AgentDashboard';
import AgentProfile from '@/pages/AgentProfile';
import AgentsList from '@/pages/AgentsList';
import Article from '@/pages/Article';
import ContactAgent from '@/pages/ContactAgent';
import DatabaseSchema from '@/pages/DatabaseSchema';
import ExternalTenantDashboard from '@/pages/ExternalTenantDashboard';
import ExternalTenantForm from '@/pages/ExternalTenantForm';
import FindAgent from '@/pages/FindAgent';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Help from '@/pages/Help';
import ListProperty from '@/pages/ListProperty';
import ListRoom from '@/pages/ListRoom';
import Messages from '@/pages/Messages';
import MyComplaints from '@/pages/MyComplaints';
import MyProperties from '@/pages/MyProperties';
import Notifications from '@/pages/Notifications';
import OwnerDashboard from '@/pages/OwnerDashboard';
import PostProperty from '@/pages/PostProperty';
import PostSpareRoom from '@/pages/PostSpareRoom';
import Privacy from '@/pages/Privacy';
import ProfileSetup from '@/pages/ProfileSetup';
import PropertyListingChoice from '@/pages/PropertyListingChoice';
import PublicAgentProfile from '@/pages/PublicAgentProfile';
import ReviewAgent from '@/pages/ReviewAgent';
import RoomDetails from '@/pages/RoomDetails';
import Rooms from '@/pages/Rooms';
import Saved from '@/pages/Saved';
import SelectAgent from '@/pages/SelectAgent';
import SelectRole from '@/pages/SelectRole';
import SubmitComplaint from '@/pages/SubmitComplaint';
import TenantDashboard from '@/pages/TenantDashboard';
import TenantOnboarding from '@/pages/TenantOnboarding';
import TenantSupport from '@/pages/TenantSupport';
import Terms from '@/pages/Terms';
import VerifyEmail from '@/pages/VerifyEmail';
import BuyerDashboard from '@/pages/BuyerDashboard';

import './index.css';

const queryClient = new QueryClient();

// Loading component
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Main app router component wrapped with proper error handling
const AppRouter: React.FC = () => {
  try {
    const { isAgencyMode, loading } = useAgency();

    if (loading) {
      return <LoadingScreen />;
    }

    return (
      <Routes>
        {isAgencyMode ? (
          // Agency subdomain routes
          <>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<AgencyLogin />} />
            <Route path="/dashboard" element={<AgencyDashboard />} />
            <Route path="/properties" element={<AgencyDashboard />} />
            <Route path="/agents" element={<AgencyDashboard />} />
            <Route path="/messages" element={<AgencyDashboard />} />
            <Route path="/viewings" element={<AgencyDashboard />} />
            <Route path="/analytics" element={<AgencyDashboard />} />
            <Route path="/reports" element={<AgencyDashboard />} />
            <Route path="/tenants" element={<AgencyDashboard />} />
            <Route path="/settings" element={<AgencyDashboard />} />
            <Route path="/list-property" element={<ListProperty />} />
            {/* Escape route to main site */}
            <Route path="/main-site" element={<Navigate to="/?exit_agency=true" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          // Regular site routes
          <>
            {/* Main Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/select-role" element={<SelectRole />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tenant-dashboard" element={<TenantDashboard />} />
            <Route path="/agent-dashboard" element={<AgentDashboard />} />
            <Route path="/owner-dashboard" element={<OwnerDashboard />} />
            <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
            <Route path="/admin-dashboard" element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            } />
            <Route path="/agency-dashboard" element={<AgencyDashboard />} />
            <Route path="/external-tenant-dashboard" element={<ExternalTenantDashboard />} />
            
            {/* Property Routes */}
            <Route path="/properties" element={<Properties />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/my-properties" element={<MyProperties />} />
            <Route path="/post-property" element={<PostProperty />} />
            <Route path="/list-property" element={<ListProperty />} />
            <Route path="/property-listing-choice" element={<PropertyListingChoice />} />
            <Route path="/saved" element={<Saved />} />
            
            {/* Room Routes */}
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:id" element={<RoomDetails />} />
            <Route path="/rooms/list" element={<ListRoom />} />
            <Route path="/post-spare-room" element={<PostSpareRoom />} />
            
            {/* Agent Routes */}
            <Route path="/find-agent" element={<FindAgent />} />
            <Route path="/agents" element={<AgentsList />} />
            <Route path="/agent-profile" element={<AgentProfile />} />
            <Route path="/agent/:id" element={<PublicAgentProfile />} />
            <Route path="/contact-agent" element={<ContactAgent />} />
            <Route path="/select-agent" element={<SelectAgent />} />
            <Route path="/review-agent" element={<ReviewAgent />} />
            <Route path="/agent-complaints" element={<AgentComplaints />} />
            
            {/* Agency Routes */}
            <Route path="/agency-login" element={<AgencyLogin />} />
            <Route path="/agency-profile" element={<AgencyProfile />} />
            <Route path="/agency-registration" element={<AgencyRegistration />} />
            
            {/* Admin Routes */}
            <Route path="/admin-login" element={<AdminLogin />} />
            
            {/* Tenant Routes */}
            <Route path="/tenant-support" element={<TenantSupport />} />
            <Route path="/tenant-onboarding" element={<TenantOnboarding />} />
            <Route path="/external-tenant-form" element={<ExternalTenantForm />} />
            <Route path="/my-complaints" element={<MyComplaints />} />
            <Route path="/submit-complaint" element={<SubmitComplaint />} />
            
            {/* Communication Routes */}
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            
            {/* Info Routes */}
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<Help />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/article/:id" element={<Article />} />
            
            {/* Development Routes */}
            <Route path="/database-schema" element={<DatabaseSchema />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </>
        )}
      </Routes>
    );
  } catch (error) {
    console.error('Error in AppRouter:', error);
    return <LoadingScreen />;
  }
};

// Wrapper component to ensure AgencyProvider is available
const RouterWrapper: React.FC = () => {
  return (
    <Router>
      <AdminAuthProvider>
        <ThemeProvider>
          <AppRouter />
        </ThemeProvider>
      </AdminAuthProvider>
    </Router>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AgencyProvider>
          <AuthProvider>
            <LoadingProvider>
              <SavedPropertiesProvider>
                <NotificationProvider>
                  <RouterWrapper />
                  <Toaster />
                </NotificationProvider>
              </SavedPropertiesProvider>
            </LoadingProvider>
          </AuthProvider>
        </AgencyProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);
root.render(<App />);