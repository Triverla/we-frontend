import Image from "next/image";
import Link from "next/link";

export const PriceNegotiationSection = () => {
  // Steps for the negotiation process
  const steps = [
    {
      title: "Find your perfect property",
      description: "Browse our listings and find the accommodation that meets your needs",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      title: "Request price negotiation",
      description: "Click the 'Make an Offer' button on eligible listings and propose your price",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Host reviews your offer",
      description: "The host evaluates your offer based on your profile, stay duration, and season",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: "Negotiate and agree",
      description: "You may receive a counter-offer or immediate acceptance to finalize your booking",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative w-full py-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50" />
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-40 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 right-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="relative inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#1E3A8A] to-[#1E3A8A]/80 rounded-full blur opacity-30" />
            <span className="relative inline-block bg-[#1E3A8A] text-white px-6 py-2 rounded-full text-sm font-medium mb-4">
              Save on your stay
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#1E3A8A]">
            Flexible Price Negotiation
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            At Woothomes, we believe in transparent pricing that works for everyone. 
            Our price negotiation feature lets you propose a fair rate for your stay.
          </p>
        </div>

        {/* Main content with image */}
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-16">
          <div className="lg:w-1/2">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#1E3A8A] to-[#1E3A8A]/80 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000" />
              <div className="relative h-96 w-full rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                  alt="Price negotiation illustration"
                  width={800}
                  height={600}
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-3xl font-bold mb-8 text-[#1E3A8A]">
                How Price Negotiation Works
              </h3>
              
              <div className="space-y-8">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start group">
                    <div className="flex-shrink-0 bg-[#1E3A8A] rounded-xl p-3 mr-4 w-12 h-12 flex items-center justify-center overflow-hidden transform group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg group-hover:text-[#1E3A8A] transition-colors duration-300">
                        {index + 1}. {step.title}
                      </h4>
                      <p className="text-gray-600 group-hover:text-gray-900 transition-colors duration-300">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              title: "Better Deals",
              description: "Get more value for your money, especially for longer stays or off-season bookings",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              title: "Flexible Options",
              description: "Discover properties you might otherwise overlook due to pricing constraints",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
            },
            {
              title: "Direct Communication",
              description: "Engage with hosts directly to build rapport and create a personalized stay experience",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              ),
            },
          ].map((benefit, index) => (
            <div key={index} className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#1E3A8A] to-[#1E3A8A]/80 rounded-2xl blur opacity-30" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:-translate-y-1">
                <div className="bg-[#1E3A8A] rounded-xl w-12 h-12 flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <h3 className="font-bold text-xl mb-2 group-hover:text-[#1E3A8A] transition-colors duration-300">{benefit.title}</h3>
                <p className="text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/how-negotiation-works"
            className="relative inline-flex items-center px-8 py-4 text-white bg-[#1E3A8A] rounded-xl hover:bg-[#1E3A8A]/90 transition-colors duration-300"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[#1E3A8A] to-[#1E3A8A]/80 rounded-xl blur opacity-30" />
            <span className="relative">Learn More About Price Negotiation</span>
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
    </div>
  );
}; 