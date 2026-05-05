import { Routes, Route } from "react-router-dom";

import { MdRestaurant } from "react-icons/md";
import { FaMapMarkerAlt, FaTrophy, FaChartBar } from "react-icons/fa";

import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Card from "./components/Card/Card";
import Issues from "./components/Issues/Issues";
import Leaderboard from "./components/Leaderboard/Leaderboard";
import OptOutList from "./components/OptOutList/OptOutList";
import ProfileSetup from "./components/ProfileSetup/ProfileSetup";
import EditProfile from "./components/EditProfile/EditProfile";
import Auth from "./components/Auth/Auth";
import CampusMap from "./components/CampusMap/CampusMap";
import Rewards from "./components/Rewards/Rewards";
import UserProfile from "./components/UserProfile/UserProfile";
import Admin from "./components/Admin/Admin";
import Analytics from "./components/Analytics/Analytics";

import mess from "./assets/mess.jpg";
import map from "./assets/map.jpg";
import rewards from "./assets/rewards.jpg";
import analytics from "./assets/analytics.jpg";


function App() {
  return (
    <div className="bg-black min-h-screen">

      {/* 🔥 NAVBAR */}
      <Navbar />

      {/* 🔥 CONTENT */}
      <div className="pt-20">

        <Routes>

          {/* 🔐 AUTH */}
          <Route path="/auth" element={<Auth />} />

          {/* 👤 PROFILE */}
          <Route path="/setup" element={<ProfileSetup />} />
          <Route path="/edit-profile" element={<EditProfile />} />

          {/* 🗺 CAMPUS */}
          <Route path="/map" element={<CampusMap />} />

          {/* 🍽 MESS */}
          <Route path="/optouts" element={<OptOutList />} />

          {/* 🏆 REWARDS */}
          <Route path="/rewards" element={<Rewards />} />

          {/* 👤 USER PROFILE */}
          <Route path="/user/:id" element={<UserProfile />} />

          {/* 🔥 ADMIN (SAFE NOW) */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/analytics" element={<Analytics />} />

          {/* 🏠 HOME */}
          <Route
            path="/"
            element={
              <>
                <Hero />

                <div className="px-10 mt-10">
                  <h2 className="text-white text-2xl mb-4">
                    Popular on Campus
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

                    <Card
                      image={mess}
                      title="Mess Opt-out"
                      link="/optouts"
                      icon={<MdRestaurant className="text-orange-400 text-xl" />}
                    />

                    <Card
                      image={map}
                      title="Campus Map"
                      link="/map"
                      icon={<FaMapMarkerAlt className="text-green-400 text-xl" />}
                    />

                    <Card
                      image={rewards}
                      title="Earn Rewards"
                      link="/rewards"
                      icon={<FaTrophy className="text-yellow-400 text-xl" />}
                    />

                    <Card
                      image={analytics}
                      title="Campus Analytics"
                      icon={<FaChartBar className="text-blue-400 text-xl" />}
                    />

                  </div>
                </div>

                <Issues />
                <Leaderboard />
              </>
            }
          />

        </Routes>

      </div>
    </div>
  );
}

export default App;