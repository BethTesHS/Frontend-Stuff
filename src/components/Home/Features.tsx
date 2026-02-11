
import { useState } from 'react';

const Features = () => {
  console.log('Features component rendering');
  const [location, setLocation] = useState('');
  const [agentName, setAgentName] = useState('');
  const [searchRadius, setSearchRadius] = useState('');
  const [agentType, setAgentType] = useState('');

  const steps = [
    {
      number: '01',
      title: 'Search',
      description: 'Enter your location and preferences\nto find qualified agents in your area'
    },
    {
      number: '02',
      title: 'Compare Agents',
      description: 'Review agent profiles, ratings, and\nspecializations to find the perfect match'
    },
    {
      number: '03',
      title: 'Contact or Book',
      description: 'Get in touch directly or book a free property\nvaluation with your chosen agent'
    }
  ];

  return (
    <section className="bg-white py-16">
      <div className="max-w-[1400px] mx-auto px-8">
        {/* Section Title */}
        <h2 className="text-5xl font-bold text-[#0056B3] text-center mb-16 font-['Poppins']">How it Works</h2>

        {/* Steps Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              {/* Circle with connectors */}
              <div className="relative mb-6">
                {/* Left connector dot */}
                {index > 0 && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-[#E8F1FD] rounded-full border-2 border-[#1E73E8]"></div>
                )}

                {/* Main circle */}
                <div className="w-32 h-32 rounded-full border-8 border-[#1E73E8] bg-white flex flex-col items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                  <div className="text-4xl font-bold text-[#1E73E8]">{step.number}</div>
                  <div className="text-xs font-semibold text-[#333333] mt-1">STEP</div>
                </div>

                {/* Right connector dot */}
                {index < steps.length - 1 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-[#E8F1FD] rounded-full border-2 border-[#1E73E8]"></div>
                )}
              </div>

              <h3 className="text-xl font-bold text-[#333333] mb-3 font-['Poppins']">{step.title}</h3>
              <p className="text-[#333333]/70 text-sm leading-relaxed px-4 whitespace-pre-line font-['Inter']">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Search Form */}
        <div className="bg-[#0056B3] rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Location */}
            <div>
              <label className="block text-white font-semibold mb-2 text-sm">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-[#1E73E8] shadow-sm transition-all duration-300"
              />
            </div>

            {/* Agent Name */}
            <div>
              <label className="block text-white font-semibold mb-2 text-sm">Agent Name (Optional)</label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-[#1E73E8] shadow-sm transition-all duration-300"
              />
            </div>

            {/* Search Radius */}
            <div>
              <label className="block text-white font-semibold mb-2 text-sm">Search Radius</label>
              <select
                value={searchRadius}
                onChange={(e) => setSearchRadius(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-[#1E73E8] appearance-none bg-white cursor-pointer shadow-sm transition-all duration-300"
              >
                <option value=""></option>
                <option>5 miles</option>
                <option>10 miles</option>
                <option>25 miles</option>
                <option>50 miles</option>
              </select>
            </div>

            {/* Agent Type */}
            <div>
              <label className="block text-white font-semibold mb-2 text-sm">Agent Type</label>
              <select
                value={agentType}
                onChange={(e) => setAgentType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-[#1E73E8] appearance-none bg-white cursor-pointer shadow-sm transition-all duration-300"
              >
                <option value=""></option>
                <option>Buyer's Agent</option>
                <option>Seller's Agent</option>
                <option>Rental Agent</option>
                <option>Commercial Agent</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
