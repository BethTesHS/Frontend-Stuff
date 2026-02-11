import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';

const AgentSection = () => {
  return (
    <section id="agents" className="bg-blue-900 text-white py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            alt="Professional Agent"
            className="rounded-lg shadow-xl"
          />
          <div className="absolute -bottom-4 -right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg">
            <p className="font-bold">Expert</p>
            <p className="text-sm">Property Guidance</p>
          </div>
        </div>

        <div>
          <h3 className="text-3xl md:text-4xl font-serif mb-6">
            We are in this together!
          </h3>

          <p className="text-lg leading-relaxed mb-6">
            Our experienced team has been helping buyers and sellers navigate the UK property market.
            We live here. We work here. We know our towns, schools and lifestyle.
          </p>

          <p className="text-lg leading-relaxed mb-8">
            Whether you're buying your first home, upgrading to accommodate a growing family, or downsizing for retirement,
            we're here to guide your home journey from day one.
          </p>

          <div className="flex items-center mb-8">
            <div className="bg-white text-blue-900 rounded-full w-12 h-12 flex items-center justify-center mr-4">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold">Expert Team</p>
              <p className="text-blue-200">Professional Guidance & Support</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link to="/find-agent">
              <button className="bg-white text-blue-900 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-colors">
                Meet Our Team
              </button>
            </Link>
            <Link to="/contact">
              <button className="border border-white hover:bg-white hover:text-blue-900 px-6 py-3 rounded-lg font-medium transition-colors">
                Contact Us
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgentSection;
