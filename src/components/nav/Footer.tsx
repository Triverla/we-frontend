"use client";

import { Mail, Phone, Globe, Facebook, Twitter, Instagram } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-gray-50 text-sm text-gray-600">
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 justify-around">
        {/* Logo and Description */}
        <div>
          <div className="flex items-center space-x-2">
            <div className="text-blue-600 font-bold text-lg">
              <Image
                alt="woothomes logo"
                src="/logo.svg"
                width={150}
                height={150}
                priority
                loading="eager"
              />
            </div>
          </div>
          <p className="mt-4 max-w-xs">
            Your trusted platform for finding the perfect short-term
            accommodation in Nigeria.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#06A2E2] after:transition-all after:duration-300 hover:after:w-full">Home</Link>
            </li>
            <li>
              <Link href="/about" className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#06A2E2] after:transition-all after:duration-300 hover:after:w-full">About</Link>
            </li>
            <li>
              <Link href="/properties" className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#06A2E2] after:transition-all after:duration-300 hover:after:w-full">Properties</Link>
            </li>
            <li>
              <Link href="/price-negotiation" className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#06A2E2] after:transition-all after:duration-300 hover:after:w-full">Price Negotiation</Link>
            </li>
            <li>
              <Link href="/hourly-rentals" className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#06A2E2] after:transition-all after:duration-300 hover:after:w-full">Hourly Rentals</Link>
            </li>
            <li>
              <Link href="/services" className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#06A2E2] after:transition-all after:duration-300 hover:after:w-full">Services</Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Support</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/help-center" className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#06A2E2] after:transition-all after:duration-300 hover:after:w-full">Help Center</Link>
            </li>
            <li>
              <Link href="/safety" className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#06A2E2] after:transition-all after:duration-300 hover:after:w-full">Safety Information</Link>
            </li>
            <li>
              <Link href="/cancellation-options" className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#06A2E2] after:transition-all after:duration-300 hover:after:w-full">Cancellation Options</Link>
            </li>
            <li>
              <Link href="/report-concern" className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#06A2E2] after:transition-all after:duration-300 hover:after:w-full">Report Concern</Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Subscription */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Subscribe to our Newsletter</h4>
          <form className="flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="Your email address"
              className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button
              type="submit"
              className="bg-[#1E3A8A] text-white rounded-lg px-4 py-2 font-semibold hover:bg-[#1E3A8A]/90 transition-all"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">Get the latest updates and offers.</p>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-200 py-6 text-center text-xs text-gray-500 flex flex-col md:flex-row justify-between items-center px-4 container mx-auto">
        {/* Contact Info moved here */}
        <div className="flex flex-col md:flex-row items-center gap-2 mb-2 md:mb-0">
          <span className="flex items-center gap-1"><Phone size={14} /> +2347025112581</span>
          <span className="hidden md:inline-block mx-2">|</span>
          <span className="flex items-center gap-1"><Mail size={14} /> hello@woothomes.com</span>
        </div>
        <div>
          © 2025 WootHomes. All rights reserved. ·{" "}
          <Link href="/privacy" className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#06A2E2] after:transition-all after:duration-300 hover:after:w-full">Privacy</Link> ·{" "}
          <Link href="/terms" className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#06A2E2] after:transition-all after:duration-300 hover:after:w-full">Terms</Link>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div className="flex items-center gap-1">
            <Globe size={14} />
            English (US)
          </div>
          <div className="flex gap-3 text-gray-600">
            <Link href="#">
              <Facebook size={16} className="hover:text-[#06A2E2]" />
            </Link>
            <Link href="#">
              <Twitter size={16} className="hover:text-[#06A2E2]" />
            </Link>
            <Link href="#">
              <Instagram size={16} className="hover:text-[#06A2E2]" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
