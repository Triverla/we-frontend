import Image from "next/image";
import Link from "next/link";

// Location card component
const LocationCard = ({
  city,
  state,
  image,
  count,
  size = "normal",
}: {
  city: string;
  state: string;
  image: string;
  count: number;
  size?: "large" | "normal";
}) => {
  return (
    <Link
      href={`/properties/location/${city.toLowerCase()}`}
      className={`group relative overflow-hidden rounded-2xl ${
        size === "large" ? "md:col-span-2 md:row-span-2" : ""
      }`}
    >
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={image}
          alt={`${city}, ${state}`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
      </div>
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-[#1E3A8A] flex items-center justify-center mr-3 transform group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className={`font-bold text-white ${size === "large" ? "text-3xl" : "text-2xl"}`}>{city}</h3>
          </div>
          <p className="text-[#1E3A8A]/90 bg-white/90 backdrop-blur-sm inline-block px-3 py-1 rounded-full text-sm font-medium mb-3">
            {state}
          </p>
          <div className="flex items-center text-white/90 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {count} properties
          </div>
        </div>
      </div>
    </Link>
  );
};

export const LocationsSection = () => {
  // Sample locations with apartment images from Unsplash
  const locations = [
    {
      city: "Lagos",
      state: "Lagos State",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      count: 245,
      size: "large" as const,
    },
    {
      city: "Abuja",
      state: "Federal Capital Territory",
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      count: 180,
    },
    {
      city: "Port Harcourt",
      state: "Rivers State",
      image: "https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      count: 120,
    },
    {
      city: "Calabar",
      state: "Cross River State",
      image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      count: 95,
    },
    {
      city: "Enugu",
      state: "Enugu State",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      count: 85,
    },
    {
      city: "Kano",
      state: "Kano State",
      image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      count: 75,
    },
  ];

  return (
    <div className="relative w-full py-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/5 via-white to-[#1E3A8A]/5" />
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#1E3A8A]/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-40 left-10 w-72 h-72 bg-[#1E3A8A]/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 right-1/2 w-72 h-72 bg-[#1E3A8A]/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="relative inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#1E3A8A] to-[#1E3A8A]/80 rounded-full blur opacity-30" />
            <span className="relative inline-block bg-[#1E3A8A] text-white px-6 py-2 rounded-full text-sm font-medium mb-4">
              Popular Destinations
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#1E3A8A]">
            Explore Top Locations
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Discover our most popular destinations with handpicked properties and unforgettable experiences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[200px]">
          {locations.map((location) => (
            <LocationCard
              key={location.city}
              city={location.city}
              state={location.state}
              image={location.image}
              count={location.count}
              size={location.size}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/properties"
            className="relative inline-flex items-center px-8 py-4 text-white bg-[#1E3A8A] rounded-xl hover:bg-[#1E3A8A]/90 transition-colors duration-300"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[#1E3A8A] to-[#1E3A8A]/80 rounded-xl blur opacity-30" />
            <span className="relative">Explore All Locations</span>
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