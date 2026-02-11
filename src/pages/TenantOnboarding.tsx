import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, Clock, MessageSquare, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import tenantHeroImage from '@/assets/tenant-onboarding-hero.jpg';
import secureComplaintImage from '@/assets/secure-complaint-management.jpg';
import supportImage from '@/assets/24-7-support.jpg';
import communicationImage from '@/assets/direct-communication.jpg';
import trackingImage from '@/assets/resolution-tracking.jpg';

const TenantOnboarding = () => {
  const navigate = useNavigate();
  const { loading, hasAccess } = useAuthGuard();

  if (loading || !hasAccess) {
    return <div>Loading...</div>;
  }

  const benefits = [
    {
      icon: Home,
      title: "Secure Complaint Management",
      description: "Submit and track complaints securely with full transparency",
      image: secureComplaintImage
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Get help whenever you need it, day or night",
      image: supportImage
    },
    {
      icon: MessageSquare,
      title: "Direct Communication",
      description: "Connect directly with your landlord or agent through our platform",
      image: communicationImage
    },
    {
      icon: CheckCircle,
      title: "Resolution Tracking",
      description: "Monitor the progress of all your requests and complaints",
      image: trackingImage
    }
  ];

  const handleGetStarted = () => {
    navigate('/external-tenant-form');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden min-h-[600px] flex items-end">
          <div className="absolute inset-0">
            <img 
              src={tenantHeroImage} 
              alt="Professional tenants in modern apartment" 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent"></div>
          </div>
          <div className="max-w-4xl mx-auto text-center relative z-10 pb-8">
            <div className="mb-8">
              <h1 className="text-foreground text-4xl md:text-5xl font-bold leading-tight mb-4">
                You're One Step Away
              </h1>
              <p className="text-foreground font-bold text-lg md:text-xl max-w-2xl mx-auto transition-all duration-300">
                Let Homed manage your tenancy and experience seamless property management like never before
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-4">
          <div className="w-full">
            <h2 className="text-foreground text-3xl font-bold text-center mb-12">
              Why Choose Homed for Your Tenancy?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 lg:px-0">
              {benefits.map((benefit, index) => (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="relative h-32 mb-4 rounded-lg overflow-hidden">
                    <img 
                      src={benefit.image} 
                      alt={benefit.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                      <benefit.icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-card-foreground text-lg font-semibold mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {benefit.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-foreground text-3xl font-bold mb-8">
              What You'll Get Access To
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Complaint Portal</h3>
                <p className="text-muted-foreground">
                  Submit and track all your tenancy complaints in one place
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Progress Tracking</h3>
                <p className="text-muted-foreground">
                  See real-time updates on your requests and complaints
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Home className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Secure Platform</h3>
                <p className="text-muted-foreground">
                  Your data is protected with enterprise-grade security
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-foreground text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Tell us about your property and tenancy details so we can set up your account
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold min-w-[250px]"
              onClick={handleGetStarted}
            >
              Tell Us About Yourself
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default TenantOnboarding;