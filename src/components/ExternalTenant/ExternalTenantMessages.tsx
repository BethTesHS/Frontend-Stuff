import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip, X, FileText, Image, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { tenantMessagingApi, TenantMessage, TenantConversation } from "@/services/tenantMessagingApi";

const ExternalTenantMessages = () => {
  const [newMessage, setNewMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [messages, setMessages] = useState<TenantMessage[]>([]);
  const [conversations, setConversations] = useState<TenantConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<TenantConversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation.id);
    }
  }, [currentConversation]);

  const loadConversations = async () => {
    try {
      const response = await tenantMessagingApi.getConversations();
      if (response.success) {
        setConversations(response.conversations);
        // Auto-select first conversation or create new one
        if (response.conversations.length > 0) {
          setCurrentConversation(response.conversations[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast.error('Failed to load conversations');
    }
  };

  const loadMessages = async (conversationId: number) => {
    setLoading(true);
    try {
      const response = await tenantMessagingApi.getConversationMessages(conversationId);
      if (response.success) {
        setMessages(response.messages);
      }
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

    setSending(true);
    try {
      let attachmentData = null;

      // Upload file if attached
      if (attachedFiles.length > 0) {
        setUploadingFile(true);
        const file = attachedFiles[0]; // Send one file at a time
        const uploadResponse = await tenantMessagingApi.uploadFile(file, currentConversation?.id);
        
        if (uploadResponse.success) {
          attachmentData = {
            attachment_url: uploadResponse.file_url,
            attachment_name: uploadResponse.file_name,
            attachment_size: uploadResponse.file_size,
            attachment_type: uploadResponse.file_type,
          };
        }
        setUploadingFile(false);
      }

      // Send message
      const messageData = {
        conversation_id: currentConversation?.id,
        message_text: newMessage.trim() || undefined,
        subject: currentConversation?.subject || 'General Inquiry',
        ...attachmentData,
      };

      const response = await tenantMessagingApi.sendMessage(messageData);
      
      if (response.success) {
        // Add new message to the list
        setMessages(prev => [...prev, response.message]);
        setNewMessage("");
        setAttachedFiles([]);
        toast.success("Message sent successfully!");
        
        // Refresh conversations to update last message
        loadConversations();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
      setUploadingFile(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    
    const validFiles = files.filter(file => {
      if (file.size > maxFileSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    // Only allow one file at a time for simplicity
    setAttachedFiles(validFiles.slice(0, 1));
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

  const handleDownloadFile = async (filename: string, originalName: string) => {
    try {
      const blob = await tenantMessagingApi.downloadFile(filename);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Download started");
    } catch (error) {
      console.error('Download failed:', error);
      toast.error("Failed to download file");
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Messages</h2>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b border-border pb-4 flex-shrink-0">
          <CardTitle className="text-lg">Support Chat</CardTitle>
          <p className="text-sm text-muted-foreground">
            Send us any questions or complaints - we're here to help!
          </p>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-sm text-muted-foreground">No messages yet. Start a conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender_type === 'user' || message.sender_type === 'tenant' || message.sender_type === 'external_tenant' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {message.sender_type === 'user' || message.sender_type === 'tenant' || message.sender_type === 'external_tenant' ? "ME" : "AS"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`max-w-[70%] ${message.sender_type === 'user' || message.sender_type === 'tenant' || message.sender_type === 'external_tenant' ? 'text-right' : 'text-left'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          {message.sender_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(message.created_at)}
                        </span>
                      </div>
                      
                      <div className={`p-3 rounded-lg ${
                        message.sender_type === 'user' || message.sender_type === 'tenant' || message.sender_type === 'external_tenant'
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-foreground'
                      }`}>
                        {message.message_text && <p className="text-sm">{message.message_text}</p>}
                        
                        {/* File attachment */}
                        {message.attachment_url && (
                          <div className="mt-2">
                            <div className={`flex items-center gap-2 p-2 rounded border ${
                              message.sender_type === 'user' || message.sender_type === 'tenant' || message.sender_type === 'external_tenant'
                                ? 'bg-primary-foreground/10 border-primary-foreground/20' 
                                : 'bg-background border-border'
                            }`}>
                              {message.attachment_type?.startsWith('image/') ? (
                                <Image className="w-4 h-4" />
                              ) : (
                                <FileText className="w-4 h-4" />
                              )}
                              <div className="flex-1 min-w-0">
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
              </div>
            )}
          </ScrollArea>

          {/* Send Message */}
          <div className="border-t border-border p-4">
            {/* File attachments preview */}
            {attachedFiles.length > 0 && (
              <div className="mb-3 space-y-2">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    {getFileIcon(file.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                rows={2}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  size="icon"
                  variant="outline"
                  className="border-border hover:bg-muted"
                  disabled={uploadingFile || sending}
                >
                  {uploadingFile ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Paperclip className="w-4 h-4" />
                  )}
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  size="icon"
                  className="bg-primary hover:bg-primary/90"
                  disabled={sending || uploadingFile}
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ExternalTenantMessages;