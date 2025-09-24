"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Home, 
  Search, 
  ArrowLeft, 
  MapPin, 
  Calendar,
  Users,
  Building2,
  Sparkles
} from "lucide-react";
import { Button } from "@woothomes/components";

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      // Simulate search delay
      setTimeout(() => {
        router.push(`/properties?search=${encodeURIComponent(searchQuery.trim())}`);
      }, 500);
    }
  };

  const quickActions = [
    {
      icon: <Home className="w-6 h-6" />,
      title: "Go Home",
      description: "Return to homepage",
      href: "/",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Browse Properties",
      description: "Find your perfect stay",
      href: "/properties",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Hourly Rentals",
      description: "Short-term stays",
      href: "/hourly-rentals",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      title: "Become a Host",
      description: "List your property",
      href: "/auth/host/signup",
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A8A]/5 via-white to-[#1E3A8A]/5 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#1E3A8A]/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
        <div className="absolute top-40 left-10 w-72 h-72 bg-[#1E3A8A]/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-1/2 w-72 h-72 bg-[#1E3A8A]/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* 404 Number with Animation */}
          <div className="relative mb-8">
            <div className="text-9xl md:text-[12rem] font-black text-[#1E3A8A] opacity-20 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl md:text-8xl font-bold text-[#1E3A8A] animate-pulse">
                Oops!
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1E3A8A] mb-4">
              Page Not Found
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              The page you&apos;re looking for doesn&apos;t exist or has been moved. 
              Let&apos;s help you find what you&apos;re looking for.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-12">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for properties, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pr-12 text-lg border-2 border-gray-200 rounded-xl focus:border-[#1E3A8A] focus:outline-none transition-all duration-300 shadow-lg"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 transition-colors duration-300 disabled:opacity-50"
                >
                  {isSearching ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {quickActions.map((action, index) => (
              <Link
                key={action.title}
                href={action.href}
                className={`group relative overflow-hidden rounded-xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${action.color}`} />
                <div className="relative z-10">
                  <div className="text-[#1E3A8A] mb-4 group-hover:scale-110 transition-transform duration-300">
                    {action.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-[#1E3A8A] mb-2">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Back Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="lg"
              className="group px-8 py-3 border-2 border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Go Back
            </Button>
            
            <Link href="/">
              <Button
                size="lg"
                className="px-8 py-3 bg-[#1E3A8A] text-white hover:bg-[#1E3A8A]/90 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Home className="w-5 h-5 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-10 opacity-20 animate-bounce">
            <MapPin className="w-8 h-8 text-[#1E3A8A]" />
          </div>
          <div className="absolute top-40 right-20 opacity-20 animate-bounce" style={{ animationDelay: '1s' }}>
            <Users className="w-8 h-8 text-[#1E3A8A]" />
          </div>
          <div className="absolute bottom-40 left-20 opacity-20 animate-bounce" style={{ animationDelay: '2s' }}>
            <Sparkles className="w-8 h-8 text-[#1E3A8A]" />
          </div>
        </div>
      </div>
    </div>
  );
} 