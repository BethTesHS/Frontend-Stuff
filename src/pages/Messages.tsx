
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, User, Search, Phone, Mail, Star, Paperclip, X } from 'lucide-react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useState, useRef } from 'react';

// Enhanced Messages Data
const mockMessages = [
  {
    id: '1',
    from: 'John Smith',
    role: 'Estate Agent',
    subject: 'Re: Property Viewing Request',
    preview: 'Thank you for your interest in the 3-bedroom house on Oak Avenue. I have availability this Thursday...',
    time: '2 hours ago',
    unread: true,
    avatar: '/placeholder.svg',
    phone: '+44 7700 900123',
    email: 'john@premiumproperties.co.uk',
    rating: 4.8
  },
  {
    id: '2',
    from: 'Sarah Wilson',
    role: 'Lettings Specialist',
    subject: 'Rental Application Update',
    preview: 'Your rental application has been approved and we can proceed with the next steps...',
    time: '1 day ago',
    unread: false,
    avatar: '/placeholder.svg',
    phone: '+44 7700 900124',
    email: 'sarah@lettings.co.uk',
    rating: 4.9
  },
  {
    id: '3',
    from: 'Mike Johnson',
    role: 'Sales Director',
    subject: 'Property Valuation Report',
    preview: 'Please find attached your comprehensive property valuation report with market analysis...',
    time: '3 days ago',
    unread: false,
    avatar: '/placeholder.svg',
    phone: '+44 7700 900125',
    email: 'mike@sales.co.uk',
    rating: 4.7
  },
];

const Messages = () => {
  const { loading, hasAccess } = useAuthGuard(['agent', 'owner', 'manager', 'tenant']);
  const [selectedMessage, setSelectedMessage] = useState(mockMessages[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyText, setReplyText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!hasAccess) {
    return null;
  }

  const filteredMessages = mockMessages.filter(message =>
    message.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendReply = () => {
    if (replyText.trim() || attachedFiles.length > 0) {
      console.log('Sending reply:', replyText);
      setAttachedFiles([]);
      setReplyText('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="w-8 h-8 mr-3 text-emerald-600" />
              Messages
            </h1>
            <p className="text-gray-600">
              Manage your conversations with clients and property professionals
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Messages Sidebar */}
            <div className="lg:col-span-1">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Conversations</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-y-auto">
                  <div className="divide-y">
                    {filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 cursor-pointer transition-colors ${
                          selectedMessage.id === message.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : 'hover:bg-gray-50'
                        } ${message.unread ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedMessage(message)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-medium text-gray-900 truncate ${message.unread ? 'font-semibold' : ''}`}>
                                {message.from}
                              </p>
                              {message.unread && (
                                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">New</Badge>
                              )}
                            </div>
                            <p className="text-xs text-emerald-600 font-medium">{message.role}</p>
                            <p className={`text-sm text-gray-600 truncate mt-1 ${message.unread ? 'font-medium' : ''}`}>
                              {message.subject}
                            </p>
                            <p className="text-xs text-gray-400 truncate mt-1">
                              {message.preview}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {message.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Message Detail */}
            <div className="lg:col-span-2">
              <Card className="h-full flex flex-col">
                <CardHeader className="border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{selectedMessage.subject}</CardTitle>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600">{selectedMessage.from} - {selectedMessage.role}</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{selectedMessage.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{selectedMessage.time}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/50">
                  {/* Agent Contact Info */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{selectedMessage.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{selectedMessage.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-4 rounded-lg mb-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{selectedMessage.from} - {selectedMessage.role}</p>
                        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
                          <p>
                            Thank you for your interest in the 3-bedroom house on Oak Avenue. 
                            I'd be happy to arrange a viewing for you. I have availability this 
                            Thursday at 2 PM or Friday at 10 AM. Please let me know which time 
                            works better for you.
                          </p>
                          <p>
                            The property features a modern kitchen, spacious living areas, and a 
                            beautiful garden. It's located in a quiet residential area with excellent 
                            transport links to the city center.
                          </p>
                          <p>
                            If you have any questions about the property or would like to discuss 
                            financing options, please don't hesitate to ask. I'm here to help make 
                            your property journey as smooth as possible.
                          </p>
                          <p className="font-medium">
                            Best regards,<br />
                            {selectedMessage.from}<br />
                            {selectedMessage.role}<br />
                            Direct: {selectedMessage.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Reply Section */}
                <div className="border-t border-gray-200 dark:border-gray-800 p-6 space-y-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Reply</h3>
                  
                  {/* File attachments preview */}
                  {attachedFiles.length > 0 && (
                    <div className="space-y-2">
                      {attachedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                          <Paperclip className="w-4 h-4 text-gray-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">{file.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
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
                        placeholder="Type your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSendReply();
                          }
                        }}
                        style={{ paddingRight: '2.5rem' }} // Add right padding to prevent text overlap with the button
                        className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                      />
                      
                      {/* Absolute positioned Attachment button */}
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        size="icon"
                        variant="ghost" // Changed to ghost for a cleaner look inside the input
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Send button stays on the outside */}
                    <Button 
                      onClick={handleSendReply} 
                      disabled={!replyText.trim() && attachedFiles.length === 0}
                      className="h-auto bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;