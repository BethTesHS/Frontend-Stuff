import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Megaphone, TrendingUp, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/Auth/AuthModal';
import { useState } from 'react';
import heroImage from '@/assets/tenancy-hero.jpg';

const TenantSupport = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const handleGetStarted = () => {
    if (isAuthenticated) {
      // Redirect to onboarding page
      navigate('/tenant-onboarding');
    } else {
      // Show auth modal
      setShowAuthModal(true);
    }
  };

  const features = [
    {
      icon: Megaphone,
      title: "File a Complaint",
      description: "Easily submit complaints about your tenancy issues"
    },
    {
      icon: TrendingUp,
      title: "Track Resolution",
      description: "Monitor the progress of your complaints and requests"
    },
    {
      icon: Bell,
      title: "Stay Informed",
      description: "Get updates and notifications about your tenancy"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section 
          className="relative min-h-[480px] bg-cover bg-center bg-no-repeat flex items-center justify-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url(${heroImage})`
          }}
        >
          <div className="text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4">
              Manage Your Tenancy — Wherever You Live
            </h1>
            <p className="text-white text-base md:text-lg font-normal leading-normal mb-8 max-w-2xl mx-auto">
              Join our platform to access tools that help you raise complaints, get landlord support, and stay informed — even if your home isn't listed with us.
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-foreground text-2xl font-bold leading-tight tracking-tight mb-8 px-4">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
              {features.map((feature, index) => (
                <Card key={index} className="p-6 border border-border bg-card hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="text-primary">
                      <feature.icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-card-foreground text-base font-bold leading-tight">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-foreground text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-4">
              Ready to take control of your tenancy?
            </h2>
            <p className="text-foreground text-base font-normal leading-normal mb-8 max-w-2xl mx-auto">
              Sign up now and experience seamless tenancy management.
            </p>
            <div className="flex justify-center">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold min-w-[200px]"
                onClick={handleGetStarted}
              >
                Get Started
              </Button>
            </div>
          </div>
        </section>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </Layout>
  );
};

export default TenantSupport;