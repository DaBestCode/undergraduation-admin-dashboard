import React from "react";
import { Link } from "react-router-dom"; // Only Link or NavLink

// No <Router> used!!!
function NavBar() {
  return (
    <nav className="bg-gradient-to-r from-indigo-700 to-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-indigo-100 hover:text-white font-semibold text-sm px-2">Students</Link>
          {/* ...other nav links */}
        </div>
      </div>
    </nav>
  );
}
export default NavBar;
