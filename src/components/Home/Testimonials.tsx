import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'London Homebuyer',
      initials: 'SM',
      text: 'The team helped us find our dream home in London. Their knowledge of the local market is unparalleled.',
      rating: 5
    },
    {
      name: 'Thomas R.',
      role: 'Manchester Home Seller',
      initials: 'TR',
      text: 'Our home sold quickly thanks to their excellent marketing strategy and professional approach.',
      rating: 5
    },
    {
      name: 'Jessica C.',
      role: 'Birmingham Homebuyer',
      initials: 'JC',
      text: 'The entire process was seamless. From search to closing, the team was with us every step.',
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl md:text-4xl font-serif text-center mb-4 text-blue-900">
          Client Testimonials
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          See what our clients have to say about their experience with Homed
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="text-yellow-400 mb-4 flex">
                {Array(testimonial.rating)
                  .fill(0)
                  .map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
              </div>
              <p className="italic mb-6 text-gray-700">&ldquo;{testimonial.text}&rdquo;</p>
              <div className="flex items-center">
                <div className="bg-blue-100 text-blue-900 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                  <span className="font-bold text-sm">{testimonial.initials}</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
