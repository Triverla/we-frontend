import Link from "next/link";

export default function WellnessServicePage() {
  const features = [
    {
      title: "Licensed Therapists",
      description: "Certified and experienced wellness professionals",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      title: "Mobile Service",
      description: "Professional massage therapy in your accommodation",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      title: "Multiple Therapies",
      description: "Swedish, deep tissue, and relaxation massages",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      title: "Wellness Packages",
      description: "Comprehensive wellness and relaxation treatments",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const services = [
    {
      name: "Swedish Massage",
      price: "₦18,000",
      description: "Relaxing full-body massage therapy",
    },
    {
      name: "Deep Tissue",
      price: "₦22,000",
      description: "Therapeutic massage for muscle tension",
    },
    {
      name: "Couples Massage",
      price: "₦35,000",
      description: "Romantic massage for two people",
    },
    {
      name: "Wellness Package",
      price: "₦45,000",
      description: "Complete wellness treatment session",
    },
  ];

  return (
    <div className="py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-block bg-[#1E3A8A]/10 text-[#1E3A8A] px-3 py-1 rounded-full text-sm font-medium mb-4">
          Massage & Wellness
        </div>
        <h1 className="text-4xl font-extrabold mb-4 text-[#1E3A8A]">
          Professional Wellness Services
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto text-lg">
          Rejuvenate your body and mind with our professional massage and wellness services. 
          Our licensed therapists bring the spa experience directly to your accommodation.
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
            <h3 className="font-bold text-lg mb-2">Book Your Session</h3>
            <p className="text-gray-600">Choose your preferred massage therapy and schedule</p>
          </div>
          <div className="text-center">
            <div className="bg-[#1E3A8A] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="font-bold text-lg mb-2">Therapist Arrives</h3>
            <p className="text-gray-600">Our licensed therapist arrives with all equipment</p>
          </div>
          <div className="text-center">
            <div className="bg-[#1E3A8A] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="font-bold text-lg mb-2">Relax & Rejuvenate</h3>
            <p className="text-gray-600">Enjoy a professional massage in your own space</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <h2 className="text-3xl font-bold mb-4 text-[#1E3A8A]">Ready to Relax?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Book your wellness session today and experience the ultimate relaxation in the comfort of your accommodation.
        </p>
        <Link
          href="/custom-services"
          className="inline-flex items-center px-8 py-4 text-white bg-[#1E3A8A] rounded-md hover:bg-[#1E3A8A]/90 transition-colors font-medium"
        >
          Book Wellness Service
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