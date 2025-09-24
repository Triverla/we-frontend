import Link from "next/link";

export default function AirportTransferServicePage() {
  const features = [
    {
      title: "Professional Drivers",
      description: "Licensed and experienced chauffeurs",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      title: "Flight Tracking",
      description: "Real-time flight monitoring for timely pickup",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: "Luxury Vehicles",
      description: "Comfortable and well-maintained transportation",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "24/7 Service",
      description: "Available round the clock for your convenience",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const services = [
    {
      name: "Airport Pickup",
      price: "₦12,000",
      description: "From airport to your accommodation",
    },
    {
      name: "Airport Drop-off",
      price: "₦12,000",
      description: "From accommodation to airport",
    },
    {
      name: "Round Trip",
      price: "₦20,000",
      description: "Complete airport transfer service",
    },
    {
      name: "VIP Service",
      price: "₦35,000",
      description: "Luxury vehicle with premium amenities",
    },
  ];

  return (
    <div className="py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-block bg-[#1E3A8A]/10 text-[#1E3A8A] px-3 py-1 rounded-full text-sm font-medium mb-4">
          Airport Transfer
        </div>
        <h1 className="text-4xl font-extrabold mb-4 text-[#1E3A8A]">
          Reliable Airport Transportation
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto text-lg">
          Start and end your journey with ease with our professional airport transfer services. 
          We provide reliable, comfortable transportation to and from all major airports.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {features.map((feature) => (
          <div key={feature.title} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-[#1E3A8A]/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
              {feature.icon}
            </div>
            <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Services and Pricing */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-16">
        <h2 className="text-3xl font-bold mb-8 text-[#1E3A8A] text-center">Our Services & Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div key={service.name} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-lg mb-2">{service.name}</h3>
              <p className="text-2xl font-bold text-[#1E3A8A] mb-2">{service.price}</p>
              <p className="text-gray-600 text-sm">{service.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-[#1E3A8A]/5 rounded-xl p-8 mb-16">
        <h2 className="text-3xl font-bold mb-8 text-[#1E3A8A] text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-[#1E3A8A] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h3 className="font-bold text-lg mb-2">Book Your Transfer</h3>
            <p className="text-gray-600">Provide your flight details and accommodation address</p>
          </div>
          <div className="text-center">
            <div className="bg-[#1E3A8A] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="font-bold text-lg mb-2">Meet Your Driver</h3>
            <p className="text-gray-600">Your driver will meet you at the designated location</p>
          </div>
          <div className="text-center">
            <div className="bg-[#1E3A8A] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="font-bold text-lg mb-2">Relax & Arrive</h3>
            <p className="text-gray-600">Enjoy a comfortable ride to your destination</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <h2 className="text-3xl font-bold mb-4 text-[#1E3A8A]">Ready to Book Your Transfer?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Book your airport transfer today and enjoy stress-free travel to and from the airport.
        </p>
        <Link
          href="/custom-services"
          className="inline-flex items-center px-8 py-4 text-white bg-[#1E3A8A] rounded-md hover:bg-[#1E3A8A]/90 transition-colors font-medium"
        >
          Book Airport Transfer
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
} 