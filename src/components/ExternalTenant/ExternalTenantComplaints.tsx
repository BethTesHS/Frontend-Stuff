import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  Eye,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { externalTenantComplaintsApi, type ExternalTenantComplaint } from "@/services/externalTenantComplaintsApi";

const ExternalTenantComplaints = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [showNewComplaintForm, setShowNewComplaintForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [complaints, setComplaints] = useState<ExternalTenantComplaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState({
    total_complaints: 0,
    open_complaints: 0,
    resolved_complaints: 0
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    current_page: 1,
    per_page: 10,
    has_next: false,
    has_prev: false
  });
  const [formData, setFormData] = useState({
    issue_type: "",
    urgency: "medium",
    description: "",
    additional_notes: ""
  });

  // Fetch complaints data
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 10,
        ...(activeTab !== "all" && { status: activeTab })
      };
      
      const response = await externalTenantComplaintsApi.getComplaints(params);
      
      if (response.success && response.data) {
        setComplaints(response.data.complaints || []);
        setSummary(response.data.summary || summary);
        setPagination(response.data.pagination || pagination);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [currentPage, activeTab]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitComplaint = async () => {
    if (!formData.issue_type || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const response = await externalTenantComplaintsApi.submitComplaint(formData);
      
      if (response.success && response.data) {
        toast.success(`Complaint submitted successfully! Ticket #${response.data.ticket_number}`);
        setShowNewComplaintForm(false);
        setFormData({
          issue_type: "",
          urgency: "medium",
          description: "",
          additional_notes: ""
        });
        fetchComplaints(); // Refresh the complaints list
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error('Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="destructive" className="bg-destructive/10 text-destructive">Open</Badge>;
      case "in_progress":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case "resolved":
      case "closed":
        return <Badge variant="secondary" className="bg-success/10 text-success">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "urgent":
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Low</Badge>;
      default:
        return <Badge variant="secondary">{urgency}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "resolved":
      case "closed":
        return <CheckCircle className="w-4 h-4 text-success" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Reset to first page when filter changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const goToNextPage = () => {
    if (pagination.has_next) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (pagination.has_prev) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleViewDetails = (complaint: any) => {
    setSelectedComplaint(complaint);
    setShowDetailsDialog(true);
  };

  const handleAddComment = (complaint: any) => {
    setSelectedComplaint(complaint);
    setShowCommentDialog(true);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      const response = await externalTenantComplaintsApi.addComplaintNote(selectedComplaint.id, newComment);
      
      if (response.success) {
        toast.success("Comment added successfully!");
        setNewComment("");
        setShowCommentDialog(false);
        fetchComplaints(); // Refresh the complaints list
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment. Please try again.');
    }
  };

  if (showNewComplaintForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Submit New Complaint</h2>
          <Button
            variant="outline"
            onClick={() => setShowNewComplaintForm(false)}
          >
            Back to Complaints
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Complaint Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issueType">Issue Type *</Label>
                <Select value={formData.issue_type} onValueChange={(value) => handleInputChange('issue_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="heating">Heating/Cooling</SelectItem>
                    <SelectItem value="maintenance">General Maintenance</SelectItem>
                    <SelectItem value="structural">Structural Issues</SelectItem>
                    <SelectItem value="pest">Pest Control</SelectItem>
                    <SelectItem value="security">Security Issues</SelectItem>
                    <SelectItem value="noise">Noise Complaints</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level *</Label>
                <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Can wait a few days</SelectItem>
                    <SelectItem value="medium">Medium - Needs attention within 24-48 hours</SelectItem>
                    <SelectItem value="high">High - Urgent, needs immediate attention</SelectItem>
                    <SelectItem value="urgent">Urgent - Emergency situation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Please provide as much detail as possible about the issue, when it started, and how it affects you"
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_notes">Additional Notes (Optional)</Label>
              <Textarea
                id="additional_notes"
                value={formData.additional_notes}
                onChange={(e) => handleInputChange('additional_notes', e.target.value)}
                placeholder="Any additional information that might be helpful"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Attach Photos (Optional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop images here, or click to select
                </p>
                <Button variant="outline" className="mt-2">
                  Choose Files
                </Button>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                onClick={handleSubmitComplaint}
                disabled={submitting}
                className="bg-primary hover:bg-primary/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Complaint'
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowNewComplaintForm(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">My Complaints</h2>
        <Button
          onClick={() => setShowNewComplaintForm(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Complaint
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl font-bold">
                  {summary.open_complaints}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">
                  {summary.resolved_complaints}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{summary.total_complaints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complaints List */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="all">All Complaints</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <Card key={complaint.id} className="hover-lift">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(complaint.status)}
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {complaint.issue_type} Issue
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Ticket #{complaint.ticket_number}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(complaint.status)}
                        {getUrgencyBadge(complaint.urgency)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Issue Type</p>
                        <p className="text-sm">{complaint.issue_type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">House Number</p>
                        <p className="text-sm">{complaint.house_number}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                        <p className="text-sm">{new Date(complaint.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                        <p className="text-sm">{new Date(complaint.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="bg-muted p-3 rounded-lg mb-4">
                      <p className="text-sm">{complaint.description}</p>
                    </div>

                    {complaint.resolution_description && (
                      <div className="bg-success/10 p-3 rounded-lg mb-3">
                        <p className="text-sm font-medium text-success mb-1">Resolution:</p>
                        <p className="text-sm">{complaint.resolution_description}</p>
                      </div>
                    )}


                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(complaint)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      {complaint.status !== 'resolved' && complaint.status !== 'closed' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAddComment(complaint)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Add Comment
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last updated: {new Date(complaint.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
              ))}

              {complaints.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No complaints found</h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === "all" 
                      ? "You haven't submitted any complaints yet."
                      : `No ${activeTab.replace('_', ' ')} complaints found.`
                    }
                  </p>
                  <Button
                    onClick={() => setShowNewComplaintForm(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Your First Complaint
                  </Button>
                </div>
              )}

              {/* Pagination Controls */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.current_page - 1) * pagination.per_page) + 1}-{Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} complaints
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={!pagination.has_prev}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm font-medium">
                      Page {pagination.current_page} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={!pagination.has_next}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ticket Number</p>
                  <p className="text-sm">{selectedComplaint.ticketNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedComplaint.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Issue Type</p>
                  <p className="text-sm">{selectedComplaint.issueType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Urgency</p>
                  <div className="mt-1">{getUrgencyBadge(selectedComplaint.urgency)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="text-sm">{selectedComplaint.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                  <p className="text-sm">{new Date(selectedComplaint.createdAt).toLocaleDateString()}</p>
                </div>
                {selectedComplaint.assignedAgent && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Assigned Agent</p>
                      <p className="text-sm">{selectedComplaint.assignedAgent}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                      <p className="text-sm">{new Date(selectedComplaint.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </>
                )}
                {selectedComplaint.estimatedResolution && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Estimated Resolution</p>
                    <p className="text-sm">{new Date(selectedComplaint.estimatedResolution).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm">{selectedComplaint.description}</p>
                </div>
              </div>

              {selectedComplaint.resolutionNote && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Resolution Note</p>
                  <div className="bg-success/10 border border-success/20 p-3 rounded-lg">
                    <p className="text-sm text-success">{selectedComplaint.resolutionNote}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Comment Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium">{selectedComplaint.title}</p>
                <p className="text-xs text-muted-foreground">Ticket #{selectedComplaint.ticketNumber}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="comment">Your Comment</Label>
                <Textarea
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add your comment or additional information..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmitComment} className="bg-primary hover:bg-primary/90">
                  Submit Comment
                </Button>
                <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExternalTenantComplaints;