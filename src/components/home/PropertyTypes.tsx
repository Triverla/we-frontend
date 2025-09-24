"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";

// Property type card component
const PropertyTypeCard = ({
  type,
  image,
  count,
  price,
}: {
  type: string;
  image: string;
  count: number;
  price: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={`/properties/type/${encodeURIComponent(type.toLowerCase())}`}
      className="group relative flex-none w-full overflow-hidden rounded-xl bg-white transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full aspect-[4/3]">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={image}
            alt={type}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className={`object-cover transition-transform duration-500 ${
              isHovered ? 'scale-105' : 'scale-100'
            }`}
            priority={false}
          />
        </div>
        <div className={`absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-90' : 'opacity-80'
        }`} />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{type}</h3>
            <span className="text-sm bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
              {count}
            </span>
          </div>
          <p className="text-sm mt-1 opacity-90">{price}</p>
        </div>
      </div>
    </Link>
  );
};

export const PropertyTypesSection = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      checkScrollButtons();
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      }
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.offsetWidth;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const propertyTypes = [
    {
      type: "Apartments",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      count: 324,
      price: "From ₦50,000/night"
    },
    {
      type: "Villas",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      count: 120,
      price: "From ₦150,000/night"
    },
    {
      type: "Cabins",
      image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      count: 86,
      price: "From ₦80,000/night"
    },
    {
      type: "Beach Houses",
      image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      count: 56,
      price: "From ₦200,000/night"
    },
    {
      type: "Penthouses",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      count: 42,
      price: "From ₦180,000/night"
    },
    {
      type: "Houseboats",
      image: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      count: 30,
      price: "From ₦120,000/night"
    },
    {
      type: "Farmhouses",
      image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      count: 22,
      price: "From ₦90,000/night"
    },
    {
      type: "Tiny Homes",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      count: 15,
      price: "From ₦40,000/night"
    },
  ];

  // Infinite scroll effect
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Duplicate cards for seamless infinite scroll
    const originalCards = Array.from(container.children);
    if (container.children.length === propertyTypes.length) {
      originalCards.forEach((child) => {
        container.appendChild(child.cloneNode(true));
      });
    }

    let intervalId: NodeJS.Timeout | null = null;
    let isPaused = false;

    const card = container.querySelector('div.flex-none');
    const cardWidth = card ? (card as HTMLElement).offsetWidth + 24 : 300; // 24px gap
    const totalCards = propertyTypes.length;

    const startAutoScroll = () => {
      if (intervalId) return;
      intervalId = setInterval(() => {
        if (!container || isPaused) return;
        // If we've scrolled past the original set, reset scrollLeft
        if (container.scrollLeft >= cardWidth * totalCards) {
          container.scrollLeft = 0;
        } else {
          container.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
      }, 3000);
    };

    const stopAutoScroll = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    startAutoScroll();
    container.addEventListener('mouseenter', () => { isPaused = true; });
    container.addEventListener('mouseleave', () => { isPaused = false; });

    return () => {
      stopAutoScroll();
      container.removeEventListener('mouseenter', () => { isPaused = true; });
      container.removeEventListener('mouseleave', () => { isPaused = false; });
    };
  }, [propertyTypes.length]);

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
              Explore Options
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#1E3A8A]">
            Find Your Perfect Space
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            From cozy apartments to luxurious villas, discover the perfect accommodation for your stay
          </p>
        </div>

        <div className="relative">
          {/* Scroll Buttons */}
          {showLeftButton && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white transition-colors duration-300 -ml-6"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {showRightButton && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white transition-colors duration-300 -mr-6"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-6 px-4 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Render property cards twice for infinite scroll */}
            {propertyTypes.concat(propertyTypes).map((property, idx) => (
              <div key={property.type + '-' + idx} className="flex-none w-[calc(100%-2rem)] sm:w-[calc(50%-1.5rem)] lg:w-[calc(25%-1.5rem)] snap-start">
                <PropertyTypeCard
                  type={property.type}
                  image={property.image}
                  count={property.count}
                  price={property.price}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            href="/properties"
            className="relative inline-flex items-center px-8 py-4 text-white bg-[#1E3A8A] rounded-xl hover:bg-[#1E3A8A]/90 transition-colors duration-300"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[#1E3A8A] to-[#1E3A8A]/80 rounded-xl blur opacity-30" />
            <span className="relative">View All Property Types</span>
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