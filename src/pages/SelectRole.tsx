import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Home, User, Building2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthToken } from '@/utils/tokenStorage';
import TenantVerification from '@/components/TenantVerification/TenantVerification';
import ExternalTenantForm from '@/components/TenantVerification/ExternalTenantForm';
import { profileApi } from '@/services/api';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://api.homeduk.property';

const SelectRole = () => {
  const { user, isAuthenticated, updateUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [showTenantVerification, setShowTenantVerification] = useState(false);
  const [showTenantTypeSelection, setShowTenantTypeSelection] = useState(false);
  const [showExternalTenantForm, setShowExternalTenantForm] = useState(false);
  const [selectedTenantType, setSelectedTenantType] = useState('');
  const [showBuyerIntentSelection, setShowBuyerIntentSelection] = useState(false);
  const [selectedBuyerIntent, setSelectedBuyerIntent] = useState<'buy' | 'rent' | 'find_roommate' | ''>('');
  const [hasPin, setHasPin] = useState<"yes" | "no" | "">("");
  const [pinCode, setPinCode] = useState("");

  useEffect(() => {
    console.log('SelectRole: Component mounted');
    console.log('SelectRole: user:', user);
    console.log('SelectRole: isAuthenticated:', isAuthenticated);

    // Redirect to home if not authenticated
    if (!authLoading && (!isAuthenticated || !user)) {
      console.log('SelectRole: User not authenticated or user is null, redirecting to home');
      navigate('/');
      return;
    }

    // Protect SelectRole page - redirect users who already have roles
    if (user?.role) {
      console.log('SelectRole: User already has role:', user.role, 'checking appropriate dashboard...');

      if (user.role === 'tenant') {
        console.log('SelectRole: Tenant role detected, checking tenant type');

        // For tenants without verified status, we need to check which type they are
        const authToken = getAuthToken();
        if (authToken) {
          // Check external tenant status
          fetch(`${API_BASE_URL}/external-tenant/check-profile`, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              const { has_external_profile, profile_complete, redirect_to } = data.data;

              if (has_external_profile && profile_complete) {
                console.log('External tenant detected, redirecting to external dashboard');
                navigate('/external-tenant-dashboard');
              } else if (redirect_to === 'external_tenant_setup') {
                console.log('External tenant setup required, starting external tenant flow');
                setShowTenantTypeSelection(true);
                setSelectedTenantType('external');
                setShowExternalTenantForm(true);
                return;
              } else {
                // Platform tenant - always redirect to dashboard regardless of verification status
                console.log('Platform tenant detected, redirecting to tenant dashboard');
                navigate('/tenant-dashboard');
              }
            }
          })
          .catch(() => {
            // If external check fails, assume platform tenant and redirect to dashboard
            console.log('External tenant check failed, redirecting to tenant dashboard');
            navigate('/tenant-dashboard');
          });
        }
      } else if (user.role === 'agent') {
        navigate(user.profileComplete ? '/agent-dashboard' : '/profile-setup');
      } else if (user.role === 'owner' || user.role === 'manager') {
        navigate(user.profileComplete ? '/owner-dashboard' : '/profile-setup');
      } else if (user.role === 'buyer') {
        navigate(user.profileComplete ? '/buyer-dashboard' : '/profile-setup');
      } else {
        navigate('/dashboard');
      }
      return;
    }
  }, [authLoading, isAuthenticated, navigate, user, location.state]);

  // Show loading while checking authentication
  if (authLoading || (!isAuthenticated || !user)) {
    console.log('SelectRole: Loading or not authenticated, showing loading');
    return null;
  }

  const roleOptions = [
    {
      value: 'tenant',
      label: 'Tenant',
      description: 'Searching for a rental property',
      icon: Home,
      color: 'text-orange-600',
    },
    {
      value: 'buyer',
      label: 'Home Seeker',
      description: 'Looking to buy, rent or find a roommate',
      icon: Users,
      color: 'text-blue-600',
      disabled: true,
    },
    {
      value: 'owner',
      label: 'House Owner',
      description: 'Managing or selling your property',
      icon: Home,
      color: 'text-green-600',
      disabled: true,
    },
    {
      value: 'agent',
      label: 'Agent',
      description: 'Assisting clients in real estate transactions',
      icon: User,
      color: 'text-purple-600',
      disabled: true,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('HandleSubmit called with selectedRole:', selectedRole);
    
    if (!selectedRole) {
      toast.error('Please select a role to continue');
      return;
    }

    // Special handling for tenant role
    if (selectedRole === 'tenant') {
      console.log('Setting showTenantTypeSelection to true');
      setShowTenantTypeSelection(true);
      return;
    }

    // Special handling for buyer role — ask for intent first
    if (selectedRole === 'buyer') {
      setShowBuyerIntentSelection(true);
      return;
    }

    console.log('Processing non-tenant role:', selectedRole);

    setLoading(true);
    setPageLoading(true);

    try {
      console.log('Updating user role to:', selectedRole);

      const response = await profileApi.selectRole(selectedRole);
      console.log('SelectRole API response:', response);

      if (!response.success || !response.data) {
        throw new Error(response.message || response.error || 'Failed to select role');
      }

      const responseData = response.data;
      const updatedUserData = {
        ...user,
        role: responseData?.role?.name || responseData?.user?.role || selectedRole,
        profileComplete: responseData?.profile?.is_profile_complete || (selectedRole === 'buyer'),
      };
      console.log('Updating user with:', updatedUserData);
      updateUser(updatedUserData);

      toast.success('Role selected successfully!');
      navigate('/dashboard');

    } catch (error) {
      console.error('SelectRole error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error selecting role. Please try again.';
      toast.error(errorMessage);

      if (errorMessage.includes('Session expired') || errorMessage.includes('log in again')) {
        navigate('/');
      }
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  const handleTenantVerificationComplete = async () => {
    setLoading(true);
    setPageLoading(true);

    try {
      console.log('Tenant verification complete, setting role to tenant');

      const response = await profileApi.selectRole('tenant');
      console.log('Tenant role selection API response:', response);

      if (!response.success || !response.data) {
        throw new Error(response.message || response.error || 'Failed to set tenant role');
      }

      const responseData = response.data;
      const updatedUserData = {
        ...user,
        role: responseData?.role?.name || responseData?.user?.role || 'tenant',
        profileComplete: responseData?.profile?.is_profile_complete || true,
        tenantVerified: true
      };
      console.log('Updating tenant user data:', updatedUserData);
      updateUser(updatedUserData);

      toast.success('Tenant role set successfully!');
      navigate('/dashboard');

    } catch (error) {
      console.error('Tenant role setting error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error setting tenant role. Please try again.';
      toast.error(errorMessage);

      if (errorMessage.includes('Session expired') || errorMessage.includes('log in again')) {
        navigate('/');
      }
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  const handleTenantTypeSelection = (tenantType: string) => {
    console.log('handleTenantTypeSelection called with:', tenantType);
    setSelectedTenantType(tenantType);
    console.log('Selected tenant type set to:', tenantType);
  };

  const handleTenantTypeContinue = async () => {
    console.log('handleTenantTypeContinue called with selectedTenantType:', selectedTenantType);
    setShowTenantTypeSelection(false); // Hide the selection page

    if (selectedTenantType === 'external') {
      console.log('Setting showExternalTenantForm to true');
      setShowExternalTenantForm(true);
    } else {
      // Platform tenant - set role and redirect directly to dashboard
      console.log('Platform tenant selected, setting role and redirecting to dashboard');
      setLoading(true);
      setPageLoading(true);

      try {
        const response = await profileApi.selectRole('tenant');
        console.log('Platform tenant role selection API response:', response);

        if (!response.success || !response.data) {
          throw new Error(response.message || response.error || 'Failed to set tenant role');
        }

        const responseData = response.data;
        const updatedUserData = {
          ...user,
          role: responseData?.role?.name || responseData?.user?.role || 'tenant',
          profileComplete: responseData?.profile?.is_profile_complete || true,
          isPlatformTenant: true,
          tenantVerified: false,
          manualVerificationStatus: 'not_started' as const
        };
        console.log('Updating platform tenant user data:', updatedUserData);
        updateUser(updatedUserData);

        toast.success('Welcome! Please verify your tenancy to unlock all features.');
        navigate('/tenant-dashboard');
      } catch (error) {
        console.error('Platform tenant setup error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error setting up account. Please try again.';
        toast.error(errorMessage);

        if (errorMessage.includes('Session expired') || errorMessage.includes('log in again')) {
          navigate('/');
        }
      } finally {
        setLoading(false);
        setPageLoading(false);
      }
    }
    console.log('handleTenantTypeContinue completed');
  };

  const handleBackToRoleSelection = () => {
    setShowTenantTypeSelection(false);
    setShowExternalTenantForm(false);
    setShowTenantVerification(false);
    setShowBuyerIntentSelection(false);
    setSelectedRole('');
    setSelectedTenantType('');
    setSelectedBuyerIntent('');
  };

  const handleBuyerIntentContinue = async () => {
    if (!selectedBuyerIntent) return;
    setLoading(true);
    setPageLoading(true);
    try {
      const response = await profileApi.selectRole('buyer');
      if (!response.success || !response.data) {
        throw new Error(response.message || response.error || 'Failed to set role');
      }
      const responseData = response.data;
      const updatedUserData = {
        ...user,
        role: responseData?.role?.name || responseData?.user?.role || 'buyer',
        profileComplete: responseData?.profile?.is_profile_complete || true,
        buyerIntent: selectedBuyerIntent,
      };
      updateUser(updatedUserData);
      toast.success('Welcome! Your account is ready.');
      navigate('/buyer-dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error setting up account. Please try again.';
      toast.error(errorMessage);
      if (errorMessage.includes('Session expired') || errorMessage.includes('log in again')) {
        navigate('/');
      }
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  const handleExternalTenantComplete = async () => {
    setLoading(true);
    setPageLoading(true);

    try {
      console.log('External tenant form completed, setting role to tenant');

      const response = await profileApi.selectRole('tenant');
      console.log('External tenant role selection API response:', response);

      if (!response.success || !response.data) {
        throw new Error(response.message || response.error || 'Failed to set tenant role');
      }

      const responseData = response.data;
      const updatedUserData = {
        ...user,
        role: responseData?.role?.name || responseData?.user?.role || 'tenant',
        profileComplete: responseData?.profile?.is_profile_complete || true,
        tenantVerified: true,
        tenantType: 'external'
      };
      console.log('Updating external tenant user data:', updatedUserData);
      updateUser(updatedUserData);

      toast.success('External tenant registration completed successfully!');
      navigate('/external-tenant-dashboard');

    } catch (error) {
      console.error('External tenant setup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error completing registration. Please try again.';
      toast.error(errorMessage);

      if (errorMessage.includes('Session expired') || errorMessage.includes('log in again')) {
        navigate('/');
      }
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  const handleBackToTenantTypeSelection = () => {
    setShowExternalTenantForm(false);
    setShowTenantVerification(false);
    setShowTenantTypeSelection(true);
    setSelectedTenantType(''); // Reset selection when going back
  };

  if (pageLoading) {
    console.log('Rendering tenant type selection page');
    return null;
  }

  console.log('Current state - showTenantTypeSelection:', showTenantTypeSelection, 'showExternalTenantForm:', showExternalTenantForm, 'showTenantVerification:', showTenantVerification);

  // Show tenant type selection
  if (showTenantTypeSelection) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-screen bg-white px-4 sm:px-10 md:px-40 flex justify-center py-5">
          <div className="max-w-[600px] w-full mt-10">
            <div className="p-4 mb-6">
              <p className="text-foreground tracking-tight text-2xl sm:text-[32px] font-bold leading-tight">
                Tell us about your tenancy
              </p>
              <p className="text-muted-foreground mt-2">
                We need a few details to set up your dashboard.
              </p>
            </div>

            <div className="space-y-8 p-4">
              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  (Optional) Do you have Agent, Agency or Landlord's Pin?
                  <span className="block text-xs font-normal text-muted-foreground mt-1">
                    This pin only belongs to homeduk.com properties.
                  </span>
                </Label>

                <RadioGroup
                  value={hasPin}
                  onValueChange={(val: "yes" | "no") => {
                    setHasPin(val);
                    setSelectedTenantType(
                      val === "yes" ? "internal" : "external",
                    );
                  }}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-md px-4 py-3 flex-1 cursor-pointer hover:bg-blue-100">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes" className="cursor-pointer flex-1">
                      Yes, I have one
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md px-4 py-3 flex-1 cursor-pointer hover:bg-blue-100">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no" className="cursor-pointer flex-1">
                      No, I don't
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              {hasPin === "yes" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="pin">Enter Pin Code</Label>
                  <input
                    id="pin"
                    type="text"
                    placeholder="e.g. HD-1234"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between p-4 gap-4 mt-6">
              <Button
                variant="ghost"
                onClick={handleBackToRoleSelection}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Back
              </Button>

              <Button
                onClick={handleTenantTypeContinue}
                disabled={!hasPin || (hasPin === "yes" && !pinCode)}
                className={`w-full sm:w-auto min-w-[200px] order-1 sm:order-2 transition-all shadow-lg ${
                  hasPin ? "bg-primary scale-105" : ""
                }`}
              >
                {loading ? "Processing..." : "Continue"}
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show buyer intent selection
  if (showBuyerIntentSelection) {
    const intentOptions = [
      {
        value: 'buy' as const,
        label: 'Buy a Property',
        description: "I'm looking to purchase a property",
        icon: Home,
        color: 'text-blue-600',
      },
      {
        value: 'rent' as const,
        label: 'Rent a Property',
        description: "I'm looking to rent a place to live",
        icon: Building2,
        color: 'text-emerald-600',
      },
      {
        value: 'find_roommate' as const,
        label: 'Find a Roommate',
        description: "I'm looking to share a place with someone",
        icon: Users,
        color: 'text-purple-600',
      },
    ];

    return (
      <Layout showFooter={false}>
        <div className="min-h-screen bg-white px-4 sm:px-10 md:px-40 flex justify-center py-5">
          <div className="max-w-[960px] w-full">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-foreground tracking-light text-2xl sm:text-[32px] font-bold leading-tight min-w-0">
                What are you looking for?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
              {intentOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => setSelectedBuyerIntent(option.value)}
                  className={`flex flex-col gap-3 rounded-lg border p-6 cursor-pointer transition-all hover:bg-accent hover:shadow-md min-h-[160px] ${
                    selectedBuyerIntent === option.value
                      ? 'border-primary ring-2 ring-primary bg-primary/5'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className={option.color}>
                    <option.icon size={24} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-foreground text-base font-bold leading-tight">{option.label}</h2>
                    <p className="text-muted-foreground hover:text-foreground text-sm font-normal leading-normal">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between p-4 gap-4">
              <Button variant="outline" onClick={handleBackToRoleSelection} className="w-full sm:w-auto min-w-[200px]">
                Back to Role Selection
              </Button>
              {selectedBuyerIntent && (
                <Button onClick={handleBuyerIntentContinue} disabled={loading} className="w-full sm:w-auto min-w-[200px]">
                  {loading ? 'Setting up your account...' : 'Continue'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show external tenant form
  if (showExternalTenantForm) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 py-8">
          <ExternalTenantForm 
            onComplete={handleExternalTenantComplete}
            onBack={handleBackToTenantTypeSelection}
          />
        </div>
      </Layout>
    );
  }

  // Show tenant verification form (for internal tenants)
  if (showTenantVerification) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 py-8">
          <TenantVerification 
            onComplete={handleTenantVerificationComplete}
            onBack={handleBackToTenantTypeSelection}
          />
        </div>
      </Layout>
    );
  }

  console.log('SelectRole: Rendering select role page for user:', user);

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-white px-4 sm:px-10 md:px-40 flex justify-center py-5">
        <div className="max-w-[960px] w-full">
          <div className="flex flex-wrap justify-between gap-3 p-4">
            <p className="text-foreground tracking-light text-2xl sm:text-[32px] font-bold leading-tight min-w-0">
              Choose your role
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <RadioGroup value={selectedRole} onValueChange={setSelectedRole}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4">
                {roleOptions.map((option) => {
                  const isDisabled = option.disabled;
                  return (
                    <div key={option.value} className="relative">
                      <RadioGroupItem
                        value={option.value}
                        id={option.value}
                        className="sr-only"
                        disabled={isDisabled}
                      />
                      <Label
                        htmlFor={option.value}
                        className={`block relative ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div
                          className={`group flex flex-1 gap-3 rounded-lg border border-border bg-card p-4 flex-col transition-all min-h-[140px]
                          ${
                            isDisabled
                              ? "opacity-60 bg-gray-50/50 grayscale-[0.3]"
                              : "hover:bg-accent hover:shadow-md hover:text-foreground"
                          } 
                          ${selectedRole === option.value ? "ring-2 ring-primary bg-primary/5" : ""}
                        `}
                        >
                          {isDisabled && (
                            <span className="absolute top-2 right-2 text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider border border-slate-300">
                              Coming Soon
                            </span>
                          )}
                          <div className={option.color}>
                            <option.icon size={24} />
                          </div>
                          <div className="flex flex-col gap-1 mt-auto">
                            <h2 className="text-foreground text-base font-bold leading-tight">
                              {option.label}
                            </h2>
                            <p className="text-muted-foreground group-hover:text-foreground text-xs font-normal leading-normal">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
            
            <div className="flex justify-center p-4">
              <Button
                type="submit"
                className="w-full sm:w-auto min-w-[200px]"
                disabled={loading || !selectedRole}
                onClick={() => console.log('Continue button clicked, selectedRole:', selectedRole, 'about to submit form')}
              >
                {loading ? 'Setting up your account...' : 'Continue'}
              </Button>
              {/* Debug info */}
              {import.meta.env.DEV && (
                <div className="ml-4 text-xs text-gray-500">
                  Role: {selectedRole || 'none'} | Disabled: {loading || !selectedRole ? 'yes' : 'no'} | States: TTS:{showTenantTypeSelection ? 'T' : 'F'} ETF:{showExternalTenantForm ? 'T' : 'F'} TV:{showTenantVerification ? 'T' : 'F'}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SelectRole;
