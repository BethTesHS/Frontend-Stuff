import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  Download,
  Loader2,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  messagingApi,
  Conversation,
  Message as ApiMessage,
} from "@/services/messagingApi";

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export interface MessagesProps {
  initialContext?: {
    propertyId?: string | null;
    recipientId?: string | null;
    recipientName?: string | null;
    subject?: string | null;
  };
}

export interface ChatMessage {
  id: number | string;
  conversation_id: string | number;
  sender_id: string | number;
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

export default function Messages({ initialContext }: MessagesProps) {
  const [newMessage, setNewMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedConversation) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const response = await messagingApi.getConversations();
      if (response.success) {
        setConversations(response.conversations);

        // Handle initial context if provided
        if (initialContext?.recipientId) {
          const existing = response.conversations.find(
            (c) => String(c.user_id) === initialContext.recipientId,
          );
          if (existing) handleSelectConversation(existing);
        }
      }
    } catch (error) {
      toast.error("Failed to load conversations");
    }
  };

  const handleSelectConversation = async (conv: Conversation) => {
    setSelectedConversation(conv);
    setLoadingMessages(true);
    if (isMobile) setMobileShowChat(true);

    try {
      const response = await messagingApi.getConversationMessages(conv.id);
      if (response.success) {
        // Transform API messages to internal ChatMessage format
        const transformed: ChatMessage[] = response.messages.map((m) => ({
          id: m.id,
          conversation_id: m.conversation_id,
          sender_id: String(m.sender_id),
          sender_name: m.sender_name,
          sender_type: m.sender_type,
          message_text: m.message_text,
          created_at: m.created_at,
          attachment_url: m.attachment_url,
          attachment_name: m.attachment_name,
        }));
        setMessages(transformed);
      }
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachedFiles.length === 0) return;
    if (!selectedConversation) return;

    setSending(true);
    try {
      let attachmentUrl = undefined;
      if (attachedFiles.length > 0) {
        setUploadingFile(true);
        const uploadRes = await messagingApi.uploadFile(
          attachedFiles[0],
          selectedConversation.id,
        );
        attachmentUrl = uploadRes.file_url;
        setUploadingFile(false);
      }

      const response = await messagingApi.sendMessage({
        conversation_id: selectedConversation.id,
        message_text: newMessage.trim(),
        attachment_url: attachmentUrl,
      });

      if (response.success) {
        const newMsg: ChatMessage = {
          ...response.message,
          sender_type: "me", 
        };
        setMessages((prev) => [...prev, newMsg]);
        setNewMessage("");
        setAttachedFiles([]);

        loadConversations();
      }
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
      setUploadingFile(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type?: string) => {
    if (type?.includes("image")) return <ImageIcon className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    return (now.getTime() - date.getTime()) / (1000 * 60 * 60) < 24
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString();
  };

  const isMyMessage = (message: ChatMessage) => {
    return message.sender_type === "me" || message.sender_type === "admin";
  };

  if (authLoading)
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (!isAuthenticated || !user) return null;

  const showContactList = !isMobile || !mobileShowChat;
  const showChatPanel = !isMobile || mobileShowChat;

  return (
    <div className="h-full w-full flex overflow-hidden bg-background">
      {showContactList && (
        <div className="w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col border-r border-border bg-card">
          <div className="flex-none px-4 py-4 border-b border-border/50">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              Conversations
              {isLocalhost && (
                <span className="text-xs text-muted-foreground font-normal bg-muted px-2 py-0.5 rounded-full">
                  Live
                </span>
              )}
            </h2>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center px-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-medium text-foreground">
                    No messages yet
                  </h3>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`group rounded-xl p-3 cursor-pointer transition-all duration-150 ${
                      selectedConversation?.id === conv.id
                        ? "bg-primary/10 border border-primary/20"
                        : conv.unread_count > 0
                          ? "bg-primary/5 hover:bg-primary/10"
                          : "hover:bg-muted/60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-foreground/70">
                        {conv.user_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-sm font-semibold truncate text-foreground/90">
                            {conv.user_name}
                          </span>
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                            {conv.last_message_at
                              ? formatMessageTime(conv.last_message_at)
                              : ""}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/60 truncate mb-0.5">
                          {conv.subject}
                        </p>
                        <p
                          className={`text-xs truncate ${conv.unread_count > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}
                        >
                          {conv.last_message_at
                            ? "Open to view messages"
                            : "No messages yet"}
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

      {showChatPanel && (
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {selectedConversation ? (
            <>
              <div className="flex-none px-4 py-3 border-b border-border bg-card flex items-center gap-3">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileShowChat(false)}
                    className="h-8 w-8 flex-shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-foreground/70">
                  {selectedConversation.user_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm leading-tight truncate">
                    {selectedConversation.user_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {selectedConversation.subject}
                  </p>
                </div>
              </div>

              <ScrollArea className="flex-1 px-4 py-4">

                {loadingMessages ? null : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground">
                    <p className="text-sm">No messages yet.</p>
                    <p className="text-xs mt-1 text-center max-w-xs opacity-70">
                      Send a message to start the conversation.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 pb-2">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${isMyMessage(message) ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] lg:max-w-lg px-4 py-2 rounded-2xl ${
                            isMyMessage(message)
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-muted text-foreground border border-border rounded-bl-sm"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.message_text}
                          </p>
                          {message.attachment_url && (
                            <div className="mt-2">
                              <div
                                className={`flex items-center gap-2 p-2 rounded-lg border ${isMyMessage(message) ? "bg-primary-foreground/10 border-primary-foreground/20" : "bg-background border-border"}`}
                              >
                                {getFileIcon()}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">
                                    {message.attachment_name || "File"}
                                  </p>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    window.open(message.attachment_url)
                                  }
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                          <p
                            className={`text-[10px] mt-1.5 text-right ${isMyMessage(message) ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                          >
                            {formatMessageTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              <div className="flex-none px-4 py-3 border-t border-border bg-card">
                {attachedFiles.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border border-border text-sm"
                      >
                        {getFileIcon(file.type)}
                        <p className="flex-1 truncate font-medium">
                          {file.name}
                        </p>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6"
                        >
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
                      onKeyDown={(e) =>
                        e.key === "Enter" && !e.shiftKey && handleSendMessage()
                      }
                      className="pr-10 bg-background"
                    />
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={
                      sending ||
                      (!newMessage.trim() && attachedFiles.length === 0)
                    }
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
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
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <MessageSquare className="w-8 h-8 opacity-20" />
              <p className="text-base font-medium">Select a conversation</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
