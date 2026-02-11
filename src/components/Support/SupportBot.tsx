
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Phone,
  Mail
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

// Enhanced bot responses with comprehensive support
const getBotResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();
  
  // Property-related queries
  if (message.includes('property') || message.includes('listing') || message.includes('add property') || message.includes('list property')) {
    if (message.includes('add') || message.includes('create') || message.includes('list')) {
      return "🏠 To add a new property listing:\n\n1. Go to your dashboard\n2. Click 'Add New Property'\n3. Fill in property details (photos, description, price)\n4. Set viewing preferences\n5. Publish your listing\n\nNeed help with any specific step?";
    }
    if (message.includes('edit') || message.includes('update') || message.includes('modify')) {
      return "✏️ To edit your property listing:\n\n1. Navigate to 'My Properties'\n2. Find your listing and click 'Edit'\n3. Update any details needed\n4. Save changes\n\nYour updates will be live immediately!";
    }
    if (message.includes('photo') || message.includes('image') || message.includes('picture')) {
      return "📸 For property photos:\n\n• Upload high-quality images (min 1024x768)\n• Include exterior, interior, and key features\n• Max 20 photos per listing\n• First photo becomes your main listing image\n\nGood photos increase viewing requests by 40%!";
    }
    return "🏡 I can help with property listings! Are you looking to add a new property, edit an existing one, or need help with photos and descriptions?";
  }
  
  // Complaint and issues
  if (message.includes('complaint') || message.includes('issue') || message.includes('problem') || message.includes('report')) {
    if (message.includes('tenant') || message.includes('landlord') || message.includes('rent')) {
      return "🔧 For tenant-landlord issues:\n\n1. Submit a complaint via your dashboard\n2. Include photos/evidence if applicable\n3. Our resolution team responds within 24 hours\n4. Track progress in 'My Complaints'\n\nFor urgent issues, contact admin support immediately.";
    }
    if (message.includes('agent') || message.includes('viewing') || message.includes('service')) {
      return "📋 To report service issues:\n\n1. Go to 'Submit Complaint'\n2. Select issue type (Agent, Viewing, Service)\n3. Provide detailed description\n4. Upload supporting documents\n\nWe investigate all complaints within 48 hours.";
    }
    return "⚠️ I can help you submit a complaint. What type of issue are you experiencing? (Property maintenance, Agent service, Viewing problems, or Other)";
  }
  
  // Account and login help
  if (message.includes('login') || message.includes('password') || message.includes('account') || message.includes('forgot')) {
    return "🔐 Account & Login Help:\n\n• Forgot password? Use 'Reset Password' on login page\n• Account locked? Contact admin support\n• Update profile: Go to Account Settings\n• Verification issues? Check your email inbox\n\nStill need help? I can connect you with our admin team.";
  }
  
  // Payment and subscription
  if (message.includes('payment') || message.includes('subscription') || message.includes('billing') || message.includes('charge')) {
    return "💳 Payment & Billing:\n\n• View billing history in Account Settings\n• Update payment methods anytime\n• Subscription changes take effect immediately\n• Refund requests processed within 5-7 days\n\nFor billing disputes, contact admin support.";
  }
  
  // Technical issues
  if (message.includes('bug') || message.includes('error') || message.includes('not working') || message.includes('broken')) {
    return "🔧 Technical Issues:\n\n1. Try refreshing the page (Ctrl+F5)\n2. Clear browser cache and cookies\n3. Check internet connection\n4. Try different browser/device\n\nIf problems persist, I'll connect you with technical support.";
  }
  
  // Viewing and scheduling
  if (message.includes('viewing') || message.includes('schedule') || message.includes('appointment') || message.includes('visit')) {
    return "📅 Property Viewings:\n\n• Book viewings directly from property listings\n• Receive confirmation within 2 hours\n• Reschedule up to 24hrs before appointment\n• Virtual viewings available for distant properties\n\nNeed help booking a specific viewing?";
  }
  
  // General support and help
  if (message.includes('help') || message.includes('support') || message.includes('guide') || message.includes('how')) {
    return "💡 I'm here to help! Here's what I can assist with:\n\n🏠 Property listings & management\n📋 Complaints & issue reporting\n🔐 Account & login support\n💳 Billing & payments\n📅 Viewing appointments\n🔧 Technical troubleshooting\n\nWhat would you like help with?";
  }
  
  // Contact admin
  if (message.includes('admin') || message.includes('human') || message.includes('agent') || message.includes('speak to someone')) {
    return "👨‍💼 Connecting you to Admin Support:\n\n• Live chat: Available 9AM-6PM weekdays\n• Email: admin@homed.uk (24hr response)\n• Phone: +44 800 123 4567\n• Emergency: Available 24/7 for urgent issues\n\nI'll transfer you now - please describe your issue.";
  }
  
  // Greetings
  if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message.includes('good morning') || message.includes('good afternoon')) {
    return "👋 Hello! Welcome to Homed Support. I'm here to help you with:\n\n• Property management\n• Account issues\n• Technical support\n• Booking viewings\n• Billing questions\n\nWhat can I help you with today?";
  }
  
  // Default response
  return "🤖 Thanks for your message! I'm your Homed support assistant. I can help with property listings, account issues, complaints, viewings, and more.\n\nCould you tell me more about what you need help with? Or I can connect you directly with our admin team.";
};

const SupportBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "👋 Hi there! I'm your Homed support assistant. I can help you with property listings, account issues, technical support, viewing bookings, and more. What can I help you with today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnectingToAdmin, setIsConnectingToAdmin] = useState(false);

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputMessage),
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const connectToAdmin = () => {
    setIsConnectingToAdmin(true);
    const adminMessage: Message = {
      id: Date.now().toString(),
      text: "🔄 Connecting you to our admin support team...\n\n📞 Call: +44 800 123 4567 (9AM-6PM)\n📧 Email: admin@homed.uk\n💬 Live Chat: Available now\n\nPlease describe your issue and our team will assist you within 24 hours.",
      isBot: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, adminMessage]);
  };

  const quickActions = [
    { text: "Add Property Help", action: () => setInputMessage("How do I add a new property listing?") },
    { text: "Submit Complaint", action: () => setInputMessage("I need to submit a complaint about an issue") },
    { text: "Account Issues", action: () => setInputMessage("I'm having trouble with my account") },
    { text: "Book Viewing", action: () => setInputMessage("How do I schedule a property viewing?") },
    { text: "Technical Support", action: () => setInputMessage("I'm experiencing technical problems") },
    { text: "Speak to Admin", action: connectToAdmin }
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="w-80 h-96 shadow-xl border-2 border-emerald-200">
          <CardHeader className="bg-emerald-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <Bot className="w-5 h-5 mr-2" />
                Support Assistant
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-emerald-700 p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex flex-col h-80">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[80%] ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.isBot ? 'bg-emerald-100' : 'bg-blue-100'
                      }`}>
                        {message.isBot ? (
                          <Bot className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <User className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className={`p-3 rounded-lg ${
                        message.isBot 
                          ? 'bg-gray-100 text-gray-800' 
                          : 'bg-emerald-600 text-white'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            {!isConnectingToAdmin && (
              <div className="p-3 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Quick Actions:</p>
                <div className="grid grid-cols-2 gap-1">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={action.action}
                      className="text-xs py-1 px-2 h-auto w-full"
                    >
                      {action.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Contact Form */}
            {isConnectingToAdmin && (
              <div className="p-3 border-t border-gray-200 bg-blue-50">
                <div className="space-y-2">
                  <p className="text-xs text-blue-800 font-medium">Admin Support Contact:</p>
                  <div className="flex items-center space-x-2 text-xs text-blue-700">
                    <Phone className="w-3 h-3" />
                    <span>+44 800 123 4567</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-blue-700">
                    <Mail className="w-3 h-3" />
                    <span>admin@homed.uk</span>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-xs"
                    onClick={() => setIsConnectingToAdmin(false)}
                  >
                    Back to Chat
                  </Button>
                </div>
              </div>
            )}

            {/* Input */}
            {!isConnectingToAdmin && (
              <div className="p-3 border-t border-gray-200">
                <div className="flex space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button
                    onClick={sendMessage}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 px-3"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupportBot;
