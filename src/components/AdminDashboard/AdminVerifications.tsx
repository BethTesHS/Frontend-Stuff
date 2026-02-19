import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserCheck, Mail, Phone, Clock, FileText, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PENDING_VERIFICATIONS } from '@/constants/mockMessages';

export const AdminVerifications = () => {
  const { toast } = useToast();
  const [verifications, setVerifications] = useState(PENDING_VERIFICATIONS);
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleReviewVerification = (verification: any) => {
    setSelectedVerification(verification);
    setReviewDialogOpen(true);
  };

  const handleApproveVerification = (id: string) => {
    const verification = verifications.find(v => v.id === id);
    if (!verification) return;

    setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: 'approved' } : v));
    toast({
      title: "Verification Approved",
      description: `${verification.name} has been approved as a ${verification.type}.`,
    });
  };

  const handleRejectVerification = (id: string, reason?: string) => {
    const verification = verifications.find(v => v.id === id);
    if (!verification) return;

    setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: 'rejected', rejectionReason: reason } : v));
    toast({
      title: "Verification Rejected",
      description: `${verification.name}'s application has been rejected.`,
      variant: "destructive"
    });
    setRejectionReason('');
  };

  const pendingItems = verifications.filter(v => v.status === 'pending' || v.status === 'review');

  return (
    <>
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gray-800 dark:text-gray-100">
            <div className="flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
              Pending Verifications
            </div>
            <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-200">
              {pendingItems.length} pending
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingItems.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No pending verifications</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">All verifications have been processed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingItems.map((verification) => (
                <div key={verification.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800/30 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant={verification.type === 'agent' ? 'default' : 'secondary'}>
                          {verification.type.toUpperCase()}
                        </Badge>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{verification.name}</h3>
                        {verification.status === 'review' && (
                          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                            Under Review
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {verification.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {verification.phone}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {verification.submittedAt}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Documents: {verification.documents.join(', ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                        onClick={() => handleReviewVerification(verification)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
                        onClick={() => handleApproveVerification(verification.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                          <DialogHeader>
                            <DialogTitle className="text-gray-900 dark:text-gray-100">
                              Reject Verification - {verification.name}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Reason for Rejection
                              </label>
                              <Textarea
                                placeholder="Please provide a reason for rejecting this verification..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={4}
                                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <DialogTrigger asChild>
                                <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                  Cancel
                                </Button>
                              </DialogTrigger>
                              <DialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleRejectVerification(verification.id, rejectionReason)}
                                >
                                  Confirm Rejection
                                </Button>
                              </DialogTrigger>
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
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">
              Review Verification Details
            </DialogTitle>
          </DialogHeader>
          {selectedVerification && (
            <div className="space-y-6">
              {/* Applicant Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Applicant Information
                  </h3>
                  <Badge variant={selectedVerification.type === 'agent' ? 'default' : 'secondary'}>
                    {selectedVerification.type.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedVerification.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedVerification.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedVerification.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Submitted</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedVerification.submittedAt}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Submitted Documents
                </h3>
                <div className="space-y-2">
                  {selectedVerification.documents.map((doc: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">{doc}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="dark:border-gray-600 dark:text-gray-300"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setReviewDialogOpen(false)}
                  className="dark:border-gray-600 dark:text-gray-300"
                >
                  Close
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900 dark:text-gray-100">
                        Reject Verification - {selectedVerification.name}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Reason for Rejection
                        </label>
                        <Textarea
                          placeholder="Please provide a reason for rejecting this verification..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={4}
                          className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <DialogTrigger asChild>
                          <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                            Cancel
                          </Button>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              handleRejectVerification(selectedVerification.id, rejectionReason);
                              setReviewDialogOpen(false);
                            }}
                          >
                            Confirm Rejection
                          </Button>
                        </DialogTrigger>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
                  onClick={() => {
                    handleApproveVerification(selectedVerification.id);
                    setReviewDialogOpen(false);
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};