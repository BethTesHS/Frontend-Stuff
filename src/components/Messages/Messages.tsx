// src/components/Messages/Messages.tsx
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Paperclip, X, FileText, Image as ImageIcon, Download, Loader2, ArrowLeft, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
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
    recipientId?: string | null;
    recipientName?: string | null;
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
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const targetId = initialContext?.recipientId || initialContext?.agentId || initialContext?.landlordId || initialContext?.tenantId;
    const targetName = initialContext?.recipientName || initialContext?.agentName || initialContext?.landlordName || initialContext?.tenantName;
    const subject = initialContext?.subject || initialContext?.propertyTitle || initialContext?.roomTitle;

    if (targetId && groupedConversations.length > 0) {
      const existingConv = groupedConversations.find(c => c.user_id === targetId);

      if (existingConv) {
        handleSelectConversation(existingConv);
      } else {
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
        handleSelectConversation(newContact);
      }
    }
  }, [initialContext, groupedConversations.length]);

  useEffect(() => {
    if (currentGroupedConversation) {
      loadMockMessages(currentGroupedConversation.user_id);
    }
  }, [currentGroupedConversation]);

  useEffect(() => {
    if (currentGroupedConversation) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
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

  const handleSelectConversation = (groupedConv: GroupedConversation) => {
    setCurrentGroupedConversation(groupedConv);
    if (groupedConv.status === 'unread') {
      setGroupedConversations(prev => prev.map(conv =>
        conv.user_id === groupedConv.user_id
          ? { ...conv, status: 'read', total_unread_count: 0 }
          : conv
      ));
    }
    if (isMobile) setMobileShowChat(true);
  };

  const handleMobileBack = () => {
    setMobileShowChat(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachedFiles.length === 0) {
      toast.error("Please enter a message or attach a file");
      return;
    }

    if (!currentGroupedConversation) return;

    setSending(true);

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

  // On mobile show only one panel at a time; on desktop show both
  const showContactList = !isMobile || !mobileShowChat;
  const showChatPanel = !isMobile || mobileShowChat;

  return (
    <div className="h-full w-full flex overflow-hidden bg-background">
      {/* Left Panel — Contact / Conversation List */}
      {showContactList && (
        <div className="w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col border-r border-border bg-card">
          {/* Panel header */}
          <div className="flex-none px-4 py-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                {/* <MessageSquare className="w-5 h-5 text-muted-foreground" /> */}
                Conversations
                {isLocalhost && (
                  <span className="text-xs text-muted-foreground font-normal bg-muted px-2 py-0.5 rounded-full">
                    Mock
                  </span>
                )}
              </h2>
            </div>
          </div>

          {/* Conversation list */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {groupedConversations.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center px-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-medium text-foreground">No messages yet</h3>
                  <p className="text-muted-foreground text-sm mt-1">Your conversations will appear here.</p>
                </div>
              ) : (
                groupedConversations.map((groupedConv) => (
                  <div
                    key={groupedConv.user_id}
                    onClick={() => handleSelectConversation(groupedConv)}
                    className={`group rounded-xl p-3 cursor-pointer transition-all duration-150 ${
                      currentGroupedConversation?.user_id === groupedConv.user_id
                        ? 'bg-primary/10 border border-primary/20'
                        : groupedConv.status === 'unread'
                        ? 'bg-primary/5 hover:bg-primary/10'
                        : 'hover:bg-muted/60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-foreground/70">
                        {groupedConv.user_name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`text-sm font-semibold truncate ${groupedConv.status === 'unread' ? 'text-foreground' : 'text-foreground/90'}`}>
                              {groupedConv.user_name}
                            </span>
                            {groupedConv.status === 'unread' && (
                              <Badge className="bg-primary text-primary-foreground border-none h-5 px-1.5 text-[10px] flex-shrink-0">
                                NEW
                              </Badge>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                            {formatMessageTime(groupedConv.latest_message_at)}
                          </span>
                        </div>
                        {groupedConv.subject && (
                          <p className="text-xs text-foreground/60 truncate mb-0.5">{groupedConv.subject}</p>
                        )}
                        <p className={`text-xs ${groupedConv.status === 'unread' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {groupedConv.latest_message?.text?.length > 45 ? groupedConv.latest_message.text.slice(0, 45) + '...' : groupedConv.latest_message?.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Right Panel — Chat View */}
      {showChatPanel && (
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {currentGroupedConversation ? (
            <>
              {/* Chat header */}
              <div className="flex-none px-4 py-3 border-b border-border bg-card flex items-center gap-3">
                {isMobile && (
                  <Button variant="ghost" size="icon" onClick={handleMobileBack} className="h-8 w-8 flex-shrink-0">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-foreground/70">
                  {currentGroupedConversation.user_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm leading-tight truncate">
                    {currentGroupedConversation.user_name}
                  </p>
                  {currentGroupedConversation.subject && (
                    <p className="text-xs text-muted-foreground truncate">{currentGroupedConversation.subject}</p>
                  )}
                </div>
              </div>

              {/* Messages area */}
              <ScrollArea className="flex-1 px-4 py-4">
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
                  <div className="space-y-4 pb-2">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] lg:max-w-lg px-4 py-2 rounded-2xl ${
                          isMyMessage(message)
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-muted text-foreground border border-border rounded-bl-sm'
                        }`}>
                          {message.message_text && (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message_text}</p>
                          )}
                          {message.attachment_url && (
                            <div className="mt-2">
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

              {/* Input area */}
              <div className="flex-none px-4 py-3 border-t border-border bg-card">
                {attachedFiles.length > 0 && (
                  <div className="space-y-1 max-h-24 overflow-y-auto mb-2">
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
                <div className="flex items-center gap-2">
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
                      className="pr-10 bg-background"
                    />
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFile}
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
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
            </>
          ) : (
            /* Empty state — no conversation selected */
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-base font-medium">Select a conversation</p>
              <p className="text-sm opacity-70">Choose a contact from the list to start messaging</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
