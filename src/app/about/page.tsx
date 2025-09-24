"use client";

import React from "react";
import { Button } from "@woothomes/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Clock, Building2, BookOpen, Target, Heart } from "lucide-react";

// Custom Naira Icon Component
const NairaIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <text
      x="12"
      y="17"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="20"
      fontWeight="bold"
      fill="currentColor"
    >
      ₦
    </text>
  </svg>
);

export default function AboutPage() {
  const router = useRouter();

  const sidebarLinks = [
    {
      title: "Our Story",
      icon: <BookOpen className="w-5 h-5" />,
      href: "#story",
      description: "Learn about our journey"
    },
    {
      title: "Vision & Mission",
      icon: <Target className="w-5 h-5" />,
      href: "#mission",
      description: "Our goals and aspirations"
    },
    {
      title: "Our Values",
      icon: <Heart className="w-5 h-5" />,
      href: "#values",
      description: "What we stand for"
    },
    {
      title: "Hourly Rentals",
      icon: <Clock className="w-5 h-5" />,
      href: "#hourly",
      description: "Learn about our hourly booking options"
    },
    {
      title: "Price Negotiations",
      icon: <NairaIcon className="w-6 h-6" />,
      href: "#pricing",
      description: "Understanding our pricing system"
    },
    {
      title: "Our Services",
      icon: <Building2 className="w-5 h-5" />,
      href: "#services",
      description: "Explore what we offer"
    },
    {
      title: "Contact Us",
      icon: <Phone className="w-5 h-5" />,
      href: "#contact",
      description: "Get in touch with our team"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="relative text-white py-20">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/home/hero_image.jpeg')",
            backgroundPosition: "center",
            backgroundSize: "cover"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/80 via-[#1E3A8A]/70 to-[#1E3A8A]/80"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white mb-8 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg tracking-tight">
            About Woothomes
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl drop-shadow-md font-light leading-relaxed">
            Revolutionizing the way people find and book their perfect stay in Nigeria
          </p>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-[#1E3A8A] mb-4">Quick Links</h3>
              <nav className="space-y-2">
                {sidebarLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#1E3A8A]/5 transition-colors duration-200 group"
                  >
                    <div className="text-[#1E3A8A] group-hover:text-[#1E3A8A]/80">
                      {link.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-[#1E3A8A]">
                        {link.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {link.description}
                      </p>
                    </div>
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Our Story */}
            <section id="story" className="mb-24 relative">
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-[#1E3A8A]/5 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-tl from-[#1E3A8A]/5 to-transparent rounded-full blur-3xl"></div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A8A] mb-8 tracking-tight">Our Story</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Woothomes was born from a simple yet powerful idea: to make finding and booking accommodations in Nigeria as seamless and enjoyable as possible. Founded in 2024, we set out to transform the hospitality landscape by connecting travelers with unique and comfortable stays across the country.
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Our platform bridges the gap between property owners and travelers, creating a community where everyone can find their perfect match. Whether you&apos;re looking for a luxury apartment in Lagos, a cozy home in Abuja, or a beachfront property in Port Harcourt, Woothomes makes it easy to discover and book your ideal stay.
                </p>
              </div>
            </section>

            {/* Vision & Mission */}
            <section id="mission" className="mb-24 relative">
              <div className="absolute -top-20 right-0 w-40 h-40 bg-gradient-to-bl from-[#1E3A8A]/10 to-transparent rounded-full blur-3xl"></div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A8A] mb-8 tracking-tight">Vision & Mission</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  At Woothomes, our mission is to revolutionize the hospitality industry in Nigeria by:
                </p>
                <ul className="list-none space-y-4">
                  {[
                    "Providing a seamless booking experience for travelers",
                    "Empowering property owners to showcase their spaces",
                    "Building trust through transparent reviews and ratings",
                    "Creating a community of satisfied hosts and guests",
                    "Promoting sustainable tourism practices"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-[#1E3A8A] mt-1">•</span>
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Our Values */}
            <section id="values" className="mb-24 relative">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-bl from-[#1E3A8A]/10 to-transparent rounded-full blur-3xl"></div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A8A] mb-8 tracking-tight">Our Values</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    title: "Trust & Transparency",
                    description: "We believe in building trust through honest communication and transparent processes."
                  },
                  {
                    title: "Customer First",
                    description: "Every decision we make is guided by what's best for our customers and community."
                  },
                  {
                    title: "Innovation",
                    description: "We continuously strive to improve and innovate our platform to better serve our users."
                  },
                  {
                    title: "Community",
                    description: "We foster a strong community of hosts and guests who share our vision."
                  }
                ].map((item, index) => (
                  <div key={index} className="border-l-4 border-[#1E3A8A] pl-8 py-4 hover:bg-gradient-to-r from-[#1E3A8A]/5 to-transparent transition-all duration-300 backdrop-blur-sm">
                    <h3 className="text-xl font-semibold text-[#1E3A8A] mb-3">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Hourly Rentals Section */}
            <section id="hourly" className="mb-24 relative">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A8A] mb-8 tracking-tight">Hourly Rentals</h2>
              <div className="bg-gradient-to-br from-[#1E3A8A]/5 to-[#1E3A8A]/10 p-8 rounded-xl">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  We understand that sometimes you need a space for just a few hours. Our hourly rental service provides flexible booking options for:
                </p>
                <ul className="list-none space-y-4">
                  {[
                    "Business meetings and conferences",
                    "Short-term stays and day use",
                    "Event spaces and gatherings",
                    "Quick getaways and staycations"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-[#1E3A8A] mt-1">•</span>
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Price Negotiations Section */}
            <section id="pricing" className="mb-24 relative">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A8A] mb-8 tracking-tight">Price Negotiations</h2>
              <div className="bg-gradient-to-br from-[#1E3A8A]/5 to-[#1E3A8A]/10 p-8 rounded-xl">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  We believe in fair and transparent pricing. Our platform offers:
                </p>
                <ul className="list-none space-y-4">
                  {[
                    "Flexible pricing options for different durations",
                    "Special rates for long-term stays",
                    "Seasonal discounts and promotions",
                    "Price matching for competitive properties"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-[#1E3A8A] mt-1">•</span>
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Services Section */}
            <section id="services" className="mb-24 relative">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A8A] mb-8 tracking-tight">Our Services</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    title: "Property Management",
                    description: "Professional management services for property owners"
                  },
                  {
                    title: "Concierge Services",
                    description: "Premium services for guests including cleaning and maintenance"
                  },
                  {
                    title: "Verified Listings",
                    description: "Thorough verification process for all properties"
                  },
                  {
                    title: "24/7 Support",
                    description: "Round-the-clock assistance for hosts and guests"
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-gradient-to-br from-[#1E3A8A]/5 to-[#1E3A8A]/10 p-8 rounded-xl">
                    <h3 className="text-xl font-semibold text-[#1E3A8A] mb-4">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Contact Information */}
            <section id="contact" className="mb-24 relative">
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-[#1E3A8A]/10 to-transparent rounded-full blur-3xl"></div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A8A] mb-8 tracking-tight">Contact Information</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-[#1E3A8A]/5 to-[#1E3A8A]/10 p-8 rounded-xl">
                  <h3 className="text-xl font-semibold text-[#1E3A8A] mb-6">Company Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Organization Name</p>
                      <p className="font-medium text-gray-900">Woothomes Innovation Limited</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Registration Number</p>
                      <p className="font-medium text-gray-900">RC: 8512791</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Year Founded</p>
                      <p className="font-medium text-gray-900">2024</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1E3A8A]/5 to-[#1E3A8A]/10 p-8 rounded-xl">
                  <h3 className="text-xl font-semibold text-[#1E3A8A] mb-6">Contact Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Head Office Address</p>
                      <p className="font-medium text-gray-900">
                        29 Usuma street,<br />
                        Maitama,<br />
                        Abuja, Nigeria
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email Address</p>
                      <p className="font-medium text-gray-900">hello@woothomes.com</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                      <p className="font-medium text-gray-900">+234 702 511 2581</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Business Hours</p>
                      <p className="font-medium text-gray-900">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-gradient-to-br from-[#1E3A8A]/5 to-[#1E3A8A]/10 p-8 rounded-xl">
                <h3 className="text-xl font-semibold text-[#1E3A8A] mb-6">Additional Information</h3>
                <div className="grid md:grid-cols-3 gap-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Customer Support</p>
                    <p className="font-medium text-gray-900">support@woothomes.com</p>
                    <p className="text-sm text-gray-500 mt-2">Available 24/7</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Partnership Inquiries</p>
                    <p className="font-medium text-gray-900">partners@woothomes.com</p>
                    <p className="text-sm text-gray-500 mt-2">For business collaborations</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Press & Media</p>
                    <p className="font-medium text-gray-900">press@woothomes.com</p>
                    <p className="text-sm text-gray-500 mt-2">For media inquiries</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Connect With Us */}
            <section id="connect" className="mb-24 relative">
              <div className="mt-8 bg-gradient-to-r from-[#1E3A8A]/10 to-[#1E3A8A]/5 p-8 rounded-xl backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-[#1E3A8A] mb-6">Connect With Us</h3>
                <div className="grid md:grid-cols-4 gap-8">
                  {[
                    { platform: "Facebook", handle: "@woothomes", url: "https://facebook.com/woothomes" },
                    { platform: "Twitter", handle: "@woothomes", url: "https://twitter.com/woothomes" },
                    { platform: "Instagram", handle: "@woothomes", url: "https://instagram.com/woothomes" },
                    { platform: "LinkedIn", handle: "Woothomes Limited", url: "https://linkedin.com/company/woothomes" }
                  ].map((item, index) => (
                    <div key={index}>
                      <p className="text-sm text-gray-500 mb-1">{item.platform}</p>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-medium text-[#1E3A8A] hover:text-[#1E3A8A]/80 transition-colors duration-300"
                      >
                        {item.handle}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Join Us */}
            <section className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A]/80 to-[#1E3A8A]/70"></div>
              <div className="relative p-12 text-white rounded-2xl">
                <div className="text-center">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">Join Our Community</h2>
                  <p className="text-white/90 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                    Whether you&apos;re looking to list your property or find your next stay, Woothomes is here to help you every step of the way.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={() => router.push('/properties')}
                      className="bg-white text-[#1E3A8A] hover:bg-gray-100 px-8 py-6 text-lg font-medium rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      Find a Stay
                    </Button>
                    <Button
                      onClick={() => router.push('/host/properties/new')}
                      variant="outline"
                      className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-medium rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      List Your Property
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 