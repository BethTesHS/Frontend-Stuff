import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Star, CheckCircle, ArrowRight, BarChart3, Shield, Clock } from 'lucide-react';
import agencyHero from '@/assets/agency-hero.jpg';
import Layout from '@/components/Layout/Layout';

const AgencyProfile = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Building2,
      title: "Property Management",
      description: "Centrally manage all your property listings, viewings, and sales across your agency."
    },
    {
      icon: Users,
      title: "Agent Management",
      description: "Add and manage multiple agents under your agency profile with individual performance tracking."
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Get comprehensive insights into your agency's performance, agent productivity, and market trends."
    },
    {
      icon: Shield,
      title: "Tenant Management",
      description: "Handle tenant complaints, maintenance requests, and communication through a unified dashboard."
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Access round-the-clock support for your agency and streamlined communication tools."
    },
    {
      icon: Star,
      title: "Public Profile",
      description: "Showcase your agency with a professional public profile featuring ratings and testimonials."
    }
  ];

  const benefits = [
    "Increase your agency's visibility and reach",
    "Streamline property and agent management",
    "Professional public profile with ratings",
    "Centralized tenant communication",
    "Advanced analytics and reporting",
    "Multi-agent collaboration tools"
  ];

  return (
    <Layout showFooter={true}>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${agencyHero})` }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Join Our Estate Agency Network
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Create your professional agency profile and manage properties, agents, and tenants all in one place
          </p>
          <Button 
            size="lg" 
            className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6"
            onClick={() => navigate('/agency-registration')}
          >
            Start Your Agency Profile
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Our Platform</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything your estate agency needs to thrive in today's competitive market
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <feature.icon className="w-12 h-12 text-primary mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Agency Benefits</h2>
            <p className="text-xl text-muted-foreground">
              Join hundreds of successful agencies already using our platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="text-lg">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Create your agency profile today and start managing your properties and agents more effectively
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-6"
            onClick={() => navigate('/agency-registration')}
          >
            Create Agency Profile
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-primary mb-2">500+</div>
              <div className="text-lg text-muted-foreground">Active Agencies</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary mb-2">2,500+</div>
              <div className="text-lg text-muted-foreground">Professional Agents</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary mb-2">15K+</div>
              <div className="text-lg text-muted-foreground">Properties Listed</div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AgencyProfile;