import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAgency } from '@/contexts/AgencyContext';
import { toast } from 'sonner';
import { agencyApi } from '@/services/agencyApi';
import { setAgencyToken, setAgencyUser, setAgencyData } from '@/utils/tokenStorage';

const AgencyLogin = () => {
  const navigate = useNavigate();
  const { agency, loading: agencyLoading } = useAgency();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await agencyApi.login({
        email: formData.email,
        password: formData.password,
      });

      setAgencyToken(response.access_token);

      const userData = {
        id: response.agency.id,
        email: response.agency.email,
        name: response.agency.name,
        role: 'agency_admin',
        agency_slug: response.agency.slug,
        agency_name: response.agency.name,
        phone: response.agency.phone,
        address: response.agency.address
      };
      setAgencyUser(userData);
      setAgencyData(response.agency);

      console.log('AgencyLogin: Successfully stored user data:', userData);
      console.log('AgencyLogin: Successfully stored agency data:', response.agency);

      toast.success('Login successful! Redirecting to dashboard...');

      setTimeout(() => {
        navigate(`/dashboard?agency=${response.agency.slug}`);
      }, 100);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (agencyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <button 
            onClick={() => window.location.href = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 backdrop-blur-sm border border-primary/20 text-sm font-medium text-primary hover:text-primary-foreground hover:bg-primary hover:border-primary transition-all duration-200 group shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to main site
          </button>
        </div>

        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            {agency?.logo ? (
              <img 
                src={agency.logo} 
                alt={`${agency.name} logo`}
                className="h-16 w-auto mx-auto"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">
                  {agency?.name?.charAt(0) || 'A'}
                </span>
              </div>
            )}
            <div>
              <CardTitle className="text-2xl font-bold">
                Welcome to {agency?.name || 'Agency Portal'}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Sign in to your agency dashboard
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    className="pl-10 h-12 text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-12 text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Need help accessing your account?{' '}
              <Link to="/contact" className="text-primary hover:underline">
                Contact support
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 {agency?.name || 'Agency'}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgencyLogin;