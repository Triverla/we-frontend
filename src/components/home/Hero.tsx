"use client";

import { SafeImage } from "@woothomes/components/ui/SafeImage";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const PHRASES = [
  "apartments",
  "villas",
  "cabins",
  "beach houses",
  "city lofts",
  "family homes",
];

export const HeroSection = () => {
  // Typing animation for rotating phrases
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    const current = PHRASES[phraseIndex % PHRASES.length];
    setTypedText(current.slice(0, charIndex));

    const isWordComplete = !isDeleting && charIndex === current.length;
    const isWordEmpty = isDeleting && charIndex === 0;

    const delay = isWordComplete ? 1000 : isWordEmpty ? 300 : isDeleting ? 50 : 100;

    const timer = setTimeout(() => {
      if (isWordComplete) {
        setIsDeleting(true);
        return;
      }
      if (isWordEmpty) {
        setIsDeleting(false);
        setPhraseIndex((i) => (i + 1) % PHRASES.length);
        return;
      }
      setCharIndex((ci) => ci + (isDeleting ? -1 : 1));
    }, delay);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex]);

  useEffect(() => {
    // Kick off typing on mount
    if (charIndex === 0 && !isDeleting) {
      const kick = setTimeout(() => setCharIndex(1), 300);
      return () => clearTimeout(kick);
    }
  }, [charIndex, isDeleting]);
  return (
    <div className="relative w-full min-h-[600px] overflow-hidden bg-white">
      {/* Background Gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-blue-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent" />
      </div>

      {/* Animated Gradient Blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-100/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-20 w-[500px] h-[500px] bg-blue-100/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Modern Pattern Overlay */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/home/hero.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.15,
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-4 py-16">
        {/* Left Content */}
        <motion.div
          className="w-full md:w-1/2 text-blue-900 mb-12 md:mb-0"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
          >
            Your Home, <br />
            <span className="text-blue-500">Anywhere</span> You Go
          </motion.h1>
          <motion.div
            className="text-lg md:text-xl text-blue-700 mb-4 h-7"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            aria-live="polite"
          >
            Find {" "}
            <span className="font-semibold text-blue-500">{typedText}</span>
            <span className="ml-1 inline-block align-middle h-5 w-[2px] bg-blue-500 animate-pulse" /> {" "}
            across Nigeria
          </motion.div>
          {/* <motion.p
            className="text-xl text-blue-500 mb-8 max-w-xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            Experience the comfort of home with our curated collection of unique short-term rentals across Nigeria.
          </motion.p> */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <Link
              href="/properties"
              className="relative overflow-hidden inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-blue-500 rounded-full hover:bg-blue-700 transition-colors duration-300"
            >
              <span
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(255,255,255,0.25) 1px, transparent 1px)",
                  backgroundSize: "8px 8px",
                }}
              />
              Find Your Stay
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
            <Link
              href="/auth/host/signup"
              className="relative overflow-hidden inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-blue-600 border-2 border-blue-600 rounded-full hover:bg-blue-50 transition-colors duration-300"
            >
              <span
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, rgba(37,99,235,0.12) 25%, transparent 25%, transparent 50%, rgba(37,99,235,0.12) 50%, rgba(37,99,235,0.12) 75%, transparent 75%, transparent)",
                  backgroundSize: "12px 12px",
                }}
              />
              Become a Host
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Content - Featured Properties Preview */}
        <motion.div
          className="w-full md:w-1/2 relative"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.2 } },
            hidden: {},
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <motion.div
                className="relative h-48 rounded-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.7 }}
              >
                <SafeImage
                  src="/home/hero_image.jpeg"
                  alt="Luxury apartment"
                  width={400}
                  height={300}
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="font-medium">Luxury Apartments</p>
                  <p className="text-sm text-blue-200">From ₦50,000/night</p>
                </div>
              </motion.div>
              <motion.div
                className="relative h-64 rounded-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.7 }}
              >
                <SafeImage
                  src="https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                  alt="Beach house"
                  width={400}
                  height={300}
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="font-medium">Beach Houses</p>
                  <p className="text-sm text-blue-200">From ₦75,000/night</p>
                </div>
              </motion.div>
            </div>
            <div className="space-y-4 mt-8">
              <motion.div
                className="relative h-64 rounded-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.7 }}
              >
                <SafeImage
                  src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                  alt="Villa"
                  width={400}
                  height={300}
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="font-medium">Villas</p>
                  <p className="text-sm text-blue-200">From ₦100,000/night</p>
                </div>
              </motion.div>
              <motion.div
                className="relative h-48 rounded-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.7 }}
              >
                <SafeImage
                  src="/home/hero_image.jpeg"
                  alt="Studio"
                  width={400}
                  height={300}
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="font-medium">Studios</p>
                  <p className="text-sm text-blue-200">From ₦30,000/night</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
