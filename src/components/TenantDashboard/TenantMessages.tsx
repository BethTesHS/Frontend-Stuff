import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip, X, FileText, Image, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { tenantMessagingApi, TenantMessage } from "@/services/tenantMessagingApi";

interface TenantMessagesProps {
  initialMessage?: string;
  agentToMessage?: {
    id: string;
    name: string;
  };
}

const TenantMessages = ({ initialMessage, agentToMessage }: TenantMessagesProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [messages, setMessages] = useState<TenantMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set initial message from props
  useEffect(() => {
    if (initialMessage) {
      setNewMessage(initialMessage);
    }
  }, [initialMessage]);

  // Load messages on component mount
  useEffect(() => {
    loadMessages();
  }, []);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await tenantMessagingApi.getConversations();
      if (response.success && Array.isArray(response.conversations)) {
        // Get the main conversation (should be auto-created for platform tenants)
        const mainConversation = response.conversations[0];
        if (mainConversation) {
          const messagesResponse = await tenantMessagingApi.getConversationMessages(mainConversation.id);
          if (messagesResponse.success && Array.isArray(messagesResponse.messages)) {
            setMessages(messagesResponse.messages);
          }
        }
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
        const uploadResponse = await tenantMessagingApi.uploadFile(file);
        
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
        message_text: newMessage.trim(),
        subject: agentToMessage 
          ? `Message to ${agentToMessage.name}` 
          : 'Agent Communication',
        recipient_type: agentToMessage ? 'agent' : 'agent',
        recipient_id: agentToMessage?.id,
        ...attachmentData,
      };

      const response = await tenantMessagingApi.sendMessage(messageData);
      
      if (response.success) {
        // Add new message to the list
        setMessages(prev => [...prev, response.message]);
        setNewMessage("");
        setAttachedFiles([]);
        toast.success("Message sent successfully!");
        
        // Note: No need to loadMessages() again since we just added the new message locally
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

  const formatMessageTime = (timestamp: string) => {
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
      <Card className="h-[580px] mr-4 ml-4 flex flex-col bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader className="border-b border-gray-200 dark:border-gray-800 pb-4 flex-shrink-0">
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
            {agentToMessage ? `Message ${agentToMessage.name}` : "Chat with Agent"}
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {agentToMessage 
              ? `Send a message to your assigned agent` 
              : "Message your property agent or support team"
            }
          </p>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
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
                      message.sender_type === 'user' || message.sender_type === 'tenant' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {message.sender_type === 'user' || message.sender_type === 'tenant' ? "ME" : "AG"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`max-w-xs lg:max-w-md ${message.sender_type === 'user' || message.sender_type === 'tenant' ? 'text-right' : 'text-left'}`}>
                      <div className={`flex items-center gap-2 mb-1 ${message.sender_type === 'user' || message.sender_type === 'tenant' ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {message.sender_name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatMessageTime(message.created_at)}
                        </span>
                      </div>
                      
                      <div className={`px-4 py-2 rounded-lg text-left ${
                        message.sender_type === 'user' || message.sender_type === 'tenant'
                          ? 'bg-gray-800 dark:bg-gray-700 text-white' 
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-900 dark:text-gray-100'
                      }`}>
                        {message.message_text && <p className="text-sm">{message.message_text}</p>}
                        
                        {/* File attachment */}
                        {message.attachment_url && (
                          <div className="mt-2 space-y-2">
                            <div className={`flex items-center gap-2 p-2 rounded border ${
                              message.sender_type === 'user' || message.sender_type === 'tenant'
                                ? 'bg-gray-700/50 border-gray-600/50' 
                                : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-600'
                            }`}>
                              {message.attachment_type?.startsWith('image/') ? (
                                <Image className="w-4 h-4" />
                              ) : (
                                <FileText className="w-4 h-4" />
                              )}
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

          {/* Send Message */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900 space-y-3">
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
                  placeholder={agentToMessage ? `Message ${agentToMessage.name}...` : "Message your agent..."}
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
                  size="icon"
                  variant="ghost" // Changed to ghost for a cleaner look inside the input
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  disabled={uploadingFile || sending}
                >
                  {uploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                </Button>
              </div>

              {/* Send button stays on the outside */}
              <Button 
                onClick={handleSendMessage}
                disabled={sending || uploadingFile || (!newMessage.trim() && attachedFiles.length === 0)}
                className="h-auto bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantMessages;