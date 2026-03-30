import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import TenantVerification from "@/components/TenantVerification/TenantVerification";

export const TenantVerificationContent = ({ user, navigate }: any) => {
  const { updateUser } = useAuth();
  const { toast } = useToast();

  const handleVerificationComplete = async () => {
    try {
      const updatedUser = {
        ...user,
        tenantVerified: true,
        manualVerificationStatus: 'verified' as const
      };

      updateUser(updatedUser);

      toast({
        title: "Verification Submitted",
        description: "Your tenancy verification has been submitted for review.",
      });

      window.location.reload();
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Error",
        description: "Failed to submit verification. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (user?.tenantVerified) {
    return (
      <div className="space-y-6">
        <Alert className="border-green-300 dark:border-green-700 bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Your tenancy has been verified! You have full access to all platform features.
          </AlertDescription>
        </Alert>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Verification Complete
            </h3>
            <p className="text-muted-foreground mb-6">
              Your tenancy verification has been approved. You can now access all features.
            </p>
            <Button onClick={() => navigate('/tenant-dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert className="border-orange-300 dark:border-orange-700 bg-orange-100 dark:bg-orange-900/30">
        <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          Please complete your tenancy verification to access all features. Some functionality is limited until verified.
        </AlertDescription>
      </Alert>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Verify Your Tenancy
          </h3>
          <p className="text-muted-foreground">
            Complete the verification process below to unlock all features and start managing your tenancy.
          </p>
        </div>

        <TenantVerification
          onComplete={handleVerificationComplete}
          onBack={() => navigate('/tenant-dashboard')}
        />
      </div>
    </div>
  );
};