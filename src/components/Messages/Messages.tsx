import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  ShieldCheck,
  CheckCircle,
  RotateCcw,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  messagingApi,
  Conversation,
} from "@/services/messagingApi";
import {
  supportMessagingApi,
  SupportConversation,
  SupportMessage,
} from "@/services/supportMessagingApi";
import { playMessageSound } from "@/hooks/useNotificationSound";
import { SupportReviewModal } from "./SupportReviewModal";

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
  /** When true the UI is rebranded as "Support" and shows admin-targeted messaging */
  supportMode?: boolean;
  /** When true the component is rendered for an admin — flips message orientation and shows real user names */
  isAdminView?: boolean;
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

export default function Messages({ initialContext, supportMode = false, isAdminView = false }: MessagesProps) {
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
  const prevUnreadRef = useRef(0);

  // Support mode – new conversation form state
  const [showNewConvForm, setShowNewConvForm] = useState(false);
  const [newConvSubject, setNewConvSubject] = useState("");
  const [newConvMessage, setNewConvMessage] = useState("");
  const [creatingConv, setCreatingConv] = useState(false);

  // Support mode – close/reopen conversation state
  const [closingConv, setClosingConv] = useState(false);
  const [selectedConvStatus, setSelectedConvStatus] = useState<'open' | 'closed' | 'pending'>('open');

  // Review modal — shown to tenant after admin closes conversation
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [closedConvSubject, setClosedConvSubject] = useState("");

  // Refs for polling
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const selectedConvRef = useRef<Conversation | null>(null);
  const selectedConvStatusRef = useRef<'open' | 'closed' | 'pending'>('open');
  const prevAdminUnreadRef = useRef(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();

  // Keep refs in sync with state for use inside polling callback
  useEffect(() => { selectedConvRef.current = selectedConversation; }, [selectedConversation]);
  useEffect(() => { selectedConvStatusRef.current = selectedConvStatus; }, [selectedConvStatus]);

  useEffect(() => {
    if (isAuthenticated || isAdminView) {
      loadConversations();
    }
  }, [isAuthenticated, isAdminView]);

  useEffect(() => {
    if (selectedConversation) {
      scrollToBottom();
    }
  }, [messages]);

  // Polling: tenant detects conversation close; admin detects new messages
  const pollConversations = useCallback(async () => {
    if (!supportMode) return;
    try {
      const response = await supportMessagingApi.getConversations();
      if (!response.success || !response.data) return;
      const incoming: SupportConversation[] = response.data.conversations;

      if (isAdminView) {
        // Admin: detect new unread messages and play sound
        const totalUnread = incoming.reduce((sum, c) => sum + (c.unread_count ?? 0), 0);
        if (totalUnread > prevAdminUnreadRef.current) {
          playMessageSound();
          toast.info("New support message received");
        }
        prevAdminUnreadRef.current = totalUnread;
        setConversations(
          incoming.map((c) => ({
            id: c.id,
            user_id: c.user_id,
            user_name: c.user_name,
            subject: c.subject,
            status: c.status,
            last_message_at: c.last_message_at ?? undefined,
            unread_count: c.unread_count,
            created_at: c.created_at,
          }))
        );
      } else {
        // Tenant: detect if selected conversation was closed by admin
        const current = selectedConvRef.current;
        const prevStatus = selectedConvStatusRef.current;
        if (current && prevStatus !== 'closed') {
          const updated = incoming.find((c) => c.id === current.id);
          if (updated && updated.status === 'closed') {
            setSelectedConvStatus('closed');
            setSelectedConversation((prev) => prev ? { ...prev, status: 'closed' } : prev);
            setConversations((prev) =>
              prev.map((c) => c.id === current.id ? { ...c, status: 'closed' } : c)
            );
            playMessageSound();
            toast.info("Your support conversation has been closed by Homed admin.");
            setClosedConvSubject(current.subject ?? "");
            setShowReviewModal(true);
          }
        }
      }
    } catch {
      // silent — polling errors shouldn't bother the user
    }
  }, [supportMode, isAdminView]);

  useEffect(() => {
    if (!supportMode) return;
    if (!isAuthenticated && !isAdminView) return;

    // Start polling every 15 seconds
    pollingIntervalRef.current = setInterval(pollConversations, 15000);
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [supportMode, isAuthenticated, isAdminView, pollConversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      if (supportMode) {
        const response = await supportMessagingApi.getConversations();
        if (response.success && response.data) {
          const incoming = response.data.conversations;
          const totalUnread = incoming.reduce(
            (sum: number, c: SupportConversation) => sum + (c.unread_count ?? 0),
            0
          );
          if (totalUnread > prevUnreadRef.current) playMessageSound();
          prevUnreadRef.current = totalUnread;
          // Seed admin poll baseline so first poll doesn't false-trigger
          if (isAdminView) prevAdminUnreadRef.current = totalUnread;
          // Map SupportConversation to the Conversation shape used by the list UI
          setConversations(
            incoming.map((c) => ({
              id: c.id,
              user_id: c.user_id,
              // Admin sees real tenant names; tenants see "Homed Support"
              user_name: isAdminView ? c.user_name : "Homed Support",
              subject: c.subject,
              status: c.status,
              last_message_at: c.last_message_at ?? undefined,
              unread_count: c.unread_count,
              created_at: c.created_at,
            }))
          );
        }
      } else {
        const response = await messagingApi.getConversations();
        if (response.success) {
          const incoming = response.conversations;
          const totalUnread = incoming.reduce(
            (sum: number, c: Conversation) => sum + (c.unread_count ?? 0),
            0
          );
          if (totalUnread > prevUnreadRef.current) playMessageSound();
          prevUnreadRef.current = totalUnread;
          setConversations(incoming);
          if (initialContext?.recipientId) {
            const existing = incoming.find(
              (c: Conversation) => String(c.user_id) === initialContext.recipientId,
            );
            if (existing) handleSelectConversation(existing);
          }
        }
      }
    } catch {
      toast.error("Failed to load conversations");
    }
  };

  const handleSelectConversation = async (conv: Conversation) => {
    setSelectedConversation(conv);
    setSelectedConvStatus(conv.status ?? 'open');
    setLoadingMessages(true);
    setShowNewConvForm(false);
    if (isMobile) setMobileShowChat(true);

    try {
      if (supportMode) {
        const response = await supportMessagingApi.getMessages(conv.id);
        if (response.success && response.data) {
          setMessages(
            response.data.messages.map((m: SupportMessage) => ({
              id: m.id,
              conversation_id: m.conversation_id,
              sender_id: String(m.sender_id),
              sender_name: m.sender_name,
              // Admin view: admin's own messages → "me" (right), tenant messages → left
              // Tenant view: tenant's own messages → "me" (right), admin messages → left
              sender_type: isAdminView
                ? (m.sender_type === "admin" ? "me" : "other")
                : (m.sender_type === "user" ? "me" : "admin"),
              message_text: m.message_text,
              created_at: m.created_at,
            }))
          );
        }
      } else {
        const response = await messagingApi.getConversationMessages(conv.id);
        if (response.success) {
          setMessages(
            response.messages.map((m) => ({
              id: m.id,
              conversation_id: m.conversation_id,
              sender_id: String(m.sender_id),
              sender_name: m.sender_name,
              sender_type: m.sender_type,
              message_text: m.message_text,
              created_at: m.created_at,
              attachment_url: m.attachment_url,
              attachment_name: m.attachment_name,
            }))
          );
        }
      }
    } catch {
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
      if (supportMode) {
        const response = await supportMessagingApi.sendReply(
          selectedConversation.id,
          newMessage.trim()
        );
        if (response.success && response.data) {
          const m = response.data.message;
          setMessages((prev) => [
            ...prev,
            {
              id: m.id,
              conversation_id: m.conversation_id,
              sender_id: String(m.sender_id),
              sender_name: m.sender_name,
              // Always "me" so the just-sent message shows on the right for whoever sent it
              sender_type: "me",
              message_text: m.message_text,
              created_at: m.created_at,
            },
          ]);
          setNewMessage("");
          loadConversations();
        }
      } else {
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
          setMessages((prev) => [
            ...prev,
            { ...response.message, sender_type: "me" },
          ]);
          setNewMessage("");
          setAttachedFiles([]);
          loadConversations();
        }
      }
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
      setUploadingFile(false);
    }
  };

  const handleCreateConversation = async () => {
    if (!newConvSubject.trim() || !newConvMessage.trim()) return;
    setCreatingConv(true);
    try {
      const response = await supportMessagingApi.createConversation({
        subject: newConvSubject.trim(),
        message_text: newConvMessage.trim(),
      });
      if (response.success && response.data) {
        setShowNewConvForm(false);
        setNewConvSubject("");
        setNewConvMessage("");
        await loadConversations();
        // Auto-select the new conversation
        const newConv = response.data.conversation;
        handleSelectConversation({
          id: newConv.id,
          user_id: newConv.user_id,
          user_name: "Homed Support",
          subject: newConv.subject,
          status: newConv.status,
          last_message_at: newConv.last_message_at ?? undefined,
          unread_count: 0,
          created_at: newConv.created_at,
        });
      }
    } catch {
      toast.error("Failed to create support conversation");
    } finally {
      setCreatingConv(false);
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
    if (supportMode) {
      return message.sender_type === "me";
    }
    return message.sender_type === "me" || message.sender_type === "admin";
  };

  const handleCloseConversation = async () => {
    if (!selectedConversation) return;
    setClosingConv(true);
    try {
      const response = await supportMessagingApi.closeConversation(selectedConversation.id);
      if (response.success) {
        setSelectedConvStatus('closed');
        setSelectedConversation((prev) => prev ? { ...prev, status: 'closed' } : prev);
        setConversations((prev) =>
          prev.map((c) => c.id === selectedConversation.id ? { ...c, status: 'closed' } : c)
        );
        toast.success("Conversation closed");
      }
    } catch {
      toast.error("Failed to close conversation");
    } finally {
      setClosingConv(false);
    }
  };

  const handleReopenConversation = async () => {
    if (!selectedConversation) return;
    setClosingConv(true);
    try {
      const response = await supportMessagingApi.reopenConversation(selectedConversation.id);
      if (response.success) {
        setSelectedConvStatus('open');
        setSelectedConversation((prev) => prev ? { ...prev, status: 'open' } : prev);
        setConversations((prev) =>
          prev.map((c) => c.id === selectedConversation.id ? { ...c, status: 'open' } : c)
        );
        toast.success("Conversation reopened");
      }
    } catch {
      toast.error("Failed to reopen conversation");
    } finally {
      setClosingConv(false);
    }
  };

  // In admin view, authentication is already verified by the admin guard at page level.
  // Skip the regular user auth check so the component renders for admins.
  if (!isAdminView) {
    if (authLoading)
      return (
        <div className="h-full flex items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      );
    if (!isAuthenticated || !user) return null;
  }

  const showContactList = !isMobile || !mobileShowChat;
  const showChatPanel = !isMobile || mobileShowChat;

  return (
    <>
    {showReviewModal && (
      <SupportReviewModal
        conversationSubject={closedConvSubject}
        onClose={() => setShowReviewModal(false)}
      />
    )}
    <div className="h-full w-full flex overflow-hidden bg-background">
      {showContactList && (
        <div className="w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col border-r border-border bg-card">
          <div className="flex-none px-4 py-4 border-b border-border/50">
            {supportMode ? (
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    {isAdminView ? "Support Conversations" : "Homed Support"}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isAdminView
                      ? "Incoming messages from tenants and users."
                      : "Messages go directly to the Homed admin team."}
                  </p>
                </div>
              </div>
            ) : (
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                Conversations
                {isLocalhost && (
                  <span className="text-xs text-muted-foreground font-normal bg-muted px-2 py-0.5 rounded-full">
                    Live
                  </span>
                )}
              </h2>
            )}
          </div>

          {supportMode && !isAdminView && (
            <div className="px-3 py-2 border-b border-border/50">
              <button
                onClick={() => {
                  setShowNewConvForm(true);
                  setSelectedConversation(null);
                  if (isMobile) setMobileShowChat(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                New support message
              </button>
            </div>
          )}

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center px-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    {supportMode
                      ? <ShieldCheck className="w-6 h-6 text-muted-foreground" />
                      : <MessageSquare className="w-6 h-6 text-muted-foreground" />
                    }
                  </div>
                  <h3 className="text-base font-medium text-foreground">
                    {supportMode ? "No support messages yet" : "No messages yet"}
                  </h3>
                  {supportMode && (
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      Use "New support message" above to contact the Homed team.
                    </p>
                  )}
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
                        <div className="flex items-center justify-between gap-1">
                          <p
                            className={`text-xs truncate ${conv.unread_count > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}
                          >
                            {conv.last_message_at
                              ? "Open to view messages"
                              : "No messages yet"}
                          </p>
                          {supportMode && conv.status === 'closed' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 flex-shrink-0">
                              closed
                            </span>
                          )}
                        </div>
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
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground text-sm leading-tight truncate">
                      {selectedConversation.user_name}
                    </p>
                    {supportMode && selectedConvStatus === 'closed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex-shrink-0">
                        <Lock className="w-2.5 h-2.5" />
                        Closed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {selectedConversation.subject}
                  </p>
                </div>
                {supportMode && isAdminView && (
                  <div className="flex-shrink-0">
                    {selectedConvStatus === 'closed' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReopenConversation}
                        disabled={closingConv}
                        className="h-8 text-xs gap-1.5"
                      >
                        {closingConv ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                        Reopen
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCloseConversation}
                        disabled={closingConv}
                        className="h-8 text-xs gap-1.5 text-orange-600 border-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/20"
                      >
                        {closingConv ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                        Close
                      </Button>
                    )}
                  </div>
                )}
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
                {supportMode && selectedConvStatus === 'closed' ? (
                  <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    <span>This conversation is closed.</span>
                    {!isAdminView && (
                      <span className="text-xs opacity-70">Contact admin to reopen.</span>
                    )}
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </>
          ) : showNewConvForm && supportMode ? (
            <div className="flex-1 flex flex-col p-6 gap-4 max-w-lg mx-auto w-full">
              <div className="flex items-center gap-3 mb-2">
                {isMobile && (
                  <Button variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => { setShowNewConvForm(false); if (isMobile) setMobileShowChat(false); }}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <div>
                  <h3 className="font-semibold text-foreground">New Support Message</h3>
                  <p className="text-xs text-muted-foreground">The Homed team will respond shortly.</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject</label>
                  <Input
                    placeholder="e.g. Question about my rent payment"
                    value={newConvSubject}
                    onChange={(e) => setNewConvSubject(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Message</label>
                  <textarea
                    placeholder="Describe your issue or question..."
                    value={newConvMessage}
                    onChange={(e) => setNewConvMessage(e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateConversation}
                    disabled={creatingConv || !newConvSubject.trim() || !newConvMessage.trim()}
                    className="flex-1"
                  >
                    {creatingConv ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" />Send</>}
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewConvForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <MessageSquare className="w-8 h-8 opacity-20" />
              <p className="text-base font-medium">Select a conversation</p>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}
