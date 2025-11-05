import React from "react";
import { Link } from "react-router-dom";
import { Plane} from "lucide-react";

const Footer = () => (
  <footer className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white mt-auto">
    {/* Main Footer Section */}
    <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
      {/* Brand */}
      <div>
        <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
          <Plane className="w-6 h-6 text-white" />
          <h2 className="font-bold text-xl">Flight Booker</h2>
        </div>
        <p className="text-sm text-gray-200 leading-relaxed">
          Book your flights, manage bookings, and explore travel insights with a smooth, user-friendly experience.
        </p>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="font-semibold text-white mb-4">Quick Links</h3>
        <ul className="space-y-2 text-gray-200">
          <li><Link to="/dashboard" className="hover:text-yellow-300 transition">Dashboard</Link></li>
          <li><Link to="/flights" className="hover:text-yellow-300 transition">Browse Flights</Link></li>
          <li><Link to="/bookings" className="hover:text-yellow-300 transition">My Bookings</Link></li>
          <li><Link to="/reports" className="hover:text-yellow-300 transition">Reports</Link></li>
        </ul>
      </div>

      {/* Support */}
      <div>
        <h3 className="font-semibold text-white mb-4">Support</h3>
        <ul className="space-y-2 text-gray-200">
          <li><Link to="/support" className="hover:text-yellow-300 transition">Help Center</Link></li>
          <li><Link to="/faq" className="hover:text-yellow-300 transition">FAQs</Link></li>
          <li><Link to="/contact" className="hover:text-yellow-300 transition">Contact Us</Link></li>
        </ul>
      </div>

      {/* Contact & Socials */}
      <div>
        <h3 className="font-semibold text-white mb-4">Connect With Us</h3>
        <p className="text-gray-200 text-sm mb-3">✉️ support@flightbooker.com</p>
        <p className="text-gray-200 text-sm mb-5">📞 +91 1234567890</p>
        
      </div>
    </div>

    {/* Bottom Section */}
    <div className="bg-gradient-to-r from-indigo-800 to-blue-800 py-4 text-center text-sm text-gray-200 border-t border-indigo-500">
      © {new Date().getFullYear()} <span className="font-semibold text-yellow-300">Flight Booker</span>. All rights reserved.
    </div>
  </footer>
);

export default Footer;
