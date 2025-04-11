import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import History from "./pages/History";
import { useAuth } from "./contexts/AuthContext";
import ProfileCard from "./components/ProfileCard";

function App() {
  const { user } = useAuth() || {}; // Ensure it doesn't crash if useAuth() is undefined
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Restrict access: Unauthenticated users can ONLY access /login and /signup
  useEffect(() => {
    if (!user && location.pathname !== "/login" && location.pathname !== "/signup") {
      navigate("/login"); // Redirect unauthenticated users to Login
    }
  }, [user, navigate, location]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Routes>
          {/* ✅ Unauthenticated users can only access these pages */}
          {!user ? (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="*" element={<Login />} /> {/* Redirect all other routes to login */}
            </>
          ) : (
            <>
              {/* ✅ Authenticated users can access these pages */}
              <Route path="/" element={<Home />} />
              <Route path="/history" element={<History />} />
              <Route path="*" element={<Home />} /> {/* Redirect all other routes to home */}
              <Route path="/profile" element={<ProfileCard />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
}

export default App;
