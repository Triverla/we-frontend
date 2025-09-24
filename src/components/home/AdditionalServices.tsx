import Image from "next/image";
import Link from "next/link";

interface ServiceCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  link: string;
}

const ServiceCard = ({ title, icon, description, link }: ServiceCardProps) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden transition-colors duration-300">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="bg-[#1E3A8A]/10 rounded-full p-3 mr-4 w-12 h-12 flex items-center justify-center overflow-hidden">
            {icon}
          </div>
          <h3 className="font-bold text-lg">{title}</h3>
        </div>
        <p className="text-gray-600 mb-4">{description}</p>
        <Link
          href={link}
          className="text-[#1E3A8A] font-medium flex items-center hover:text-[#1E3A8A]/80 transition-colors"
        >
          Learn more
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export const AdditionalServicesSection = () => {
  const services = [
    {
      title: "Laundry & Dry Cleaning",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      description: "Professional cleaning services for your clothes delivered right to your door",
      link: "/services/laundry",
    },
    {
      title: "Personal Chef",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      description: "Enjoy gourmet meals prepared by professional chefs in the comfort of your rental",
      link: "/services/chef",
    },
    {
      title: "Housekeeping",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      description: "Keep your space clean and tidy with our professional housekeeping services",
      link: "/services/housekeeping",
    },
    {
      title: "Airport Transfer",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
      description: "Convenient and reliable transportation to and from the airport",
      link: "/services/airport-transfer",
    },
    {
      title: "Grocery Delivery",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      description: "Get fresh groceries delivered directly to your accommodation",
      link: "/services/grocery-delivery",
    },
    {
      title: "Massage & Wellness",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: "Relax and rejuvenate with professional massage and wellness services",
      link: "/services/wellness",
    },
  ];

  return (
    <div className="w-full bg-gradient-to-b from-[#1E3A8A]/5 to-white py-16">
      <div className="max-w-7xl mx-auto p-3">
        <div className="text-center mb-12">
          <span className="inline-block bg-[#1E3A8A]/10 text-[#1E3A8A] px-3 py-1 rounded-full text-sm font-medium mb-3">
            Enhance your stay
          </span>
          <h2 className="text-3xl font-extrabold mb-3 text-[#1E3A8A]">
            Additional Services
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Make your stay even more comfortable with our range of convenient services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {services.map((service) => (
            <ServiceCard
              key={service.title}
              title={service.title}
              icon={service.icon}
              description={service.description}
              link={service.link}
            />
          ))}
        </div>

        <div className="bg-[#1E3A8A]/5 rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
              <h3 className="text-2xl font-bold mb-4 text-[#1E3A8A]">Request Custom Services</h3>
              <p className="text-gray-600 mb-6">
                Don&apos;t see what you need? Our concierge team can help arrange custom services to meet your specific requirements. From childcare to event planning, we&apos;ve got you covered.
              </p>
              <Link
                href="/custom-services"
                className="inline-flex items-center px-6 py-3 text-white bg-[#1E3A8A] rounded-md hover:bg-[#1E3A8A]/90 transition-colors"
              >
                Contact Our Concierge
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
            <div className="md:w-1/2">
              <div className="relative h-64 w-full rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                  alt="Concierge services"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 