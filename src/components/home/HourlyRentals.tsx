"use client";

import Image from "next/image";
import Link from "next/link";

// Hourly rental card component
const HourlyRentalCard = ({
  title,
  image,
  category,
  price,
  rating,
}: {
  title: string;
  image: string;
  category: string;
  price: number;
  rating: number;
}) => {
  return (
    <div className="group relative bg-white rounded-xl overflow-hidden transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80" />
        <div className="absolute top-4 right-4">
            <span className="bg-white/90 backdrop-blur-sm text-[#1E3A8A] text-xs font-medium px-3 py-1.5 rounded-full">
            {category}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white text-lg font-semibold mb-2 line-clamp-1">{title}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex text-yellow-400">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <svg 
                      key={i}
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill={i < Math.floor(rating) ? "currentColor" : "none"}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={i < Math.floor(rating) ? 0 : 1.5}
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                      />
                    </svg>
                  ))}
              </div>
              <span className="text-white/90 text-sm ml-1">{rating.toFixed(1)}</span>
            </div>
            <p className="text-white text-lg font-semibold">
              ₦{price.toLocaleString()}
              <span className="text-white/70 text-sm font-normal">/hr</span>
            </p>
          </div>
        </div>
      </div>
      <Link 
        href={`/hourly-rentals/${encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))}`}
        className="block w-full text-center bg-[#1E3A8A] text-white py-3 px-4 transition-colors duration-300 hover:bg-[#1E3A8A]/90"
      >
        Book Now
      </Link>
    </div>
  );
};

export const HourlyRentalsSection = () => {
  // Sample hourly rental properties with working Unsplash images
  const hourlyRentals = [
    {
      title: "Luxury Studio for Photoshoots",
      image: "https://images.unsplash.com/photo-1554941829-202a0b2403b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "Photography",
      price: 15000,
      rating: 4.8,
    },
    {
      title: "Modern Boardroom",
      image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "Meetings",
      price: 8000,
      rating: 4.6,
    },
    {
      title: "Rooftop Event Space",
      image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "Events",
      price: 25000,
      rating: 4.9,
    },
    {
      title: "Podcast Recording Studio",
      image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "Media",
      price: 7500,
      rating: 4.7,
    },
  ];

  return (
    <div className="relative w-full py-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/5 via-white to-[#1E3A8A]/5" />
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#1E3A8A]/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-[#1E3A8A]/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-[#1E3A8A]/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-16">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#1E3A8A]/10 rounded-full blur-2xl" />
            <span className="relative inline-block bg-[#1E3A8A] text-white px-6 py-2 rounded-full text-sm font-medium mb-4">
              Flexible Bookings
            </span>
            <h2 className="relative text-4xl md:text-5xl font-extrabold mb-4 text-[#1E3A8A]">
              Hourly Rentals
            </h2>
            <p className="relative text-gray-600 max-w-2xl text-lg">
              Perfect spaces for photoshoots, meetings, events, and more - rent only for the time you need
            </p>
          </div>
          <div className="hidden md:flex items-center justify-center bg-white/80 backdrop-blur-sm p-6 rounded-2xl w-20 h-20 mt-8 md:mt-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {hourlyRentals.map((rental) => (
            <HourlyRentalCard
              key={rental.title}
              title={rental.title}
              image={rental.image}
              category={rental.category}
              price={rental.price}
              rating={rental.rating}
            />
          ))}
        </div>

        <div className="mt-20 bg-white/80 backdrop-blur-sm rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-3/5 mb-8 md:mb-0 md:pr-12">
              <h3 className="text-3xl font-bold mb-6 text-[#1E3A8A]">
                How Hourly Rentals Work
              </h3>
              <ol className="space-y-6">
                {[
                  "Browse our selection of hourly rental spaces",
                  "Choose your date and specify the hours you need",
                  "Complete your booking and payment securely online",
                  "Receive your access instructions and enjoy your space"
                ].map((step, index) => (
                  <li key={index} className="flex items-start group">
                    <span className="flex items-center justify-center bg-[#1E3A8A] text-white rounded-full w-8 h-8 mt-0.5 mr-4 flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                      {index + 1}
                    </span>
                    <span className="text-gray-600 group-hover:text-gray-900 transition-colors duration-300">{step}</span>
                  </li>
                ))}
              </ol>
              <Link 
                href="/hourly-rentals"
                className="mt-8 inline-flex items-center px-8 py-4 text-white bg-[#1E3A8A] rounded-xl hover:bg-[#1E3A8A]/90 transition-colors duration-300"
              >
                Explore All Hourly Spaces
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
            <div className="md:w-2/5">
              <div className="relative h-80 w-full rounded-xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1497215842964-222b430dc094?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                  alt="How hourly rentals work"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 