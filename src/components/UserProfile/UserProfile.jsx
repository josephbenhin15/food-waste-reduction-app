import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const ref = doc(db, "users", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setUser(snap.data());
      }
    };

    fetchUser();
  }, [id]);

  // 🔥 ESC KEY CLOSE
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        navigate(-1);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [navigate]);

  if (!user) {
    return <div className="text-white p-10">Loading...</div>;
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">

      {/* 🔥 BACKDROP (CLICK TO CLOSE) */}
      <div
        className="absolute inset-0"
        onClick={() => navigate(-1)}
      ></div>

      {/* 🔥 MODAL */}
      <div
        className="relative bg-white/10 p-8 rounded-xl w-96 text-center backdrop-blur-lg z-10"
        onClick={(e) => e.stopPropagation()} // ❗ IMPORTANT
      >

        {/* ❌ CLOSE BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-3 right-3 text-white text-xl hover:text-red-400"
        >
          ✖
        </button>

        {/* IMAGE */}
        <img
          src={user.photo || "https://i.pravatar.cc/150"}
          className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
        />

        <h2 className="text-2xl font-bold mb-4">
          {user.name}
        </h2>

        <div className="space-y-2 text-gray-300">
          <p>📌 Roll No: {user.rollNo}</p>
          <p>🏫 Year: {user.year}</p>
          <p>🍽 Mess: {user.mess}</p>
          <p>📱 Mobile: {user.mobile}</p>
        </div>

        <p className="mt-4 text-yellow-400 font-semibold text-lg">
          🏆 {user.points || 0} Points
        </p>

      </div>
    </div>
  );
}

export default UserProfile;