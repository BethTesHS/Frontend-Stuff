import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { buyerApi } from '@/services/buyerApi';

interface MessageDialogProps {
  children: React.ReactNode;
  recipientId: string;
  recipientName: string;
  recipientType: 'agent' | 'landlord' | 'owner';
  propertyId?: string;
  propertyTitle?: string;
  roomId?: string;
  roomTitle?: string;
}

export const MessageDialog = ({
  children,
  recipientId,
  recipientName,
  recipientType,
  propertyId,
  propertyTitle,
  roomId,
  roomTitle,
}: MessageDialogProps) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const contextTitle = propertyTitle || roomTitle;
  const contextType = propertyId ? 'property' : 'room';

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && !isAuthenticated) {
      navigate('/login');
      return;
    }
    setOpen(isOpen);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);
    try {
      const response = await buyerApi.sendChatMessage({
        recipient_id: recipientId,
        recipient_type: recipientType,
        initial_message: message,
        property_id: propertyId,
        property_title: propertyTitle,
        room_id: roomId,
        room_title: roomTitle,
      });

      if (response.success) {
        toast.success('Message sent successfully!');
        setMessage('');
        setOpen(false);

        // Redirect to messages tab with conversation context
        const params = new URLSearchParams({
          activeTab: 'messages',
          conversationId: response.data?.conversation_id || '',
          recipientId: recipientId,
          recipientName: recipientName,
        });

        if (propertyId && propertyTitle) {
          params.append('propertyId', propertyId);
          params.append('propertyTitle', propertyTitle);
        }
        if (roomId && roomTitle) {
          params.append('roomId', roomId);
          params.append('roomTitle', roomTitle);
        }

        navigate(`/buyer-dashboard?${params.toString()}`);
      } else {
        toast.error(response.message || response.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to send message. Please try again.');
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Message to {recipientName}</DialogTitle>
          <DialogDescription>
            {contextTitle && (
              <span className="block mt-1 text-sm">
                Regarding: <span className="font-medium">{contextTitle}</span>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder={`Hi ${recipientName}, I'm interested in this ${contextType}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[150px] resize-none"
              disabled={sending}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/1000 characters
            </p>
          </div>

          {contextTitle && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="font-medium text-foreground mb-1">Property Details:</p>
              <p className="text-muted-foreground">{contextTitle}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={sending || !message.trim() || message.length > 1000}
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MessageDialog;
