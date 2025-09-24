export default function CustomServicesPage() {
  const availableServices = [
    {
      title: "Childcare Services",
      description: "Professional babysitting and childcare",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      title: "Event Planning",
      description: "Birthday parties, anniversaries, and special events",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Pet Care",
      description: "Pet sitting, walking, and grooming services",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      title: "Photography",
      description: "Professional photography for special occasions",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4H14a2 2 0 012 2v1a2 2 0 01-2 2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2V11a2 2 0 00-2-2H9a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: "Tech Support",
      description: "IT assistance and device setup services",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Personal Shopping",
      description: "Personal shopping and styling services",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-block bg-[#1E3A8A]/10 text-[#1E3A8A] px-3 py-1 rounded-full text-sm font-medium mb-4">
          Custom Services
        </div>
        <h1 className="text-4xl font-extrabold mb-4 text-[#1E3A8A]">
          Request Custom Services
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto text-lg">
          Don&apos;t see what you need? Our concierge team can help arrange custom services to meet your specific requirements. 
          From childcare to event planning, we&apos;ve got you covered.
        </p>
      </div>

      {/* Available Services Grid */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-16">
        <h2 className="text-3xl font-bold mb-8 text-[#1E3A8A] text-center">Available Custom Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableServices.map((service) => (
            <div key={service.title} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="bg-[#1E3A8A]/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                {service.icon}
              </div>
              <h3 className="font-bold text-lg mb-2">{service.title}</h3>
              <p className="text-gray-600 text-sm">{service.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-[#1E3A8A]/5 rounded-xl p-8 mb-16">
        <h2 className="text-3xl font-bold mb-8 text-[#1E3A8A] text-center">Contact Our Concierge</h2>
        <div className="max-w-2xl mx-auto">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">
                Service Type
              </label>
              <select
                id="serviceType"
                name="serviceType"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
              >
                <option value="">Select a service type</option>
                <option value="childcare">Childcare Services</option>
                <option value="event-planning">Event Planning</option>
                <option value="pet-care">Pet Care</option>
                <option value="photography">Photography</option>
                <option value="tech-support">Tech Support</option>
                <option value="personal-shopping">Personal Shopping</option>
                <option value="other">Other (Please specify)</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Service Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                placeholder="Please describe your service requirements in detail..."
              ></textarea>
            </div>

            <div>
              <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Date & Time
              </label>
              <input
                type="datetime-local"
                id="preferredDate"
                name="preferredDate"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="inline-flex items-center px-8 py-4 text-white bg-[#1E3A8A] rounded-md hover:bg-[#1E3A8A]/90 transition-colors font-medium"
              >
                Submit Request
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
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <h2 className="text-3xl font-bold mb-4 text-[#1E3A8A]">Need Immediate Assistance?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Our concierge team is available 24/7 to help with your requests. 
          Contact us directly for urgent service needs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-[#1E3A8A]/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Phone</h3>
            <p className="text-gray-600">+234 800 123 4567</p>
          </div>
          <div className="text-center">
            <div className="bg-[#1E3A8A]/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Email</h3>
            <p className="text-gray-600">concierge@woothomes.com</p>
          </div>
          <div className="text-center">
            <div className="bg-[#1E3A8A]/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">WhatsApp</h3>
            <p className="text-gray-600">+234 800 123 4567</p>
          </div>
        </div>
      </div>
    </div>
  );
} 