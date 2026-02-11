
const OurTowns = () => {
  const towns = [
    {
      name: 'London',
      avgPrice: '£850,000',
      image: 'https://images.unsplash.com/photo-1545324412-8b6d8b6e4c8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Manchester',
      avgPrice: '£350,000',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Birmingham',
      avgPrice: '£280,000',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Edinburgh',
      avgPrice: '£320,000',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    }
  ];

  return (
    <section id="towns" className="bg-blue-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl md:text-4xl font-serif text-center mb-4 text-blue-900">
          Our UK Towns
        </h2>
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
          We proudly serve these beautiful UK communities
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {towns.map((town, index) => (
            <div
              key={index}
              className="town-card"
              style={{ backgroundImage: `url('${town.image}')` }}
            >
              <div className="town-overlay">
                <h3 className="font-bold text-lg">{town.name}</h3>
                <p className="text-sm">Avg Price: {town.avgPrice}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurTowns;
