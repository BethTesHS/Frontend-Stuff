// src/components/Messages/Messages.tsx
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Paperclip, X, FileText, Image as ImageIcon, Download, Loader2, ArrowLeft, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { MOCK_MESSAGES_DATA } from '@/constants/mockMessages';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export interface MessagesProps {
  initialContext?: {
    propertyId?: string | null;
    propertyTitle?: string | null;
    agentId?: string | null;
    agentName?: string | null;
    roomId?: string | null;
    roomTitle?: string | null;
    landlordId?: string | null;
    landlordName?: string | null;
    tenantId?: string | null;
    tenantName?: string | null;
    recipientId?: string | null; // Generic target ID
    recipientName?: string | null; // Generic target Name
    subject?: string | null;
  };
}

export interface ChatMessage {
  id: number | string;
  conversation_id: string | number;
  sender_id: string;
  sender_name: string;
  sender_type: string;
  message_text: string;
  created_at: string;
  is_read?: boolean;
  attachment_url?: string;
  attachment_name?: string;
  attachment_size?: number;
  attachment_type?: string;
}

export interface GroupedConversation {
  user_id: string;
  user_name: string;
  user_type: string;
  latest_message_at: string;
  latest_message: { text: string };
  total_unread_count: number;
  status?: string;
  subject?: string;
}

export default function Messages({ initialContext }: MessagesProps) {
  const [newMessage, setNewMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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

  // Handle auto-opening a conversation if initialContext is provided
  useEffect(() => {
    const targetId = initialContext?.recipientId || initialContext?.agentId || initialContext?.landlordId || initialContext?.tenantId;
    const targetName = initialContext?.recipientName || initialContext?.agentName || initialContext?.landlordName || initialContext?.tenantName;
    const subject = initialContext?.subject || initialContext?.propertyTitle || initialContext?.roomTitle;

    if (targetId && groupedConversations.length > 0) {
      const existingConv = groupedConversations.find(c => c.user_id === targetId);
      
      if (existingConv) {
        handleViewConversation(existingConv);
      } else {
        // Create a temporary conversation placeholder if it's a new contact
        const newContact: GroupedConversation = {
          user_id: targetId as string,
          user_name: targetName || 'Unknown User',
          user_type: initialContext?.agentId ? 'agent' : initialContext?.landlordId ? 'owner' : 'user',
          latest_message_at: new Date().toISOString(),
          latest_message: { text: subject ? `Regarding: ${subject}` : 'New conversation' },
          total_unread_count: 0,
          status: 'read',
          subject: subject || 'General Inquiry'
        };
        setGroupedConversations(prev => [newContact, ...prev]);
        handleViewConversation(newContact);
      }
    }
  }, [initialContext, groupedConversations.length]);

  useEffect(() => {
    if (currentGroupedConversation && viewingConversation) {
      loadMockMessages(currentGroupedConversation.user_id);
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

  const loadConversations = async () => {
    try {
      // Mock data integration - swap this out for your real API call later
      const mockGroups = MOCK_MESSAGES_DATA.contacts.map(contact => ({
        user_id: contact.id,
        user_name: contact.name,
        user_type: contact.role,
        latest_message_at: new Date(contact.timestamp).toISOString(),
        latest_message: { text: contact.lastMessage },
        total_unread_count: contact.unreadCount,
        status: contact.unreadCount > 0 ? 'unread' : 'read',
        subject: contact.role.charAt(0).toUpperCase() + contact.role.slice(1)
      }));
      setGroupedConversations(mockGroups);
    } catch (error) {
      toast.error('Failed to load conversations');
    }
  };

  const loadMockMessages = (targetUserId: string) => {
    setLoading(true);
    const mockConvo = MOCK_MESSAGES_DATA.conversations[targetUserId as keyof typeof MOCK_MESSAGES_DATA.conversations];
    
    if (mockConvo) {
      const transformedMessages: ChatMessage[] = mockConvo.map((msg: any, index: number) => ({
        id: index,
        conversation_id: targetUserId,
        sender_id: msg.senderId === 'admin' ? targetUserId : user?.id || 'current_user',
        sender_name: msg.senderId === 'admin' ? currentGroupedConversation?.user_name || 'Contact' : 'You',
        sender_type: msg.senderId === 'admin' ? 'contact' : 'me',
        message_text: msg.text,
        created_at: msg.timestamp,
        is_read: true,
      }));
      setMessages(transformedMessages);
    } else {
      setMessages([]);
    }
    setLoading(false);
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

    // Create immediate local message for optimistic UI
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      conversation_id: currentGroupedConversation.user_id,
      sender_id: user?.id || 'current_user',
      sender_name: user?.firstName ? `${user.firstName} ${user.lastName}` : 'You',
      sender_type: 'me',
      message_text: newMessage.trim(),
      created_at: new Date().toISOString(),
      is_read: true,
      attachment_url: attachedFiles.length > 0 ? URL.createObjectURL(attachedFiles[0]) : undefined,
      attachment_name: attachedFiles.length > 0 ? attachedFiles[0].name : undefined,
      attachment_size: attachedFiles.length > 0 ? attachedFiles[0].size : undefined,
      attachment_type: attachedFiles.length > 0 ? (attachedFiles[0].type.startsWith('image/') ? 'image' : 'document') : undefined,
    };

    setMessages(prev => [...prev, newMsg]);
    
    // Update the conversation preview on the list view
    setGroupedConversations(prev => prev.map(conv => {
      if (conv.user_id === currentGroupedConversation.user_id) {
        return {
          ...conv,
          latest_message: { text: newMessage.trim() || 'Attached a file' },
          latest_message_at: new Date().toISOString()
        };
      }
      return conv;
    }));

    setNewMessage("");
    setAttachedFiles([]);
    setSending(false);
    
    // toast.success("Message sent!"); 
    // Commented out success toast to make chat feel more natural, uncomment if preferred.
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

  const isMyMessage = (message: ChatMessage) => {
    return message.sender_type === 'me' || message.sender_id === user?.id;
  };

  return (
    <Card className="bg-card border-border shadow-sm h-full flex flex-col overflow-hidden">
      <CardHeader className="flex-none pb-4 border-b border-border/50">
        <CardTitle className="flex items-center text-lg text-foreground">
          {viewingConversation && (
            <Button variant="ghost" size="icon" onClick={handleBackToMessages} className="mr-2 h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <MessageSquare className="w-5 h-5 mr-2 text-muted-foreground" />
          {viewingConversation ? `Chat with ${currentGroupedConversation?.user_name}` : 'Messages'}
          {isLocalhost && <span className="ml-2 text-xs text-muted-foreground font-normal bg-muted px-2 py-1 rounded-full">(Mock Data)</span>}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 p-0 sm:p-4 sm:pt-4 pt-0">
        {viewingConversation ? (
          <div className="flex-1 flex flex-col min-h-0 space-y-4 h-full px-4 sm:px-0 pt-4 sm:pt-0">
            {/* Chat Area */}
            <ScrollArea className="flex-1 border border-border rounded-lg p-4 bg-muted/20">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mb-2" />
                  <span className="text-sm">Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground">
                  <p className="text-sm">No messages yet.</p>
                  <p className="text-xs mt-1 text-center max-w-xs opacity-70">
                    Send a message to start the conversation.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pr-4 pb-2">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[85%] lg:max-w-md px-4 py-2 rounded-2xl ${
                         isMyMessage(message)
                           ? 'bg-primary text-primary-foreground rounded-br-sm'
                           : 'bg-muted text-foreground border border-border rounded-bl-sm'
                       }`}>
                         {message.message_text && (
                           <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message_text}</p>
                         )}
                         {message.attachment_url && (
                           <div className="mt-2 space-y-2">
                             <div className={`flex items-center gap-2 p-2 rounded-lg border ${
                               isMyMessage(message) ? 'bg-primary-foreground/10 border-primary-foreground/20' : 'bg-background border-border'
                             }`}>
                               {getFileIcon(message.attachment_type || 'file')}
                               <div className="flex-1 min-w-0">
                                 <p className="text-xs font-medium truncate">{message.attachment_name}</p>
                                 <p className="text-[10px] opacity-70">{formatFileSize(message.attachment_size || 0)}</p>
                               </div>
                               <Button size="icon" variant="ghost" className="h-6 w-6 p-0 hover:bg-transparent hover:opacity-80" onClick={(e) => {
                                   e.stopPropagation();
                                   toast.info(`Downloading ${message.attachment_name}`);
                               }}>
                                 <Download className="w-3 h-3" />
                               </Button>
                             </div>
                           </div>
                         )}
                         <p className={`text-[10px] mt-1.5 text-right ${isMyMessage(message) ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                           {formatMessageTime(message.created_at)}
                         </p>
                       </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="flex-none pt-2 pb-4 sm:pb-0">
               {attachedFiles.length > 0 && (
                 <div className="space-y-2 max-h-32 overflow-y-auto pr-2 mb-3">
                   {attachedFiles.map((file, index) => (
                     <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border border-border text-sm">
                       {getFileIcon(file.type)}
                       <div className="flex-1 min-w-0">
                         <p className="font-medium truncate">{file.name}</p>
                         <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                       </div>
                       <Button size="icon" variant="ghost" onClick={() => removeFile(index)} className="h-6 w-6 text-muted-foreground hover:text-destructive">
                         <X className="w-4 h-4" />
                       </Button>
                     </div>
                   ))}
                 </div>
               )}
               <div className="flex items-end gap-2">
                <div className="relative flex-1">
                  <Input 
                    placeholder="Type a message..." 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="pr-10 bg-background resize-none" 
                  />
                  <Button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={uploadingFile}
                    size="icon" 
                    variant="ghost" 
                    className="absolute right-1 bottom-1 h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    {uploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                  </Button>
                </div>
                <Button 
                  onClick={handleSendMessage} 
                  disabled={sending || (!newMessage.trim() && attachedFiles.length === 0)} 
                  className="h-10 px-4"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
             </div>
          </div>
         ) : (
           // Conversation List
           <div className="flex-1 overflow-auto p-4 sm:p-0 space-y-2">
             {groupedConversations.length === 0 ? (
               <div className="text-center py-12 flex flex-col items-center">
                 <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                   <MessageSquare className="w-6 h-6 text-muted-foreground" />
                 </div>
                 <h3 className="text-lg font-medium text-foreground">No messages yet</h3>
                 <p className="text-muted-foreground text-sm mt-1">Your conversations will appear here.</p>
               </div>
              ) :
              groupedConversations.map((groupedConv) => (
                <div 
                  key={groupedConv.user_id} 
                  onClick={() => handleViewConversation(groupedConv)} 
                  className={`group border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                    groupedConv.status === 'unread' 
                      ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' 
                      : 'bg-card border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2 min-w-0">
                          <h3 className={`font-semibold truncate ${groupedConv.status === 'unread' ? 'text-foreground' : 'text-foreground/90'}`}>
                            {groupedConv.user_name}
                          </h3>
                          {groupedConv.status === 'unread' && (
                            <Badge className="bg-primary text-primary-foreground border-none h-5 px-1.5 text-[10px]">NEW</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                          {formatMessageTime(groupedConv.latest_message_at)}
                        </span>
                      </div>
                      {groupedConv.subject && (
                        <p className="text-xs font-medium text-foreground/70 truncate">{groupedConv.subject}</p>
                      )}
                      <p className={`text-sm truncate ${groupedConv.status === 'unread' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {groupedConv.latest_message?.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}