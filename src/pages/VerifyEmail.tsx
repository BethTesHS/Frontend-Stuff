
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Building2, Mail, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout/Layout';
import { authApi } from '@/services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading');
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else if (email) {
      // User just registered and is waiting for email verification
      setVerificationStatus('pending');
    } else {
      // No token and no email - show error
      setVerificationStatus('error');
    }
  }, [token, email]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      console.log('Starting email verification with token:', verificationToken);
      const response = await authApi.verifyEmail(verificationToken);
      console.log('Verification response:', response);

      if (response.success) {
        setVerificationStatus('success');
        toast.success('Email verified successfully!');
      } else {
        console.error('Verification failed:', response);
        setVerificationStatus('error');
        toast.error(response.message || response.error || 'Email verification failed.');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setVerificationStatus('error');
      const errorMessage = error.message || 'Email verification failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  const resendVerificationEmail = async () => {
    if (!email) {
      toast.error('Email address not found. Please register again.');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.resendVerification(email);
      
      if (response.success) {
        toast.success('Verification email sent! Please check your inbox.');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send verification email. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative max-w-md w-full space-y-8 z-10">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mb-6">
              <Home className="h-8 w-8 text-white" />
            </div>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Homed</h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Email Verification
            </h2>
          </div>

          <Card className="bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl text-gray-800 flex items-center justify-center">
                <Mail className="h-5 w-5 mr-2" />
                Verify Your Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {verificationStatus === 'loading' && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Verifying your email...</h3>
                  <p className="text-gray-600">
                    Please wait while we verify your email address.
                  </p>
                </div>
              )}

              {verificationStatus === 'pending' && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Check Your Email</h3>
                  <p className="text-gray-600">
                    We've sent a verification email to <strong>{email}</strong>.
                    Please check your inbox and click the verification link to activate your account.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
                    <p className="font-medium mb-2">Didn't receive the email?</p>
                    <ul className="list-disc list-inside space-y-1 text-left">
                      <li>Check your spam or junk folder</li>
                      <li>Make sure you entered the correct email address</li>
                      <li>Wait a few minutes for the email to arrive</li>
                    </ul>
                  </div>
                  <Button
                    onClick={resendVerificationEmail}
                    disabled={loading}
                    className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg transition-all duration-200 hover:-translate-y-1"
                  >
                    {loading ? 'Sending...' : 'Resend Verification Email'}
                  </Button>
                  <div className="pt-4 border-t border-white/20">
                    <Link to="/login">
                      <Button variant="outline" className="w-full bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30">
                        Back to Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {verificationStatus === 'success' && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Email Verified!</h3>
                  <p className="text-gray-600">
                    Your email has been successfully verified. You can now access all features of your account.
                  </p>
                  <Link to="/login">
                    <Button className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg transition-all duration-200 hover:-translate-y-1">
                      Continue to Sign In
                    </Button>
                  </Link>
                </div>
              )}

              {verificationStatus === 'error' && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Verification Failed</h3>
                  <p className="text-gray-600">
                    We couldn't verify your email address. The link may have expired or is invalid.
                  </p>
                  {email && (
                    <Button
                      onClick={resendVerificationEmail}
                      disabled={loading}
                      className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg transition-all duration-200 hover:-translate-y-1"
                    >
                      {loading ? 'Sending...' : 'Resend Verification Email'}
                    </Button>
                  )}
                  <div className="pt-4 border-t border-white/20">
                    <p className="text-sm text-gray-600 mb-4">
                      Need help? Contact our support team or try registering again.
                    </p>
                    <div className="space-y-2">
                      <Link to="/register">
                        <Button variant="outline" className="w-full bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30">
                          Register Again
                        </Button>
                      </Link>
                      <Link to="/login">
                        <Button variant="outline" className="w-full bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30">
                          Back to Sign In
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyEmail;
