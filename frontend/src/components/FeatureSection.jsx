function FeatureSection() {
  const features = [
    {
      icon: '🎫',
      title: 'Easy Booking',
      description: 'Book tickets for your favorite events in just a few clicks',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: '💳',
      title: 'Secure Payment',
      description: 'Safe and secure payment gateway for all transactions',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: '📱',
      title: 'Instant Confirmation',
      description: 'Get instant booking confirmation and e-tickets',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Why Choose EventHub?
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need for seamless event booking
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
              
              <div className="relative z-10 text-center">
                <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FeatureSection;  // ✅ Must have this!