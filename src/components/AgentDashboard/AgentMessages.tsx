import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip, X, FileText, Image as ImageIcon, Download, Loader2, ArrowLeft, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { tenantMessagingApi, TenantMessage } from "@/services/tenantMessagingApi";
import buyerApi, { Conversation } from "@/services/buyerApi";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { MOCK_MESSAGES_DATA } from '@/constants/adminDashboard';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

interface GroupedConversation {
  user_id: string;
  user_name: string;
  user_email: string;
  user_type: string;
  conversations: Conversation[];
  latest_message_at: string;
  latest_message: any;
  total_unread_count: number;
  property: any;
  priority?: string;
  status?: string;
  subject?: string;
}

interface MessageContext {
  propertyId?: string | null;
  propertyTitle?: string | null;
  agentId?: string | null;
  agentName?: string | null;
  roomId?: string | null;
  roomTitle?: string | null;
  landlordId?: string | null;
  landlordName?: string | null;
}

interface AgentMessagesProps {
  initialContext?: MessageContext;
}

const AgentMessages = ({ initialContext }: AgentMessagesProps = {}) => {
  const [newMessage, setNewMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [messages, setMessages] = useState<TenantMessage[]>([]);
  const [groupedConversations, setGroupedConversations] = useState<GroupedConversation[]>([]);
  const [currentGroupedConversation, setCurrentGroupedConversation] = useState<GroupedConversation | null>(null);
  const [viewingConversation, setViewingConversation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (currentGroupedConversation && viewingConversation) {
      if (isLocalhost) {
        loadMockMessages(currentGroupedConversation.user_id);
      } else {
        loadMessagesForUser(currentGroupedConversation.user_id);
      }
    }
  }, [currentGroupedConversation, viewingConversation]);

  useEffect(() => {
    if (viewingConversation) {
      scrollToBottom();
    }
  }, [messages, viewingConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const groupConversationsByUser = (conversations: Conversation[]): GroupedConversation[] => {
    const userMap = new Map<string, GroupedConversation>();

    conversations.forEach(conv => {
      const userId = conv.agent_id?.toString();
      if (!userId) return;

      if (!userMap.has(userId)) {
        userMap.set(userId, {
          user_id: userId,
          user_name: conv.agent?.name || 'Unknown User',
          user_email: conv.agent?.email || '',
          user_type: 'agent',
          conversations: [conv],
          latest_message_at: conv.last_message_at || new Date().toISOString(),
          latest_message: { text: conv.last_message || 'Conversation started' },
          total_unread_count: conv.unread_count || 0,
          property: conv.property_id ? {
            id: conv.property_id,
            title: conv.property?.title
          } : null,
          priority: (conv.unread_count || 0) > 0 ? 'high' : 'low',
          status: (conv.unread_count || 0) > 0 ? 'unread' : 'read',
          subject: conv.subject || conv.property?.title || 'General Chat'
        });
      } else {
        const existing = userMap.get(userId)!;
        existing.conversations.push(conv);
        existing.total_unread_count += conv.unread_count || 0;
        existing.status = existing.total_unread_count > 0 ? 'unread' : 'read';
        existing.priority = existing.total_unread_count > 0 ? 'high' : 'low';

        if (conv.last_message_at && conv.last_message_at > existing.latest_message_at) {
          existing.latest_message_at = conv.last_message_at;
          existing.latest_message = { text: conv.last_message };
        }
      }
    });

    return Array.from(userMap.values()).sort((a, b) =>
      new Date(b.latest_message_at).getTime() - new Date(a.latest_message_at).getTime()
    );
  };

  const loadConversations = async () => {
    try {
      if (isLocalhost) {
        const mockGroups = MOCK_MESSAGES_DATA.contacts.map(contact => ({
          user_id: contact.id,
          user_name: contact.name,
          user_email: `${contact.name.toLowerCase().replace(' ', '.')}@mock.com`,
          user_type: contact.role,
          conversations: [],
          latest_message_at: new Date(contact.timestamp).toISOString(),
          latest_message: { text: contact.lastMessage },
          total_unread_count: contact.unreadCount,
          property: { id: 'mock', title: 'Mock Property' },
          priority: contact.unreadCount > 0 ? 'high' : 'low',
          status: contact.unreadCount > 0 ? 'unread' : 'read',
          subject: contact.role
        }));
        
        setGroupedConversations(mockGroups);

        if (initialContext && (initialContext.agentId || initialContext.landlordId)) {
           const targetId = initialContext.agentId || initialContext.landlordId;
           const targetConversation = mockGroups.find(gc => gc.user_id === targetId);
           if (targetConversation) {
             handleViewConversation(targetConversation);
           }
        }
        return;
      }

      const response = await buyerApi.getConversations();
      if (response.success && response.data && Array.isArray(response.data.conversations)) {
        const grouped = groupConversationsByUser(response.data.conversations);
        setGroupedConversations(grouped);

        if (initialContext && (initialContext.agentId || initialContext.landlordId)) {
          const targetId = initialContext.agentId || initialContext.landlordId;
          const targetConversation = grouped.find(gc => gc.user_id === targetId);

          if (targetConversation) {
            handleViewConversation(targetConversation);
          } else {
            const placeholderConversation: GroupedConversation = {
              user_id: targetId || 'new',
              user_name: initialContext.agentName || initialContext.landlordName || 'Contact',
              user_email: '',
              user_type: initialContext.agentId ? 'agent' : 'landlord',
              conversations: [],
              latest_message_at: new Date().toISOString(),
              latest_message: null,
              total_unread_count: 0,
              property: {
                id: initialContext.propertyId || initialContext.roomId,
                title: initialContext.propertyTitle || initialContext.roomTitle
              },
              priority: 'low',
              status: 'read',
              subject: initialContext.propertyTitle || initialContext.roomTitle || 'Inquiry'
            };
            handleViewConversation(placeholderConversation);
          }
        }
      }
    } catch (error) {
      toast.error('Failed to load conversations');
    }
  };

  const loadMockMessages = (userId: string) => {
    setLoading(true);
    const mockConvo = MOCK_MESSAGES_DATA.conversations[userId as keyof typeof MOCK_MESSAGES_DATA.conversations];
    if (mockConvo) {
      const transformedMessages: TenantMessage[] = mockConvo.map((msg: any, index: number) => ({
        id: index,
        conversation_id: 1,
        sender_id: msg.senderId === 'admin' ? user?.id || 'admin' : userId,
        sender_name: msg.senderId === 'admin' ? 'You' : currentGroupedConversation?.user_name || 'Contact',
        sender_type: msg.senderId === 'admin' ? 'agent' : 'buyer',
        message_text: msg.text,
        created_at: msg.timestamp,
        is_read_by_tenant: true,
        is_read_by_agent: true,
      }));
      setMessages(transformedMessages);
    } else {
      setMessages([]);
    }
    setLoading(false);
  };

  const loadMessagesForUser = async (userId: string) => {
    setLoading(true);
    try {
      const groupedConv = groupedConversations.find(gc => gc.user_id === userId);
      if (!groupedConv) return;

      const allMessages: TenantMessage[] = [];
      for (const conv of groupedConv.conversations) {
        const response = await buyerApi.getConversationMessages(conv.id);
        if (response.success && Array.isArray(response.data?.messages)) {
          allMessages.push(...response.data.messages);
        }
      }

      allMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      setMessages(allMessages);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleViewConversation = (groupedConv: GroupedConversation) => {
    setCurrentGroupedConversation(groupedConv);
    setViewingConversation(true);
  };

  const handleBackToMessages = () => {
    setViewingConversation(false);
    setCurrentGroupedConversation(null);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachedFiles.length === 0) {
      toast.error("Please enter a message or attach a file");
      return;
    }

    if (!currentGroupedConversation) return;

    setSending(true);

    if (isLocalhost) {
      const newMsg: TenantMessage = {
        id: Date.now(),
        conversation_id: parseInt(currentGroupedConversation.user_id || '0'),
        sender_id: user?.id || 'admin',
        sender_name: user?.firstName ? `${user.firstName} ${user.lastName}` : 'You',
        sender_type: user?.role || 'agent',
        message_text: newMessage.trim(),
        created_at: new Date().toISOString(),
        is_read_by_tenant: false,
        is_read_by_agent: true,
        attachment_url: attachedFiles.length > 0 ? URL.createObjectURL(attachedFiles[0]) : undefined,
        attachment_name: attachedFiles.length > 0 ? attachedFiles[0].name : undefined,
        attachment_size: attachedFiles.length > 0 ? attachedFiles[0].size : undefined,
        attachment_type: attachedFiles.length > 0 ? (attachedFiles[0].type.startsWith('image/') ? 'image' : 'document') : undefined,
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
      setAttachedFiles([]);
      toast.success("Mock message sent successfully!");
      setSending(false);
      return;
    }

    try {
      const response = await tenantMessagingApi.sendChatMessage({
        recipient_id: currentGroupedConversation.user_id,
        recipient_type: currentGroupedConversation.user_type || 'buyer',
        initial_message: newMessage.trim(),
        property_id: currentGroupedConversation.property?.id,
        property_title: currentGroupedConversation.property?.title,
      });

      if (response.success) {
        const newMsg: TenantMessage = {
          id: Date.now(),
          conversation_id: parseInt(response.data?.conversation_id || '0'),
          sender_id: user?.id || '',
          sender_name: user?.firstName + ' ' + user?.lastName || 'You',
          sender_type: user?.role || 'agent',
          message_text: newMessage.trim(),
          created_at: new Date().toISOString(),
          is_read_by_tenant: false,
          is_read_by_agent: true,
        };

        setMessages(prev => [...prev, newMsg]);
        setNewMessage("");
        setAttachedFiles([]);
        toast.success("Message sent successfully!");
        loadConversations();
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setAttachedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type?.startsWith('image')) return <ImageIcon className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const isMyMessage = (message: TenantMessage) => {
    return user && message.sender_id?.toString() === user.id;
  };

  const handleDownloadFile = async (filename: string, displayName: string) => {
    try {
      const blob = await tenantMessagingApi.downloadFile(filename);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = displayName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg text-gray-800 dark:text-gray-100">
          {viewingConversation && (
            <Button variant="ghost" size="sm" onClick={handleBackToMessages} className="mr-2 dark:text-gray-300">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <MessageSquare className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
          {viewingConversation ? `Conversation with ${currentGroupedConversation?.user_name}` : 'Messages'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {viewingConversation ? (
          <div className="space-y-4">
            <ScrollArea className="h-[60vh] border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-500 dark:text-gray-400" />
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-sm text-gray-500 dark:text-gray-400">No messages yet. Start a conversation!</p>
                </div>
              ) : (
                <div className="space-y-4 pr-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                         isMyMessage(message)
                           ? 'bg-gray-800 dark:bg-gray-700 text-white'
                           : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-900 dark:text-gray-100'
                       }`}>
                         {message.message_text && (
                           <p className="text-sm">{message.message_text}</p>
                         )}
                         {message.attachment_url && (
                           <div className="mt-2 space-y-2">
                             <div className={`flex items-center gap-2 p-2 rounded border ${
                               isMyMessage(message) ? 'bg-gray-700/50 border-gray-600/50' : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-600'
                             }`}>
                               {getFileIcon(message.attachment_type || 'file')}
                               <div className="flex-1 min-w-0">
                                 <p className="text-xs font-medium truncate">{message.attachment_name}</p>
                                 <p className="text-xs opacity-70">{formatFileSize(message.attachment_size || 0)}</p>
                               </div>
                               <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={(e) => {
                                   e.stopPropagation();
                                   if (!isLocalhost && message.attachment_url) {
                                       handleDownloadFile(message.attachment_url, message.attachment_name || 'file');
                                   } else {
                                       toast.info(`Downloading ${message.attachment_name}`);
                                   }
                               }}>
                                 <Download className="w-3 h-3" />
                               </Button>
                             </div>
                           </div>
                         )}
                         <p className={`text-xs mt-1 ${isMyMessage(message) ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                           {message.sender_name} • {formatMessageTime(message.created_at)}
                         </p>
                       </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            <div className="space-y-3">
               {attachedFiles.length > 0 && (
                 <div className="space-y-2">
                   {attachedFiles.map((file, index) => (
                     <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                       {getFileIcon(file.type)}
                       <div className="flex-1 min-w-0">
                         <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">{file.name}</p>
                         <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                       </div>
                       <Button size="sm" variant="ghost" onClick={() => removeFile(index)} className="h-6 w-6 p-0 text-gray-400 hover:text-red-600">
                         <X className="w-4 h-4" />
                       </Button>
                     </div>
                   ))}
                 </div>
               )}
               <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Input 
                    placeholder="Type your message..." 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    style={{ paddingRight: '2.5rem' }} 
                    className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700" 
                  />
                  <Button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={uploadingFile}
                    size="icon" 
                    variant="ghost" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {uploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                  </Button>
                </div>
                <Button 
                  onClick={handleSendMessage} 
                  disabled={sending || (!newMessage.trim() && attachedFiles.length === 0)} 
                  className="h-auto bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
             </div>
          </div>
         ) : (
           <div className="space-y-4">
             {groupedConversations.length === 0 ? (
               <div className="text-center py-8">
                 <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                 <p className="text-gray-600 dark:text-gray-400">No conversations yet</p>
               </div>
              ) :
              groupedConversations.map((groupedConv) => (
                <div 
                  key={groupedConv.user_id} 
                  onClick={() => handleViewConversation(groupedConv)} 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    groupedConv.status === 'unread' 
                      ? 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800' 
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-200">{groupedConv.user_name}</h3>
                          <Badge variant={groupedConv.priority === 'high' ? 'destructive' : groupedConv.priority === 'medium' ? 'default' : 'secondary'}>
                            {(groupedConv.priority || 'low').toUpperCase()}
                          </Badge>
                          {groupedConv.status === 'unread' && (
                            <Badge variant="outline" className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600">NEW</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{formatMessageTime(groupedConv.latest_message_at)}</p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{groupedConv.subject || 'General Chat'}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{groupedConv.latest_message?.text}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentMessages;