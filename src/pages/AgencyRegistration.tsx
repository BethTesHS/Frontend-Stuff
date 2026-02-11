import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, Users, Plus, X, Upload, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { generateSlug, validateSlug, buildAgencyUrl } from '@/utils/subdomain';
import Layout from '@/components/Layout/Layout';
import { agencyApi } from '@/services/agencyApi';

const AgencyRegistration = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    agencyName: '',
    slug: '',
    description: '',
    address: '',
    city: '',
    postcode: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    website: '',
    establishedYear: '',
    licenseNumber: '',
    specializations: [] as string[],
    logo: null as File | null
  });

  const [agents, setAgents] = useState([
    { id: 1, name: '', email: '', role: '', phone: '' }
  ]);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const specializationOptions = [
    'Residential Sales',
    'Commercial Sales',
    'Lettings',
    'Property Management',
    'New Homes',
    'Luxury Properties',
    'Investment Properties',
    'Land & Development'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate slug when agency name changes
      if (field === 'agencyName') {
        updated.slug = generateSlug(value);
      }
      
      return updated;
    });
  };

  const handleSpecializationToggle = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...prev.specializations, specialization]
    }));
  };

  const handleAgentChange = (id: number, field: string, value: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === id ? { ...agent, [field]: value } : agent
    ));
  };

  const addAgent = () => {
    setAgents(prev => [...prev, {
      id: Date.now(),
      name: '',
      email: '',
      role: '',
      phone: ''
    }]);
  };

  const removeAgent = (id: number) => {
    if (agents.length > 1) {
      setAgents(prev => prev.filter(agent => agent.id !== id));
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
    }
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.agencyName && formData.email && formData.phone && formData.address && 
               formData.slug && validateSlug(formData.slug) && formData.password && 
               formData.confirmPassword && formData.password === formData.confirmPassword;
      case 2:
        return agents.every(agent => agent.name && agent.email && agent.role);
      case 3:
        return formData.specializations.length > 0;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      toast.error('Please complete all required fields');
      return;
    }

    if (!validateSlug(formData.slug)) {
      toast.error('Invalid agency slug. Use only letters, numbers, and hyphens.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const registrationData = {
        name: formData.agencyName,
        slug: formData.slug,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.postcode}`,
        website: formData.website,
        description: formData.description,
        agents: agents.filter(agent => agent.name && agent.email && agent.role),
        specializations: formData.specializations,
      };

      console.log('Registration data being sent:', registrationData);
      console.log('Agents array in detail:', JSON.stringify(registrationData.agents, null, 2));
      console.log('All agents data:', agents);
      const response = await agencyApi.register(registrationData);

      // Use the backend response which includes the agency slug and redirect URL
      const agencyUrl = response.redirect_url 
        ? response.redirect_url.replace(/login$/, 'dashboard') // Change login to dashboard
        : buildAgencyUrl(response.agency.slug, '/dashboard');
      
      toast.success(
        `Agency profile created successfully! Redirecting to your agency dashboard...`,
        { duration: 4000 }
      );
      
      // Redirect to the agency dashboard
      setTimeout(() => {
        // For development, navigate with agency parameter
        window.location.href = `/dashboard?agency=${response.agency.slug}`;
      }, 2000);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to create agency profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero Background */}
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="container mx-auto px-4 max-w-5xl py-12">
          {/* Header */}
          <div className="mb-12">
            <Button 
              variant="default" 
              onClick={() => navigate('/agency-profile')}
              className="mb-8 shadow-lg hover:shadow-xl transition-all duration-300"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Agency Profile
            </Button>
            
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent animate-fade-in">
                  Create Your Agency Profile
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary-glow mx-auto rounded-full"></div>
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Join our platform and unlock powerful tools designed specifically for estate agencies. 
                Manage properties, agents, and clients with enterprise-grade features.
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-12">
            <div className="bg-card rounded-2xl shadow-lg border p-8 backdrop-blur-sm">
              <div className="flex items-center space-x-6">
                {[
                  { step: 1, title: 'Agency Details', icon: Building2 },
                  { step: 2, title: 'Team Members', icon: Users },
                  { step: 3, title: 'Specializations', icon: Building2 }
                ].map((item, index) => (
                  <div key={item.step} className="flex items-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-semibold transition-all duration-500 ${
                        currentStep >= item.step 
                          ? 'bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-lg shadow-primary/25 scale-110' 
                          : 'bg-muted text-muted-foreground border-2 border-muted-foreground/20'
                      }`}>
                        {currentStep > item.step ? (
                          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                          </div>
                        ) : (
                          <item.icon className="w-6 h-6" />
                        )}
                      </div>
                      <div className="text-center">
                        <div className={`text-sm font-medium ${currentStep >= item.step ? 'text-primary' : 'text-muted-foreground'}`}>
                          Step {item.step}
                        </div>
                        <div className={`text-xs ${currentStep >= item.step ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {item.title}
                        </div>
                      </div>
                    </div>
                    {index < 2 && (
                      <div className={`w-20 h-1 mx-6 rounded-full transition-all duration-500 ${
                        currentStep > item.step + 1 ? 'bg-gradient-to-r from-primary to-primary-glow' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary-glow/5 border-b border-border/50">
              <CardTitle className="flex items-center gap-3 text-2xl">
                {currentStep === 1 && (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg">
                      <Building2 className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                      Agency Information
                    </span>
                  </>
                )}
                {currentStep === 2 && (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg">
                      <Users className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                      Add Your Agents
                    </span>
                  </>
                )}
                {currentStep === 3 && (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg">
                      <Building2 className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                      Specializations & Review
                    </span>
                  </>
                )}
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground mt-2">
                {currentStep === 1 && "Tell us about your estate agency and create your unique brand presence"}
                {currentStep === 2 && "Add your team members who will use the platform and manage properties"}
                {currentStep === 3 && "Select your specializations and review all information before creating your agency"}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8 space-y-8 bg-gradient-to-b from-background to-muted/10">
              {/* Step 1: Agency Information */}
              {currentStep === 1 && (
                <div className="space-y-8 animate-fade-in">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="agency-name" className="text-sm font-semibold text-foreground">
                        Agency Name *
                      </Label>
                      <Input
                        id="agency-name"
                        value={formData.agencyName}
                        onChange={(e) => handleInputChange('agencyName', e.target.value)}
                        placeholder="Your Estate Agency Ltd"
                        required
                        className="h-12 text-base border-2 focus:border-primary shadow-sm hover:shadow-md transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="agency-slug" className="text-sm font-semibold text-foreground">
                        Agency URL Slug *
                      </Label>
                      <div className="flex items-center space-x-3">
                        <Input
                          id="agency-slug"
                          value={formData.slug}
                          onChange={(e) => handleInputChange('slug', e.target.value)}
                          placeholder="your-agency"
                          required
                          pattern="[a-z0-9-]+"
                          title="Only lowercase letters, numbers, and hyphens allowed"
                          className="h-12 text-base border-2 focus:border-primary shadow-sm hover:shadow-md transition-all duration-200"
                        />
                        <div className="px-3 py-3 bg-gradient-to-r from-primary/10 to-primary-glow/10 border border-primary/20 rounded-lg">
                          <span className="text-sm font-medium text-primary">.homed.com</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        This will be your agency's subdomain (e.g., your-agency.homed.com)
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                        Contact Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="contact@agency.com"
                        required
                        className="h-12 text-base border-2 focus:border-primary shadow-sm hover:shadow-md transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-sm font-semibold text-foreground">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+44 20 1234 5678"
                        required
                        className="h-12 text-base border-2 focus:border-primary shadow-sm hover:shadow-md transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                        Password *
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Create a secure password"
                        required
                        className="h-12 text-base border-2 focus:border-primary shadow-sm hover:shadow-md transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
                        Confirm Password *
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm your password"
                        required
                        className={`h-12 text-base border-2 focus:border-primary shadow-sm hover:shadow-md transition-all duration-200 ${
                          formData.confirmPassword && formData.password !== formData.confirmPassword 
                            ? 'border-red-500 focus:border-red-500' 
                            : ''
                        }`}
                      />
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="website" className="text-sm font-semibold text-foreground">
                        Website
                      </Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="www.youragency.com"
                        className="h-12 text-base border-2 focus:border-primary shadow-sm hover:shadow-md transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="established-year" className="text-sm font-semibold text-foreground">
                        Year Established
                      </Label>
                      <Input
                        id="established-year"
                        value={formData.establishedYear}
                        onChange={(e) => handleInputChange('establishedYear', e.target.value)}
                        placeholder="2010"
                        className="h-12 text-base border-2 focus:border-primary shadow-sm hover:shadow-md transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="address" className="text-sm font-semibold text-foreground">
                      Full Address *
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 High Street"
                      required
                      className="h-12 text-base border-2 focus:border-primary shadow-sm hover:shadow-md transition-all duration-200"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="city" className="text-sm font-semibold text-foreground">
                        City
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="London"
                        className="h-12 text-base border-2 focus:border-primary shadow-sm hover:shadow-md transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="postcode" className="text-sm font-semibold text-foreground">
                        Postcode
                      </Label>
                      <Input
                        id="postcode"
                        value={formData.postcode}
                        onChange={(e) => handleInputChange('postcode', e.target.value)}
                        placeholder="SW1A 1AA"
                        className="h-12 text-base border-2 focus:border-primary shadow-sm hover:shadow-md transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="license-number" className="text-sm font-semibold text-foreground">
                      License Number
                    </Label>
                    <Input
                      id="license-number"
                      value={formData.licenseNumber}
                      onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                      placeholder="RICS123456"
                      className="h-12 text-base border-2 focus:border-primary shadow-sm hover:shadow-md transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                      Agency Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your agency's services and expertise..."
                      rows={4}
                      className="text-base border-2 focus:border-primary shadow-sm hover:shadow-md transition-all duration-200 resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="logo" className="text-sm font-semibold text-foreground">
                      Agency Logo
                    </Label>
                    <div className="flex items-center gap-6">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('logo')?.click()}
                        className="h-12 px-6 border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                      >
                        <Upload className="w-5 h-5 mr-3" />
                        Upload Logo
                      </Button>
                      {formData.logo && (
                        <div className="flex items-center gap-3 px-4 py-3 bg-primary/10 border border-primary/20 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                          <span className="text-sm font-medium text-primary">
                            {formData.logo.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* Step 2: Agents */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Add Your Agents</h3>
                    <Button onClick={addAgent} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Agent
                    </Button>
                  </div>

                  {agents.map((agent, index) => (
                    <div key={agent.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Agent {index + 1}</h4>
                        {agents.length > 1 && (
                          <Button
                            onClick={() => removeAgent(agent.id)}
                            variant="ghost"
                            size="sm"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Full Name *</Label>
                          <Input
                            value={agent.name}
                            onChange={(e) => handleAgentChange(agent.id, 'name', e.target.value)}
                            placeholder="John Smith"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            value={agent.email}
                            onChange={(e) => handleAgentChange(agent.id, 'email', e.target.value)}
                            placeholder="john@agency.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Role *</Label>
                          <Select
                            value={agent.role}
                            onValueChange={(value) => handleAgentChange(agent.id, 'role', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="senior-agent">Senior Agent</SelectItem>
                              <SelectItem value="agent">Agent</SelectItem>
                              <SelectItem value="junior-agent">Junior Agent</SelectItem>
                              <SelectItem value="trainee">Trainee</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input
                            value={agent.phone}
                            onChange={(e) => handleAgentChange(agent.id, 'phone', e.target.value)}
                            placeholder="+44 20 1234 5678"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

             {/* Step 3: Specializations & Review */}
             {currentStep === 3 && (
               <div className="space-y-8 animate-fade-in">
                 {/* Specializations Section */}
                 <div className="relative">
                   <div className="text-center mb-6">
                     <div className="inline-flex items-center gap-3 mb-4">
                       <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary-glow to-primary flex items-center justify-center shadow-lg">
                         <Building2 className="w-6 h-6 text-primary-foreground" />
                       </div>
                       <div>
                         <h3 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                           Choose Your Specializations
                         </h3>
                         <p className="text-sm text-muted-foreground">
                           Select the services that define your agency's expertise
                         </p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                     {specializationOptions.map((specialization, index) => {
                       const isSelected = formData.specializations.includes(specialization);
                       return (
                         <div
                           key={specialization}
                           className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-102 hover:-translate-y-0.5 ${
                             isSelected
                               ? 'bg-gradient-to-br from-primary/20 via-primary-glow/15 to-primary/10 border-2 border-primary shadow-lg shadow-primary/10'
                               : 'bg-gradient-to-br from-card to-muted/30 border-2 border-border/50 hover:border-primary/40 hover:shadow-md hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary-glow/5'
                           }`}
                           onClick={() => handleSpecializationToggle(specialization)}
                         >
                           <div className="flex items-center justify-between mb-2">
                             <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                               isSelected 
                                 ? 'bg-primary text-primary-foreground shadow-sm' 
                                 : 'bg-muted group-hover:bg-primary/20 text-muted-foreground group-hover:text-primary'
                             }`}>
                               <Building2 className="w-4 h-4" />
                             </div>
                             <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                               isSelected 
                                 ? 'bg-primary border-primary' 
                                 : 'border-muted-foreground/30 group-hover:border-primary/50'
                             }`}>
                               {isSelected && (
                                 <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                                   <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                 </div>
                               )}
                             </div>
                           </div>
                           <h4 className={`font-semibold text-sm leading-tight transition-colors duration-300 ${
                             isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'
                           }`}>
                             {specialization}
                           </h4>
                         </div>
                       );
                     })}
                   </div>

                   {formData.specializations.length > 0 && (
                     <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/5 via-primary-glow/10 to-primary/5 border border-primary/20 p-4 shadow-lg">
                       <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-primary-glow to-primary"></div>
                       <div className="flex items-start gap-4">
                         <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-md">
                           <Building2 className="w-5 h-5 text-primary-foreground" />
                         </div>
                         <div className="flex-1">
                           <h4 className="text-lg font-bold text-primary mb-3">Your Selected Specializations</h4>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                             {formData.specializations.map((spec, index) => (
                               <div
                                 key={spec}
                                 className="flex items-center gap-2 p-2 bg-white/50 rounded-xl border border-primary/20 shadow-sm"
                               >
                                 <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                 <span className="text-xs font-medium text-primary truncate">{spec}</span>
                               </div>
                             ))}
                           </div>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>

                 {/* Enhanced Separator */}
                 <div className="relative">
                   <div className="absolute inset-0 flex items-center">
                     <div className="w-full border-t border-primary/20"></div>
                   </div>
                   <div className="relative flex justify-center">
                     <div className="bg-background px-4">
                       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-md">
                         <div className="w-3 h-3 rounded-full bg-white/30"></div>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Review Section */}
                 <div className="relative">
                   <div className="text-center mb-6">
                     <div className="inline-flex items-center gap-3 mb-4">
                       <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-success via-success to-success/80 flex items-center justify-center shadow-lg">
                         <Building2 className="w-6 h-6 text-white" />
                       </div>
                       <div>
                         <h3 className="text-2xl font-bold bg-gradient-to-r from-success to-success/80 bg-clip-text text-transparent">
                           Review Your Agency Profile
                         </h3>
                         <p className="text-sm text-muted-foreground">
                           Verify all information before creating your agency
                         </p>
                       </div>
                     </div>
                   </div>

                   <div className="grid lg:grid-cols-2 gap-4">
                     {/* Agency Details Card */}
                     <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-muted/20 border-2 border-border/50 p-5 hover:shadow-lg transition-all duration-300">
                       <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-glow"></div>
                       <div className="flex items-start gap-4 mb-4">
                         <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-md">
                           <Building2 className="w-5 h-5 text-primary-foreground" />
                         </div>
                         <div>
                           <h4 className="text-lg font-bold text-foreground">Agency Information</h4>
                           <p className="text-xs text-muted-foreground">Your agency's core details</p>
                         </div>
                       </div>
                       
                       <div className="space-y-3">
                         <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-transparent rounded-xl border border-primary/10">
                           <div className="w-2 h-2 rounded-full bg-primary"></div>
                           <div className="flex-1 min-w-0">
                             <div className="text-xs text-muted-foreground">Agency Name</div>
                             <div className="font-bold text-sm text-primary truncate">{formData.agencyName}</div>
                           </div>
                         </div>
                         
                         <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary-glow/5 to-transparent rounded-xl border border-primary-glow/10">
                           <div className="w-2 h-2 rounded-full bg-primary-glow"></div>
                           <div className="flex-1 min-w-0">
                             <div className="text-xs text-muted-foreground">Agency URL</div>
                             <div className="font-mono font-bold text-sm text-primary-glow truncate">{formData.slug}.homed.com</div>
                           </div>
                         </div>
                         
                         <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-success/5 to-transparent rounded-xl border border-success/10">
                           <div className="w-2 h-2 rounded-full bg-success"></div>
                           <div className="flex-1 min-w-0">
                             <div className="text-xs text-muted-foreground">Contact</div>
                             <div className="font-semibold text-sm text-success truncate">{formData.email}</div>
                             <div className="text-xs text-muted-foreground">{formData.phone}</div>
                           </div>
                         </div>
                         
                         <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-muted/20 to-transparent rounded-xl border border-muted/30">
                           <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                           <div className="flex-1 min-w-0">
                             <div className="text-xs text-muted-foreground">Address</div>
                             <div className="font-semibold text-sm truncate">{formData.address}</div>
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Team & Specializations Card */}
                     <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-muted/20 border-2 border-border/50 p-5 hover:shadow-lg transition-all duration-300">
                       <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-success to-success/80"></div>
                       <div className="flex items-start gap-4 mb-4">
                         <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-success/80 flex items-center justify-center shadow-md">
                           <Users className="w-5 h-5 text-white" />
                         </div>
                         <div>
                           <h4 className="text-lg font-bold text-foreground">Team & Services</h4>
                           <p className="text-xs text-muted-foreground">Your agents and specializations</p>
                         </div>
                       </div>
                       
                       <div className="space-y-4">
                         <div className="p-4 bg-gradient-to-br from-success/5 to-success/10 rounded-2xl border border-success/20">
                           <div className="flex items-center gap-3 mb-3">
                             <div className="w-8 h-8 rounded-xl bg-success flex items-center justify-center shadow-md">
                               <Users className="w-4 h-4 text-white" />
                             </div>
                             <div>
                               <div className="text-lg font-bold text-success">{agents.filter(a => a.name).length}</div>
                               <div className="text-xs text-muted-foreground">Team Members</div>
                             </div>
                           </div>
                           <div className="grid grid-cols-1 gap-2">
                             {agents.filter(a => a.name).slice(0, 3).map((agent, index) => (
                               <div key={index} className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
                                 <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                                 <span className="text-xs font-medium truncate">{agent.name}</span>
                               </div>
                             ))}
                             {agents.filter(a => a.name).length > 3 && (
                               <div className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
                                 <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                                 <span className="text-xs font-medium">+{agents.filter(a => a.name).length - 3} more</span>
                               </div>
                             )}
                           </div>
                         </div>
                         
                         <div className="p-4 bg-gradient-to-br from-primary/5 to-primary-glow/10 rounded-2xl border border-primary/20">
                           <div className="flex items-center gap-3 mb-3">
                             <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md">
                               <Building2 className="w-4 h-4 text-primary-foreground" />
                             </div>
                             <div>
                               <div className="text-lg font-bold text-primary">{formData.specializations.length}</div>
                               <div className="text-xs text-muted-foreground">Specializations</div>
                             </div>
                           </div>
                           <div className="space-y-1.5">
                             {formData.specializations.slice(0, 3).map((spec, index) => (
                               <div key={index} className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
                                 <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                 <span className="text-xs font-medium truncate">{spec}</span>
                               </div>
                             ))}
                             {formData.specializations.length > 3 && (
                               <div className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
                                 <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                 <span className="text-xs font-medium">+{formData.specializations.length - 3} more</span>
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t border-border/50">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="h-12 px-8 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < 3 ? (
                  <Button 
                    onClick={nextStep}
                    className="h-12 px-8 bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
                  >
                    Next Step
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="h-12 px-8 bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating Profile...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Create Agency Profile
                      </div>
                    )}
                  </Button>
                )}
              </div>
          </CardContent>
         </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AgencyRegistration;