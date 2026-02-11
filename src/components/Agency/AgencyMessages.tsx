import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  MessageCircle,
  Users,
  Clock,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  agencyConversationsApi,
  Conversation as ApiConversation,
  Message as ApiMessage,
} from '@/services/agencyApi';

interface Message extends ApiMessage {
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  timestamp?: Date;
  isRead?: boolean;
}

interface Conversation extends Omit<ApiConversation, 'last_message'> {
  lastMessage?: Message;
  unreadCount?: number;
}

export function AgencyMessages() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations from backend
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await agencyConversationsApi.getAll({ page: 1, limit: 50 });

      // Transform API data
      const transformedConversations: Conversation[] = (response.conversations || []).map((conv) => ({
        ...conv,
        lastMessage: conv.last_message ? {
          ...conv.last_message,
          timestamp: new Date(conv.last_message.created_at),
          isRead: conv.last_message.read,
        } : undefined,
        unreadCount: conv.unread_count || 0,
      }));

      setConversations(transformedConversations);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch conversations');
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await agencyConversationsApi.getMessages(conversationId, { page: 1, limit: 100 });

      // Transform API data
      const transformedMessages: Message[] = (response.messages || []).map((msg) => ({
        ...msg,
        senderId: msg.sender_id,
        senderName: msg.sender_name,
        senderAvatar: msg.sender_avatar_url,
        timestamp: new Date(msg.created_at),
        isRead: msg.read,
      }));

      setMessages(transformedMessages);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch messages');
      console.error('Error fetching messages:', error);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const searchLower = searchTerm.toLowerCase();
    return conv.participants.some(p =>
      (p.name && p.name.toLowerCase().includes(searchLower))
    ) || (conv.title && conv.title.toLowerCase().includes(searchLower));
  });

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await agencyConversationsApi.sendMessage(selectedConversation, {
        content: newMessage,
      });

      setNewMessage('');
      await fetchMessages(selectedConversation);
      await fetchConversations(); // Update conversation list with new last message
      toast.success('Message sent');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastMessageTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with your agents and clients
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
            <span>{conversations.length} conversations</span>
          </div>
          {totalUnread > 0 && (
            <Badge variant="destructive">
              {totalUnread} unread
            </Badge>
          )}
        </div>
      </div>

      {/* Messages Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {filteredConversations.map((conversation) => {
                const displayName = conversation.type === 'group' 
                  ? conversation.title 
                  : conversation.participants[0]?.name;
                
                const displayAvatar = conversation.participants[0]?.avatar;
                const isSelected = selectedConversation === conversation.id;

                return (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                      isSelected ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={displayAvatar} />
                          <AvatarFallback>
                            {displayName?.split(' ').map(n => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.type === 'direct' && (
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(conversation.participants[0]?.status)}`} />
                        )}
                        {conversation.type === 'group' && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white bg-blue-500" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-sm truncate">{displayName}</h4>
                          {conversation.lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {formatLastMessageTime(conversation.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        
                        {conversation.type === 'group' && (
                          <p className="text-xs text-muted-foreground mb-1">
                            {conversation.participants.length} participants
                          </p>
                        )}
                        
                        {conversation.lastMessage && (
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                      
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Message View */}
        <Card className="lg:col-span-2">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConv.participants[0]?.avatar} />
                      <AvatarFallback>
                        {(selectedConv.type === 'group' 
                          ? selectedConv.title 
                          : selectedConv.participants[0]?.name)?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {selectedConv.type === 'group' 
                          ? selectedConv.title 
                          : selectedConv.participants[0]?.name}
                      </h3>
                      {selectedConv.type === 'direct' ? (
                        <p className="text-sm text-muted-foreground">
                          {selectedConv.participants[0]?.status}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {selectedConv.participants.length} participants
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="p-0 flex flex-col h-[400px]">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => {
                    const isMyMessage = message.senderId === 'admin';
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isMyMessage ? 'order-2' : 'order-1'}`}>
                          {!isMyMessage && (
                            <p className="text-xs text-muted-foreground mb-1 px-3">
                              {message.senderName}
                            </p>
                          )}
                          <div
                            className={`rounded-lg px-3 py-2 ${
                              isMyMessage
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              isMyMessage 
                                ? 'text-primary-foreground/70' 
                                : 'text-muted-foreground'
                            }`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex items-end space-x-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Textarea
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="min-h-[40px] max-h-[120px] resize-none"
                      rows={1}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="p-8 text-center h-full flex items-center justify-center">
              <div>
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">
                  Choose a conversation from the left to start messaging
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}