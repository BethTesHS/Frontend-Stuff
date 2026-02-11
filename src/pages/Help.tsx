
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { HelpCircle, MessageCircle, Phone, Mail, Search } from 'lucide-react';
import { useState } from 'react';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const faqItems = [
    {
      question: "How do I search for properties?",
      answer: "Use our property search feature to filter by location, price range, and property type."
    },
    {
      question: "How do I list my property?",
      answer: "Click 'List Property' in the navigation menu and follow the guided process."
    },
    {
      question: "How do I contact an agent?",
      answer: "Find agents through our 'Find Agent' page and contact them directly."
    },
    {
      question: "How do I schedule a viewing?",
      answer: "On any property page, click 'Schedule Viewing' and select your preferred time."
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Compact Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Center</h1>
            <p className="text-gray-600">Find answers and get support</p>
          </div>

          {/* Compact Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Help Cards - Compact */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                <Card className="p-4 text-center">
                  <MessageCircle className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                  <h3 className="font-semibold mb-2">Live Chat</h3>
                  <Button size="sm" className="w-full">Start Chat</Button>
                </Card>

                <Card className="p-4 text-center">
                  <Phone className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                  <h3 className="font-semibold mb-2">Call Us</h3>
                  <Button variant="outline" size="sm" className="w-full">0800 123 4567</Button>
                </Card>

                <Card className="p-4 text-center">
                  <Mail className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                  <h3 className="font-semibold mb-2">Email</h3>
                  <Button variant="outline" size="sm" className="w-full">Email Us</Button>
                </Card>
              </div>
            </div>

            {/* FAQ and Contact Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Compact FAQ */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">FAQ</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqItems.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-sm">{item.question}</AccordionTrigger>
                        <AccordionContent className="text-sm">{item.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>

              {/* Compact Contact Form */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Need More Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="Name" className="h-9" />
                      <Input placeholder="Email" type="email" className="h-9" />
                    </div>
                    <Input placeholder="Subject" className="h-9" />
                    <Textarea placeholder="Your question..." className="resize-none" rows={3} />
                    <Button className="w-full">Send Message</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Help;
