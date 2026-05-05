import { FaHome, FaMapMarkedAlt, FaTrophy, FaChartBar } from "react-icons/fa";
import { MdRestaurant } from "react-icons/md";

import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";

function Navbar() { 

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 AUTH TRACK
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // 🔥 PROFILE FETCH
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    const ref = doc(db, "users", user.uid);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setProfile(snap.data());
      } else {
        setProfile(null);
      }
      setProfileLoading(false);
    });

    return () => unsub();
  }, [user]);

  const isLoading = authLoading || profileLoading;

  // 🔥 🚨 REDIRECT ONLY ONCE (FIXED LOOP)
  useEffect(() => {
    if (!isLoading && user && !profile) {
      if (location.pathname !== "/setup") {
        navigate("/setup");
      }
    }
  }, [isLoading, user, profile]); // ❌ removed location to avoid loop

  // 🔥 LOGIN
  const handleLogin = () => {
    navigate("/auth");
  };

  // 🔥 LOGOUT
  const handleLogout = async () => {
    await signOut(auth);
    setProfile(null);
    navigate("/auth");
  };

  // 🔥 ACTIVE STYLE
  const isActive = (path) => location.pathname === path;

  const navClass = (path, color) =>
    `flex items-center gap-2 cursor-pointer ${
      isActive(path) ? "text-white font-bold" : color
    }`;

  return (
    <nav className="flex items-center px-8 py-4 bg-black text-white fixed w-full z-50 shadow-md">

      {/* 🔴 LOGO */}
      <h1
        onClick={() => navigate("/")}
        className="text-2xl font-bold text-red-400 cursor-pointer"
      >
        CampusApp
      </h1>

      {/* 🟡 MENU */} 
      <div className="flex gap-8 items-center text-sm font-medium ml-10">

        <div onClick={() => navigate("/")} className={navClass("/", "text-blue-400")}>
          <FaHome /> Home
        </div>

        <div onClick={() => navigate("/optouts")} className={navClass("/optouts", "text-orange-400")}>
          <MdRestaurant /> Mess
        </div>

        <div onClick={() => navigate("/map")} className={navClass("/map", "text-green-400")}>
          <FaMapMarkedAlt /> Campus Map
        </div>

        <div onClick={() => navigate("/rewards")} className={navClass("/rewards", "text-yellow-400")}>
          <FaTrophy /> Rewards
        </div>

        {/* ✅ FIXED ANALYTICS CLICK */}
        <div onClick={() => navigate("/analytics")} className={navClass("/analytics", "text-purple-400")}>
          <FaChartBar /> Analytics
        </div>

        {/* ✅ ADMIN */}
        {!isLoading && profile?.role === "admin" && (
          <div
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 text-red-400 cursor-pointer font-semibold"
          >
            ⚡ Admin
          </div>
        )}

      </div>

      {/* 🔥 RIGHT SIDE */}
      <div className="ml-auto flex items-center gap-4">

        {isLoading ? (
          <span className="text-gray-400 text-sm">Loading...</span>
        ) : user ? (
          <>
            {/* 👤 NAME */}
            <span className="text-sm text-gray-300 flex items-center gap-2">
              {profile?.name || user.email}

              {profile?.role === "admin" && (
                <span className="text-xs bg-red-500 px-2 py-0.5 rounded-full">
                  ADMIN
                </span>
              )}
            </span>

            {/* 🏆 POINTS */}
            <span className="text-yellow-400 font-semibold">
              {profile?.points || 0} pts
            </span>

            {/* ✏ EDIT */}
            <button
              onClick={() => navigate("/edit-profile")}
              className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded"
            >
              Edit
            </button>

            {/* 🔴 LOGOUT */}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={handleLogin}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-1 rounded"
          >
            Login
          </button>
        )}

      </div>

    </nav>
  );
}

export default Navbar;