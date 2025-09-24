import Link from "next/link";

export default function ChefServicePage() {
  const features = [
    {
      title: "Professional Chefs",
      description: "Experienced culinary experts with diverse specialties",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
    },
    {
      title: "Custom Menus",
      description: "Personalized meal plans tailored to your preferences",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      title: "Fresh Ingredients",
      description: "Premium quality ingredients sourced locally",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      title: "Dietary Accommodations",
      description: "Specialized meals for dietary restrictions and allergies",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const services = [
    {
      name: "Single Meal",
      price: "₦15,000",
      description: "One-time gourmet meal preparation",
    },
    {
      name: "Daily Chef",
      price: "₦45,000",
      description: "Daily meal preparation for your stay",
    },
    {
      name: "Special Occasion",
      price: "₦25,000",
      description: "Celebration meals and events",
    },
    {
      name: "Cooking Classes",
      price: "₦20,000",
      description: "Learn to cook with our expert chefs",
    },
  ];

  return (
    <div className="py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-block bg-[#1E3A8A]/10 text-[#1E3A8A] px-3 py-1 rounded-full text-sm font-medium mb-4">
          Personal Chef
        </div>
        <h1 className="text-4xl font-extrabold mb-4 text-[#1E3A8A]">
          Private Chef Services
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto text-lg">
          Enjoy restaurant-quality meals in the comfort of your rental with our professional personal chef services. 
          From intimate dinners to family gatherings, our chefs create memorable dining experiences.
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
            <h3 className="font-bold text-lg mb-2">Book Your Chef</h3>
            <p className="text-gray-600">Select your preferred chef and schedule your meal service</p>
          </div>
          <div className="text-center">
            <div className="bg-[#1E3A8A] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="font-bold text-lg mb-2">Customize Menu</h3>
            <p className="text-gray-600">Work with your chef to create the perfect menu for your occasion</p>
          </div>
          <div className="text-center">
            <div className="bg-[#1E3A8A] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="font-bold text-lg mb-2">Enjoy Your Meal</h3>
            <p className="text-gray-600">Sit back and enjoy a professionally prepared gourmet meal</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <h2 className="text-3xl font-bold mb-4 text-[#1E3A8A]">Ready to Experience Fine Dining?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Book your personal chef today and transform your accommodation into a private dining experience.
        </p>
        <Link
          href="/custom-services"
          className="inline-flex items-center px-8 py-4 text-white bg-[#1E3A8A] rounded-md hover:bg-[#1E3A8A]/90 transition-colors font-medium"
        >
          Book Personal Chef
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