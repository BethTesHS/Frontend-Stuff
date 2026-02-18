import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip, X, FileText, Image, Download, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { tenantMessagingApi, TenantMessage, TenantConversation } from "@/services/tenantMessagingApi";
import buyerApi, { Conversation } from "@/services/buyerApi";
import { useAuth } from "@/contexts/AuthContext";

// Interface for grouped conversations by user
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groupedConversations, setGroupedConversations] = useState<GroupedConversation[]>([]);
  const [currentGroupedConversation, setCurrentGroupedConversation] = useState<GroupedConversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when grouped conversation changes
  useEffect(() => {
    if (currentGroupedConversation) {
      loadMessagesForUser(currentGroupedConversation.user_id);
    }
  }, [currentGroupedConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
          latest_message_at: conv.last_message_at || '',
          latest_message: { text: conv.last_message },
          total_unread_count: conv.unread_count || 0,
          property: conv.property_id ? {
            id: conv.property_id,
            title: conv.property?.title
          } : null
        });
      } else {
        const existing = userMap.get(userId)!;
        existing.conversations.push(conv);
        existing.total_unread_count += conv.unread_count || 0;

        // Keep the most recent message
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
      const response = await buyerApi.getConversations();
      if (response.success && response.data && Array.isArray(response.data.conversations)) {
        setConversations(response.data.conversations);
        const grouped = groupConversationsByUser(response.data.conversations);
        setGroupedConversations(grouped);

        // If there's an initialContext, try to find and select the relevant conversation
        if (initialContext && (initialContext.agentId || initialContext.landlordId)) {
          const targetId = initialContext.agentId || initialContext.landlordId;
          const targetConversation = grouped.find(gc => gc.user_id === targetId);

          if (targetConversation) {
            setCurrentGroupedConversation(targetConversation);
          } else {
            // Create a placeholder for new conversation
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
              }
            };
            setCurrentGroupedConversation(placeholderConversation);
          }
        } else if (grouped.length > 0) {
          // Auto-select first grouped conversation if no initial context
          setCurrentGroupedConversation(grouped[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast.error('Failed to load conversations');
    }
  };

  const loadMessagesForUser = async (userId: string) => {
    setLoading(true);
    try {
      // Get all messages from all conversations for this user
      const groupedConv = groupedConversations.find(gc => gc.user_id === userId);
      if (!groupedConv) return;

      const allMessages: TenantMessage[] = [];

      // Load messages from all conversations for this user
      for (const conv of groupedConv.conversations) {
        const response = await buyerApi.getConversationMessages(conv.id);
        if (response.success && Array.isArray(response.data?.messages)) {
          allMessages.push(...response.data.messages);
        }
      }

      // Sort messages by timestamp
      allMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      setMessages(allMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachedFiles.length === 0) {
      toast.error("Please enter a message or attach a file");
      return;
    }

    if (!currentGroupedConversation) {
      toast.error("Please select a conversation");
      return;
    }

    setSending(true);
    try {
      // Use the new chat endpoint for replies
      const response = await tenantMessagingApi.sendChatMessage({
        recipient_id: currentGroupedConversation.user_id,
        recipient_type: currentGroupedConversation.user_type || 'buyer',
        initial_message: newMessage.trim(),
        property_id: currentGroupedConversation.property?.id,
        property_title: currentGroupedConversation.property?.title,
      });

      if (response.success) {
        // Add new message to the list
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

        // Refresh conversations to update last message
        loadConversations();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to send message');
      } else {
        toast.error('Failed to send message');
      }
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
    if (type?.startsWith('image/')) return <Image className="w-4 h-4" />;
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
      console.error('Failed to download file:', error);
      toast.error('Failed to download file');
    }
  };

  return (
    <div className="h-full">
      <div className="flex h-full rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Conversations</h3>
              </div>
              <ScrollArea className="h-full">
                <div className="space-y-2 p-2">
                  {groupedConversations.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500 dark:text-gray-400">No conversations yet</p>
                    </div>
                  ) : (
                    groupedConversations.map((groupedConv) => (
                      <div
                        key={groupedConv.user_id}
                        onClick={() => setCurrentGroupedConversation(groupedConv)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          currentGroupedConversation?.user_id === groupedConv.user_id
                            ? 'bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800/50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {groupedConv.user_name?.charAt(0) || 'T'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                              {groupedConv.user_name || 'Tenant'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {groupedConv.latest_message?.text || 'No messages yet'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {groupedConv.latest_message_at && formatMessageTime(groupedConv.latest_message_at)}
                            </p>
                          </div>
                          {groupedConv.total_unread_count > 0 && (
                            <div className="bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {groupedConv.total_unread_count}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex flex-col">
              {currentGroupedConversation ? (
                <>
                  {/* Messages Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {currentGroupedConversation.user_name?.charAt(0) || 'T'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {currentGroupedConversation.user_name || 'Tenant'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {currentGroupedConversation.conversations.length} conversation{currentGroupedConversation.conversations.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4 max-h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 bg-gray-50 dark:bg-gray-900/50">
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
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${
                              isMyMessage(message) ? 'flex-row-reverse' : 'flex-row'
                            }`}
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">
                                {isMyMessage(message) ? "AG" : "TN"}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className={`max-w-xs lg:max-w-md ${isMyMessage(message) ? 'text-right' : 'text-left'}`}>
                              <div className={`flex items-center gap-2 mb-1 ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                  {message.sender_name}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatMessageTime(message.created_at)}
                                </span>
                              </div>
                              
                              <div className={`px-4 py-2 rounded-lg text-left ${
                                isMyMessage(message)
                                  ? 'bg-gray-800 dark:bg-gray-700 text-white'
                                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-900 dark:text-gray-100'
                              }`}>
                                {message.message_text && (
                                  <p className="text-sm">
                                    {message.message_text}
                                  </p>
                                )}
                                
                                {/* File attachment */}
                                {message.attachment_url && (
                                  <div className="mt-2 space-y-2">
                                    <div className={`flex items-center gap-2 p-2 rounded border ${
                                      isMyMessage(message)
                                        ? 'bg-gray-700/50 border-gray-600/50' 
                                        : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-600'
                                    }`}>
                                      {getFileIcon(message.attachment_type || 'file')}
                                      <div className="flex-1 min-w-0 text-left">
                                        <p className="text-xs font-medium truncate">{message.attachment_name}</p>
                                        <p className="text-xs opacity-70">{formatFileSize(message.attachment_size || 0)}</p>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (message.attachment_url && message.attachment_name) {
                                            handleDownloadFile(message.attachment_url, message.attachment_name);
                                          }
                                        }}
                                      >
                                        <Download className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
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
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          style={{ paddingRight: '2.5rem' }} // Add right padding to prevent text overlap with the button
                          className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        
                        {/* Absolute positioned Attachment button */}
                        <Button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingFile}
                          size="icon"
                          variant="ghost" // Changed to ghost for a cleaner look inside the input
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          {uploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                        </Button>
                      </div>

                      {/* Send button stays on the outside */}
                      <Button
                        onClick={handleSendMessage}
                        disabled={sending || (!newMessage.trim() && attachedFiles.length === 0)}
                        className="h-auto bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white"
                      >
                        {sending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
                  <div className="text-center">
                    <User className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
      </div>
    </div>
  );
};

export default AgentMessages;