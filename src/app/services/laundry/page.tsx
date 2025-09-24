import Link from "next/link";

export default function LaundryServicePage() {
  const features = [
    {
      title: "Professional Cleaning",
      description: "Expert care for all types of fabrics and garments",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Same Day Service",
      description: "Express cleaning available for urgent needs",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Door-to-Door Delivery",
      description: "Convenient pickup and delivery to your accommodation",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      title: "Eco-Friendly Options",
      description: "Environmentally conscious cleaning methods available",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
  ];

  const services = [
    {
      name: "Wash & Fold",
      price: "₦2,500",
      description: "Basic laundry service with folding",
    },
    {
      name: "Dry Cleaning",
      price: "₦3,500",
      description: "Professional dry cleaning for delicate items",
    },
    {
      name: "Press Only",
      price: "₦1,500",
      description: "Ironing and pressing service",
    },
    {
      name: "Express Service",
      price: "₦4,000",
      description: "Same day cleaning and delivery",
    },
  ];

  return (
    <div className="py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-block bg-[#1E3A8A]/10 text-[#1E3A8A] px-3 py-1 rounded-full text-sm font-medium mb-4">
          Laundry & Dry Cleaning
        </div>
        <h1 className="text-4xl font-extrabold mb-4 text-[#1E3A8A]">
          Professional Laundry Services
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto text-lg">
          Keep your clothes fresh and clean with our professional laundry and dry cleaning services. 
          We handle everything from everyday wear to delicate garments with expert care.
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
            <h3 className="font-bold text-lg mb-2">Schedule Pickup</h3>
            <p className="text-gray-600">Book your laundry service through our app or call our concierge</p>
          </div>
          <div className="text-center">
            <div className="bg-[#1E3A8A] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="font-bold text-lg mb-2">Professional Cleaning</h3>
            <p className="text-gray-600">Our experts handle your garments with care and attention</p>
          </div>
          <div className="text-center">
            <div className="bg-[#1E3A8A] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="font-bold text-lg mb-2">Fresh Delivery</h3>
            <p className="text-gray-600">Your clean, pressed clothes delivered back to your door</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <h2 className="text-3xl font-bold mb-4 text-[#1E3A8A]">Ready to Get Started?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Book your laundry service today and enjoy the convenience of professional cleaning delivered to your accommodation.
        </p>
        <Link
          href="/custom-services"
          className="inline-flex items-center px-8 py-4 text-white bg-[#1E3A8A] rounded-md hover:bg-[#1E3A8A]/90 transition-colors font-medium"
        >
          Book Laundry Service
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