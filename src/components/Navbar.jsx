import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plane, User, Menu, X } from "lucide-react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/20 relative">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2 font-bold text-xl"
          onClick={closeMenu}
        >
          <Plane className="w-6 h-6" /> Flight Booker
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-sm md:text-base">
          <NavItem to="/flights">Browse Flights</NavItem>
          <NavItem to="/bookings">My Bookings</NavItem>
          <NavItem to="/support">Support</NavItem>
          <NavItem to="/reports">Reports</NavItem>
          <NavItem to="/profile">
            <User className="w-5 h-5" /> Profile
          </NavItem>
        </div>

        {/* Mobile Menu Toggle */}
        <button onClick={toggleMenu} className="md:hidden focus:outline-none">
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* ✅ Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-indigo-700/95 backdrop-blur-md shadow-inner absolute top-full left-0 w-full z-50">
          <div className="flex flex-col items-center gap-4 py-4 text-base">
            <NavItem to="/flights" onClick={closeMenu}>Browse Flights</NavItem>
            <NavItem to="/bookings" onClick={closeMenu}>My Bookings</NavItem>
            <NavItem to="/support" onClick={closeMenu}>Support</NavItem>
            <NavItem to="/reports" onClick={closeMenu}>Reports</NavItem>
            <NavItem to="/profile" onClick={closeMenu}>
              <User className="w-5 h-5" /> Profile
            </NavItem>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavItem = ({ to, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="relative hover:after:content-[''] hover:after:absolute hover:after:left-0 hover:after:bottom-[-4px] hover:after:w-full hover:after:h-[2px] hover:after:bg-white transition-all duration-300"
  >
    {children}
  </Link>
);

export default Navbar;
