import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout/Layout';
import { authApi } from '@/services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authApi.forgotPassword(email);
      if (response.success) {
        setEmailSent(true);
        toast.success('Password reset email sent!');
      }
    } catch (error: any) {
      const errorMessage =
        error.message || 'Failed to send password reset email. Please try again.';
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
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password</h1>
            <p className="text-sm text-gray-600 mb-6">
              Enter your email address and we’ll send you a link to reset your password.
            </p>

            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg h-12 px-4 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="your@email.com"
                    />
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold h-12 rounded-lg transition-all duration-300"
                >
                  {loading ? 'Sending link...' : 'Send Reset Link'}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-5">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Check your email
                </h3>
                <p className="text-gray-600">
                  We’ve sent a password reset link to <strong>{email}</strong>.
                </p>
                <p className="text-sm text-gray-500">
                  Didn’t receive the email? Check your spam folder or try again.
                </p>

                <button
                  onClick={() => setEmailSent(false)}
                  className="w-full border border-gray-300 rounded-lg h-12 text-gray-700 hover:bg-gray-50 transition"
                >
                  Send another email
                </button>
              </div>
            )}

            {/* Back Link */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-emerald-600 hover:underline font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
