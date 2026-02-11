
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Mail, Clock, Home } from 'lucide-react';

const Contact = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Compact Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
            <p className="text-gray-600">Get in touch with our team</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information - Compact */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-primary-600" />
                    <div>
                      <h3 className="font-semibold text-sm">Phone</h3>
                      <p className="text-sm text-gray-600">0800 123 4567</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-primary-600" />
                    <div>
                      <h3 className="font-semibold text-sm">Email</h3>
                      <p className="text-sm text-gray-600">hello@homed.uk</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    <div>
                      <h3 className="font-semibold text-sm">Address</h3>
                      <p className="text-sm text-gray-600">London, UK</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-primary-600" />
                    <div>
                      <h3 className="font-semibold text-sm">Hours</h3>
                      <p className="text-sm text-gray-600">Mon-Fri 9-6</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Compact Contact Form */}
            <div>
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="First Name" className="h-9" />
                      <Input placeholder="Last Name" className="h-9" />
                    </div>
                    <Input type="email" placeholder="Email" className="h-9" />
                    <Input placeholder="Subject" className="h-9" />
                    <Textarea 
                      placeholder="Your message..."
                      rows={3}
                      className="resize-none"
                    />
                    <Button className="w-full">Send Message</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
