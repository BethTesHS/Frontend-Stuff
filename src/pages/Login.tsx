import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout/Layout';
import { handleGoogleAuth } from '@/services/googleAuth';

const Login = () => {
  const { login, loginWithSSO } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      setPageLoading(true);

      const redirectPath = localStorage.getItem('login_redirect_path') || '/select-role';
      localStorage.removeItem('login_redirect_path');

      navigate(redirectPath);
    } catch (error: any) {
      const errorMessage = error.message || 'Invalid credentials. Please try again.';
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setPageLoading(true);

      const result = await handleGoogleAuth();
      if (result.success && result.data) {
        await loginWithSSO(result.data);

        toast.success('Successfully logged in with Google!');
        const redirectPath = localStorage.getItem('login_redirect_path') || '/select-role';
        localStorage.removeItem('login_redirect_path');

        navigate(redirectPath);
      }
    } catch (error: any) {
      toast.error(error.message || 'Google login failed. Please try again.');
      setLoading(false);
      setPageLoading(false);
    }
  };

  const handleMicrosoftLogin = () => {
    setPageLoading(true);
    setTimeout(() => {
      toast.info('Microsoft login coming soon!');
      setPageLoading(false);
    }, 1500);
  };

  if (pageLoading) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mb-4"></div>
            <p className="text-gray-700 font-semibold text-lg">Signing you in...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 py-3 text-center">
            <h2 className="text-sm font-semibold text-gray-700">Log in or sign up</h2>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome to Homed</h1>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg h-12 px-4 text-gray-800 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    placeholder="your@email.com"
                  />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-red-600 hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg h-12 px-4 text-gray-800 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    placeholder="Enter your password"
                  />
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Continue Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold h-12 rounded-lg transition-all duration-300"
              >
                {loading ? 'Signing in...' : 'Continue'}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-3 text-sm text-gray-500">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Social Logins */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleGoogleLogin}
                type="button"
                className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition"
                aria-label="Continue with Google"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>

              <button
                onClick={handleMicrosoftLogin}
                type="button"
                className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition"
                aria-label="Continue with Microsoft"
              >
                <svg className="w-6 h-6" viewBox="0 0 23 23">
                  <path fill="#f25022" d="M0 0h11v11H0z"/>
                  <path fill="#00a4ef" d="M12 0h11v11H12z"/>
                  <path fill="#7fba00" d="M0 12h11v11H0z"/>
                  <path fill="#ffb900" d="M12 12h11v11H12z"/>
                </svg>
              </button>
            </div>

            {/* Sign Up Link
            <p className="mt-6 text-center text-sm text-gray-600">
              Don’t have an account?{' '}
              <Link to="/register" className="text-pink-600 hover:underline font-medium">
                Sign up
              </Link>
            </p> */}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
