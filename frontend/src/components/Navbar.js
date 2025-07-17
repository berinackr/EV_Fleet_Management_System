import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MapPin, // Changed from MessageCircle
  Menu,
  X,
  Sun,
  Moon
} from "lucide-react";
// roadmapLogo import removed

export default function Navbar({ alertBlink, toggleChat, darkMode, setDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Define navigation items without icons
  const navItems = [
    { path: "/route-optimization", label: "Route Optimization" },
    { path: "/fleet-monitoring", label: "Fleet Monitoring" },
    { path: "/vehicles", label: "Vehicles" },
    { path: "/maintenance", label: "Maintenance" },
    { path: "/ev-charging", label: "EV Charging" },
    { path: "/orders", label: "Orders" },
    { path: "/inventory", label: "Inventory" },
    { path: "/demand-planning", label: "Demand Planning" },
    { path: "/performance-monitoring", label: "Analytics" }
  ];

  return (
    <nav className={`navbar professional-navbar ${darkMode ? 'dark' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="navbar-container">
        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="navbar-links"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo and Brand */}
        <Link to="/" className="navbar-brand" aria-label="Home">
          {/* img tag removed */}
          <span className="brand-name">FleetApp</span> {/* Updated brand name */}
        </Link>

        {/* Navigation Links */}
        <div
          id="navbar-links"
          className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}
        >
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              aria-current={location.pathname === item.path ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Controls */}
        <div className="navbar-controls">
          <button
            className="theme-toggle control-button"
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ?
              <Sun size={20} /> :
              <Moon size={20} />
            }
          </button>

          <button
            className={`chat-button control-button ${alertBlink ? 'blink' : ''}`}
            onClick={toggleChat}
            aria-label="Toggle chat/tracking" // Updated aria-label
          >
            <MapPin size={20} /> {/* Icon changed to MapPin */}
          </button>
        </div>
      </div>
    </nav>
  );
}
