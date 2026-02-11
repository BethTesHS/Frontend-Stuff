
import { useState, useEffect } from 'react';
import { Complaint } from '@/types';

interface ComplaintNotification {
  complaint: Complaint;
  agentName: string;
  agentImage?: string;
}

export const useComplaintNotifications = () => {
  const [notification, setNotification] = useState<ComplaintNotification | null>(null);

  useEffect(() => {
    // TODO: Replace with actual WebSocket or polling mechanism to listen for complaint updates
    // This would typically be connected to your backend notification system
    
    // Simulate checking for resolved complaints
    const checkForResolvedComplaints = () => {
      const existingComplaints = localStorage.getItem('tenantComplaints');
      if (!existingComplaints) return;

      const complaints: Complaint[] = JSON.parse(existingComplaints);
      const recentlyResolved = complaints.find(complaint => 
        complaint.status === 'closed' && 
        complaint.closedAt &&
        !localStorage.getItem(`reviewed_${complaint.id}`) &&
        // Check if resolved within last 24 hours (for demo purposes)
        new Date(complaint.closedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
      );

      if (recentlyResolved) {
        // TODO: Fetch agent details from backend
        // const agentDetails = await fetchAgentDetails(recentlyResolved.agentId);
        
        setNotification({
          complaint: recentlyResolved,
          agentName: "Sarah Johnson", // TODO: Replace with actual agent name from backend
          agentImage: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&face=true" // TODO: Replace with actual agent image
        });
      }
    };

    // Check immediately and then every 30 seconds
    checkForResolvedComplaints();
    const interval = setInterval(checkForResolvedComplaints, 30000);

    return () => clearInterval(interval);
  }, []);

  const dismissNotification = () => {
    if (notification) {
      // Mark as reviewed so it doesn't show again
      localStorage.setItem(`reviewed_${notification.complaint.id}`, 'true');
    }
    setNotification(null);
  };

  const submitReview = async (rating: number, review: string) => {
    if (!notification) return;

    // TODO: Replace with actual API call to submit review
    // await submitAgentReview({
    //   agentId: notification.complaint.agentId,
    //   complaintId: notification.complaint.id,
    //   rating,
    //   review,
    //   tenantId: currentUser.id
    // });

    console.log('Review submitted:', { 
      complaintId: notification.complaint.id, 
      rating, 
      review,
      agentName: notification.agentName
    });

    // Mark as reviewed
    localStorage.setItem(`reviewed_${notification.complaint.id}`, 'true');
    
    // Show success toast or message
    // toast.success('Thank you for your review!');
    
    setNotification(null);
  };

  return {
    notification,
    dismissNotification,
    submitReview
  };
};
