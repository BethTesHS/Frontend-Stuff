
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { flushSync } from 'react-dom';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AdminSidebar } from '@/components/AdminDashboard/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminProfileComponent } from '@/components/Admin/AdminProfile';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Users,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Home,
  UserCheck,
  FileText,
  Bot,
  Eye,
  Clock,
  Mail,
  Phone,
  ArrowLeft,
  Send,
  Paperclip,
  X,
  Image,
  Download,
  Moon,
  Sun,
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  UserX,
  UserMinus,
  Filter,
  MoreVertical
} from 'lucide-react';

// Determine if we are on localhost
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Mock data for admin dashboard
const pendingVerifications = [
  {
    id: '1',
    type: 'agent',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@properties.co.uk',
    phone: '+44 7700 900123',
    submittedAt: '2024-01-15',
    documents: ['ID', 'Certification', 'References'],
    status: 'pending'
  },
  {
    id: '2',
    type: 'owner',
    name: 'Michael Chen',
    email: 'michael.chen@gmail.com',
    phone: '+44 7700 900124',
    submittedAt: '2024-01-14',
    documents: ['Property Deed', 'ID', 'Proof of Address'],
    status: 'pending'
  },
  {
    id: '3',
    type: 'agent',
    name: 'Emma Williams',
    email: 'emma.williams@realestate.co.uk',
    phone: '+44 7700 900125',
    submittedAt: '2024-01-13',
    documents: ['ID', 'License', 'Insurance'],
    status: 'review'
  }
];

const mockMessagesData = {
  contacts: [
    {
      id: "usr_001",
      name: "Sarah Jenkins",
      role: "Tenant",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      lastMessage: "Thank you, the plumber fixed the issue this morning.",
      timestamp: "2026-02-18T11:30:00Z",
      unreadCount: 0,
      isOnline: true
    },
    {
      id: "usr_002",
      name: "David Ochieng",
      role: "Owner",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      lastMessage: "When will the background check for the new applicant be ready?",
      timestamp: "2026-02-18T10:15:00Z",
      unreadCount: 2,
      isOnline: false
    },
    {
      id: "usr_003",
      name: "Amina Yusuf",
      role: "Buyer",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amina",
      lastMessage: "I would like to reschedule my viewing for tomorrow.",
      timestamp: "2026-02-17T16:45:00Z",
      unreadCount: 1,
      isOnline: true
    },
    {
      id: "usr_004",
      name: "Michael Chang",
      role: "Agent",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      lastMessage: "I've uploaded the new property photos to the dashboard.",
      timestamp: "2026-02-16T09:20:00Z",
      unreadCount: 0,
      isOnline: false
    }
  ],
  conversations: {
    "usr_001": [
      { id: "msg_101", senderId: "usr_001", text: "Hi Admin, the sink in apartment 4B is leaking again.", timestamp: "2026-02-17T08:00:00Z" },
      { id: "msg_102", senderId: "admin", text: "Hello Sarah, I'm sorry to hear that. I will dispatch the maintenance team immediately.", timestamp: "2026-02-17T08:15:00Z" },
      { id: "msg_103", senderId: "admin", text: "They should be there between 9 AM and 11 AM tomorrow.", timestamp: "2026-02-17T08:16:00Z" },
      { id: "msg_104", senderId: "usr_001", text: "Thank you, the plumber fixed the issue this morning.", timestamp: "2026-02-18T11:30:00Z" }
    ],
    "usr_002": [
      { id: "msg_201", senderId: "usr_002", text: "Good morning. Just following up on the Westlands property.", timestamp: "2026-02-18T10:10:00Z" },
      { id: "msg_202", senderId: "usr_002", text: "When will the background check for the new applicant be ready?", timestamp: "2026-02-18T10:15:00Z" }
    ],
    "usr_003": [
      { id: "msg_301", senderId: "admin", text: "Hi Amina, confirming your viewing for the Kilimani apartment today at 4 PM.", timestamp: "2026-02-17T10:00:00Z" },
      { id: "msg_302", senderId: "usr_003", text: "I would like to reschedule my viewing for tomorrow.", timestamp: "2026-02-17T16:45:00Z" }
    ],
    "usr_004": [
      { id: "msg_401", senderId: "usr_004", text: "Hey, the client loved the virtual tour.", timestamp: "2026-02-15T14:30:00Z" },
      { id: "msg_402", senderId: "admin", text: "That's great news! Do we need to update the listing images?", timestamp: "2026-02-15T14:45:00Z" },
      { id: "msg_403", senderId: "usr_004", text: "I've uploaded the new property photos to the dashboard.", timestamp: "2026-02-16T09:20:00Z" }
    ]
  }
};

const AdminDashboard = () => {
  // All hooks must be called first, before any conditional logic
  const { isAdminAuthenticated, loading: authLoading } = useAdminGuard();
  const { logout: adminLogout } = useAdminAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [viewingConversation, setViewingConversation] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [adminMessages, setAdminMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [verifications, setVerifications] = useState(pendingVerifications);
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspensionType, setSuspensionType] = useState<'temp' | 'perm'>('temp');
  const [suspensionReason, setSuspensionReason] = useState('');
  const [suspensionDays, setSuspensionDays] = useState('30');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 5;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data effects
  useEffect(() => {
    if (isAdminAuthenticated) {
      loadStats();
      loadMessagesAndConversations();
      loadUsers();
    }
  }, [isAdminAuthenticated]);

  // Reload users when filters or pagination changes
  useEffect(() => {
    if (isAdminAuthenticated) {
      loadUsers();
    }
  }, [currentPage, roleFilter, statusFilter, userSearchQuery]);

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Shield className="w-8 h-8 text-gray-600 dark:text-gray-400 animate-pulse" />
          </div>
          <p className="text-gray-800 dark:text-gray-100 text-lg font-semibold">Verifying admin access...</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 dark:border-gray-400 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Only render dashboard if authenticated (useAdminGuard handles the redirect)
  if (!isAdminAuthenticated) {
    return null;
  }

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const { adminApi } = await import('@/services/adminApi');
      const response = await adminApi.getStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadMessagesAndConversations = async () => {
    try {
      setMessagesLoading(true);

      // Check if Localhost
      if (isLocalhost) {
        console.log('Running on localhost. Using mock messages...');
        const mockMessages = mockMessagesData.contacts.map(contact => ({
          id: contact.id,
          from: contact.name,
          email: `${contact.name.toLowerCase().replace(' ', '.')}@mock-tenant.com`,
          subject: contact.role, // Just simulating a subject 
          message: contact.lastMessage,
          priority: contact.unreadCount > 0 ? 'high' : 'low',
          timestamp: new Date(contact.timestamp).toLocaleString(),
          status: contact.unreadCount > 0 ? 'unread' : 'read',
          conversation_id: contact.id
        }));
        setAdminMessages(mockMessages);
      } 
      else {
        const { adminApi } = await import('@/services/adminApi');
        
        console.log('Loading conversations with adminApi...');
        // Load conversations (which contain messages from external tenants)
        const conversationsResponse = await adminApi.getConversations({ limit: 50 });
        console.log('Conversations response:', conversationsResponse);
        if (conversationsResponse.success) {
          // Transform conversations to message format for compatibility
          const messages = conversationsResponse.conversations.map(conv => ({
            id: conv.id.toString(),
            from: conv.user_name,
            email: `${conv.user_name.toLowerCase().replace(' ', '.')}@tenant.com`,
            subject: conv.subject,
            message: `Conversation with ${conv.unread_count} unread messages`,
            priority: conv.unread_count > 0 ? 'high' : 'low',
            timestamp: conv.last_message_at || conv.created_at,
            status: conv.unread_count > 0 ? 'unread' : 'read',
            conversation_id: conv.id
          }));
          setAdminMessages(messages);
        }
      }
    } catch (error) {
      console.error('Failed to load messages and conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load messages from external tenants",
        variant: "destructive"
      });
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleViewConversation = async (message: any) => {
    setSelectedMessage(message);
    
    if (message.conversation_id) {
      // Localhost Mock Data logic
      if (isLocalhost) {
        const mockConvo = mockMessagesData.conversations[message.conversation_id as keyof typeof mockMessagesData.conversations];
        if (mockConvo) {
          const transformedMessages = mockConvo.map(msg => ({
            id: msg.id,
            text: msg.text,
            sender: msg.senderId === 'admin' ? 'admin' : 'user',
            timestamp: msg.timestamp,
            senderName: msg.senderId === 'admin' ? 'Admin' : message.from,
            attachments: []
          }));
          setConversationMessages(transformedMessages);
        } else {
          setConversationMessages([]);
        }
      } else {
        // Production API logic
        try {
          const { adminApi } = await import('@/services/adminApi');
          const response = await adminApi.getConversationMessages(message.conversation_id);
          
          if (response.success) {
            const transformedMessages = response.messages.map(msg => ({
              id: msg.id.toString(),
              text: msg.message_text,
              sender: msg.sender_type === 'admin' ? 'admin' : 'user',
              timestamp: msg.created_at,
              senderName: msg.sender_name,
              attachments: msg.attachment_url ? [{
                name: msg.attachment_name,
                size: msg.attachment_size,
                type: msg.attachment_type?.startsWith('image/') ? 'image' : 'document',
                url: msg.attachment_url
              }] : []
            }));
            setConversationMessages(transformedMessages);
          }
        } catch (error) {
          console.error('Failed to load conversation messages:', error);
          toast({
            title: "Error",
            description: "Failed to load conversation messages",
            variant: "destructive"
          });
        }
      }
    }
    
    setViewingConversation(true);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() && attachedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please enter a reply message or attach a file",
        variant: "destructive"
      });
      return;
    }

    if (isLocalhost) {
      // Simulate sending a message for localhost viewing
      const newMessage = {
        id: `mock_reply_${Date.now()}`,
        text: replyText.trim(),
        sender: 'admin',
        timestamp: new Date().toISOString(),
        senderName: 'Admin',
        attachments: attachedFiles.map(file => ({
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type.startsWith('image/') ? 'image' : 'document',
          url: URL.createObjectURL(file)
        }))
      };

      setConversationMessages(prev => [...prev, newMessage]);
      toast({
        title: "Mock Reply Sent",
        description: `Reply appended locally for ${selectedMessage?.from}`,
      });
      setReplyText('');
      setAttachedFiles([]);
      return;
    }

    // Production API logic 
    try {
      const { adminApi } = await import('@/services/adminApi');
      
      let attachmentData = null;
      if (attachedFiles.length > 0) {
        const file = attachedFiles[0];
        const uploadResponse = await adminApi.uploadFile(file, selectedMessage?.conversation_id);
        
        if (uploadResponse.success) {
          attachmentData = {
            attachment_url: uploadResponse.file_url,
            attachment_name: uploadResponse.file_name,
            attachment_size: uploadResponse.file_size,
            attachment_type: uploadResponse.file_type,
          };
        }
      }
      
      const messageData = {
        conversation_id: selectedMessage?.conversation_id,
        message_text: replyText.trim(),
        subject: selectedMessage?.subject || 'Admin Reply',
        ...attachmentData,
      };
      
      const response = await adminApi.sendMessage(messageData);
      
      if (response.success) {
        const newMessage = {
          id: response.message.id.toString(),
          text: replyText,
          sender: 'admin',
          timestamp: response.message.created_at,
          senderName: 'Admin',
          attachments: attachmentData ? [{
            name: attachmentData.attachment_name,
            size: formatFileSize(attachmentData.attachment_size),
            type: attachmentData.attachment_type?.startsWith('image/') ? 'image' : 'document',
            url: attachmentData.attachment_url
          }] : []
        };

        setConversationMessages(prev => [...prev, newMessage]);
        
        toast({
          title: "Reply Sent",
          description: `Reply sent to ${selectedMessage?.from}`,
        });

        setReplyText('');
        setAttachedFiles([]);
        loadMessagesAndConversations();
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive"
      });
    }
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const { adminApi } = await import('@/services/adminApi');

      console.log('[AdminDashboard] Loading users from API...');
      const response = await adminApi.getUsers({
        page: currentPage,
        limit: itemsPerPage,
        search: userSearchQuery || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      console.log('[AdminDashboard] Users API response:', response);

      if (response.success && response.users) {
        console.log(`[AdminDashboard] Successfully loaded ${response.users.length} users`);
        setUsers(response.users);
        setTotalUsers(response.total || response.users.length);
        setTotalPages(response.pages || Math.ceil((response.total || response.users.length) / itemsPerPage));
      } else {
        console.warn('[AdminDashboard] API returned success=false or no users array');
        toast({
          title: "Error",
          description: "Failed to load users from API.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('[AdminDashboard] Failed to load users:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load users from API.",
        variant: "destructive"
      });
    } finally {
      setUsersLoading(false);
    }
  };


  const handleReviewVerification = (verification: any) => {
    setSelectedVerification(verification);
    setReviewDialogOpen(true);
  };

  const handleApproveVerification = (id: string) => {
    const verification = verifications.find(v => v.id === id);
    if (!verification) return;

    // Update verification status
    setVerifications(prev => prev.map(v =>
      v.id === id ? { ...v, status: 'approved' } : v
    ));

    toast({
      title: "Verification Approved",
      description: `${verification.name} has been approved as a ${verification.type}.`,
    });

    // In real app, this would make an API call
    // await adminApi.approveVerification(id);
  };

  const handleRejectVerification = (id: string, reason?: string) => {
    const verification = verifications.find(v => v.id === id);
    if (!verification) return;

    // Update verification status
    setVerifications(prev => prev.map(v =>
      v.id === id ? { ...v, status: 'rejected', rejectionReason: reason } : v
    ));

    toast({
      title: "Verification Rejected",
      description: `${verification.name}'s application has been rejected.`,
      variant: "destructive"
    });

    setRejectionReason('');

    // In real app, this would make an API call
    // await adminApi.rejectVerification(id, reason);
  };

  const handleSuspendUser = (user: any, type: 'temp' | 'perm') => {
    setSelectedUser(user);
    setSuspensionType(type);
    setSuspendDialogOpen(true);
  };

  const confirmSuspendUser = async () => {
    if (!selectedUser) return;

    try {
      const { adminApi } = await import('@/services/adminApi');

      const newStatus = suspensionType === 'temp' ? 'suspended_temp' : 'suspended_perm';
      let suspendedUntil;

      if (suspensionType === 'temp') {
        const days = parseInt(suspensionDays) || 30;
        const date = new Date();
        date.setDate(date.getDate() + days);
        suspendedUntil = date.toISOString().split('T')[0];
      }

      // Call API to suspend user
      const response = await adminApi.suspendUser(
        selectedUser.id,
        suspensionType,
        suspensionReason,
        suspendedUntil
      );

      if (response.success) {
        // Update local state with API response
        setUsers(prev => prev.map(u =>
          u.id === selectedUser.id
            ? { ...u, status: newStatus, suspendedUntil, suspensionReason }
            : u
        ));

        toast({
          title: suspensionType === 'temp' ? "User Temporarily Suspended" : "User Permanently Suspended",
          description: `${selectedUser.name} has been suspended ${suspensionType === 'temp' ? `for ${suspensionDays} days` : 'permanently'}.`,
          variant: "destructive"
        });

        setSuspendDialogOpen(false);
        setSuspensionReason('');
        setSuspensionDays('30');
      }
    } catch (error) {
      console.error('Failed to suspend user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to suspend user",
        variant: "destructive"
      });
    }
  };

  const handleUnsuspendUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      const { adminApi } = await import('@/services/adminApi');

      // Call API to unsuspend user
      const response = await adminApi.unsuspendUser(userId);

      if (response.success) {
        // Update local state
        setUsers(prev => prev.map(u =>
          u.id === userId
            ? { ...u, status: 'active', suspendedUntil: undefined, suspensionReason: undefined }
            : u
        ));

        toast({
          title: "User Unsuspended",
          description: `${user.name} has been reactivated.`,
        });
      }
    } catch (error) {
      console.error('Failed to unsuspend user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to unsuspend user",
        variant: "destructive"
      });
    }
  };

  const handleReplyMessage = (message: any) => {
    setSelectedMessage(message);
    setReplyText('');
  };

  // const handleSendReply = async () => {
  //   if (!replyText.trim() && attachedFiles.length === 0) {
  //     toast({
  //       title: "Error",
  //       description: "Please enter a reply message or attach a file",
  //       variant: "destructive"
  //     });
  //     return;
  //   }

  //   try {
  //     const { adminApi } = await import('@/services/adminApi');
      
  //     let attachmentData = null;
      
  //     // Upload file if attached
  //     if (attachedFiles.length > 0) {
  //       const file = attachedFiles[0];
  //       const uploadResponse = await adminApi.uploadFile(file, selectedMessage?.conversation_id);
        
  //       if (uploadResponse.success) {
  //         attachmentData = {
  //           attachment_url: uploadResponse.file_url,
  //           attachment_name: uploadResponse.file_name,
  //           attachment_size: uploadResponse.file_size,
  //           attachment_type: uploadResponse.file_type,
  //         };
  //       }
  //     }
      
  //     // Send the message
  //     const messageData = {
  //       conversation_id: selectedMessage?.conversation_id,
  //       message_text: replyText.trim(),
  //       subject: selectedMessage?.subject || 'Admin Reply',
  //       ...attachmentData,
  //     };
      
  //     const response = await adminApi.sendMessage(messageData);
      
  //     if (response.success) {
  //       // Add the reply to the conversation
  //       const newMessage = {
  //         id: response.message.id.toString(),
  //         text: replyText,
  //         sender: 'admin',
  //         timestamp: response.message.created_at,
  //         senderName: 'Admin',
  //         attachments: attachmentData ? [{
  //           name: attachmentData.attachment_name,
  //           size: formatFileSize(attachmentData.attachment_size),
  //           type: attachmentData.attachment_type?.startsWith('image/') ? 'image' : 'document',
  //           url: attachmentData.attachment_url
  //         }] : []
  //       };

  //       setConversationMessages(prev => [...prev, newMessage]);
        
  //       toast({
  //         title: "Reply Sent",
  //         description: `Reply sent to ${selectedMessage?.from}`,
  //       });

  //       setReplyText('');
  //       setAttachedFiles([]);
        
  //       // Refresh messages list to update status
  //       loadMessagesAndConversations();
  //     }
  //   } catch (error) {
  //     console.error('Failed to send reply:', error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to send reply",
  //       variant: "destructive"
  //     });
  //   }
  // };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    
    const validFiles = files.filter(file => {
      if (file.size > maxFileSize) {
        toast({
          title: "File too large",
          description: `File ${file.name} is too large. Maximum size is 10MB.`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    setAttachedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // const handleViewConversation = async (message: any) => {
  //   setSelectedMessage(message);
    
  //   if (message.conversation_id) {
  //     try {
  //       const { adminApi } = await import('@/services/adminApi');
  //       const response = await adminApi.getConversationMessages(message.conversation_id);
        
  //       if (response.success) {
  //         // Transform API messages to component format
  //         const transformedMessages = response.messages.map(msg => ({
  //           id: msg.id.toString(),
  //           text: msg.message_text,
  //           sender: msg.sender_type === 'admin' ? 'admin' : 'user',
  //           timestamp: msg.created_at,
  //           senderName: msg.sender_name,
  //           attachments: msg.attachment_url ? [{
  //             name: msg.attachment_name,
  //             size: msg.attachment_size,
  //             type: msg.attachment_type?.startsWith('image/') ? 'image' : 'document',
  //             url: msg.attachment_url
  //           }] : []
  //         }));
  //         setConversationMessages(transformedMessages);
  //       }
  //     } catch (error) {
  //       console.error('Failed to load conversation messages:', error);
  //       toast({
  //         title: "Error",
  //         description: "Failed to load conversation messages",
  //         variant: "destructive"
  //       });
  //     }
  //   }
  
  //   setViewingConversation(true);
  // };

  const handleBackToMessages = () => {
    setViewingConversation(false);
    setSelectedMessage(null);
    setConversationMessages([]);
  };

  const mockStats = [
    {
      label: 'Pending Verifications',
      value: statsLoading ? '...' : stats?.pending_verifications?.toString() || '0',
      icon: UserCheck,
      color: 'text-gray-600'
    },
    {
      label: 'Unread Messages',
      value: statsLoading ? '...' : stats?.unread_messages?.toString() || '0',
      icon: MessageSquare,
      color: 'text-gray-600'
    },
    {
      label: 'Total Users',
      value: statsLoading ? '...' : stats?.total_users?.toString() || '0',
      icon: Users,
      color: 'text-gray-600'
    },
    {
      label: 'Active Properties',
      value: statsLoading ? '...' : stats?.active_properties?.toString() || '0',
      icon: Home,
      color: 'text-gray-600'
    }
  ];

  const handleTabChange = (tab: string) => {
    flushSync(() => {
      setActiveTab(tab);
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverviewContent();
      case "users":
        return renderUsersContent();
      case "verifications":
        return renderVerificationsContent();
      case "messages":
        return renderMessagesContent();
      case "support":
        return renderSupportContent();
      default:
        return renderOverviewContent();
    }
  };

  const renderOverviewContent = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockStats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <stat.icon className={`w-6 h-6 ${stat.color} dark:text-gray-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts and Bot Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="flex items-center text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
            <AlertTriangle className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
            Recent Alerts
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">High complaint volume</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">3 complaints received today</p>
              </div>
              <Badge variant="destructive">High</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">Verification backlog</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">12 pending verifications</p>
              </div>
              <Badge variant="secondary">Medium</Badge>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="flex items-center text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
            <Bot className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
            Support Bot Activity
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Conversations Today</span>
              <span className="font-medium text-gray-800 dark:text-gray-100">47</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Resolved Automatically</span>
              <span className="font-medium text-gray-800 dark:text-gray-100">31</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Escalated to Admin</span>
              <span className="font-medium text-gray-800 dark:text-gray-100">8</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersContent = () => {
    // Show loading state
    if (usersLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 dark:border-gray-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
          </div>
        </div>
      );
    }

    // Use server-side filtered data directly
    const activeUsersCount = users.filter(u => u.status === 'active').length;
    const suspendedUsersCount = users.filter(u => u.status === 'suspended_temp' || u.status === 'suspended_perm').length;

    const getRoleBadgeColor = (role: string) => {
      switch (role) {
        case 'agent': return 'default';
        case 'owner': return 'secondary';
        case 'buyer': return 'outline';
        case 'tenant': return 'outline';
        default: return 'secondary';
      }
    };

    const getStatusBadge = (user: any) => {
      if (user.status === 'active') {
        return <Badge className="bg-green-600 dark:bg-green-700">Active</Badge>;
      } else if (user.status === 'suspended_temp') {
        return <Badge variant="destructive">Suspended (Temp)</Badge>;
      } else if (user.status === 'suspended_perm') {
        return <Badge className="bg-red-900 dark:bg-red-950">Suspended (Perm)</Badge>;
      }
    };

    return (
      <>
        <div className="space-y-6">
          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{users.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{activeUsersCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Suspended Users</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">{suspendedUsersCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={userSearchQuery}
                    onChange={(e) => {
                      setUserSearchQuery(e.target.value);
                      setCurrentPage(1); // Reset to first page on search
                    }}
                    className="pl-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                  />
                </div>

                {/* Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setCurrentPage(1); // Reset to first page on filter change
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="agent">Agent</option>
                  <option value="owner">Owner</option>
                  <option value="buyer">Buyer</option>
                  <option value="tenant">Tenant</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1); // Reset to first page on filter change
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Results count */}
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                {totalUsers > 0 ? (
                  <>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users</>
                ) : (
                  <>No users found</>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800 dark:text-gray-100">
                <Users className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No users found</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800/30 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* User Info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-lg">
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200">{user.name}</h3>
                                <Badge variant={getRoleBadgeColor(user.role)}>
                                  {user.role.toUpperCase()}
                                </Badge>
                                {getStatusBadge(user)}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 dark:text-gray-500">Joined</p>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{user.joinedDate}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-500">Last Active</p>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{user.lastActive}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-500">Properties</p>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{user.properties}</p>
                            </div>
                            {user.suspendedUntil && (
                              <div>
                                <p className="text-gray-500 dark:text-gray-500">Suspended Until</p>
                                <p className="font-medium text-red-600 dark:text-red-400">{user.suspendedUntil}</p>
                              </div>
                            )}
                          </div>

                          {user.suspensionReason && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                              <p className="text-sm text-red-800 dark:text-red-300">
                                <strong>Suspension Reason:</strong> {user.suspensionReason}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          {user.status === 'active' ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="dark:border-gray-600 dark:text-gray-300"
                                onClick={() => handleSuspendUser(user, 'temp')}
                              >
                                <UserMinus className="w-4 h-4 mr-1" />
                                Suspend Temp
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleSuspendUser(user, 'perm')}
                              >
                                <UserX className="w-4 h-4 mr-1" />
                                Suspend Perm
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
                              onClick={() => handleUnsuspendUser(user.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Unsuspend
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="dark:border-gray-600 dark:text-gray-300"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Show first page, last page, current page, and pages around current
                          return page === 1 ||
                                 page === totalPages ||
                                 (page >= currentPage - 1 && page <= currentPage + 1);
                        })
                        .map((page, index, array) => (
                          <div key={page} className="flex items-center">
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
                            )}
                            <Button
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className={currentPage === page
                                ? "bg-blue-600 hover:bg-blue-700 text-white min-w-[2.5rem]"
                                : "dark:border-gray-600 dark:text-gray-300 min-w-[2.5rem]"
                              }
                            >
                              {page}
                            </Button>
                          </div>
                        ))
                      }
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="dark:border-gray-600 dark:text-gray-300"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Suspension Dialog */}
        <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
          <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-gray-100">
                {suspensionType === 'temp' ? 'Temporarily Suspend User' : 'Permanently Suspend User'}
              </DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">User</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedUser.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                </div>

                {suspensionType === 'temp' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Suspension Duration (days)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={suspensionDays}
                      onChange={(e) => setSuspensionDays(e.target.value)}
                      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Reason for Suspension *
                  </label>
                  <Textarea
                    placeholder="Please provide a detailed reason for the suspension..."
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    rows={4}
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                  />
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong>Warning:</strong> {suspensionType === 'temp'
                      ? `This user will be suspended for ${suspensionDays} days and will not be able to access their account during this period.`
                      : 'This user will be permanently suspended and will not be able to access their account unless manually unsuspended.'}
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSuspendDialogOpen(false);
                      setSuspensionReason('');
                      setSuspensionDays('30');
                    }}
                    className="dark:border-gray-600 dark:text-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmSuspendUser}
                    disabled={!suspensionReason.trim()}
                  >
                    {suspensionType === 'temp' ? 'Suspend Temporarily' : 'Suspend Permanently'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  };

  const renderVerificationsContent = () => {
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
                            <Button
                              size="sm"
                              variant="destructive"
                            >
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

  const renderMessagesContent = () => (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-800 dark:text-gray-100">
          {viewingConversation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToMessages}
              className="mr-2 dark:text-gray-300"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <MessageSquare className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
          {viewingConversation ? `Conversation with ${selectedMessage?.from}` : 'Admin Messages'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {viewingConversation ? (
          <div className="space-y-4">
            {/* Conversation View */}
            <ScrollArea className="h-96 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
              <div className="space-y-4 pr-4">
                {conversationMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                       msg.sender === 'admin'
                         ? 'bg-gray-800 dark:bg-gray-700 text-white'
                         : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-900 dark:text-gray-100'
                     }`}>
                       <p className="text-sm">{msg.text}</p>

                       {/* File attachments */}
                       {msg.attachments && msg.attachments.length > 0 && (
                         <div className="mt-2 space-y-2">
                           {msg.attachments.map((attachment: any, index: number) => (
                             <div key={index} className={`flex items-center gap-2 p-2 rounded border ${
                               msg.sender === 'admin'
                                 ? 'bg-gray-700/50 border-gray-600/50'
                                 : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-600'
                             }`}>
                               {attachment.type === 'image' ? (
                                 <Image className="w-4 h-4" />
                               ) : (
                                 <FileText className="w-4 h-4" />
                               )}
                               <div className="flex-1 min-w-0">
                                 <p className="text-xs font-medium truncate">{attachment.name}</p>
                                 <p className="text-xs opacity-70">{attachment.size}</p>
                               </div>
                               <Button
                                 size="sm"
                                 variant="ghost"
                                 className="h-6 w-6 p-0"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   toast({
                                     title: "Download started",
                                     description: `Downloading ${attachment.name}`,
                                   });
                                 }}
                               >
                                 <Download className="w-3 h-3" />
                               </Button>
                             </div>
                           ))}
                         </div>
                       )}

                       <p className={`text-xs mt-1 ${
                         msg.sender === 'admin' ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'
                       }`}>
                         {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString()}
                       </p>
                     </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

             {/* Reply Input */}
             <div className="space-y-3">
               {/* File attachments preview */}
               {attachedFiles.length > 0 && (
                 <div className="space-y-2">
                   {attachedFiles.map((file, index) => (
                     <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                       {getFileIcon(file.type)}
                       <div className="flex-1 min-w-0">
                         <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">{file.name}</p>
                         <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                       </div>
                       <Button
                         size="sm"
                         variant="ghost"
                         onClick={() => removeFile(index)}
                         className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                       >
                         <X className="w-4 h-4" />
                       </Button>
                     </div>
                   ))}
                 </div>
               )}

               <div className="flex space-x-2">
                {/* Relative wrapper for the input and inner button */}
                <div className="relative flex-1">
                  <Input
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    // rows={3}
                    style = {{ paddingRight: '2.5rem' }} // Add right padding to prevent text overlap with the button
                    className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                  />
                  
                  {/* Absolute positioned Attachment button */}
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    size="icon"
                    variant="ghost" // Changed to ghost for a cleaner look inside the input
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </div>

                {/* Send button stays on the outside */}
                <Button 
                  onClick={handleSendReply} 
                  className="h-auto bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

               <input
                 ref={fileInputRef}
                 type="file"
                 multiple
                 onChange={handleFileUpload}
                 className="hidden"
                 accept="image/*,.pdf,.doc,.docx,.txt"
               />
             </div>
          </div>
         ) : (
           <div className="space-y-4">
             {messagesLoading ? (
               <div className="flex items-center justify-center py-8">
                 <div className="text-center">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 dark:border-gray-400 mx-auto"></div>
                   <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading messages...</p>
                 </div>
               </div>
             ) : adminMessages.length === 0 ? (
               <div className="text-center py-8">
                 <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                 <p className="text-gray-600 dark:text-gray-400">No messages from external tenants yet</p>
               </div>
              ) :
                adminMessages.map((message) => (
              <div
                key={message.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  message.status === 'unread'
                    ? 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30'
                }`}
                onClick={() => handleViewConversation(message)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      {/* THE MAIN ADMIN MESSAGES LIST UI */}
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                          {message.from}
                        </h3>
                        
                        <Badge variant={
                          message.priority === 'high' ? 'destructive' :
                          message.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {message.priority.toUpperCase()}
                        </Badge>
                        {message.status === 'unread' && (
                          <Badge variant="outline" className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{message.timestamp}</p>
                      
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{message.subject}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{message.message}</p>
                    {/* <p className="text-xs text-gray-500 dark:text-gray-500">{message.timestamp}</p> */}
                  </div>
                  <div className="flex space-x-2">
                    {/* <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="dark:border-gray-600 dark:text-gray-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReplyMessage(message);
                          }}
                        >
                          Quick Reply
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                        <DialogHeader>
                          <DialogTitle className="text-gray-900 dark:text-gray-100">Quick Reply to {message.from}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <strong>Original Message:</strong>
                            </p>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                              <p className="text-gray-900 dark:text-gray-100"><strong>Subject:</strong> {message.subject}</p>
                              <p className="mt-2 text-gray-700 dark:text-gray-300">{message.message}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Your Reply:</label>
                            <Textarea
                              placeholder="Type your reply here..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              rows={5}
                              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <DialogTrigger asChild>
                              <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300">Cancel</Button>
                            </DialogTrigger>
                            <Button onClick={handleSendReply} className="bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600">
                              Send Reply
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderSupportContent = () => (
    <div className="space-y-6">
      {/* Admin Profile Component */}
      <AdminProfileComponent />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800 dark:text-gray-100">
              <Bot className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
              Chatbot Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Bot Status: <span className="text-gray-800 dark:text-gray-200">Active</span></p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Response Rate: <span className="text-gray-800 dark:text-gray-200">97%</span></p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg Response Time: <span className="text-gray-800 dark:text-gray-200">1.2s</span></p>
            </div>
            <div className="space-y-2">
              <Button size="sm" className="w-full bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600">Update Knowledge Base</Button>
              <Button size="sm" variant="outline" className="w-full dark:border-gray-600 dark:text-gray-300">View Chat Logs</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800 dark:text-gray-100">
              <FileText className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Server Status</span>
                <Badge className="bg-gray-700 dark:bg-gray-600">Online</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Database</span>
                <Badge className="bg-gray-700 dark:bg-gray-600">Healthy</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">File Storage</span>
                <Badge className="bg-gray-700 dark:bg-gray-600">Available</Badge>
              </div>
              {stats && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Admin Sessions</span>
                  <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">{stats.active_sessions} active</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left: Menu buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Menu size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {sidebarCollapsed ? (
                    <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
                  )}
                </button>
                <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Shield size={24} />
                  Admin Dashboard
                </h1>
              </div>

              {/* Right: Theme toggle and notifications */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? (
                    <Sun size={20} className="text-yellow-500" />
                  ) : (
                    <Moon size={20} className="text-gray-600" />
                  )}
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative transition-colors">
                  <Bell size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
