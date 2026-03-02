import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout/Layout";
import { authApi } from "@/services/api";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error" | "pending"
  >("loading");
  const [loading, setLoading] = useState(false);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else if (email) {
      // User just registered and is waiting for email verification
      setVerificationStatus("pending");
    } else {
      // No token and no email - show error
      setVerificationStatus("error");
    }
  }, [token, email]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      console.log("Starting email verification with token:", verificationToken);
      const response = await authApi.verifyEmail(verificationToken);
      console.log("Verification response:", response);

      if (response.success) {
        setVerificationStatus("success");
        toast.success("Email verified successfully!");
      } else {
        console.error("Verification failed:", response);
        setVerificationStatus("error");
        toast.error(
          response.message || response.error || "Email verification failed.",
        );
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      setVerificationStatus("error");
      const errorMessage =
        error.message || "Email verification failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  const resendVerificationEmail = async () => {
    if (!email) {
      toast.error("Email address not found. Please register again.");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.resendVerification(email);

      if (response.success) {
        toast.success("Verification email sent! Please check your inbox.");
      }
    } catch (error: any) {
      const errorMessage =
        error.message || "Failed to send verification email. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
          {/* Header to match Login/Register */}
          <div className="border-b border-gray-200 py-3 text-center">
            <h2 className="text-sm font-semibold text-gray-700">
              Email Verification
            </h2>
          </div>

          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center">
                <Mail className="h-5 w-5 mr-2 text-red-600" />
                Verify Your Email
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 pt-0 space-y-6">
              {verificationStatus === "loading" && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                    <RefreshCw className="h-8 w-8 text-red-600 animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Verifying your email...
                  </h3>
                  <p className="text-gray-600">
                    Please wait while we verify your email address.
                  </p>
                </div>
              )}

              {verificationStatus === "pending" && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Check Your Email
                  </h3>
                  <p className="text-gray-600">
                    We've sent a verification email to <strong>{email}</strong>.
                    Please check your inbox and click the verification link to
                    activate your account.
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 text-left">
                    <p className="font-medium mb-2 text-gray-800">
                      Didn't receive the email?
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Check your spam or junk folder</li>
                      <li>Make sure you entered the correct email address</li>
                      <li>Wait a few minutes for the email to arrive</li>
                    </ul>
                  </div>
                  <Button
                    onClick={resendVerificationEmail}
                    disabled={loading}
                    className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300"
                  >
                    {loading ? "Sending..." : "Resend Verification Email"}
                  </Button>
                  <div className="pt-4 border-t border-gray-100">
                    <Link to="/login">
                      <Button
                        variant="outline" className="w-full h-11 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                      >
                        Back to Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {verificationStatus === "success" && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Email Verified!
                  </h3>
                  <p className="text-gray-600">
                    Your email has been successfully verified. You can now
                    access all features of your account.
                  </p>
                  <Link to="/login">
                    <Button className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300">
                      Continue to Sign In
                    </Button>
                  </Link>
                </div>
              )}

              {verificationStatus === "error" && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Verification Failed
                  </h3>
                  <p className="text-gray-600">
                    We couldn't verify your email address. The link may have
                    expired or is invalid.
                  </p>
                  {email && (
                    <Button
                      onClick={resendVerificationEmail}
                      disabled={loading}
                      className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300"
                    >
                      {loading ? "Sending..." : "Resend Verification Email"}
                    </Button>
                  )}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mb-4">
                      Need help? Contact our support team or try registering
                      again.
                    </p>
                    <div className="space-y-2">
                      <Link to="/register">
                        <Button
                          variant="outline"
                          className="w-full h-11 border-gray-300 hover:bg-gray-50 text-gray-700"
                        >
                          Register Again
                        </Button>
                      </Link>
                      <Link to="/login">
                        <Button
                          variant="outline"
                          className="w-full h-11 border-gray-300 hover:bg-gray-50 text-gray-700"
                        >
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
