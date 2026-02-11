import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout/Layout';
import { authApi } from '@/services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      toast.error('Invalid or missing reset token');
      navigate('/forgot-password');
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.resetPassword(token, password, confirmPassword);
      if (response.success) {
        setResetSuccess(true);
        toast.success('Password reset successfully!');

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error: any) {
      const errorMessage =
        error.message || 'Failed to reset password. Please try again or request a new reset link.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 py-3 text-center">
            <h2 className="text-sm font-semibold text-gray-700">Reset your password</h2>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {!resetSuccess ? (
              <>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Create New Password</h1>
                <p className="text-sm text-gray-600 mb-6">
                  Enter your new password below. Make sure it's at least 8 characters long.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Password Input */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg h-12 px-4 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        placeholder="Enter new password"
                        minLength={8}
                      />
                      <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg h-12 px-4 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        placeholder="Confirm new password"
                        minLength={8}
                      />
                      <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p className="font-medium">Password must:</p>
                    <ul className="list-disc list-inside space-y-0.5 ml-2">
                      <li>Be at least 8 characters long</li>
                      <li>Match in both fields</li>
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold h-12 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Resetting password...' : 'Reset Password'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center space-y-5">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Password Reset Successful!
                </h3>
                <p className="text-gray-600">
                  Your password has been successfully reset.
                </p>
                <p className="text-sm text-gray-500">
                  Redirecting you to the login page...
                </p>
              </div>
            )}

            {/* Back Link */}
            {!resetSuccess && (
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm text-emerald-600 hover:underline font-medium"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;
