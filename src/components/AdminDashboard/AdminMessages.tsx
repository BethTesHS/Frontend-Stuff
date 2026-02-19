import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, ArrowLeft, Image as ImageIcon, FileText, Download, X, Paperclip, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MOCK_MESSAGES_DATA } from '@/constants/mockMessages';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const AdminMessages = () => {
  const { toast } = useToast();
  const [adminMessages, setAdminMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [viewingConversation, setViewingConversation] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMessagesAndConversations();
  }, []);

  const loadMessagesAndConversations = async () => {
    try {
      setMessagesLoading(true);
    //   if (isLocalhost) {
        const mockMessages = MOCK_MESSAGES_DATA.contacts.map(contact => ({
          id: contact.id,
          from: contact.name,
          email: `${contact.name.toLowerCase().replace(' ', '.')}@mock-tenant.com`,
          subject: contact.role,
          message: contact.lastMessage,
          priority: contact.unreadCount > 0 ? 'high' : 'low',
          timestamp: new Date(contact.timestamp).toLocaleString(),
          status: contact.unreadCount > 0 ? 'unread' : 'read',
          conversation_id: contact.id
        }));
        setAdminMessages(mockMessages);
    //   } else {
    //     const { adminApi } = await import('@/services/adminApi');
    //     const conversationsResponse = await adminApi.getConversations({ limit: 50 });
    //     if (conversationsResponse.success) {
    //       const messages = conversationsResponse.conversations.map(conv => ({
    //         id: conv.id.toString(),
    //         from: conv.user_name,
    //         email: `${conv.user_name.toLowerCase().replace(' ', '.')}@tenant.com`,
    //         subject: conv.subject,
    //         message: `Conversation with ${conv.unread_count} unread messages`,
    //         priority: conv.unread_count > 0 ? 'high' : 'low',
    //         timestamp: conv.last_message_at || conv.created_at,
    //         status: conv.unread_count > 0 ? 'unread' : 'read',
    //         conversation_id: conv.id
    //       }));
    //       setAdminMessages(messages);
    //     }
    //   }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load messages", variant: "destructive" });
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleViewConversation = async (message: any) => {
    setSelectedMessage(message);
    if (message.conversation_id) {
    //   if (isLocalhost) {
        const mockConvo = MOCK_MESSAGES_DATA.conversations[message.conversation_id as keyof typeof MOCK_MESSAGES_DATA.conversations];
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
    //   } else {
    //     try {
    //       const { adminApi } = await import('@/services/adminApi');
    //       const response = await adminApi.getConversationMessages(message.conversation_id);
    //       if (response.success) {
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
    //       toast({ title: "Error", description: "Failed to load conversation messages", variant: "destructive" });
    //     }
    //   }
    }
    setViewingConversation(true);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() && attachedFiles.length === 0) {
      toast({ title: "Error", description: "Please enter a reply message or attach a file", variant: "destructive" });
      return;
    }

    // if (isLocalhost) {
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
      toast({ title: "Mock Reply Sent", description: `Reply appended locally for ${selectedMessage?.from}` });
      setReplyText('');
      setAttachedFiles([]);
      return;
    // }

    // try {
    //   const { adminApi } = await import('@/services/adminApi');
    //   let attachmentData = null;
    //   if (attachedFiles.length > 0) {
    //     const file = attachedFiles[0];
    //     const uploadResponse = await adminApi.uploadFile(file, selectedMessage?.conversation_id);
    //     if (uploadResponse.success) {
    //       attachmentData = {
    //         attachment_url: uploadResponse.file_url,
    //         attachment_name: uploadResponse.file_name,
    //         attachment_size: uploadResponse.file_size,
    //         attachment_type: uploadResponse.file_type,
    //       };
    //     }
    //   }
    //   const messageData = {
    //     conversation_id: selectedMessage?.conversation_id,
    //     message_text: replyText.trim(),
    //     subject: selectedMessage?.subject || 'Admin Reply',
    //     ...attachmentData,
    //   };
    //   const response = await adminApi.sendMessage(messageData);
    //   if (response.success) {
    //     const newMessage = {
    //       id: response.message.id.toString(),
    //       text: replyText,
    //       sender: 'admin',
    //       timestamp: response.message.created_at,
    //       senderName: 'Admin',
    //       attachments: attachmentData ? [{
    //         name: attachmentData.attachment_name,
    //         size: formatFileSize(attachmentData.attachment_size),
    //         type: attachmentData.attachment_type?.startsWith('image/') ? 'image' : 'document',
    //         url: attachmentData.attachment_url
    //       }] : []
    //     };
    //     setConversationMessages(prev => [...prev, newMessage]);
    //     toast({ title: "Reply Sent", description: `Reply sent to ${selectedMessage?.from}` });
    //     setReplyText('');
    //     setAttachedFiles([]);
    //     loadMessagesAndConversations();
    //   }
    // } catch (error) {
    //   toast({ title: "Error", description: "Failed to send reply", variant: "destructive" });
    // }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxFileSize = 10 * 1024 * 1024;
    const validFiles = files.filter(file => {
      if (file.size > maxFileSize) {
        toast({ title: "File too large", description: `File ${file.name} is too large. Maximum size is 10MB.`, variant: "destructive" });
        return false;
      }
      return true;
    });
    setAttachedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => setAttachedFiles(prev => prev.filter((_, i) => i !== index));

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const handleBackToMessages = () => {
    setViewingConversation(false);
    setSelectedMessage(null);
    setConversationMessages([]);
  };

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-800 dark:text-gray-100">
          {viewingConversation && (
            <Button variant="ghost" size="sm" onClick={handleBackToMessages} className="mr-2 dark:text-gray-300">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <MessageSquare className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
          {viewingConversation ? `Conversation with ${selectedMessage?.from}` : 'Admin Messages'}
          <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">(All Messages here are dummy data)</p>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {viewingConversation ? (
          <div className="space-y-4">
            <ScrollArea className="h-[60vh] border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
              <div className="space-y-4 pr-4">
                {conversationMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                       msg.sender === 'admin'
                         ? 'bg-gray-800 dark:bg-gray-700 text-white'
                         : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-900 dark:text-gray-100'
                     }`}>
                       <p className="text-sm">{msg.text}</p>
                       {msg.attachments && msg.attachments.length > 0 && (
                         <div className="mt-2 space-y-2">
                           {msg.attachments.map((attachment: any, index: number) => (
                             <div key={index} className={`flex items-center gap-2 p-2 rounded border ${
                               msg.sender === 'admin' ? 'bg-gray-700/50 border-gray-600/50' : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-600'
                             }`}>
                               {attachment.type === 'image' ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                               <div className="flex-1 min-w-0">
                                 <p className="text-xs font-medium truncate">{attachment.name}</p>
                                 <p className="text-xs opacity-70">{attachment.size}</p>
                               </div>
                               <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={(e) => {
                                   e.stopPropagation();
                                   toast({ title: "Download started", description: `Downloading ${attachment.name}` });
                               }}>
                                 <Download className="w-3 h-3" />
                               </Button>
                             </div>
                           ))}
                         </div>
                       )}
                       <p className={`text-xs mt-1 ${msg.sender === 'admin' ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                         {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString()}
                       </p>
                     </div>
                  </div>
                ))}
              </div>
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
                  <Input placeholder="Type your reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} style={{ paddingRight: '2.5rem' }} className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700" />
                  <Button type="button" onClick={() => fileInputRef.current?.click()} size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </div>
                <Button onClick={handleSendReply} className="h-auto bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
               <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" accept="image/*,.pdf,.doc,.docx,.txt" />
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
              <div key={message.id} onClick={() => handleViewConversation(message)} className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  message.status === 'unread' ? 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30'
                }`}>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{message.from}</h3>
                        <Badge variant={message.priority === 'high' ? 'destructive' : message.priority === 'medium' ? 'default' : 'secondary'}>
                          {message.priority.toUpperCase()}
                        </Badge>
                        {message.status === 'unread' && (
                          <Badge variant="outline" className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600">NEW</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{message.timestamp}</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{message.subject}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{message.message}</p>
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