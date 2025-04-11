import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-green-100 py-4 px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo positioned far left */}
        <div className="flex-none">
          <Link
            to="/"
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-700"
          >
            PersonalityTest
          </Link>
        </div>

        {/* Spacer to push elements apart */}
        <div className="flex-grow"></div>

        {/* Desktop Navigation positioned right */}
        <div className="hidden md:flex items-center space-x-8">
          {user ? (
            <>
              <Link to="/" className="text-gray-700 hover:text-green-600 transition">
                Home
              </Link>
              <button
                onClick={() => navigate("/history")}
                className="text-gray-700 hover:text-green-600 transition"
              >
                History
              </button>
              <button
                onClick={handleLogout}
                className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition"
              >
                Logout
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white">
                  {user?.username?.charAt(0).toUpperCase() || ""}
                </div>
                <Link
                  to="/profile"
                  className="text-gray-800 hover:text-green-700 transition"
                >
                  {user?.username || "User"}
                </Link>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-green-600 transition">
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
            className="text-gray-700 hover:text-green-600"
          >
            {isMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 space-y-2 px-4 pb-4 bg-white">
          {user ? (
            <>
              <Link to="/" className="block text-gray-700 hover:text-green-600 transition py-2">
                Home
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate("/history");
                }}
                className="block w-full text-left text-gray-700 hover:text-green-600 transition py-2"
              >
                History
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left text-gray-700 hover:text-green-600 transition py-2"
              >
                Logout
              </button>
              <div className="flex items-center space-x-2 py-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white">
                  {user?.username?.charAt(0).toUpperCase() || ""}
                </div>
                <Link
                  to="/profile"
                  className="text-gray-800 hover:text-green-700 transition"
                >
                  {user?.username || "User"}
                </Link>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-gray-700 hover:text-green-600 transition py-2">
                Login
              </Link>
              <Link to="/signup" className="block text-gray-700 hover:text-green-600 transition py-2 font-medium">
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;