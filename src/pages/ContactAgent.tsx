import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Mail, Phone, MapPin, Star, Building2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { findAgentApi } from '@/services/api';

// Backend API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://homedapp1.azurewebsites.net/api';
// Extract base URL without /api suffix for image URLs
const BASE_URL = API_BASE_URL.replace('/api', '');

const contactFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  postcode: z.string().optional(),
  buyerType: z.string().min(1, 'Please select an option'),
  message: z.string().optional(),
  optOutMarketing: z.boolean().default(false),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const ContactAgent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agent, setAgent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const propertyId = searchParams.get('propertyId');
  const agentId = searchParams.get('agentId') || '1'; // Default to 1 if not provided
  const agentName = searchParams.get('agentName') || 'Agent';
  const propertyTitle = searchParams.get('propertyTitle') || 'Property';

  // Fetch agent details
  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        setIsLoading(true);
        const numericId = parseInt(agentId);
        
        if (isNaN(numericId)) {
          toast({
            title: "Error",
            description: "Invalid agent ID",
            variant: "destructive",
          });
          return;
        }
        
        const response = await findAgentApi.getAgentDetails(numericId);
        if (response.success && response.data?.agent) {
          setAgent(response.data.agent);
        } else {
          toast({
            title: "Error",
            description: "Agent not found",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching agent details:', error);
        toast({
          title: "Error",
          description: "Failed to load agent details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (agentId) {
      fetchAgentDetails();
    }
  }, [agentId, toast]);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      postcode: '',
      buyerType: '',
      message: '',
      optOutMarketing: false,
    },
  });

  const buyerTypeOptions = [
    'I am a first-time buyer',
    'I am an investor / I\'m hoping to invest',
    'I have a property to let',
    'I have a property to sell',
    'I have an offer on my property',
    'I do not have a property to sell',
    'I have recently sold',
    'Other'
  ];

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const inquiryData = {
        agent_id: agentId,
        agentName: agentName,
        property_id: propertyId || undefined,
        propertyTitle: propertyTitle || undefined,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || undefined,
        message: data.message || undefined,
        buyerType: data.buyerType,
        optOutMarketing: data.optOutMarketing
      };

      const response = await findAgentApi.contactAgent(inquiryData);
      
      if (response.success) {
        toast({
          title: "Enquiry Sent Successfully",
          description: `Your message has been sent to ${response.data?.agent_name || agentName}. They will contact you soon.`,
        });

        // Navigate back to previous page
        navigate(-1);
      } else {
        throw new Error(response.message || 'Failed to submit enquiry');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send your enquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <div className="mb-6 px-4 sm:px-6 lg:px-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Agent</h1>
          <p className="text-gray-600">
            Send an enquiry about <span className="font-medium">{propertyTitle}</span> to {agentName}
          </p>
        </div>

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8">
          {/* Contact Form - Left Side */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Send Enquiry
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Full Name */}
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email Address */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Phone Number */}
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Postcode */}
                    <FormField
                      control={form.control}
                      name="postcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postcode</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your postcode" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Buyer Type Dropdown */}
                    <FormField
                      control={form.control}
                      name="buyerType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Please select *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Please select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {buyerTypeOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Message */}
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your message (optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us more about your requirements..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Marketing Opt-out */}
                    <FormField
                      control={form.control}
                      name="optOutMarketing"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              I do not wish to know what [Site Name] can do for me or hear about breaking property news
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Sending...' : 'Send Enquiry'}
                    </Button>

                    {/* Disclaimer */}
                    <div className="text-xs text-gray-500 leading-relaxed">
                      By submitting this form, you accept our Terms of Use and Privacy Notice. 
                      We process your information to provide the services requested, improve products, 
                      and personalise your experience. We may send you electronic marketing about our 
                      products and services. You can unsubscribe at any time.
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Agent Card Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Your Agent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Loading agent details...</p>
                  </div>
                ) : agent ? (
                  <>
                    {/* Agent Avatar and Basic Info */}
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                        <img 
                          src={
                            agent.profile_picture_url 
                              ? `${BASE_URL}${agent.profile_picture_url}` 
                              : `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face`
                          } 
                          alt={agent.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face`;
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {agent.name}
                        </h3>
                        <p className="text-sm text-gray-600">Estate Agent</p>
                      </div>
                    </div>

                    {/* Agency */}
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{agent.agency || agent.company}</span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{agent.rating || 'No rating'}</span>
                      <span className="text-sm text-gray-600">({agent.reviews || 0} reviews)</span>
                    </div>

                    {/* Experience */}
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{agent.years_experience || agent.experience} years experience</span>
                    </div>

                    {/* Description */}
                    {agent.description && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-900 mb-2">About</p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {agent.description}
                        </p>
                      </div>
                    )}

                    {/* Specialties */}
                    {agent.specialization && (
                      <div className="pt-2">
                        <p className="text-sm font-medium text-gray-900 mb-2">Specialization</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                            {agent.specialization}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="space-y-2">
                        {agent.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{agent.phone}</span>
                          </div>
                        )}
                        {agent.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{agent.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-600">Agent details not available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactAgent;
