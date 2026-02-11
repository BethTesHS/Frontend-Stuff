
import Layout from '@/components/Layout/Layout';
import HeroSection from '@/components/Home/HeroSection';
import FeaturedProperties from '@/components/Home/FeaturedProperties';
import OurTowns from '@/components/Home/OurTowns';
import AgentSection from '@/components/Home/AgentSection';
import Testimonials from '@/components/Home/Testimonials';

const Index = () => {
  console.log('Index page rendering...');
  console.log('Index page loaded successfully');

  return (
    <Layout>
      <div className="animate-fade-in">
        <HeroSection />
        <FeaturedProperties />
        <OurTowns />
        <AgentSection />
        <Testimonials />
      </div>
    </Layout>
  );
};

export default Index;
