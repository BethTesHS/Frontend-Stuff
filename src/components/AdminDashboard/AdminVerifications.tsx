import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  UserCheck,
  Mail,
  Phone,
  Clock,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  tenantApprovalApi,
  TenantVerificationRequest,
} from "@/services/tenantApprovalApi";

export const AdminVerifications = () => {
  const { toast } = useToast();
  const [verifications, setVerifications] = useState<
    TenantVerificationRequest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] =
    useState<TenantVerificationRequest | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const response = await tenantApprovalApi.adminListRequests(1, 50);
      if (response.status === 200) {
        setVerifications(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load verifications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleReviewVerification = (
    verification: TenantVerificationRequest,
  ) => {
    setSelectedVerification(verification);
    setReviewDialogOpen(true);
  };

  const handleApproveVerification = async (id: number) => {
    try {
      const response = await tenantApprovalApi.adminUpdateRequest({
        id,
        status: "approved",
        admin_notes: "Approved via admin dashboard",
      });

      if (response.status === 200) {
        setVerifications((prev) => prev.filter((v) => v.id !== id));
        toast({
          title: "Verification Approved",
          description: "The request has been successfully approved.",
        });
      }
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: "Could not update the verification status.",
        variant: "destructive",
      });
    }
  };

  const handleRejectVerification = async (id: number, reason: string) => {
    if (!reason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await tenantApprovalApi.adminUpdateRequest({
        id,
        status: "rejected",
        rejection_reason: reason,
        admin_notes: "Rejected via admin dashboard",
      });

      if (response.status === 200) {
        setVerifications((prev) => prev.filter((v) => v.id !== id));
        toast({
          title: "Verification Rejected",
          description: "The applicant has been notified of the rejection.",
          variant: "destructive",
        });
        setRejectionReason("");
      }
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: "Could not update the verification status.",
        variant: "destructive",
      });
    }
  };

  const pendingItems = verifications.filter((v) => v.status === "pending");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <>
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gray-800 dark:text-gray-100">
            <div className="flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
              Pending Verifications
            </div>
            <Badge
              variant="secondary"
              className="dark:bg-gray-700 dark:text-gray-200"
            >
              {pendingItems.length} pending
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingItems.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No pending verifications
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                All verifications have been processed
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingItems.map((verification) => (
                <div
                  key={verification.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800/30 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className="border-blue-200 text-blue-700"
                        >
                          {verification.verification_method?.toUpperCase() ||
                            "REQUEST"}
                        </Badge>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                          {verification.tenant_full_name}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {verification.tenant_email || "N/A"}
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {verification.tenant_phone || "N/A"}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(
                            verification.created_at,
                          ).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Property:{" "}
                          {verification.property_address ||
                            verification.property_code ||
                            "Generic Request"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReviewVerification(verification)}
                      >
                        <Eye className="w-4 h-4 mr-1" /> Review
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() =>
                          handleApproveVerification(verification.id)
                        }
                      >
                        <CheckCircle className="w-4 h-4 mr-1" /> Approve
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Reject - {verification.tenant_full_name}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Reason for rejection..."
                              value={rejectionReason}
                              onChange={(e) =>
                                setRejectionReason(e.target.value)
                              }
                            />
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  handleRejectVerification(
                                    verification.id,
                                    rejectionReason,
                                  )
                                }
                              >
                                Confirm Rejection
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>Review Verification Details</DialogTitle>
          </DialogHeader>
          {selectedVerification && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Tenant Name</p>
                  <p className="font-medium">
                    {selectedVerification.tenant_full_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Rent Amount</p>
                  <p className="font-medium">
                    {selectedVerification.monthly_rent || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">
                    Move-in Date
                  </p>
                  <p className="font-medium">
                    {selectedVerification.move_in_date
                      ? new Date(
                          selectedVerification.move_in_date,
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Method</p>
                  <p className="font-medium capitalize">
                    {selectedVerification.verification_method}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setReviewDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  className="bg-green-600 text-white"
                  onClick={() => {
                    handleApproveVerification(selectedVerification.id);
                    setReviewDialogOpen(false);
                  }}
                >
                  Approve Application
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};